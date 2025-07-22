package websocket

import (
	"encoding/json"
	"net/http"
	"sync"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
	"go.uber.org/zap"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true // Allow connections from any origin in development
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

type Message struct {
	Type   string      `json:"type"`
	Event  string      `json:"event"`
	Data   interface{} `json:"data"`
	UserID string      `json:"user_id,omitempty"`
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
			h.logger.Info("Messaging client connected", zap.String("user_id", client.userID), zap.String("role", client.role))

		case client := <-h.unregister:
			h.mutex.Lock()
			if _, ok := h.clients[client]; ok {
				delete(h.clients, client)
				close(client.send)
				h.logger.Info("Messaging client disconnected", zap.String("user_id", client.userID))
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

	userID := c.Query("user_id")
	role := c.Query("role")
	
	if userID == "" {
		userID = "messaging-user"
	}
	if role == "" {
		role = "user"
	}

	client := &Client{
		hub:    h,
		conn:   conn,
		send:   make(chan []byte, 256),
		userID: userID,
		role:   role,
	}

	client.hub.register <- client

	go client.writePump()
	go client.readPump()
}

func (c *Client) readPump() {
	defer func() {
		c.hub.unregister <- c
		c.conn.Close()
	}()

	for {
		_, message, err := c.conn.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				c.hub.logger.Error("WebSocket error", zap.Error(err))
			}
			break
		}

		var msg Message
		if err := json.Unmarshal(message, &msg); err != nil {
			c.hub.logger.Error("Failed to unmarshal message", zap.Error(err))
			continue
		}

		c.handleMessage(&msg)
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

func (c *Client) handleMessage(msg *Message) {
	switch msg.Event {
	case "ping":
		response := Message{
			Type:  "pong",
			Event: "pong",
			Data:  gin.H{"status": "alive"},
		}
		if data, err := json.Marshal(response); err == nil {
			select {
			case c.send <- data:
			default:
				c.hub.logger.Warn("Failed to send pong response")
			}
		}
	case "join_conversation":
		// Handle joining a conversation room
		c.hub.logger.Info("User joined conversation", zap.String("user_id", c.userID), zap.Any("data", msg.Data))
	default:
		c.hub.logger.Info("Received messaging message", zap.String("event", msg.Event), zap.String("user_id", c.userID))
	}
}

func (h *Hub) BroadcastMessage(message *Message) {
	if data, err := json.Marshal(message); err == nil {
		h.broadcast <- data
	}
}

func (h *Hub) BroadcastToUser(userID string, message *Message) {
	if data, err := json.Marshal(message); err == nil {
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

func (h *Hub) BroadcastToConversation(conversationID string, message *Message) {
	// In a real implementation, you would track which users are in which conversations
	// For now, broadcast to all connected clients
	h.BroadcastMessage(message)
}

func (h *Hub) GetConnectedClients() int {
	h.mutex.RLock()
	defer h.mutex.RUnlock()
	return len(h.clients)
}