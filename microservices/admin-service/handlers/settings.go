package handlers

import (
	"net/http"
	"admin-service/models"
	"admin-service/utils"

	"github.com/gin-gonic/gin"
)

type SettingsHandler struct {
	// Dependencies would be injected here
}

func NewSettingsHandler() *SettingsHandler {
	return &SettingsHandler{}
}

// @Summary Get platform settings
// @Description Retrieve current platform settings
// @Tags Platform Settings
// @Accept json
// @Produce json
// @Success 200 {object} models.APIResponse{data=models.PlatformSettings}
// @Security BearerAuth
// @Router /admin/settings/platform [get]
func (h *SettingsHandler) GetPlatformSettings(c *gin.Context) {
	// TODO: Fetch settings from database
	settings := models.PlatformSettings{
		Commission: models.PlatformCommission{
			ChefCommissionRate:     0.15,
			DeliveryCommissionRate: 0.10,
		},
		Delivery: models.PlatformDelivery{
			BaseDeliveryFee:     25.00,
			PerKmRate:          5.00,
			MaxDeliveryDistance: 10.0,
		},
		Orders: models.PlatformOrders{
			MinOrderAmount:    100.00,
			MaxOrderAmount:    5000.00,
			AutoAcceptTimeout: 300,
		},
		Payments: models.PlatformPayments{
			PaymentProcessingFee: 0.025,
			PayoutSchedule:       "weekly",
			MinPayoutAmount:      500.00,
		},
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Data:    settings,
	})
}

// @Summary Update platform settings
// @Description Update platform configuration settings
// @Tags Platform Settings
// @Accept json
// @Produce json
// @Param settings body models.PlatformSettings true "Platform settings"
// @Success 200 {object} models.APIResponse
// @Security BearerAuth
// @Router /admin/settings/platform [put]
func (h *SettingsHandler) UpdatePlatformSettings(c *gin.Context) {
	var settings models.PlatformSettings
	if err := c.ShouldBindJSON(&settings); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Error:   "invalid_request",
			Message: "Invalid request body",
			Details: utils.GetValidationErrors(err),
		})
		return
	}

	// TODO: Update settings in database
	// TODO: Notify relevant services of setting changes

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Message: "Platform settings updated successfully",
		Data:    settings,
	})
}