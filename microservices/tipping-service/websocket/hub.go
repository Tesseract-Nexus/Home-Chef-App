package websocket

import (
	"encoding/json"
	"net/http"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
	"github.com/sirupsen/logrus"
	"homechef/tipping-service/models"
)

// Hub maintains the set of active clients and broadcasts messages to the clients
type Hub struct {
	// Registered clients
	clients map[*Client]bool

	// Inbound messages from the clients
	broadcast chan []byte

	// Register requests from the clients
	register chan *Client

	// Unregister requests from clients
	unregister chan *Client

	// Mutex for thread-safe operations
	mutex sync.RWMutex
}

// Client is a middleman between the websocket connection and the hub
type Client struct {
	hub *Hub

	// The websocket connection
	conn *websocket.Conn

	// Buffered channel of outbound messages
	send chan []byte

	// User ID for targeted messages
	userID string

	// User type (chef, delivery, customer)
	userType string
}

// Message types
const (
	MessageTypeTipReceived = "tip_received"
	MessageTypeTipSent     = "tip_sent"
	MessageTypeTipUpdate   = "tip_update"
)

// WebSocketMessage represents a websocket message
type WebSocketMessage struct {
	Type      string      `json:"type"`
	UserID    string      `json:"user_id,omitempty"`
	Data      interface{} `json:"data"`
	Timestamp time.Time   `json:"timestamp"`
}

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true // Allow connections from any origin in development
	},
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
}

// NewHub creates a new WebSocket hub
func NewHub() *Hub {
	return &Hub{
		broadcast:  make(chan []byte),
		register:   make(chan *Client),
		unregister: make(chan *Client),
		clients:    make(map[*Client]bool),
	}
}

// Run starts the hub
func (h *Hub) Run() {
	for {
		select {
		case client := <-h.register:
			h.mutex.Lock()
			h.clients[client] = true
			h.mutex.Unlock()
			
			logrus.WithFields(logrus.Fields{
				"user_id":   client.userID,
				"user_type": client.userType,
			}).Info("Client connected")

			// Send welcome message
			welcome := WebSocketMessage{
				Type:      "connected",
				Data:      map[string]string{"message": "Connected to tipping service"},
				Timestamp: time.Now(),
			}
			if data, err := json.Marshal(welcome); err == nil {
				select {
				case client.send <- data:
				default:
					close(client.send)
					h.mutex.Lock()
					delete(h.clients, client)
					h.mutex.Unlock()
				}
			}

		case client := <-h.unregister:
			h.mutex.Lock()
			if _, ok := h.clients[client]; ok {
				delete(h.clients, client)
				close(client.send)
				logrus.WithFields(logrus.Fields{
					"user_id":   client.userID,
					"user_type": client.userType,
				}).Info("Client disconnected")
			}
			h.mutex.Unlock()

		case message := <-h.broadcast:
			h.mutex.RLock()
			for client := range h.clients {
				select {
				case client.send <- message:
				default:
					close(client.send)
					delete(h.clients, client)
				}
			}
			h.mutex.RUnlock()
		}
	}
}

// HandleWebSocket handles WebSocket connections
func (h *Hub) HandleWebSocket() gin.HandlerFunc {
	return func(c *gin.Context) {
		conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
		if err != nil {
			logrus.WithError(err).Error("Failed to upgrade connection")
			return
		}

		// Get user info from query parameters or headers
		userID := c.Query("user_id")
		userType := c.Query("user_type")

		if userID == "" {
			// Try to get from header
			userID = c.GetHeader("X-User-ID")
			userType = c.GetHeader("X-User-Type")
		}

		client := &Client{
			hub:      h,
			conn:     conn,
			send:     make(chan []byte, 256),
			userID:   userID,
			userType: userType,
		}

		client.hub.register <- client

		// Start goroutines for handling the connection
		go client.writePump()
		go client.readPump()
	}
}

// BroadcastToUser sends a message to a specific user
func (h *Hub) BroadcastToUser(userID string, message WebSocketMessage) {
	data, err := json.Marshal(message)
	if err != nil {
		logrus.WithError(err).Error("Failed to marshal WebSocket message")
		return
	}

	h.mutex.RLock()
	defer h.mutex.RUnlock()

	for client := range h.clients {
		if client.userID == userID {
			select {
			case client.send <- data:
			default:
				close(client.send)
				delete(h.clients, client)
			}
		}
	}
}

// BroadcastTipReceived notifies a user about receiving a tip
func (h *Hub) BroadcastTipReceived(tip *models.TipTransaction) {
	message := WebSocketMessage{
		Type: MessageTypeTipReceived,
		Data: map[string]interface{}{
			"tip_id":    tip.ID,
			"amount":    tip.Amount,
			"from_user": tip.FromUserName,
			"message":   tip.Message,
			"order_id":  tip.OrderID,
		},
		Timestamp: time.Now(),
	}

	h.BroadcastToUser(tip.ToUserID, message)
}

// BroadcastTipSent notifies a user about successfully sending a tip
func (h *Hub) BroadcastTipSent(tip *models.TipTransaction) {
	message := WebSocketMessage{
		Type: MessageTypeTipSent,
		Data: map[string]interface{}{
			"tip_id":   tip.ID,
			"amount":   tip.Amount,
			"to_user":  tip.ToUserName,
			"message":  tip.Message,
			"order_id": tip.OrderID,
			"status":   tip.Status,
		},
		Timestamp: time.Now(),
	}

	h.BroadcastToUser(tip.FromUserID, message)
}

// readPump pumps messages from the websocket connection to the hub
func (c *Client) readPump() {
	defer func() {
		c.hub.unregister <- c
		c.conn.Close()
	}()

	c.conn.SetReadLimit(512)
	c.conn.SetReadDeadline(time.Now().Add(60 * time.Second))
	c.conn.SetPongHandler(func(string) error {
		c.conn.SetReadDeadline(time.Now().Add(60 * time.Second))
		return nil
	})

	for {
		_, _, err := c.conn.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				logrus.WithError(err).Error("WebSocket error")
			}
			break
		}
	}
}

// writePump pumps messages from the hub to the websocket connection
func (c *Client) writePump() {
	ticker := time.NewTicker(54 * time.Second)
	defer func() {
		ticker.Stop()
		c.conn.Close()
	}()

	for {
		select {
		case message, ok := <-c.send:
			c.conn.SetWriteDeadline(time.Now().Add(10 * time.Second))
			if !ok {
				c.conn.WriteMessage(websocket.CloseMessage, []byte{})
				return
			}

			w, err := c.conn.NextWriter(websocket.TextMessage)
			if err != nil {
				return
			}
			w.Write(message)

			// Add queued messages to the current websocket message
			n := len(c.send)
			for i := 0; i < n; i++ {
				w.Write([]byte{'\n'})
				w.Write(<-c.send)
			}

			if err := w.Close(); err != nil {
				return
			}

		case <-ticker.C:
			c.conn.SetWriteDeadline(time.Now().Add(10 * time.Second))
			if err := c.conn.WriteMessage(websocket.PingMessage, nil); err != nil {
				return
			}
		}
	}
}

// GetConnectedClients returns the number of connected clients
func (h *Hub) GetConnectedClients() int {
	h.mutex.RLock()
	defer h.mutex.RUnlock()
	return len(h.clients)
}

// GetClientsByUserType returns clients filtered by user type
func (h *Hub) GetClientsByUserType(userType string) []*Client {
	h.mutex.RLock()
	defer h.mutex.RUnlock()

	var clients []*Client
	for client := range h.clients {
		if client.userType == userType {
			clients = append(clients, client)
		}
	}
	return clients
}