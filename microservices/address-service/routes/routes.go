package routes

import (
	"address-service/config"
	"address-service/handlers"
	"address-service/middleware"
	"address-service/services"
	"address-service/websocket"

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
			"service":   "address-service",
			"websocket": gin.H{
				"clients": hub.GetConnectedClients(),
			},
		})
	})

	// Initialize services
	addressService := services.NewAddressService(db, cfg, logger)

	// Initialize handlers
	addressHandler := handlers.NewAddressHandler(addressService)

	// WebSocket endpoint
	router.GET("/ws", hub.HandleWebSocket)

	// API routes
	api := router.Group("/v1")
	{
		// Public routes (no auth required)
		api.POST("/addresses/validate", addressHandler.ValidateAddress)

		// Protected routes (require authentication)
		protected := api.Group("")
		protected.Use(middleware.AuthMiddleware(cfg))
		{
			// Address management
			protected.GET("/addresses", addressHandler.GetAddresses)
			protected.POST("/addresses", addressHandler.CreateAddress)
			protected.GET("/addresses/:address_id", addressHandler.GetAddress)
			protected.PUT("/addresses/:address_id", addressHandler.UpdateAddress)
			protected.DELETE("/addresses/:address_id", addressHandler.DeleteAddress)
			protected.PUT("/addresses/:address_id/default", addressHandler.SetDefaultAddress)
		}
	}

	return router
}