package models

import (
	"encoding/json"
	"time"
)

// WebSocketMessage represents a WebSocket message
type WebSocketMessage struct {
	Type      string      `json:"type"`
	Event     string      `json:"event"`
	Data      interface{} `json:"data"`
	UserID    string      `json:"user_id,omitempty"`
	Timestamp time.Time   `json:"timestamp"`
}

// WebSocketClient represents a connected WebSocket client
type WebSocketClient struct {
	ID     string
	UserID string
	Role   string
	Conn   interface{} // Will be *websocket.Conn
	Send   chan []byte
}

// WebSocketHub manages WebSocket connections
type WebSocketHub struct {
	Clients    map[*WebSocketClient]bool
	Broadcast  chan []byte
	Register   chan *WebSocketClient
	Unregister chan *WebSocketClient
}

// Message types for WebSocket communication
const (
	// Order related events
	WSEventOrderCreated    = "order_created"
	WSEventOrderUpdated    = "order_updated"
	WSEventOrderCancelled  = "order_cancelled"
	WSEventOrderDelivered  = "order_delivered"
	
	// Chef related events
	WSEventChefOnline      = "chef_online"
	WSEventChefOffline     = "chef_offline"
	WSEventMenuUpdated     = "menu_updated"
	
	// Delivery related events
	WSEventDeliveryAssigned = "delivery_assigned"
	WSEventDeliveryStarted  = "delivery_started"
	WSEventDeliveryLocation = "delivery_location"
	
	// General events
	WSEventNotification    = "notification"
	WSEventSystemMessage   = "system_message"
	WSEventHeartbeat       = "heartbeat"
)

// Message types
const (
	WSTypeEvent        = "event"
	WSTypeNotification = "notification"
	WSTypeError        = "error"
	WSTypeHeartbeat    = "heartbeat"
)

// OrderUpdateData represents order update WebSocket data
type OrderUpdateData struct {
	OrderID           string    `json:"order_id"`
	Status            string    `json:"status"`
	EstimatedDelivery time.Time `json:"estimated_delivery,omitempty"`
	Message           string    `json:"message,omitempty"`
}

// DeliveryLocationData represents delivery location update
type DeliveryLocationData struct {
	OrderID   string  `json:"order_id"`
	Latitude  float64 `json:"latitude"`
	Longitude float64 `json:"longitude"`
	Timestamp time.Time `json:"timestamp"`
}

// NotificationData represents notification WebSocket data
type NotificationData struct {
	ID      string `json:"id"`
	Type    string `json:"type"`
	Title   string `json:"title"`
	Message string `json:"message"`
	Data    interface{} `json:"data,omitempty"`
}

// CreateWebSocketMessage creates a new WebSocket message
func CreateWebSocketMessage(msgType, event string, data interface{}, userID string) *WebSocketMessage {
	return &WebSocketMessage{
		Type:      msgType,
		Event:     event,
		Data:      data,
		UserID:    userID,
		Timestamp: time.Now(),
	}
}

// ToJSON converts WebSocket message to JSON bytes
func (msg *WebSocketMessage) ToJSON() ([]byte, error) {
	return json.Marshal(msg)
}