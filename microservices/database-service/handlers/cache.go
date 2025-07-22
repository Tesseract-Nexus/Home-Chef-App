package handlers

import (
	"database-service/database"
	"database-service/models"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

type CacheHandler struct {
	redis  *database.RedisClient
	logger *zap.Logger
}

func NewCacheHandler(redis *database.RedisClient, logger *zap.Logger) *CacheHandler {
	return &CacheHandler{
		redis:  redis,
		logger: logger,
	}
}

// @Summary Get cache value
// @Description Retrieve a value from Redis cache
// @Tags Cache
// @Accept json
// @Produce json
// @Param key path string true "Cache key"
// @Success 200 {object} models.APIResponse
// @Router /cache/{key} [get]
func (h *CacheHandler) GetCache(c *gin.Context) {
	key := c.Param("key")

	value, err := h.redis.Get(key)
	if err != nil {
		c.JSON(http.StatusNotFound, models.ErrorResponse{
			Error:   "key_not_found",
			Message: "Cache key not found",
		})
		return
	}

	// Try to get TTL
	ttl, _ := h.redis.GetTTL(key)

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Data: gin.H{
			"key":   key,
			"value": value,
			"ttl":   int(ttl.Seconds()),
		},
	})
}

// @Summary Set cache value
// @Description Store a value in Redis cache
// @Tags Cache
// @Accept json
// @Produce json
// @Param key path string true "Cache key"
// @Param request body object true "Cache data"
// @Success 200 {object} models.APIResponse
// @Router /cache/{key} [post]
func (h *CacheHandler) SetCache(c *gin.Context) {
	key := c.Param("key")

	var request struct {
		Value interface{} `json:"value" binding:"required"`
		TTL   int         `json:"ttl"` // TTL in seconds
	}

	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Error:   "invalid_request",
			Message: "Invalid request body",
		})
		return
	}

	ttl := time.Duration(request.TTL) * time.Second
	if request.TTL == 0 {
		ttl = time.Hour // Default 1 hour
	}

	err := h.redis.SetJSON(key, request.Value, ttl)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Error:   "cache_error",
			Message: "Failed to set cache value",
		})
		return
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Message: "Cache value set successfully",
		Data: gin.H{
			"key": key,
			"ttl": request.TTL,
		},
	})
}

// @Summary Delete cache value
// @Description Remove a value from Redis cache
// @Tags Cache
// @Accept json
// @Produce json
// @Param key path string true "Cache key"
// @Success 200 {object} models.APIResponse
// @Router /cache/{key} [delete]
func (h *CacheHandler) DeleteCache(c *gin.Context) {
	key := c.Param("key")

	err := h.redis.Delete(key)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Error:   "cache_error",
			Message: "Failed to delete cache value",
		})
		return
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Message: "Cache value deleted successfully",
	})
}

// @Summary Get chef availability
// @Description Get chef availability from cache
// @Tags Cache
// @Accept json
// @Produce json
// @Param chef_id path string true "Chef ID"
// @Success 200 {object} models.APIResponse
// @Router /cache/chef-availability/{chef_id} [get]
func (h *CacheHandler) GetChefAvailability(c *gin.Context) {
	chefID := c.Param("chef_id")
	key := "chef:availability:" + chefID

	var availability map[string]interface{}
	err := h.redis.GetJSON(key, &availability)
	if err != nil {
		c.JSON(http.StatusNotFound, models.ErrorResponse{
			Error:   "availability_not_found",
			Message: "Chef availability not found in cache",
		})
		return
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Data:    availability,
	})
}

// @Summary Update chef availability
// @Description Update chef availability in cache
// @Tags Cache
// @Accept json
// @Produce json
// @Param chef_id path string true "Chef ID"
// @Param request body object true "Availability data"
// @Success 200 {object} models.APIResponse
// @Router /cache/chef-availability/{chef_id} [put]
func (h *CacheHandler) UpdateChefAvailability(c *gin.Context) {
	chefID := c.Param("chef_id")

	var request struct {
		IsAvailable   bool `json:"is_available"`
		CurrentOrders int  `json:"current_orders"`
		AvgPrepTime   int  `json:"avg_prep_time"`
	}

	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Error:   "invalid_request",
			Message: "Invalid request body",
		})
		return
	}

	availability := map[string]interface{}{
		"is_available":   request.IsAvailable,
		"last_seen":      time.Now().Unix(),
		"current_orders": request.CurrentOrders,
		"avg_prep_time":  request.AvgPrepTime,
	}

	key := "chef:availability:" + chefID
	err := h.redis.SetJSON(key, availability, time.Hour)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Error:   "cache_error",
			Message: "Failed to update chef availability",
		})
		return
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Message: "Chef availability updated successfully",
		Data:    availability,
	})
}

// @Summary Get popular dishes
// @Description Get popular dishes from cache
// @Tags Cache
// @Accept json
// @Produce json
// @Success 200 {object} models.APIResponse
// @Router /cache/popular-dishes [get]
func (h *CacheHandler) GetPopularDishes(c *gin.Context) {
	var dishes []map[string]interface{}
	err := h.redis.GetJSON("popular:dishes", &dishes)
	if err != nil {
		c.JSON(http.StatusNotFound, models.ErrorResponse{
			Error:   "dishes_not_found",
			Message: "Popular dishes not found in cache",
		})
		return
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Data:    dishes,
	})
}

// @Summary Get delivery location
// @Description Get delivery partner location from cache
// @Tags Cache
// @Accept json
// @Produce json
// @Param delivery_id path string true "Delivery Partner ID"
// @Success 200 {object} models.APIResponse
// @Router /cache/delivery-location/{delivery_id} [get]
func (h *CacheHandler) GetDeliveryLocation(c *gin.Context) {
	deliveryID := c.Param("delivery_id")
	key := "delivery:location:" + deliveryID

	var location map[string]interface{}
	err := h.redis.GetJSON(key, &location)
	if err != nil {
		c.JSON(http.StatusNotFound, models.ErrorResponse{
			Error:   "location_not_found",
			Message: "Delivery location not found in cache",
		})
		return
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Data:    location,
	})
}

// @Summary Update delivery location
// @Description Update delivery partner location in cache
// @Tags Cache
// @Accept json
// @Produce json
// @Param delivery_id path string true "Delivery Partner ID"
// @Param request body object true "Location data"
// @Success 200 {object} models.APIResponse
// @Router /cache/delivery-location/{delivery_id} [put]
func (h *CacheHandler) UpdateDeliveryLocation(c *gin.Context) {
	deliveryID := c.Param("delivery_id")

	var request struct {
		Latitude    float64 `json:"latitude" binding:"required"`
		Longitude   float64 `json:"longitude" binding:"required"`
		IsAvailable bool    `json:"is_available"`
	}

	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Error:   "invalid_request",
			Message: "Invalid request body",
		})
		return
	}

	location := map[string]interface{}{
		"latitude":     request.Latitude,
		"longitude":    request.Longitude,
		"is_available": request.IsAvailable,
		"last_update":  time.Now().Unix(),
	}

	key := "delivery:location:" + deliveryID
	err := h.redis.SetJSON(key, location, time.Minute*5) // 5 minute TTL for location
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Error:   "cache_error",
			Message: "Failed to update delivery location",
		})
		return
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Message: "Delivery location updated successfully",
		Data:    location,
	})
}

// @Summary Get cache statistics
// @Description Get Redis cache statistics
// @Tags Cache
// @Accept json
// @Produce json
// @Success 200 {object} models.APIResponse
// @Router /cache/stats [get]
func (h *CacheHandler) GetCacheStats(c *gin.Context) {
	// This is a simplified version - in production you'd get actual Redis stats
	stats := gin.H{
		"connected_clients": 1,
		"used_memory":      "1.2MB",
		"total_keys":       15,
		"hit_rate":         "85%",
		"uptime":           "2 hours",
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Data:    stats,
	})
}