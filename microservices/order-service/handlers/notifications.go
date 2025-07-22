package handlers

import (
	"net/http"
	"order-service/models"
	"order-service/utils"

	"github.com/gin-gonic/gin"
)

type NotificationHandler struct {
	// Dependencies would be injected here
}

func NewNotificationHandler() *NotificationHandler {
	return &NotificationHandler{}
}

// @Summary Send order cancellation notifications
// @Description Send notifications to relevant parties about order cancellation
// @Tags Notifications
// @Accept json
// @Produce json
// @Param notification body object true "Notification data"
// @Success 200 {object} models.APIResponse
// @Security BearerAuth
// @Router /notifications/order-cancellation [post]
func (h *NotificationHandler) SendCancellationNotifications(c *gin.Context) {
	var request struct {
		OrderID          string  `json:"order_id" validate:"required"`
		CancellationType string  `json:"cancellation_type" validate:"required,oneof=free penalty"`
		Recipients       []struct {
			UserID           string `json:"user_id" validate:"required"`
			UserType         string `json:"user_type" validate:"required,oneof=customer chef delivery"`
			NotificationType string `json:"notification_type" validate:"required,oneof=push sms email"`
		} `json:"recipients" validate:"required,min=1"`
		PenaltyAmount float64 `json:"penalty_amount"`
		RefundAmount  float64 `json:"refund_amount"`
	}

	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Error:   "invalid_request",
			Message: "Invalid request body",
			Details: utils.GetValidationErrors(err),
		})
		return
	}

	// TODO: Send notifications to all recipients
	notificationsSent := 0
	for _, recipient := range request.Recipients {
		// Mock notification sending
		notificationsSent++
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Message: "Notifications sent successfully",
		Data: gin.H{
			"order_id":           request.OrderID,
			"notifications_sent": notificationsSent,
		},
	})
}