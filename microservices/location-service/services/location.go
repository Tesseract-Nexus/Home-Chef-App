package services

import (
	"encoding/json"
	"fmt"
	"location-service/config"
	"location-service/models"
	"math"
	"net/http"
	"net/url"
	"time"

	"gorm.io/gorm"
	"go.uber.org/zap"
)

type LocationService struct {
	db     *gorm.DB
	config *config.Config
	logger *zap.Logger
}

func NewLocationService(db *gorm.DB, config *config.Config, logger *zap.Logger) *LocationService {
	return &LocationService{
		db:     db,
		config: config,
		logger: logger,
	}
}

func (s *LocationService) GetSupportedCities(country, state string) ([]models.City, error) {
	var cities []models.City
	query := s.db.Where("is_serviceable = ?", true)

	if country != "" {
		query = query.Where("country = ?", country)
	}
	if state != "" {
		query = query.Where("state = ?", state)
	}

	err := query.Preload("Areas").Find(&cities).Error
	return cities, err
}

func (s *LocationService) GetServiceableAreas(city, pincode string) ([]models.ServiceableArea, error) {
	var areas []models.ServiceableArea
	query := s.db.Where("is_active = ?", true)

	if city != "" {
		// Join with cities table to filter by city name
		query = query.Joins("JOIN cities ON serviceable_areas.city_id = cities.id").
			Where("cities.name ILIKE ?", "%"+city+"%")
	}
	if pincode != "" {
		query = query.Where("pincode = ?", pincode)
	}

	err := query.Preload("City").Find(&areas).Error
	return areas, err
}

func (s *LocationService) ValidateLocation(request *models.LocationValidationRequest) (*models.LocationValidation, error) {
	result := &models.LocationValidation{
		IsValid:       true,
		IsServiceable: false,
		Suggestions:   []string{},
	}

	// First try to geocode the address
	geocodingResult, err := s.GeocodeAddress(request.Address)
	if err != nil {
		result.IsValid = false
		result.Suggestions = append(result.Suggestions, "Please provide a more specific address")
		return result, nil
	}

	result.Coordinates = geocodingResult.Coordinates
	result.FormattedAddress = geocodingResult.FormattedAddress
	result.Components = geocodingResult.Components

	// Check if location is serviceable
	serviceable, err := s.CheckServiceability(result.Coordinates.Latitude, result.Coordinates.Longitude)
	if err != nil {
		s.logger.Warn("Failed to check serviceability", zap.Error(err))
	} else {
		result.IsServiceable = serviceable
	}

	return result, nil
}

func (s *LocationService) GeocodeAddress(address string) (*models.GeocodingResult, error) {
	// Check cache first
	var cached models.LocationCache
	err := s.db.Where("address = ? AND expires_at > ?", address, time.Now()).First(&cached).Error
	if err == nil {
		// Return cached result
		var components models.LocationComponents
		json.Unmarshal([]byte(cached.Components), &components)
		
		return &models.GeocodingResult{
			Coordinates:      cached.Coordinates,
			FormattedAddress: cached.FormattedAddr,
			Components:       components,
			Accuracy:         cached.Accuracy,
		}, nil
	}

	// If Google Maps API key is not configured, return mock data
	if s.config.GoogleMapsAPIKey == "" {
		s.logger.Warn("Google Maps API key not configured, returning mock geocoding")
		return s.getMockGeocodingResult(address), nil
	}

	// Make request to Google Geocoding API
	encodedAddress := url.QueryEscape(address)
	apiURL := fmt.Sprintf("https://maps.googleapis.com/maps/api/geocode/json?address=%s&key=%s", 
		encodedAddress, s.config.GoogleMapsAPIKey)

	resp, err := http.Get(apiURL)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	var geocodeResp struct {
		Results []struct {
			FormattedAddress string `json:"formatted_address"`
			Geometry         struct {
				Location struct {
					Lat float64 `json:"lat"`
					Lng float64 `json:"lng"`
				} `json:"location"`
			} `json:"geometry"`
			AddressComponents []struct {
				LongName  string   `json:"long_name"`
				ShortName string   `json:"short_name"`
				Types     []string `json:"types"`
			} `json:"address_components"`
		} `json:"results"`
		Status string `json:"status"`
	}

	if err := json.NewDecoder(resp.Body).Decode(&geocodeResp); err != nil {
		return nil, err
	}

	if geocodeResp.Status != "OK" || len(geocodeResp.Results) == 0 {
		return nil, fmt.Errorf("geocoding failed: %s", geocodeResp.Status)
	}

	result := geocodeResp.Results[0]
	coordinates := models.Coordinates{
		Latitude:  result.Geometry.Location.Lat,
		Longitude: result.Geometry.Location.Lng,
	}

	// Parse address components
	components := models.LocationComponents{}
	for _, comp := range result.AddressComponents {
		for _, typ := range comp.Types {
			switch typ {
			case "route":
				components.Street = comp.LongName
			case "sublocality", "sublocality_level_1":
				components.Area = comp.LongName
			case "locality":
				components.City = comp.LongName
			case "administrative_area_level_1":
				components.State = comp.LongName
			case "postal_code":
				components.Pincode = comp.LongName
			case "country":
				components.Country = comp.LongName
			}
		}
	}

	geocodingResult := &models.GeocodingResult{
		Coordinates:      coordinates,
		FormattedAddress: result.FormattedAddress,
		Components:       components,
		Accuracy:         "exact",
	}

	// Cache the result
	componentsJSON, _ := json.Marshal(components)
	cache := &models.LocationCache{
		Address:       address,
		Coordinates:   coordinates,
		FormattedAddr: result.FormattedAddress,
		Components:    string(componentsJSON),
		Accuracy:      "exact",
		Source:        "google_maps",
		ExpiresAt:     time.Now().Add(24 * time.Hour),
	}
	s.db.Create(cache)

	return geocodingResult, nil
}

func (s *LocationService) ReverseGeocode(lat, lng float64) (*models.GeocodingResult, error) {
	// If Google Maps API key is not configured, return mock data
	if s.config.GoogleMapsAPIKey == "" {
		s.logger.Warn("Google Maps API key not configured, returning mock reverse geocoding")
		return s.getMockReverseGeocodingResult(lat, lng), nil
	}

	// Make request to Google Reverse Geocoding API
	apiURL := fmt.Sprintf("https://maps.googleapis.com/maps/api/geocode/json?latlng=%f,%f&key=%s", 
		lat, lng, s.config.GoogleMapsAPIKey)

	resp, err := http.Get(apiURL)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	// Similar processing as GeocodeAddress
	// Implementation would be similar to the geocoding function above
	
	return s.getMockReverseGeocodingResult(lat, lng), nil
}

func (s *LocationService) CalculateDistance(origin, destination models.Coordinates, mode string) (*models.DistanceResult, error) {
	// Calculate straight-line distance using Haversine formula
	distance := s.haversineDistance(origin.Latitude, origin.Longitude, destination.Latitude, destination.Longitude)
	
	// Estimate duration based on mode
	var speed float64 // km/h
	switch mode {
	case "walking":
		speed = 5.0
	case "bicycling":
		speed = 15.0
	case "driving":
		speed = 30.0 // average city speed
	default:
		speed = 30.0
	}

	duration := (distance / speed) * 3600 // convert to seconds

	return &models.DistanceResult{
		Distance: models.DistanceInfo{
			Value: distance,
			Text:  fmt.Sprintf("%.1f km", distance),
		},
		Duration: models.DurationInfo{
			Value: int(duration),
			Text:  s.formatDuration(int(duration)),
		},
		Mode: mode,
	}, nil
}

func (s *LocationService) GetRoute(request *models.RouteRequest) (*models.RouteResult, error) {
	// For now, return a simplified route calculation
	distance, err := s.CalculateDistance(request.Origin, request.Destination, request.Mode)
	if err != nil {
		return nil, err
	}

	return &models.RouteResult{
		Distance: distance.Distance,
		Duration: distance.Duration,
		Steps: []models.RouteStep{
			{
				Distance:      distance.Distance,
				Duration:      distance.Duration,
				Instruction:   "Head towards destination",
				StartLocation: request.Origin,
				EndLocation:   request.Destination,
			},
		},
		Polyline: "", // Would contain encoded polyline in real implementation
		Bounds: models.RouteBounds{
			Northeast: models.Coordinates{
				Latitude:  math.Max(request.Origin.Latitude, request.Destination.Latitude),
				Longitude: math.Max(request.Origin.Longitude, request.Destination.Longitude),
			},
			Southwest: models.Coordinates{
				Latitude:  math.Min(request.Origin.Latitude, request.Destination.Latitude),
				Longitude: math.Min(request.Origin.Longitude, request.Destination.Longitude),
			},
		},
	}, nil
}

func (s *LocationService) FindNearbyLocations(lat, lng float64, locationType string, radius float64, limit int) ([]models.NearbyLocation, error) {
	var locations []models.NearbyLocation

	switch locationType {
	case "chefs":
		// Mock chef locations
		locations = []models.NearbyLocation{
			{
				ID:   "chef-1",
				Name: "Priya's Kitchen",
				Type: "chef",
				Coordinates: models.Coordinates{
					Latitude:  lat + 0.01,
					Longitude: lng + 0.01,
				},
				Distance:    1.2,
				Address:     "123 Chef Street",
				Rating:      4.8,
				IsAvailable: true,
			},
		}
	case "delivery_partners":
		// Mock delivery partner locations
		locations = []models.NearbyLocation{
			{
				ID:   "delivery-1",
				Name: "Amit Singh",
				Type: "delivery_partner",
				Coordinates: models.Coordinates{
					Latitude:  lat + 0.005,
					Longitude: lng + 0.005,
				},
				Distance:    0.8,
				Address:     "Near Main Road",
				Rating:      4.5,
				IsAvailable: true,
			},
		}
	}

	// Apply limit
	if len(locations) > limit {
		locations = locations[:limit]
	}

	return locations, nil
}

func (s *LocationService) GetDeliveryZones(city, chefID string) ([]models.DeliveryZone, error) {
	var zones []models.DeliveryZone
	query := s.db.Where("is_active = ?", true)

	if city != "" {
		query = query.Joins("JOIN cities ON delivery_zones.city_id = cities.id").
			Where("cities.name ILIKE ?", "%"+city+"%")
	}
	if chefID != "" {
		query = query.Where("chef_id = ?", chefID)
	}

	err := query.Preload("City").Find(&zones).Error
	return zones, err
}

func (s *LocationService) CheckDeliveryZone(lat, lng float64, chefID string) (*models.DeliveryZoneResult, error) {
	var zones []models.DeliveryZone
	err := s.db.Where("chef_id = ? AND is_active = ?", chefID, true).Find(&zones).Error
	if err != nil {
		return nil, err
	}

	for _, zone := range zones {
		distance := s.haversineDistance(lat, lng, zone.Center.Latitude, zone.Center.Longitude)
		if distance <= zone.Radius {
			return &models.DeliveryZoneResult{
				IsInZone:      true,
				ZoneName:      zone.Name,
				DeliveryFee:   zone.DeliveryFee,
				MinOrder:      zone.MinOrder,
				Distance:      distance,
				EstimatedTime: int(distance * 2), // 2 minutes per km estimate
			}, nil
		}
	}

	return &models.DeliveryZoneResult{
		IsInZone: false,
	}, nil
}

func (s *LocationService) CheckServiceability(lat, lng float64) (bool, error) {
	// Check if coordinates fall within any serviceable area
	var count int64
	err := s.db.Model(&models.ServiceableArea{}).
		Where("is_active = ? AND ST_DWithin(ST_Point(?, ?), ST_Point(latitude, longitude), 0.1)", 
			true, lng, lat).Count(&count).Error
	
	if err != nil {
		// Fallback to simple distance check
		var areas []models.ServiceableArea
		s.db.Where("is_active = ?", true).Find(&areas)
		
		for _, area := range areas {
			distance := s.haversineDistance(lat, lng, area.Coordinates.Latitude, area.Coordinates.Longitude)
			if distance <= 5.0 { // 5km radius
				return true, nil
			}
		}
		return false, nil
	}

	return count > 0, nil
}

// Helper functions
func (s *LocationService) haversineDistance(lat1, lon1, lat2, lon2 float64) float64 {
	const R = 6371 // Earth's radius in kilometers

	dLat := (lat2 - lat1) * math.Pi / 180
	dLon := (lon2 - lon1) * math.Pi / 180

	a := math.Sin(dLat/2)*math.Sin(dLat/2) +
		math.Cos(lat1*math.Pi/180)*math.Cos(lat2*math.Pi/180)*
			math.Sin(dLon/2)*math.Sin(dLon/2)

	c := 2 * math.Atan2(math.Sqrt(a), math.Sqrt(1-a))
	return R * c
}

func (s *LocationService) formatDuration(seconds int) string {
	if seconds < 60 {
		return fmt.Sprintf("%d sec", seconds)
	} else if seconds < 3600 {
		return fmt.Sprintf("%d min", seconds/60)
	} else {
		hours := seconds / 3600
		minutes := (seconds % 3600) / 60
		return fmt.Sprintf("%dh %dm", hours, minutes)
	}
}

func (s *LocationService) getMockGeocodingResult(address string) *models.GeocodingResult {
	// Return mock coordinates based on address
	return &models.GeocodingResult{
		Coordinates: models.Coordinates{
			Latitude:  19.0760 + (float64(len(address)%100) * 0.001),
			Longitude: 72.8777 + (float64(len(address)%100) * 0.001),
		},
		FormattedAddress: address + ", Mumbai, Maharashtra, India",
		Components: models.LocationComponents{
			Street:  "Mock Street",
			Area:    "Mock Area",
			City:    "Mumbai",
			State:   "Maharashtra",
			Pincode: "400001",
			Country: "India",
		},
		Accuracy: "approximate",
	}
}

func (s *LocationService) getMockReverseGeocodingResult(lat, lng float64) *models.GeocodingResult {
	return &models.GeocodingResult{
		Coordinates: models.Coordinates{
			Latitude:  lat,
			Longitude: lng,
		},
		FormattedAddress: fmt.Sprintf("Mock Address near %.4f, %.4f", lat, lng),
		Components: models.LocationComponents{
			Street:  "Mock Street",
			Area:    "Mock Area",
			City:    "Mumbai",
			State:   "Maharashtra",
			Pincode: "400001",
			Country: "India",
		},
		Accuracy: "approximate",
	}
}