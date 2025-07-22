package handlers

import (
	"net/http"
	"customer-service/models"
	"customer-service/services"
	"customer-service/utils"

	"github.com/gin-gonic/gin"
)

type NotificationHandler struct {
	notificationService *services.NotificationService
}

func NewNotificationHandler(notificationService *services.NotificationService) *NotificationHandler {
	return &NotificationHandler{
		notificationService: notificationService,
	}
}

// @Summary Get notification settings
// @Description Get notification preferences for the authenticated customer
// @Tags Notifications
// @Accept json
// @Produce json
// @Success 200 {object} models.APIResponse{data=models.NotificationSettings}
// @Security BearerAuth
// @Router /customers/notifications/settings [get]
func (h *NotificationHandler) GetNotificationSettings(c *gin.Context) {
	customerID := c.GetString("customer_id")
	if customerID == "" {
		customerID = c.GetString("user_id")
	}

	settings, err := h.notificationService.GetNotificationSettings(customerID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Error:   "database_error",
			Message: "Failed to retrieve notification settings",
		})
		return
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Data:    settings,
	})
}

// @Summary Update notification settings
// @Description Update notification preferences for the authenticated customer
// @Tags Notifications
// @Accept json
// @Produce json
// @Param settings body models.NotificationSettingsUpdate true "Notification settings"
// @Success 200 {object} models.APIResponse
// @Security BearerAuth
// @Router /customers/notifications/settings [put]
func (h *NotificationHandler) UpdateNotificationSettings(c *gin.Context) {
	customerID := c.GetString("customer_id")
	if customerID == "" {
		customerID = c.GetString("user_id")
	}

	var settingsUpdate models.NotificationSettingsUpdate
	if err := c.ShouldBindJSON(&settingsUpdate); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Error:   "invalid_request",
			Message: "Invalid request body",
			Details: utils.GetValidationErrors(err),
		})
		return
	}

	updatedSettings, err := h.notificationService.UpdateNotificationSettings(customerID, &settingsUpdate)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Error:   "update_error",
			Message: "Failed to update notification settings",
		})
		return
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Message: "Notification settings updated successfully",
		Data:    updatedSettings,
	})
}