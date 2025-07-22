package handlers

import (
	"net/http"
	"inventory-service/models"
	"inventory-service/services"
	"inventory-service/utils"

	"github.com/gin-gonic/gin"
)

type AlertHandler struct {
	inventoryService *services.InventoryService
}

func NewAlertHandler(inventoryService *services.InventoryService) *AlertHandler {
	return &AlertHandler{
		inventoryService: inventoryService,
	}
}

// @Summary Get inventory alerts
// @Description Get inventory alerts for the chef
// @Tags Inventory Alerts
// @Accept json
// @Produce json
// @Param type query string false "Filter by alert type"
// @Param priority query string false "Filter by priority"
// @Success 200 {object} models.APIResponse{data=[]models.InventoryAlert}
// @Security BearerAuth
// @Router /inventory/alerts [get]
func (h *AlertHandler) GetAlerts(c *gin.Context) {
	chefID := c.GetString("chef_id")
	if chefID == "" {
		chefID = c.GetString("user_id")
	}

	alertType := c.Query("type")
	priority := c.Query("priority")

	alerts, err := h.inventoryService.GetAlerts(chefID, alertType, priority)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Error:   "database_error",
			Message: "Failed to retrieve alerts",
		})
		return
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Data:    alerts,
	})
}

// @Summary Get alert settings
// @Description Get inventory alert settings for the chef
// @Tags Inventory Alerts
// @Accept json
// @Produce json
// @Success 200 {object} models.APIResponse{data=models.AlertSettings}
// @Security BearerAuth
// @Router /inventory/alerts/settings [get]
func (h *AlertHandler) GetAlertSettings(c *gin.Context) {
	chefID := c.GetString("chef_id")
	if chefID == "" {
		chefID = c.GetString("user_id")
	}

	settings, err := h.inventoryService.GetAlertSettings(chefID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Error:   "database_error",
			Message: "Failed to retrieve alert settings",
		})
		return
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Data:    settings,
	})
}

// @Summary Update alert settings
// @Description Update inventory alert settings
// @Tags Inventory Alerts
// @Accept json
// @Produce json
// @Param settings body models.AlertSettingsUpdate true "Alert settings"
// @Success 200 {object} models.APIResponse
// @Security BearerAuth
// @Router /inventory/alerts/settings [put]
func (h *AlertHandler) UpdateAlertSettings(c *gin.Context) {
	chefID := c.GetString("chef_id")
	if chefID == "" {
		chefID = c.GetString("user_id")
	}

	var settingsUpdate models.AlertSettingsUpdate
	if err := c.ShouldBindJSON(&settingsUpdate); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Error:   "invalid_request",
			Message: "Invalid request body",
			Details: utils.GetValidationErrors(err),
		})
		return
	}

	updatedSettings, err := h.inventoryService.UpdateAlertSettings(chefID, &settingsUpdate)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Error:   "update_error",
			Message: "Failed to update alert settings",
		})
		return
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Message: "Alert settings updated successfully",
		Data:    updatedSettings,
	})
}