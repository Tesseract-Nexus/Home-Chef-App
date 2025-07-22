package services

import (
	"encoding/json"
	"fmt"
	"net/http"
	"net/url"
	"strings"
	"address-service/config"
	"address-service/models"

	"gorm.io/gorm"
	"go.uber.org/zap"
)

type AddressService struct {
	db     *gorm.DB
	config *config.Config
	logger *zap.Logger
}

func NewAddressService(db *gorm.DB, config *config.Config, logger *zap.Logger) *AddressService {
	return &AddressService{
		db:     db,
		config: config,
		logger: logger,
	}
}

func (s *AddressService) GetUserAddresses(userID string) ([]models.Address, error) {
	var addresses []models.Address
	err := s.db.Where("user_id = ?", userID).Order("is_default DESC, created_at DESC").Find(&addresses).Error
	return addresses, err
}

func (s *AddressService) CreateAddress(address *models.Address) (*models.Address, error) {
	// If this is set as default, unset other default addresses
	if address.IsDefault {
		s.db.Model(&models.Address{}).Where("user_id = ? AND is_default = ?", address.UserID, true).Update("is_default", false)
	}

	err := s.db.Create(address).Error
	if err != nil {
		return nil, err
	}

	return address, nil
}

func (s *AddressService) GetAddressByID(addressID, userID string) (*models.Address, error) {
	var address models.Address
	err := s.db.Where("id = ? AND user_id = ?", addressID, userID).First(&address).Error
	if err != nil {
		return nil, err
	}
	return &address, nil
}

func (s *AddressService) UpdateAddress(addressID, userID string, update *models.AddressUpdate) (*models.Address, error) {
	var address models.Address
	err := s.db.Where("id = ? AND user_id = ?", addressID, userID).First(&address).Error
	if err != nil {
		return nil, err
	}

	// Update fields if provided
	if update.Label != nil {
		address.Label = *update.Label
	}
	if update.FullAddress != nil {
		address.FullAddress = *update.FullAddress
		// Re-geocode if address changed
		coords, err := s.GeocodeAddress(*update.FullAddress, address.City, address.State)
		if err == nil {
			address.Coordinates = coords
		}
	}
	if update.Landmark != nil {
		address.Landmark = *update.Landmark
	}
	if update.Instructions != nil {
		address.Instructions = *update.Instructions
	}

	err = s.db.Save(&address).Error
	if err != nil {
		return nil, err
	}

	return &address, nil
}

func (s *AddressService) DeleteAddress(addressID, userID string) error {
	return s.db.Where("id = ? AND user_id = ?", addressID, userID).Delete(&models.Address{}).Error
}

func (s *AddressService) SetDefaultAddress(addressID, userID string) error {
	// Start transaction
	tx := s.db.Begin()

	// Unset all default addresses for user
	if err := tx.Model(&models.Address{}).Where("user_id = ?", userID).Update("is_default", false).Error; err != nil {
		tx.Rollback()
		return err
	}

	// Set the specified address as default
	if err := tx.Model(&models.Address{}).Where("id = ? AND user_id = ?", addressID, userID).Update("is_default", true).Error; err != nil {
		tx.Rollback()
		return err
	}

	return tx.Commit().Error
}

func (s *AddressService) ValidateAddress(validation *models.AddressValidation) (*models.ValidationResult, error) {
	result := &models.ValidationResult{
		IsValid:       true,
		IsServiceable: false,
		Suggestions:   []string{},
	}

	// Geocode the address
	coords, err := s.GeocodeAddress(validation.Address, validation.City, validation.State)
	if err != nil {
		result.IsValid = false
		result.Suggestions = append(result.Suggestions, "Please provide a more specific address")
		return result, nil
	}

	result.Coordinates = coords

	// Check serviceability based on pincode
	serviceable, err := s.CheckServiceability(validation.Pincode)
	if err != nil {
		s.logger.Warn("Failed to check serviceability", zap.Error(err))
	} else {
		result.IsServiceable = serviceable.IsServiceable
	}

	return result, nil
}

func (s *AddressService) GeocodeAddress(address, city, state string) (models.Coordinates, error) {
	var coords models.Coordinates

	// If Google Maps API key is not configured, return mock coordinates
	if s.config.GoogleMapsAPIKey == "" {
		s.logger.Warn("Google Maps API key not configured, returning mock coordinates")
		return models.Coordinates{
			Latitude:  19.0760 + (float64(len(address)%100) * 0.001), // Mock variation
			Longitude: 72.8777 + (float64(len(city)%100) * 0.001),
		}, nil
	}

	// Construct full address
	fullAddress := fmt.Sprintf("%s, %s, %s", address, city, state)
	encodedAddress := url.QueryEscape(fullAddress)

	// Make request to Google Geocoding API
	apiURL := fmt.Sprintf("https://maps.googleapis.com/maps/api/geocode/json?address=%s&key=%s", encodedAddress, s.config.GoogleMapsAPIKey)

	resp, err := http.Get(apiURL)
	if err != nil {
		return coords, err
	}
	defer resp.Body.Close()

	var geocodeResp models.GeocodeResponse
	if err := json.NewDecoder(resp.Body).Decode(&geocodeResp); err != nil {
		return coords, err
	}

	if geocodeResp.Status != "OK" || len(geocodeResp.Results) == 0 {
		return coords, fmt.Errorf("geocoding failed: %s", geocodeResp.Status)
	}

	coords.Latitude = geocodeResp.Results[0].Geometry.Location.Lat
	coords.Longitude = geocodeResp.Results[0].Geometry.Location.Lng

	return coords, nil
}

func (s *AddressService) CheckServiceability(pincode string) (*models.ServiceabilityCheck, error) {
	// Mock serviceability data - in production, this would query a database or external service
	serviceableAreas := map[string]models.ServiceabilityCheck{
		"400001": {Pincode: "400001", City: "Mumbai", State: "Maharashtra", IsServiceable: true, DeliveryTime: 30, DeliveryFee: 50.0},
		"400002": {Pincode: "400002", City: "Mumbai", State: "Maharashtra", IsServiceable: true, DeliveryTime: 35, DeliveryFee: 50.0},
		"110001": {Pincode: "110001", City: "Delhi", State: "Delhi", IsServiceable: true, DeliveryTime: 40, DeliveryFee: 60.0},
		"560001": {Pincode: "560001", City: "Bangalore", State: "Karnataka", IsServiceable: true, DeliveryTime: 35, DeliveryFee: 55.0},
	}

	if check, exists := serviceableAreas[pincode]; exists {
		return &check, nil
	}

	// Default to not serviceable for unknown pincodes
	return &models.ServiceabilityCheck{
		Pincode:       pincode,
		IsServiceable: false,
		DeliveryTime:  0,
		DeliveryFee:   0,
	}, nil
}

// GetNearbyAddresses finds addresses within a certain radius
func (s *AddressService) GetNearbyAddresses(lat, lng float64, radiusKm float64) ([]models.Address, error) {
	var addresses []models.Address
	
	// Using Haversine formula to find nearby addresses
	// This is a simplified version - in production, you'd use PostGIS or similar
	query := `
		SELECT *, (
			6371 * acos(
				cos(radians(?)) * cos(radians(latitude)) * 
				cos(radians(longitude) - radians(?)) + 
				sin(radians(?)) * sin(radians(latitude))
			)
		) AS distance 
		FROM addresses 
		HAVING distance < ? 
		ORDER BY distance
	`
	
	err := s.db.Raw(query, lat, lng, lat, radiusKm).Scan(&addresses).Error
	return addresses, err
}