package handlers

import (
	"net/http"
	"strconv"
	"order-service/models"
	"order-service/services"
	"order-service/utils"

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
	customerID := c.GetString("user_id")

	var orderCreate models.OrderCreate
	if err := c.ShouldBindJSON(&orderCreate); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Error:   "invalid_request",
			Message: "Invalid request body",
			Details: utils.GetValidationErrors(err),
		})
		return
	}

	order, err := h.orderService.CreateOrder(customerID, &orderCreate)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Error:   "creation_error",
			Message: "Failed to create order",
		})
		return
	}

	// Get countdown timer info
	countdownStatus, _ := h.orderService.GetCountdownStatus(order.ID)

	c.JSON(http.StatusCreated, models.APIResponse{
		Success: true,
		Message: "Order placed successfully",
		Data: gin.H{
			"order_id":        order.ID,
			"status":          order.Status,
			"countdown_timer": countdownStatus,
		},
	})
}

// @Summary Cancel order with penalty calculation
// @Description Cancel an order with automatic penalty calculation
// @Tags Order Cancellation
// @Accept json
// @Produce json
// @Param order_id path string true "Order ID"
// @Param cancellation body models.CancellationRequest true "Cancellation data"
// @Success 200 {object} models.APIResponse
// @Security BearerAuth
// @Router /orders/{order_id}/cancel [post]
func (h *OrderHandler) CancelOrder(c *gin.Context) {
	orderID := c.Param("order_id")
	userID := c.GetString("user_id")

	var cancellationRequest models.CancellationRequest
	if err := c.ShouldBindJSON(&cancellationRequest); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Error:   "invalid_request",
			Message: "Invalid request body",
			Details: utils.GetValidationErrors(err),
		})
		return
	}

	result, err := h.orderService.CancelOrder(orderID, userID, cancellationRequest.Reason, cancellationRequest.Notes)
	if err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Error:   "cancellation_error",
			Message: err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Message: "Order cancelled successfully",
		Data:    result,
	})
}

// @Summary Get cancellation information
// @Description Get current cancellation policy and penalty for an order
// @Tags Order Cancellation
// @Accept json
// @Produce json
// @Param order_id path string true "Order ID"
// @Success 200 {object} models.APIResponse
// @Security BearerAuth
// @Router /orders/{order_id}/cancellation-info [get]
func (h *OrderHandler) GetCancellationInfo(c *gin.Context) {
	orderID := c.Param("order_id")

	info, err := h.orderService.GetCancellationInfo(orderID)
	if err != nil {
		c.JSON(http.StatusNotFound, models.ErrorResponse{
			Error:   "order_not_found",
			Message: "Order not found",
		})
		return
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Data:    info,
	})
}

// @Summary Get countdown timer status
// @Description Get current countdown timer status for free cancellation
// @Tags Order Countdown
// @Accept json
// @Produce json
// @Param order_id path string true "Order ID"
// @Success 200 {object} models.APIResponse
// @Security BearerAuth
// @Router /orders/{order_id}/countdown-status [get]
func (h *OrderHandler) GetCountdownStatus(c *gin.Context) {
	orderID := c.Param("order_id")

	status, err := h.orderService.GetCountdownStatus(orderID)
	if err != nil {
		c.JSON(http.StatusNotFound, models.ErrorResponse{
			Error:   "order_not_found",
			Message: "Order not found",
		})
		return
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Data:    status,
	})
}

// @Summary Confirm order after countdown expires
// @Description Automatically confirm order and send to chef
// @Tags Order Countdown
// @Accept json
// @Produce json
// @Param order_id path string true "Order ID"
// @Success 200 {object} models.APIResponse
// @Security BearerAuth
// @Router /orders/{order_id}/confirm-after-timer [post]
func (h *OrderHandler) ConfirmAfterTimer(c *gin.Context) {
	orderID := c.Param("order_id")

	err := h.orderService.ConfirmOrderAfterTimer(orderID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Error:   "confirmation_error",
			Message: "Failed to confirm order",
		})
		return
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Message: "Order confirmed and sent to chef",
		Data: gin.H{
			"order_id":        orderID,
			"status":          "sent_to_chef",
			"chef_notified":   true,
			"customer_notified": true,
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
	customerID := c.GetString("user_id")

	var tipCreate models.TipCreate
	if err := c.ShouldBindJSON(&tipCreate); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Error:   "invalid_request",
			Message: "Invalid request body",
			Details: utils.GetValidationErrors(err),
		})
		return
	}

	tip, err := h.orderService.AddTip(orderID, customerID, &tipCreate)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Error:   "tip_error",
			Message: "Failed to process tip",
		})
		return
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Message: "Tip processed successfully",
		Data: gin.H{
			"tip_id":                    tip.ID,
			"direct_transfer_initiated": true,
			"recipient_notified":        true,
		},
	})
}

// @Summary Get complete order journey
// @Description Get detailed order journey with timeline and current status
// @Tags Order Journey
// @Accept json
// @Produce json
// @Param order_id path string true "Order ID"
// @Success 200 {object} models.APIResponse
// @Security BearerAuth
// @Router /orders/{order_id}/journey [get]
func (h *OrderHandler) GetOrderJourney(c *gin.Context) {
	orderID := c.Param("order_id")

	journey, err := h.orderService.GetOrderJourney(orderID)
	if err != nil {
		c.JSON(http.StatusNotFound, models.ErrorResponse{
			Error:   "order_not_found",
			Message: "Order not found",
		})
		return
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Data:    journey,
	})
}

// @Summary Chef accepts order
// @Description Chef accepts order and provides estimated preparation time
// @Tags Chef Operations
// @Accept json
// @Produce json
// @Param order_id path string true "Order ID"
// @Param request body models.ChefAcceptRequest true "Chef accept data"
// @Success 200 {object} models.APIResponse
// @Security BearerAuth
// @Router /orders/{order_id}/chef-accept [post]
func (h *OrderHandler) ChefAcceptOrder(c *gin.Context) {
	orderID := c.Param("order_id")
	chefID := c.GetString("chef_id")
	if chefID == "" {
		chefID = c.GetString("user_id")
	}

	var request models.ChefAcceptRequest
	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Error:   "invalid_request",
			Message: "Invalid request body",
			Details: utils.GetValidationErrors(err),
		})
		return
	}

	err := h.orderService.ChefAcceptOrder(orderID, chefID, &request)
	if err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Error:   "accept_error",
			Message: err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Message: "Order accepted successfully",
		Data: gin.H{
			"order_id":                   orderID,
			"status":                     "chef_accepted",
			"estimated_delivery_time":    time.Now().Add(time.Duration(request.EstimatedPrepTime+30) * time.Minute),
			"delivery_partners_notified": 5,
		},
	})
}

// @Summary Chef declines order
// @Description Chef declines order with reason
// @Tags Chef Operations
// @Accept json
// @Produce json
// @Param order_id path string true "Order ID"
// @Param request body models.ChefDeclineRequest true "Chef decline data"
// @Success 200 {object} models.APIResponse
// @Security BearerAuth
// @Router /orders/{order_id}/chef-decline [post]
func (h *OrderHandler) ChefDeclineOrder(c *gin.Context) {
	orderID := c.Param("order_id")
	chefID := c.GetString("chef_id")
	if chefID == "" {
		chefID = c.GetString("user_id")
	}

	var request models.ChefDeclineRequest
	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Error:   "invalid_request",
			Message: "Invalid request body",
			Details: utils.GetValidationErrors(err),
		})
		return
	}

	err := h.orderService.ChefDeclineOrder(orderID, chefID, &request)
	if err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Error:   "decline_error",
			Message: err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Message: "Order declined successfully",
	})
}

// @Summary Update order status
// @Description Update order status with optional message and ETA
// @Tags Order Status
// @Accept json
// @Produce json
// @Param order_id path string true "Order ID"
// @Param request body models.OrderStatusUpdate true "Status update data"
// @Success 200 {object} models.APIResponse
// @Security BearerAuth
// @Router /orders/{order_id}/update-status [put]
func (h *OrderHandler) UpdateOrderStatus(c *gin.Context) {
	orderID := c.Param("order_id")
	userID := c.GetString("user_id")

	var request models.OrderStatusUpdate
	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Error:   "invalid_request",
			Message: "Invalid request body",
			Details: utils.GetValidationErrors(err),
		})
		return
	}

	err := h.orderService.UpdateOrderStatus(orderID, userID, &request)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Error:   "update_error",
			Message: "Failed to update order status",
		})
		return
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Message: "Status updated successfully",
	})
}

// @Summary Get available delivery orders
// @Description Get orders available for delivery partner assignment
// @Tags Delivery Operations
// @Accept json
// @Produce json
// @Param latitude query number true "Latitude"
// @Param longitude query number true "Longitude"
// @Param radius query number false "Search radius in km" default(5.0)
// @Param limit query int false "Maximum results" default(10)
// @Success 200 {object} models.APIResponse
// @Security BearerAuth
// @Router /delivery/orders/available [get]
func (h *OrderHandler) GetAvailableDeliveryOrders(c *gin.Context) {
	latStr := c.Query("latitude")
	lngStr := c.Query("longitude")
	radiusStr := c.DefaultQuery("radius", "5.0")
	limitStr := c.DefaultQuery("limit", "10")

	if latStr == "" || lngStr == "" {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Error:   "invalid_request",
			Message: "Latitude and longitude are required",
		})
		return
	}

	lat, err := strconv.ParseFloat(latStr, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Error:   "invalid_request",
			Message: "Invalid latitude format",
		})
		return
	}

	lng, err := strconv.ParseFloat(lngStr, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Error:   "invalid_request",
			Message: "Invalid longitude format",
		})
		return
	}

	radius, _ := strconv.ParseFloat(radiusStr, 64)
	limit, _ := strconv.Atoi(limitStr)

	orders, err := h.orderService.GetAvailableDeliveryOrders(lat, lng, radius, limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Error:   "database_error",
			Message: "Failed to retrieve available orders",
		})
		return
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Data:    orders,
	})
}

// @Summary Accept delivery order
// @Description Delivery partner accepts order for delivery
// @Tags Delivery Operations
// @Accept json
// @Produce json
// @Param order_id path string true "Order ID"
// @Param request body models.DeliveryAcceptRequest true "Delivery accept data"
// @Success 200 {object} models.APIResponse
// @Security BearerAuth
// @Router /delivery/orders/{order_id}/accept [post]
func (h *OrderHandler) AcceptDeliveryOrder(c *gin.Context) {
	orderID := c.Param("order_id")
	deliveryPartnerID := c.GetString("delivery_partner_id")
	if deliveryPartnerID == "" {
		deliveryPartnerID = c.GetString("user_id")
	}

	var request models.DeliveryAcceptRequest
	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Error:   "invalid_request",
			Message: "Invalid request body",
			Details: utils.GetValidationErrors(err),
		})
		return
	}

	err := h.orderService.AcceptDeliveryOrder(orderID, deliveryPartnerID, &request)
	if err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Error:   "accept_error",
			Message: err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Message: "Delivery accepted successfully",
	})
}

// @Summary Send order notifications
// @Description Send notifications to relevant parties about order updates
// @Tags Order Notifications
// @Accept json
// @Produce json
// @Param order_id path string true "Order ID"
// @Param request body models.OrderNotificationRequest true "Notification data"
// @Success 200 {object} models.APIResponse
// @Security BearerAuth
// @Router /orders/{order_id}/notifications [post]
func (h *OrderHandler) SendOrderNotifications(c *gin.Context) {
	orderID := c.Param("order_id")

	var request models.OrderNotificationRequest
	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Error:   "invalid_request",
			Message: "Invalid request body",
			Details: utils.GetValidationErrors(err),
		})
		return
	}

	err := h.orderService.SendOrderNotification(orderID, &request)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Error:   "notification_error",
			Message: "Failed to send notifications",
		})
		return
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Message: "Notifications sent successfully",
		Data: gin.H{
			"order_id":           orderID,
			"notifications_sent": len(request.Recipients),
		},
	})
}

// @Summary Get user orders
// @Description Retrieve orders for the authenticated user
// @Tags Order Management
// @Accept json
// @Produce json
// @Param status query string false "Filter by status"
// @Param page query int false "Page number" default(1)
// @Success 200 {object} models.APIResponse
// @Security BearerAuth
// @Router /orders [get]
func (h *OrderHandler) GetOrders(c *gin.Context) {
	userID := c.GetString("user_id")
	status := c.Query("status")
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit := 20

	// TODO: Implement order retrieval with pagination
	orders := []gin.H{
		{
			"id":           "order-1",
			"chef_name":    "Priya Sharma",
			"status":       "delivered",
			"total_amount": 450.00,
			"created_at":   "2024-01-20T12:30:00Z",
		},
	}

	totalPages := 1
	response := models.PaginationResponse{
		Data:       orders,
		Page:       page,
		Limit:      limit,
		Total:      1,
		TotalPages: totalPages,
		HasNext:    page < totalPages,
		HasPrev:    page > 1,
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Data:    response,
	})
}