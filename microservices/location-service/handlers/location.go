package handlers

import (
	"net/http"
	"strconv"
	"location-service/models"
	"location-service/services"
	"location-service/utils"

	"github.com/gin-gonic/gin"
)

type LocationHandler struct {
	locationService *services.LocationService
}

func NewLocationHandler(locationService *services.LocationService) *LocationHandler {
	return &LocationHandler{
		locationService: locationService,
	}
}

// @Summary Get supported cities
// @Description Retrieve list of cities where service is available
// @Tags Location Services
// @Accept json
// @Produce json
// @Param country query string false "Country code" default(IN)
// @Param state query string false "State name"
// @Success 200 {object} models.APIResponse{data=[]models.City}
// @Router /locations/cities [get]
func (h *LocationHandler) GetSupportedCities(c *gin.Context) {
	country := c.DefaultQuery("country", "IN")
	state := c.Query("state")

	cities, err := h.locationService.GetSupportedCities(country, state)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Error:   "database_error",
			Message: "Failed to retrieve cities",
		})
		return
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Data:    cities,
	})
}

// @Summary Get serviceable areas
// @Description Retrieve serviceable areas for a city
// @Tags Location Services
// @Accept json
// @Produce json
// @Param city query string true "City name"
// @Param pincode query string false "Pincode filter"
// @Success 200 {object} models.APIResponse{data=[]models.ServiceableArea}
// @Router /locations/areas [get]
func (h *LocationHandler) GetServiceableAreas(c *gin.Context) {
	city := c.Query("city")
	pincode := c.Query("pincode")

	if city == "" {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Error:   "invalid_request",
			Message: "City parameter is required",
		})
		return
	}

	areas, err := h.locationService.GetServiceableAreas(city, pincode)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Error:   "database_error",
			Message: "Failed to retrieve serviceable areas",
		})
		return
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Data:    areas,
	})
}

// @Summary Validate location
// @Description Validate and check serviceability of a location
// @Tags Location Validation
// @Accept json
// @Produce json
// @Param location body models.LocationValidationRequest true "Location data"
// @Success 200 {object} models.APIResponse{data=models.LocationValidation}
// @Router /locations/validate [post]
func (h *LocationHandler) ValidateLocation(c *gin.Context) {
	var request models.LocationValidationRequest
	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Error:   "invalid_request",
			Message: "Invalid request body",
			Details: utils.GetValidationErrors(err),
		})
		return
	}

	result, err := h.locationService.ValidateLocation(&request)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Error:   "validation_error",
			Message: "Failed to validate location",
		})
		return
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Data:    result,
	})
}

// @Summary Geocode address
// @Description Convert address to coordinates
// @Tags Geocoding
// @Accept json
// @Produce json
// @Param geocoding body models.GeocodingRequest true "Address to geocode"
// @Success 200 {object} models.APIResponse{data=models.GeocodingResult}
// @Router /locations/geocode [post]
func (h *LocationHandler) GeocodeAddress(c *gin.Context) {
	var request models.GeocodingRequest
	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Error:   "invalid_request",
			Message: "Invalid request body",
			Details: utils.GetValidationErrors(err),
		})
		return
	}

	result, err := h.locationService.GeocodeAddress(request.Address)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Error:   "geocoding_error",
			Message: "Failed to geocode address",
		})
		return
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Data:    result,
	})
}

// @Summary Reverse geocode coordinates
// @Description Convert coordinates to address
// @Tags Geocoding
// @Accept json
// @Produce json
// @Param coordinates body models.ReverseGeocodingRequest true "Coordinates to reverse geocode"
// @Success 200 {object} models.APIResponse{data=models.GeocodingResult}
// @Router /locations/reverse-geocode [post]
func (h *LocationHandler) ReverseGeocode(c *gin.Context) {
	var request models.ReverseGeocodingRequest
	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Error:   "invalid_request",
			Message: "Invalid request body",
			Details: utils.GetValidationErrors(err),
		})
		return
	}

	result, err := h.locationService.ReverseGeocode(request.Latitude, request.Longitude)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Error:   "geocoding_error",
			Message: "Failed to reverse geocode coordinates",
		})
		return
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Data:    result,
	})
}

// @Summary Find nearby locations
// @Description Find nearby chefs, delivery partners, or landmarks
// @Tags Proximity Search
// @Accept json
// @Produce json
// @Param latitude query number true "Latitude"
// @Param longitude query number true "Longitude"
// @Param type query string false "Location type" Enums(chefs, delivery_partners, landmarks)
// @Param radius query number false "Search radius in km" default(5.0)
// @Param limit query integer false "Maximum results" default(20)
// @Success 200 {object} models.APIResponse{data=[]models.NearbyLocation}
// @Router /locations/nearby [get]
func (h *LocationHandler) FindNearbyLocations(c *gin.Context) {
	latStr := c.Query("latitude")
	lngStr := c.Query("longitude")
	locationType := c.DefaultQuery("type", "chefs")
	radiusStr := c.DefaultQuery("radius", "5.0")
	limitStr := c.DefaultQuery("limit", "20")

	if latStr == "" || lngStr == "" {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Error:   "invalid_request",
			Message: "Latitude and longitude are required",
		})
		return
	}

	lat, err := strconv.ParseFloat(latStr, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Error:   "invalid_request",
			Message: "Invalid latitude format",
		})
		return
	}

	lng, err := strconv.ParseFloat(lngStr, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Error:   "invalid_request",
			Message: "Invalid longitude format",
		})
		return
	}

	radius, _ := strconv.ParseFloat(radiusStr, 64)
	limit, _ := strconv.Atoi(limitStr)

	locations, err := h.locationService.FindNearbyLocations(lat, lng, locationType, radius, limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Error:   "search_error",
			Message: "Failed to find nearby locations",
		})
		return
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Data:    locations,
	})
}

// @Summary Calculate distance between points
// @Description Calculate distance and duration between two points
// @Tags Distance Calculation
// @Accept json
// @Produce json
// @Param distance body models.DistanceRequest true "Distance calculation request"
// @Success 200 {object} models.APIResponse{data=models.DistanceResult}
// @Router /locations/distance [post]
func (h *LocationHandler) CalculateDistance(c *gin.Context) {
	var request models.DistanceRequest
	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Error:   "invalid_request",
			Message: "Invalid request body",
			Details: utils.GetValidationErrors(err),
		})
		return
	}

	if request.Mode == "" {
		request.Mode = "driving"
	}

	result, err := h.locationService.CalculateDistance(request.Origin, request.Destination, request.Mode)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Error:   "calculation_error",
			Message: "Failed to calculate distance",
		})
		return
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Data:    result,
	})
}

// @Summary Get route between points
// @Description Calculate route with turn-by-turn directions
// @Tags Route Planning
// @Accept json
// @Produce json
// @Param route body models.RouteRequest true "Route calculation request"
// @Success 200 {object} models.APIResponse{data=models.RouteResult}
// @Router /locations/route [post]
func (h *LocationHandler) GetRoute(c *gin.Context) {
	var request models.RouteRequest
	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Error:   "invalid_request",
			Message: "Invalid request body",
			Details: utils.GetValidationErrors(err),
		})
		return
	}

	if request.Mode == "" {
		request.Mode = "driving"
	}

	result, err := h.locationService.GetRoute(&request)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Error:   "route_error",
			Message: "Failed to calculate route",
		})
		return
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Data:    result,
	})
}

// @Summary Get delivery zones
// @Description Get delivery zones for a city or chef
// @Tags Delivery Zones
// @Accept json
// @Produce json
// @Param city query string false "City name"
// @Param chef_id query string false "Chef ID"
// @Success 200 {object} models.APIResponse{data=[]models.DeliveryZone}
// @Router /locations/delivery-zones [get]
func (h *LocationHandler) GetDeliveryZones(c *gin.Context) {
	city := c.Query("city")
	chefID := c.Query("chef_id")

	zones, err := h.locationService.GetDeliveryZones(city, chefID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Error:   "database_error",
			Message: "Failed to retrieve delivery zones",
		})
		return
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Data:    zones,
	})
}

// @Summary Check delivery zone
// @Description Check if location is within chef's delivery zone
// @Tags Delivery Zones
// @Accept json
// @Produce json
// @Param zone_check body models.DeliveryZoneCheck true "Zone check request"
// @Success 200 {object} models.APIResponse{data=models.DeliveryZoneResult}
// @Router /locations/delivery-zones/check [post]
func (h *LocationHandler) CheckDeliveryZone(c *gin.Context) {
	var request models.DeliveryZoneCheck
	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Error:   "invalid_request",
			Message: "Invalid request body",
			Details: utils.GetValidationErrors(err),
		})
		return
	}

	result, err := h.locationService.CheckDeliveryZone(request.Latitude, request.Longitude, request.ChefID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Error:   "zone_check_error",
			Message: "Failed to check delivery zone",
		})
		return
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Data:    result,
	})
}