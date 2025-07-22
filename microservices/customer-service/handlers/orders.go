package handlers

import (
	"net/http"
	"strconv"
	"time"
	"customer-service/models"
	"customer-service/services"
	"customer-service/utils"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type OrderHandler struct {
	orderService *services.OrderService
}

func NewOrderHandler(orderService *services.OrderService) *OrderHandler {
	return &OrderHandler{
		orderService: orderService,
	}
}

// @Summary Place order with countdown timer
// @Description Place order with 30-second cancellation window
// @Tags Order Management
// @Accept json
// @Produce json
// @Param order body models.OrderCreate true "Order data"
// @Success 201 {object} models.APIResponse
// @Security BearerAuth
// @Router /orders [post]
func (h *OrderHandler) CreateOrder(c *gin.Context) {
	customerID := c.GetString("customer_id")
	if customerID == "" {
		customerID = c.GetString("user_id")
	}

	var orderCreate models.OrderCreate
	if err := c.ShouldBindJSON(&orderCreate); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Error:   "invalid_request",
			Message: "Invalid request body",
			Details: utils.GetValidationErrors(err),
		})
		return
	}

	// Create order with countdown timer
	orderID := uuid.New().String()
	
	// TODO: Process order creation and payment
	
	// Create countdown timer (30 seconds)
	countdownTimer := models.CountdownTimer{
		FreeCancellationWindow: 30,
		TimeRemaining:         30,
		CanCancelFree:         true,
		PenaltyAfterExpiry:    120.00, // Example penalty amount
	}

	c.JSON(http.StatusCreated, models.APIResponse{
		Success: true,
		Message: "Order placed successfully",
		Data: gin.H{
			"order_id":        orderID,
			"status":          "payment_confirmed",
			"countdown_timer": countdownTimer,
		},
	})
}

// @Summary Get customer orders
// @Description Retrieve order history for the authenticated customer
// @Tags Order Management
// @Accept json
// @Produce json
// @Param status query string false "Filter by status"
// @Param page query int false "Page number" default(1)
// @Success 200 {object} models.APIResponse{data=models.PaginationResponse}
// @Security BearerAuth
// @Router /orders [get]
func (h *OrderHandler) GetOrders(c *gin.Context) {
	customerID := c.GetString("customer_id")
	if customerID == "" {
		customerID = c.GetString("user_id")
	}

	status := c.Query("status")
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit := 20

	orders, total, err := h.orderService.GetCustomerOrders(customerID, status, page, limit, "created_at", "desc")
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Error:   "database_error",
			Message: "Failed to retrieve orders",
		})
		return
	}

	totalPages := int(total) / limit
	if int(total)%limit != 0 {
		totalPages++
	}

	response := models.PaginationResponse{
		Data:       orders,
		Page:       page,
		Limit:      limit,
		Total:      total,
		TotalPages: totalPages,
		HasNext:    page < totalPages,
		HasPrev:    page > 1,
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Data:    response,
	})
}

// @Summary Cancel order with penalty calculation
// @Description Cancel order with penalty system
// @Tags Order Cancellation
// @Accept json
// @Produce json
// @Param order_id path string true "Order ID"
// @Param cancellation body object true "Cancellation data"
// @Success 200 {object} models.APIResponse
// @Security BearerAuth
// @Router /orders/{order_id}/cancel [post]
func (h *OrderHandler) CancelOrder(c *gin.Context) {
	orderID := c.Param("order_id")
	customerID := c.GetString("customer_id")
	if customerID == "" {
		customerID = c.GetString("user_id")
	}

	var request struct {
		Reason string `json:"reason" binding:"required"`
		Notes  string `json:"notes"`
	}

	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Error:   "invalid_request",
			Message: "Invalid request body",
		})
		return
	}

	// TODO: Check countdown timer and calculate penalty
	cancellationResult := models.CancellationResult{
		OrderID:          orderID,
		CancellationType: "free", // or "penalty"
		PenaltyAmount:    0.00,
		RefundAmount:     450.00,
		RefundTimeline:   "3-5 business days",
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Message: "Order cancelled successfully",
		Data:    cancellationResult,
	})
}

// @Summary Get countdown timer status
// @Description Get countdown timer status for order
// @Tags Order Countdown
// @Accept json
// @Produce json
// @Param order_id path string true "Order ID"
// @Success 200 {object} models.APIResponse
// @Security BearerAuth
// @Router /orders/{order_id}/countdown-status [get]
func (h *OrderHandler) GetCountdownStatus(c *gin.Context) {
	orderID := c.Param("order_id")

	// TODO: Get actual countdown status from database/cache
	countdownStatus := models.CountdownStatus{
		OrderID:            orderID,
		IsActive:           true,
		TimeRemaining:      15,
		ProgressPercentage: 50.0,
		CanCancelFree:      true,
		PenaltyAmount:      0.00,
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Data:    countdownStatus,
	})
}

// @Summary Confirm order after countdown expires
// @Description Confirm order after countdown timer expires
// @Tags Order Countdown
// @Accept json
// @Produce json
// @Param order_id path string true "Order ID"
// @Success 200 {object} models.APIResponse
// @Security BearerAuth
// @Router /orders/{order_id}/confirm-after-timer [post]
func (h *OrderHandler) ConfirmAfterTimer(c *gin.Context) {
	orderID := c.Param("order_id")

	// TODO: Confirm order and send to chef
	
	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Message: "Order confirmed and sent to chef",
		Data: gin.H{
			"order_id": orderID,
			"status":   "confirmed",
		},
	})
}

// @Summary Add tip with direct bank transfer
// @Description Add tip for chef or delivery partner
// @Tags Tipping System
// @Accept json
// @Produce json
// @Param order_id path string true "Order ID"
// @Param tip body models.TipCreate true "Tip data"
// @Success 200 {object} models.APIResponse
// @Security BearerAuth
// @Router /orders/{order_id}/tip [post]
func (h *OrderHandler) AddTip(c *gin.Context) {
	orderID := c.Param("order_id")
	customerID := c.GetString("customer_id")
	if customerID == "" {
		customerID = c.GetString("user_id")
	}

	var tipCreate models.TipCreate
	if err := c.ShouldBindJSON(&tipCreate); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Error:   "invalid_request",
			Message: "Invalid request body",
			Details: utils.GetValidationErrors(err),
		})
		return
	}

	// TODO: Process tip payment and direct bank transfer
	tipID := uuid.New().String()

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Message: "Tip processed successfully",
		Data: gin.H{
			"tip_id":                    tipID,
			"direct_transfer_initiated": true,
			"recipient_notified":        true,
		},
	})
}