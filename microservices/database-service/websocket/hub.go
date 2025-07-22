package websocket

import (
	"database-service/models"
	"encoding/json"
	"log"
	"net/http"
	"sync"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
	"go.uber.org/zap"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		// Allow connections from any origin in development
		// In production, implement proper origin checking
		return true
	},
}

type Hub struct {
	clients    map[*Client]bool
	broadcast  chan []byte
	register   chan *Client
	unregister chan *Client
	logger     *zap.Logger
	mutex      sync.RWMutex
}

type Client struct {
	hub    *Hub
	conn   *websocket.Conn
	send   chan []byte
	userID string
	role   string
}

func NewHub(logger *zap.Logger) *Hub {
	return &Hub{
		clients:    make(map[*Client]bool),
		broadcast:  make(chan []byte),
		register:   make(chan *Client),
		unregister: make(chan *Client),
		logger:     logger,
	}
}

func (h *Hub) Run() {
	for {
		select {
		case client := <-h.register:
			h.mutex.Lock()
			h.clients[client] = true
			h.mutex.Unlock()
			
			h.logger.Info("Client connected",
				zap.String("user_id", client.userID),
				zap.String("role", client.role),
			)
			
			// Send welcome message
			welcomeMsg := models.CreateWebSocketMessage(
				models.WSTypeEvent,
				"connected",
				gin.H{"message": "Connected to HomeChef WebSocket"},
				client.userID,
			)
			
			if data, err := welcomeMsg.ToJSON(); err == nil {
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
				h.logger.Info("Client disconnected",
					zap.String("user_id", client.userID),
					zap.String("role", client.role),
				)
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

func (h *Hub) HandleWebSocket(c *gin.Context) {
	conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		h.logger.Error("WebSocket upgrade failed", zap.Error(err))
		return
	}

	// Get user info from query params or headers
	userID := c.Query("user_id")
	role := c.Query("role")
	
	if userID == "" {
		userID = "anonymous"
	}
	if role == "" {
		role = "guest"
	}

	client := &Client{
		hub:    h,
		conn:   conn,
		send:   make(chan []byte, 256),
		userID: userID,
		role:   role,
	}

	client.hub.register <- client

	// Start goroutines for reading and writing
	go client.writePump()
	go client.readPump()
}

func (c *Client) readPump() {
	defer func() {
		c.hub.unregister <- c
		c.conn.Close()
	}()

	c.conn.SetReadLimit(512)
	c.conn.SetPongHandler(func(string) error {
		return nil
	})

	for {
		_, message, err := c.conn.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				c.hub.logger.Error("WebSocket error", zap.Error(err))
			}
			break
		}

		// Handle incoming messages
		var wsMsg models.WebSocketMessage
		if err := json.Unmarshal(message, &wsMsg); err != nil {
			c.hub.logger.Error("Failed to unmarshal WebSocket message", zap.Error(err))
			continue
		}

		// Process message based on type
		c.handleMessage(&wsMsg)
	}
}

func (c *Client) writePump() {
	defer c.conn.Close()

	for {
		select {
		case message, ok := <-c.send:
			if !ok {
				c.conn.WriteMessage(websocket.CloseMessage, []byte{})
				return
			}

			if err := c.conn.WriteMessage(websocket.TextMessage, message); err != nil {
				c.hub.logger.Error("WebSocket write error", zap.Error(err))
				return
			}
		}
	}
}

func (c *Client) handleMessage(msg *models.WebSocketMessage) {
	switch msg.Event {
	case models.WSEventHeartbeat:
		// Respond to heartbeat
		response := models.CreateWebSocketMessage(
			models.WSTypeHeartbeat,
			models.WSEventHeartbeat,
			gin.H{"status": "alive"},
			c.userID,
		)
		
		if data, err := response.ToJSON(); err == nil {
			select {
			case c.send <- data:
			default:
				c.hub.logger.Warn("Failed to send heartbeat response")
			}
		}

	default:
		c.hub.logger.Info("Received WebSocket message",
			zap.String("event", msg.Event),
			zap.String("type", msg.Type),
			zap.String("user_id", c.userID),
		)
	}
}

// BroadcastToAll sends message to all connected clients
func (h *Hub) BroadcastToAll(message *models.WebSocketMessage) {
	if data, err := message.ToJSON(); err == nil {
		h.broadcast <- data
	}
}

// BroadcastToUser sends message to specific user
func (h *Hub) BroadcastToUser(userID string, message *models.WebSocketMessage) {
	if data, err := message.ToJSON(); err == nil {
		h.mutex.RLock()
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
		h.mutex.RUnlock()
	}
}

// BroadcastToRole sends message to all users with specific role
func (h *Hub) BroadcastToRole(role string, message *models.WebSocketMessage) {
	if data, err := message.ToJSON(); err == nil {
		h.mutex.RLock()
		for client := range h.clients {
			if client.role == role {
				select {
				case client.send <- data:
				default:
					close(client.send)
					delete(h.clients, client)
				}
			}
		}
		h.mutex.RUnlock()
	}
}

// GetConnectedClients returns count of connected clients
func (h *Hub) GetConnectedClients() int {
	h.mutex.RLock()
	defer h.mutex.RUnlock()
	return len(h.clients)
}

// GetClientsByRole returns count of clients by role
func (h *Hub) GetClientsByRole(role string) int {
	h.mutex.RLock()
	defer h.mutex.RUnlock()
	
	count := 0
	for client := range h.clients {
		if client.role == role {
			count++
		}
	}
	return count
}