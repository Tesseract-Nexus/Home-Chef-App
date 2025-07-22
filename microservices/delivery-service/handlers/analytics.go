package handlers

import (
	"net/http"
	"delivery-service/models"
	"delivery-service/services"

	"github.com/gin-gonic/gin"
)

type AnalyticsHandler struct {
	analyticsService *services.AnalyticsService
}

func NewAnalyticsHandler(analyticsService *services.AnalyticsService) *AnalyticsHandler {
	return &AnalyticsHandler{
		analyticsService: analyticsService,
	}
}

// @Summary Get delivery analytics
// @Description Get performance analytics for the delivery partner
// @Tags Analytics
// @Accept json
// @Produce json
// @Param period query string false "Time period" Enums(today, this_week, this_month) default(this_month)
// @Success 200 {object} models.APIResponse{data=models.DeliveryAnalytics}
// @Security BearerAuth
// @Router /delivery/analytics [get]
func (h *AnalyticsHandler) GetDeliveryAnalytics(c *gin.Context) {
	deliveryPartnerID := c.GetString("delivery_partner_id")
	if deliveryPartnerID == "" {
		deliveryPartnerID = c.GetString("user_id")
	}

	period := c.DefaultQuery("period", "this_month")

	analytics, err := h.analyticsService.GetDeliveryAnalytics(deliveryPartnerID, period)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Error:   "analytics_error",
			Message: "Failed to retrieve analytics data",
		})
		return
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Data:    analytics,
	})
}