package routes

import (
	"messaging-service/config"
	"messaging-service/handlers"
	"messaging-service/middleware"
	"messaging-service/services"
	"messaging-service/websocket"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
	"gorm.io/gorm"
)

func SetupRoutes(cfg *config.Config, db *gorm.DB, hub *websocket.Hub, logger *zap.Logger) *gin.Engine {
	// Set Gin mode
	if cfg.Environment == "production" {
		gin.SetMode(gin.ReleaseMode)
	}

	router := gin.New()

	// Middleware
	router.Use(middleware.CORSMiddleware())
	router.Use(middleware.LoggerMiddleware(logger))
	router.Use(gin.Recovery())

	// Health check
	router.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"status":    "healthy",
			"service":   "messaging-service",
			"websocket": gin.H{
				"clients": hub.GetConnectedClients(),
			},
		})
	})

	// Initialize services
	messagingService := services.NewMessagingService(db, logger)

	// Initialize handlers
	conversationHandler := handlers.NewConversationHandler(messagingService)
	messageHandler := handlers.NewMessageHandler(messagingService)
	templateHandler := handlers.NewTemplateHandler(messagingService)

	// WebSocket endpoint
	router.GET("/ws", hub.HandleWebSocket)

	// API routes
	api := router.Group("/v1")
	api.Use(middleware.AuthMiddleware(cfg))
	{
		// Conversation Management
		api.GET("/messages/conversations", conversationHandler.GetConversations)
		api.POST("/messages/conversations", conversationHandler.CreateConversation)
		api.GET("/messages/conversations/:conversation_id", conversationHandler.GetConversation)
		api.PUT("/messages/conversations/:conversation_id/archive", conversationHandler.ArchiveConversation)
		api.PUT("/messages/conversations/:conversation_id/block", conversationHandler.BlockConversation)

		// Message Management
		api.GET("/messages/conversations/:conversation_id/messages", messageHandler.GetMessages)
		api.POST("/messages/conversations/:conversation_id/messages", messageHandler.SendMessage)
		api.PUT("/messages/conversations/:conversation_id/read", messageHandler.MarkAsRead)

		// Message Templates
		api.GET("/messages/templates", templateHandler.GetTemplates)
	}

	return router
}