package handlers

import (
	"database-service/models"
	websocketHub "database-service/websocket"
	"net/http"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

type WebSocketHandler struct {
	hub    *websocketHub.Hub
	logger *zap.Logger
}

func NewWebSocketHandler(hub *websocketHub.Hub, logger *zap.Logger) *WebSocketHandler {
	return &WebSocketHandler{
		hub:    hub,
		logger: logger,
	}
}

// @Summary WebSocket connection endpoint
// @Description Establish WebSocket connection
// @Tags WebSocket
// @Param user_id query string false "User ID"
// @Param role query string false "User role"
// @Success 101 {string} string "Switching Protocols"
// @Router /ws [get]
func (h *WebSocketHandler) HandleWebSocket(c *gin.Context) {
	h.hub.HandleWebSocket(c)
}

// @Summary Broadcast message to all clients
// @Description Send a message to all connected WebSocket clients
// @Tags WebSocket
// @Accept json
// @Produce json
// @Param message body object true "Message data"
// @Success 200 {object} models.APIResponse
// @Router /ws/broadcast [post]
func (h *WebSocketHandler) BroadcastToAll(c *gin.Context) {
	var request struct {
		Type    string      `json:"type" binding:"required"`
		Event   string      `json:"event" binding:"required"`
		Data    interface{} `json:"data"`
		Message string      `json:"message"`
	}

	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Error:   "invalid_request",
			Message: "Invalid request body",
		})
		return
	}

	wsMessage := models.CreateWebSocketMessage(
		request.Type,
		request.Event,
		request.Data,
		"",
	)

	h.hub.BroadcastToAll(wsMessage)

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Message: "Message broadcasted to all clients",
		Data: gin.H{
			"clients_count": h.hub.GetConnectedClients(),
		},
	})
}

// @Summary Broadcast message to specific user
// @Description Send a message to a specific user
// @Tags WebSocket
// @Accept json
// @Produce json
// @Param user_id path string true "User ID"
// @Param message body object true "Message data"
// @Success 200 {object} models.APIResponse
// @Router /ws/broadcast/user/{user_id} [post]
func (h *WebSocketHandler) BroadcastToUser(c *gin.Context) {
	userID := c.Param("user_id")

	var request struct {
		Type    string      `json:"type" binding:"required"`
		Event   string      `json:"event" binding:"required"`
		Data    interface{} `json:"data"`
		Message string      `json:"message"`
	}

	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Error:   "invalid_request",
			Message: "Invalid request body",
		})
		return
	}

	wsMessage := models.CreateWebSocketMessage(
		request.Type,
		request.Event,
		request.Data,
		userID,
	)

	h.hub.BroadcastToUser(userID, wsMessage)

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Message: "Message sent to user",
		Data: gin.H{
			"user_id": userID,
		},
	})
}

// @Summary Broadcast message to role
// @Description Send a message to all users with specific role
// @Tags WebSocket
// @Accept json
// @Produce json
// @Param role path string true "User role"
// @Param message body object true "Message data"
// @Success 200 {object} models.APIResponse
// @Router /ws/broadcast/role/{role} [post]
func (h *WebSocketHandler) BroadcastToRole(c *gin.Context) {
	role := c.Param("role")

	var request struct {
		Type    string      `json:"type" binding:"required"`
		Event   string      `json:"event" binding:"required"`
		Data    interface{} `json:"data"`
		Message string      `json:"message"`
	}

	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Error:   "invalid_request",
			Message: "Invalid request body",
		})
		return
	}

	wsMessage := models.CreateWebSocketMessage(
		request.Type,
		request.Event,
		request.Data,
		"",
	)

	h.hub.BroadcastToRole(role, wsMessage)

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Message: "Message sent to role",
		Data: gin.H{
			"role":          role,
			"clients_count": h.hub.GetClientsByRole(role),
		},
	})
}

// @Summary Send order update notification
// @Description Send order status update to customer and chef
// @Tags WebSocket
// @Accept json
// @Produce json
// @Param notification body object true "Order update data"
// @Success 200 {object} models.APIResponse
// @Router /ws/order-update [post]
func (h *WebSocketHandler) SendOrderUpdate(c *gin.Context) {
	var request struct {
		OrderID           string `json:"order_id" binding:"required"`
		CustomerID        string `json:"customer_id" binding:"required"`
		ChefID            string `json:"chef_id" binding:"required"`
		Status            string `json:"status" binding:"required"`
		EstimatedDelivery string `json:"estimated_delivery"`
		Message           string `json:"message"`
	}

	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Error:   "invalid_request",
			Message: "Invalid request body",
		})
		return
	}

	orderData := models.OrderUpdateData{
		OrderID: request.OrderID,
		Status:  request.Status,
		Message: request.Message,
	}

	// Send to customer
	customerMessage := models.CreateWebSocketMessage(
		models.WSTypeEvent,
		models.WSEventOrderUpdated,
		orderData,
		request.CustomerID,
	)
	h.hub.BroadcastToUser(request.CustomerID, customerMessage)

	// Send to chef
	chefMessage := models.CreateWebSocketMessage(
		models.WSTypeEvent,
		models.WSEventOrderUpdated,
		orderData,
		request.ChefID,
	)
	h.hub.BroadcastToUser(request.ChefID, chefMessage)

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Message: "Order update sent successfully",
		Data: gin.H{
			"order_id":    request.OrderID,
			"customer_id": request.CustomerID,
			"chef_id":     request.ChefID,
		},
	})
}

// @Summary Send delivery location update
// @Description Send delivery partner location update
// @Tags WebSocket
// @Accept json
// @Produce json
// @Param location body object true "Location data"
// @Success 200 {object} models.APIResponse
// @Router /ws/delivery-location [post]
func (h *WebSocketHandler) SendDeliveryLocation(c *gin.Context) {
	var request struct {
		OrderID     string  `json:"order_id" binding:"required"`
		CustomerID  string  `json:"customer_id" binding:"required"`
		Latitude    float64 `json:"latitude" binding:"required"`
		Longitude   float64 `json:"longitude" binding:"required"`
	}

	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Error:   "invalid_request",
			Message: "Invalid request body",
		})
		return
	}

	locationData := models.DeliveryLocationData{
		OrderID:   request.OrderID,
		Latitude:  request.Latitude,
		Longitude: request.Longitude,
	}

	message := models.CreateWebSocketMessage(
		models.WSTypeEvent,
		models.WSEventDeliveryLocation,
		locationData,
		request.CustomerID,
	)

	h.hub.BroadcastToUser(request.CustomerID, message)

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Message: "Delivery location update sent",
		Data: gin.H{
			"order_id":    request.OrderID,
			"customer_id": request.CustomerID,
		},
	})
}

// @Summary Get WebSocket statistics
// @Description Get WebSocket connection statistics
// @Tags WebSocket
// @Accept json
// @Produce json
// @Success 200 {object} models.APIResponse
// @Router /ws/stats [get]
func (h *WebSocketHandler) GetWebSocketStats(c *gin.Context) {
	stats := gin.H{
		"total_clients":     h.hub.GetConnectedClients(),
		"chef_clients":      h.hub.GetClientsByRole("chef"),
		"customer_clients":  h.hub.GetClientsByRole("customer"),
		"delivery_clients":  h.hub.GetClientsByRole("delivery"),
		"admin_clients":     h.hub.GetClientsByRole("admin"),
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Data:    stats,
	})
}