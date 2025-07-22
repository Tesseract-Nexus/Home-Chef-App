package handlers

import (
	"net/http"
	"strconv"
	"time"
	"chef-service/models"
	"chef-service/utils"

	"github.com/gin-gonic/gin"
)

type EarningsHandler struct {
	// Dependencies would be injected here
}

func NewEarningsHandler() *EarningsHandler {
	return &EarningsHandler{}
}

// @Summary Get earnings summary
// @Description Get earnings summary for the chef
// @Tags Earnings
// @Accept json
// @Produce json
// @Param period query string false "Time period" Enums(today, this_week, this_month, last_30_days)
// @Success 200 {object} models.APIResponse{data=models.EarningsSummary}
// @Security BearerAuth
// @Router /chefs/earnings [get]
func (h *EarningsHandler) GetEarnings(c *gin.Context) {
	chefID := c.GetString("chef_id")
	period := c.Query("period")

	// TODO: Calculate earnings from database
	earnings := models.EarningsSummary{
		TotalEarnings: 58900.00,
		PlatformFee:   8835.00,
		NetEarnings:   50065.00,
		PendingAmount: 2450.00,
		PaidAmount:    47615.00,
		Breakdown: models.EarningsBreakdown{
			OrderRevenue: 55000.00,
			Tips:         2500.00,
			Bonuses:      1400.00,
			Deductions:   0.00,
		},
		PayoutSchedule: "weekly",
		NextPayoutDate: time.Now().AddDate(0, 0, 7),
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Data:    earnings,
	})
}

// @Summary Get payout history
// @Description Get payout transaction history
// @Tags Earnings
// @Accept json
// @Produce json
// @Param page query int false "Page number"
// @Param limit query int false "Items per page"
// @Success 200 {object} models.APIResponse{data=models.PaginationResponse}
// @Security BearerAuth
// @Router /chefs/payouts [get]
func (h *EarningsHandler) GetPayouts(c *gin.Context) {
	chefID := c.GetString("chef_id")
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "20"))

	// TODO: Fetch payout history from database
	payouts := []gin.H{
		{
			"id":          "payout1",
			"amount":      5000.00,
			"status":      "completed",
			"processed_at": time.Now().AddDate(0, 0, -3),
		},
	}

	paginationData := models.PaginationResponse{
		Data:       payouts,
		Page:       page,
		Limit:      limit,
		Total:      50,
		TotalPages: 3,
		HasNext:    page < 3,
		HasPrev:    page > 1,
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Data:    paginationData,
	})
}

// @Summary Request instant payout
// @Description Request an instant payout
// @Tags Earnings
// @Accept json
// @Produce json
// @Param payout body models.PayoutRequest true "Payout request data"
// @Success 200 {object} models.APIResponse
// @Failure 400 {object} models.ErrorResponse
// @Security BearerAuth
// @Router /chefs/payouts/request [post]
func (h *EarningsHandler) RequestPayout(c *gin.Context) {
	chefID := c.GetString("chef_id")
	
	var payoutRequest models.PayoutRequest
	if err := c.ShouldBindJSON(&payoutRequest); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Error:   "invalid_request",
			Message: "Invalid request body",
			Details: utils.GetValidationErrors(err),
		})
		return
	}

	// TODO: Validate available balance and process payout request

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Message: "Payout request submitted successfully",
		Data: gin.H{
			"chef_id": chefID,
			"amount":  payoutRequest.Amount,
			"status":  "processing",
		},
	})
}