package handlers

import (
	"net/http"
	"strconv"
	"ads-service/models"
	"ads-service/services"

	"github.com/gin-gonic/gin"
)

type ServingHandler struct {
	servingService *services.ServingService
}

func NewServingHandler(servingService *services.ServingService) *ServingHandler {
	return &ServingHandler{
		servingService: servingService,
	}
}

// @Summary Get ads for user
// @Description Serve ads based on targeting criteria
// @Tags Ad Serving
// @Accept json
// @Produce json
// @Param type query string true "Ad type"
// @Param placement query string false "Ad placement"
// @Param user_location query string false "User location"
// @Param limit query int false "Number of ads" default(1)
// @Success 200 {object} models.APIResponse{data=[]models.AdContent}
// @Router /ads/serve [get]
func (h *ServingHandler) ServeAds(c *gin.Context) {
	adType := c.Query("type")
	placement := c.Query("placement")
	userLocation := c.Query("user_location")
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "1"))

	if adType == "" {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Error:   "invalid_request",
			Message: "Ad type is required",
		})
		return
	}

	userID, _ := c.Get("user_id")
	userIDStr := ""
	if userID != nil {
		userIDStr = userID.(string)
	}

	ads, err := h.servingService.GetAdsForUser(adType, placement, userLocation, userIDStr, limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Error:   "serving_error",
			Message: "Failed to serve ads",
		})
		return
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Data:    ads,
	})
}