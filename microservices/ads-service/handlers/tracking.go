package handlers

import (
	"net/http"
	"ads-service/models"
	"ads-service/services"
	"ads-service/utils"

	"github.com/gin-gonic/gin"
)

type TrackingHandler struct {
	trackingService *services.TrackingService
}

func NewTrackingHandler(trackingService *services.TrackingService) *TrackingHandler {
	return &TrackingHandler{
		trackingService: trackingService,
	}
}

// @Summary Track ad impression
// @Description Track when an ad is displayed to a user
// @Tags Ad Tracking
// @Accept json
// @Produce json
// @Param impression body models.ImpressionTrack true "Impression data"
// @Success 200 {object} models.APIResponse
// @Router /ads/track/impression [post]
func (h *TrackingHandler) TrackImpression(c *gin.Context) {
	var impressionTrack models.ImpressionTrack
	if err := c.ShouldBindJSON(&impressionTrack); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Error:   "invalid_request",
			Message: "Invalid request body",
			Details: utils.GetValidationErrors(err),
		})
		return
	}

	userID, _ := c.Get("user_id")
	userIDStr := ""
	if userID != nil {
		userIDStr = userID.(string)
	}

	// Get client IP if not provided
	if impressionTrack.IPAddress == "" {
		impressionTrack.IPAddress = c.ClientIP()
	}

	// Get user agent if not provided
	if impressionTrack.UserAgent == "" {
		impressionTrack.UserAgent = c.GetHeader("User-Agent")
	}

	err := h.trackingService.TrackImpression(&impressionTrack, userIDStr)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Error:   "tracking_error",
			Message: "Failed to track impression",
		})
		return
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Message: "Impression tracked successfully",
	})
}

// @Summary Track ad click
// @Description Track when a user clicks on an ad
// @Tags Ad Tracking
// @Accept json
// @Produce json
// @Param click body models.ClickTrack true "Click data"
// @Success 200 {object} models.APIResponse
// @Router /ads/track/click [post]
func (h *TrackingHandler) TrackClick(c *gin.Context) {
	var clickTrack models.ClickTrack
	if err := c.ShouldBindJSON(&clickTrack); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Error:   "invalid_request",
			Message: "Invalid request body",
			Details: utils.GetValidationErrors(err),
		})
		return
	}

	userID, _ := c.Get("user_id")
	userIDStr := ""
	if userID != nil {
		userIDStr = userID.(string)
	}

	// Get client IP if not provided
	if clickTrack.IPAddress == "" {
		clickTrack.IPAddress = c.ClientIP()
	}

	// Get user agent if not provided
	if clickTrack.UserAgent == "" {
		clickTrack.UserAgent = c.GetHeader("User-Agent")
	}

	err := h.trackingService.TrackClick(&clickTrack, userIDStr)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Error:   "tracking_error",
			Message: "Failed to track click",
		})
		return
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Message: "Click tracked successfully",
	})
}