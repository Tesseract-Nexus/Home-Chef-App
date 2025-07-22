package handlers

import (
	"net/http"
	"strconv"
	"delivery-service/models"
	"delivery-service/services"
	"delivery-service/utils"

	"github.com/gin-gonic/gin"
)

type OrderHandler struct {
	orderService *services.OrderService
}

func NewOrderHandler(orderService *services.OrderService) *OrderHandler {
	return &OrderHandler{
		orderService: orderService,
	}
}

// @Summary Get available delivery orders
// @Description Get orders available for delivery within specified radius
// @Tags Order Management
// @Accept json
// @Produce json
// @Param radius query number false "Search radius in kilometers" default(5.0)
// @Param priority query string false "Priority filter"
// @Param min_earnings query number false "Minimum earnings filter"
// @Param page query int false "Page number" default(1)
// @Param limit query int false "Items per page" default(20)
// @Success 200 {object} models.APIResponse{data=[]models.DeliveryOrder}
// @Security BearerAuth
// @Router /delivery/orders/available [get]
func (h *OrderHandler) GetAvailableOrders(c *gin.Context) {
	deliveryPartnerID := c.GetString("delivery_partner_id")
	if deliveryPartnerID == "" {
		deliveryPartnerID = c.GetString("user_id")
	}

	radius, _ := strconv.ParseFloat(c.DefaultQuery("radius", "5.0"), 64)
	priority := c.Query("priority")
	minEarnings, _ := strconv.ParseFloat(c.Query("min_earnings"), 64)
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "20"))

	orders, total, err := h.orderService.GetAvailableOrders(deliveryPartnerID, radius, priority, minEarnings, page, limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Error:   "database_error",
			Message: "Failed to retrieve available orders",
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

// @Summary Accept delivery order
// @Description Accept an available delivery order
// @Tags Order Management
// @Accept json
// @Produce json
// @Param order_id path string true "Order ID"
// @Success 200 {object} models.APIResponse
// @Security BearerAuth
// @Router /delivery/orders/{order_id}/accept [post]
func (h *OrderHandler) AcceptOrder(c *gin.Context) {
	orderID := c.Param("order_id")
	deliveryPartnerID := c.GetString("delivery_partner_id")
	if deliveryPartnerID == "" {
		deliveryPartnerID = c.GetString("user_id")
	}

	err := h.orderService.AcceptOrder(orderID, deliveryPartnerID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Error:   "accept_error",
			Message: "Failed to accept order",
		})
		return
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Message: "Order accepted successfully",
		Data: gin.H{
			"order_id": orderID,
			"status":   "accepted",
		},
	})
}

// @Summary Mark order as picked up
// @Description Update order status to picked up
// @Tags Order Management
// @Accept json
// @Produce json
// @Param order_id path string true "Order ID"
// @Param pickup body models.PickupUpdate true "Pickup update data"
// @Success 200 {object} models.APIResponse
// @Security BearerAuth
// @Router /delivery/orders/{order_id}/pickup [put]
func (h *OrderHandler) MarkPickup(c *gin.Context) {
	orderID := c.Param("order_id")
	deliveryPartnerID := c.GetString("delivery_partner_id")
	if deliveryPartnerID == "" {
		deliveryPartnerID = c.GetString("user_id")
	}

	var pickupUpdate models.PickupUpdate
	if err := c.ShouldBindJSON(&pickupUpdate); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Error:   "invalid_request",
			Message: "Invalid request body",
			Details: utils.GetValidationErrors(err),
		})
		return
	}

	err := h.orderService.MarkPickup(orderID, deliveryPartnerID, &pickupUpdate)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Error:   "pickup_error",
			Message: "Failed to update pickup status",
		})
		return
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Message: "Pickup status updated successfully",
	})
}

// @Summary Mark order as delivered
// @Description Update order status to delivered
// @Tags Order Management
// @Accept json
// @Produce json
// @Param order_id path string true "Order ID"
// @Param delivery body models.DeliveryUpdate true "Delivery update data"
// @Success 200 {object} models.APIResponse
// @Security BearerAuth
// @Router /delivery/orders/{order_id}/deliver [put]
func (h *OrderHandler) MarkDelivered(c *gin.Context) {
	orderID := c.Param("order_id")
	deliveryPartnerID := c.GetString("delivery_partner_id")
	if deliveryPartnerID == "" {
		deliveryPartnerID = c.GetString("user_id")
	}

	var deliveryUpdate models.DeliveryUpdate
	if err := c.ShouldBindJSON(&deliveryUpdate); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Error:   "invalid_request",
			Message: "Invalid request body",
			Details: utils.GetValidationErrors(err),
		})
		return
	}

	err := h.orderService.MarkDelivered(orderID, deliveryPartnerID, &deliveryUpdate)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Error:   "delivery_error",
			Message: "Failed to update delivery status",
		})
		return
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Message: "Delivery status updated successfully",
	})
}

// @Summary Update current location during delivery
// @Description Update delivery partner location for real-time tracking
// @Tags Order Management
// @Accept json
// @Produce json
// @Param order_id path string true "Order ID"
// @Param location body models.LocationUpdate true "Location update data"
// @Success 200 {object} models.APIResponse
// @Security BearerAuth
// @Router /delivery/orders/{order_id}/location [put]
func (h *OrderHandler) UpdateLocation(c *gin.Context) {
	orderID := c.Param("order_id")
	deliveryPartnerID := c.GetString("delivery_partner_id")
	if deliveryPartnerID == "" {
		deliveryPartnerID = c.GetString("user_id")
	}

	var locationUpdate models.LocationUpdate
	if err := c.ShouldBindJSON(&locationUpdate); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Error:   "invalid_request",
			Message: "Invalid request body",
			Details: utils.GetValidationErrors(err),
		})
		return
	}

	err := h.orderService.UpdateLocation(orderID, deliveryPartnerID, &locationUpdate)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Error:   "location_error",
			Message: "Failed to update location",
		})
		return
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Message: "Location updated successfully",
	})
}

// @Summary Get active delivery orders
// @Description Get currently active orders for the delivery partner
// @Tags Order Management
// @Accept json
// @Produce json
// @Success 200 {object} models.APIResponse{data=[]models.DeliveryOrder}
// @Security BearerAuth
// @Router /delivery/orders/active [get]
func (h *OrderHandler) GetActiveOrders(c *gin.Context) {
	deliveryPartnerID := c.GetString("delivery_partner_id")
	if deliveryPartnerID == "" {
		deliveryPartnerID = c.GetString("user_id")
	}

	orders, err := h.orderService.GetActiveOrders(deliveryPartnerID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Error:   "database_error",
			Message: "Failed to retrieve active orders",
		})
		return
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Data:    orders,
	})
}

// @Summary Get delivery history
// @Description Get delivery history with filtering options
// @Tags Order Management
// @Accept json
// @Produce json
// @Param status query string false "Status filter"
// @Param date_from query string false "Start date (YYYY-MM-DD)"
// @Param date_to query string false "End date (YYYY-MM-DD)"
// @Param page query int false "Page number" default(1)
// @Param limit query int false "Items per page" default(20)
// @Success 200 {object} models.APIResponse{data=models.PaginationResponse}
// @Security BearerAuth
// @Router /delivery/orders/history [get]
func (h *OrderHandler) GetDeliveryHistory(c *gin.Context) {
	deliveryPartnerID := c.GetString("delivery_partner_id")
	if deliveryPartnerID == "" {
		deliveryPartnerID = c.GetString("user_id")
	}

	status := c.Query("status")
	dateFrom := c.Query("date_from")
	dateTo := c.Query("date_to")
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "20"))

	orders, total, err := h.orderService.GetDeliveryHistory(deliveryPartnerID, status, dateFrom, dateTo, page, limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Error:   "database_error",
			Message: "Failed to retrieve delivery history",
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