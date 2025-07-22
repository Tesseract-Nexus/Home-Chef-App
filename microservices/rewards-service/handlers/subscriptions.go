package handlers

import (
	"net/http"
	"rewards-service/models"
	"rewards-service/services"
	"rewards-service/utils"

	"github.com/gin-gonic/gin"
)

type SubscriptionHandler struct {
	subscriptionService *services.SubscriptionService
}

func NewSubscriptionHandler(subscriptionService *services.SubscriptionService) *SubscriptionHandler {
	return &SubscriptionHandler{
		subscriptionService: subscriptionService,
	}
}

// @Summary Get available subscription plans
// @Description Get all available subscription plans
// @Tags Subscriptions
// @Accept json
// @Produce json
// @Success 200 {object} models.APIResponse{data=[]models.SubscriptionPlanResponse}
// @Router /subscriptions [get]
func (h *SubscriptionHandler) GetSubscriptionPlans(c *gin.Context) {
	plans, err := h.subscriptionService.GetSubscriptionPlans()
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Error:   "database_error",
			Message: "Failed to retrieve subscription plans",
		})
		return
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Data:    plans,
	})
}

// @Summary Subscribe to plan
// @Description Create a new subscription for the user
// @Tags Subscriptions
// @Accept json
// @Produce json
// @Param request body models.SubscriptionCreateRequest true "Subscription request"
// @Success 201 {object} models.APIResponse
// @Security BearerAuth
// @Router /subscriptions [post]
func (h *SubscriptionHandler) CreateSubscription(c *gin.Context) {
	userID := c.GetString("user_id")

	var request models.SubscriptionCreateRequest
	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Error:   "invalid_request",
			Message: "Invalid request body",
			Details: utils.GetValidationErrors(err),
		})
		return
	}

	subscription, err := h.subscriptionService.CreateSubscription(userID, &request)
	if err != nil {
		if err == gorm.ErrDuplicatedKey {
			c.JSON(http.StatusConflict, models.ErrorResponse{
				Error:   "subscription_exists",
				Message: "User already has an active subscription",
			})
			return
		}
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Error:   "creation_error",
			Message: "Failed to create subscription",
		})
		return
	}

	c.JSON(http.StatusCreated, models.APIResponse{
		Success: true,
		Message: "Subscription created successfully",
		Data:    subscription,
	})
}

// @Summary Get current subscription
// @Description Get user's current active subscription
// @Tags Subscriptions
// @Accept json
// @Produce json
// @Success 200 {object} models.APIResponse{data=models.UserSubscriptionResponse}
// @Security BearerAuth
// @Router /subscriptions/current [get]
func (h *SubscriptionHandler) GetCurrentSubscription(c *gin.Context) {
	userID := c.GetString("user_id")

	subscription, err := h.subscriptionService.GetCurrentSubscription(userID)
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, models.ErrorResponse{
				Error:   "subscription_not_found",
				Message: "No active subscription found",
			})
			return
		}
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Error:   "database_error",
			Message: "Failed to retrieve subscription",
		})
		return
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Data:    subscription,
	})
}

// @Summary Update subscription
// @Description Update user's subscription settings
// @Tags Subscriptions
// @Accept json
// @Produce json
// @Param request body models.SubscriptionUpdateRequest true "Update request"
// @Success 200 {object} models.APIResponse
// @Security BearerAuth
// @Router /subscriptions/current [put]
func (h *SubscriptionHandler) UpdateSubscription(c *gin.Context) {
	userID := c.GetString("user_id")

	var request models.SubscriptionUpdateRequest
	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Error:   "invalid_request",
			Message: "Invalid request body",
			Details: utils.GetValidationErrors(err),
		})
		return
	}

	subscription, err := h.subscriptionService.UpdateSubscription(userID, &request)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Error:   "update_error",
			Message: "Failed to update subscription",
		})
		return
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Message: "Subscription updated successfully",
		Data:    subscription,
	})
}

// @Summary Cancel subscription
// @Description Cancel user's subscription
// @Tags Subscriptions
// @Accept json
// @Produce json
// @Param request body models.SubscriptionCancelRequest true "Cancel request"
// @Success 200 {object} models.APIResponse
// @Security BearerAuth
// @Router /subscriptions/current [delete]
func (h *SubscriptionHandler) CancelSubscription(c *gin.Context) {
	userID := c.GetString("user_id")

	var request models.SubscriptionCancelRequest
	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Error:   "invalid_request",
			Message: "Invalid request body",
			Details: utils.GetValidationErrors(err),
		})
		return
	}

	err := h.subscriptionService.CancelSubscription(userID, &request)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Error:   "cancel_error",
			Message: "Failed to cancel subscription",
		})
		return
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Message: "Subscription cancelled successfully",
	})
}