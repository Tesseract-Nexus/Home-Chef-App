package handlers

import (
	"net/http"
	"order-service/models"
	"order-service/services"
	"order-service/utils"

	"github.com/gin-gonic/gin"
)

type PolicyHandler struct {
	orderService *services.OrderService
}

func NewPolicyHandler(orderService *services.OrderService) *PolicyHandler {
	return &PolicyHandler{
		orderService: orderService,
	}
}

// @Summary Get current cancellation policy
// @Description Get current platform cancellation policy settings
// @Tags Admin Policy Management
// @Accept json
// @Produce json
// @Success 200 {object} models.APIResponse
// @Security BearerAuth
// @Router /admin/cancellation-policy [get]
func (h *PolicyHandler) GetCancellationPolicy(c *gin.Context) {
	policy, err := h.orderService.GetActiveCancellationPolicy()
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Error:   "database_error",
			Message: "Failed to retrieve cancellation policy",
		})
		return
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Data:    policy,
	})
}

// @Summary Update cancellation policy
// @Description Update platform cancellation policy settings
// @Tags Admin Policy Management
// @Accept json
// @Produce json
// @Param policy body models.CancellationPolicyUpdate true "Policy update data"
// @Success 200 {object} models.APIResponse
// @Security BearerAuth
// @Router /admin/cancellation-policy [put]
func (h *PolicyHandler) UpdateCancellationPolicy(c *gin.Context) {
	userID := c.GetString("user_id")

	var policyUpdate models.CancellationPolicyUpdate
	if err := c.ShouldBindJSON(&policyUpdate); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Error:   "invalid_request",
			Message: "Invalid request body",
			Details: utils.GetValidationErrors(err),
		})
		return
	}

	updatedPolicy, err := h.orderService.UpdateCancellationPolicy(&policyUpdate, userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Error:   "update_error",
			Message: "Failed to update cancellation policy",
		})
		return
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Message: "Cancellation policy updated successfully",
		Data:    updatedPolicy,
	})
}