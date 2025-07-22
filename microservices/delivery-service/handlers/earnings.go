package handlers

import (
	"net/http"
	"delivery-service/models"
	"delivery-service/services"

	"github.com/gin-gonic/gin"
)

type EarningsHandler struct {
	earningsService *services.EarningsService
}

func NewEarningsHandler(earningsService *services.EarningsService) *EarningsHandler {
	return &EarningsHandler{
		earningsService: earningsService,
	}
}

// @Summary Get earnings summary
// @Description Get earnings summary for the delivery partner
// @Tags Earnings
// @Accept json
// @Produce json
// @Param period query string false "Time period" Enums(today, this_week, this_month, last_30_days) default(this_month)
// @Success 200 {object} models.APIResponse{data=models.DeliveryEarningsSummary}
// @Security BearerAuth
// @Router /delivery/earnings [get]
func (h *EarningsHandler) GetEarningsSummary(c *gin.Context) {
	deliveryPartnerID := c.GetString("delivery_partner_id")
	if deliveryPartnerID == "" {
		deliveryPartnerID = c.GetString("user_id")
	}

	period := c.DefaultQuery("period", "this_month")

	summary, err := h.earningsService.GetEarningsSummary(deliveryPartnerID, period)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Error:   "calculation_error",
			Message: "Failed to calculate earnings summary",
		})
		return
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Data:    summary,
	})
}

// @Summary Get detailed earnings breakdown
// @Description Get detailed earnings breakdown for a date range
// @Tags Earnings
// @Accept json
// @Produce json
// @Param date_from query string false "Start date (YYYY-MM-DD)"
// @Param date_to query string false "End date (YYYY-MM-DD)"
// @Success 200 {object} models.APIResponse{data=[]models.DeliveryEarning}
// @Security BearerAuth
// @Router /delivery/earnings/breakdown [get]
func (h *EarningsHandler) GetEarningsBreakdown(c *gin.Context) {
	deliveryPartnerID := c.GetString("delivery_partner_id")
	if deliveryPartnerID == "" {
		deliveryPartnerID = c.GetString("user_id")
	}

	dateFrom := c.Query("date_from")
	dateTo := c.Query("date_to")

	breakdown, err := h.earningsService.GetEarningsBreakdown(deliveryPartnerID, dateFrom, dateTo)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Error:   "database_error",
			Message: "Failed to retrieve earnings breakdown",
		})
		return
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Data:    breakdown,
	})
}