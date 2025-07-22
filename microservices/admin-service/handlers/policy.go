package handlers

import (
	"net/http"
	"admin-service/models"
	"admin-service/utils"

	"github.com/gin-gonic/gin"
)

type PolicyHandler struct {
	// Dependencies would be injected here
}

func NewPolicyHandler() *PolicyHandler {
	return &PolicyHandler{}
}

// @Summary Get cancellation policy settings
// @Description Get current cancellation policy configuration
// @Tags Admin Policy
// @Accept json
// @Produce json
// @Success 200 {object} models.APIResponse
// @Security BearerAuth
// @Router /admin/cancellation-policy [get]
func (h *PolicyHandler) GetCancellationPolicy(c *gin.Context) {
	// TODO: Fetch policy from database
	policy := gin.H{
		"free_cancellation_window_seconds": 30,
		"penalty_rate":                     0.20,
		"min_penalty_amount":               50.00,
		"max_penalty_amount":               200.00,
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Data:    policy,
	})
}

// @Summary Update cancellation policy
// @Description Update cancellation policy configuration
// @Tags Admin Policy
// @Accept json
// @Produce json
// @Param policy body models.CancellationPolicyUpdate true "Policy update data"
// @Success 200 {object} models.APIResponse
// @Security BearerAuth
// @Router /admin/cancellation-policy [put]
func (h *PolicyHandler) UpdateCancellationPolicy(c *gin.Context) {
	var policyUpdate models.CancellationPolicyUpdate
	if err := c.ShouldBindJSON(&policyUpdate); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Error:   "invalid_request",
			Message: "Invalid request body",
			Details: utils.GetValidationErrors(err),
		})
		return
	}

	// TODO: Update policy in database
	// TODO: Notify all services of policy changes

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Message: "Cancellation policy updated successfully",
		Data:    policyUpdate,
	})
}