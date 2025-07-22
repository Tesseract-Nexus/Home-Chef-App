package routes

import (
	"delivery-service/config"
	"delivery-service/handlers"
	"delivery-service/middleware"
	"delivery-service/services"
	"delivery-service/websocket"

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
			"service":   "delivery-service",
			"websocket": gin.H{
				"clients": hub.GetConnectedClients(),
			},
		})
	})

	// Initialize services
	deliveryService := services.NewDeliveryService(db, logger)
	orderService := services.NewOrderService(db, logger)
	earningsService := services.NewEarningsService(db, logger)
	analyticsService := services.NewAnalyticsService(db, logger)
	vehicleService := services.NewVehicleService(db, logger)
	documentService := services.NewDocumentService(db, logger)
	emergencyService := services.NewEmergencyService(db, logger)

	// Initialize handlers
	profileHandler := handlers.NewProfileHandler(deliveryService)
	orderHandler := handlers.NewOrderHandler(orderService)
	earningsHandler := handlers.NewEarningsHandler(earningsService)
	analyticsHandler := handlers.NewAnalyticsHandler(analyticsService)
	vehicleHandler := handlers.NewVehicleHandler(vehicleService)
	documentHandler := handlers.NewDocumentHandler(documentService)
	emergencyHandler := handlers.NewEmergencyHandler(emergencyService)

	// WebSocket endpoint
	router.GET("/ws", hub.HandleWebSocket)

	// API routes
	api := router.Group("/v1")
	api.Use(middleware.AuthMiddleware(cfg))
	api.Use(middleware.DeliveryPartnerOnlyMiddleware())
	{
		// Delivery Partner Profile
		api.GET("/delivery/profile", profileHandler.GetProfile)
		api.PUT("/delivery/profile", profileHandler.UpdateProfile)
		api.PUT("/delivery/status", profileHandler.UpdateStatus)

		// Order Management
		api.GET("/delivery/orders/available", orderHandler.GetAvailableOrders)
		api.POST("/delivery/orders/:order_id/accept", orderHandler.AcceptOrder)
		api.PUT("/delivery/orders/:order_id/pickup", orderHandler.MarkPickup)
		api.PUT("/delivery/orders/:order_id/deliver", orderHandler.MarkDelivered)
		api.PUT("/delivery/orders/:order_id/location", orderHandler.UpdateLocation)
		api.GET("/delivery/orders/active", orderHandler.GetActiveOrders)
		api.GET("/delivery/orders/history", orderHandler.GetDeliveryHistory)

		// Earnings
		api.GET("/delivery/earnings", earningsHandler.GetEarningsSummary)
		api.GET("/delivery/earnings/breakdown", earningsHandler.GetEarningsBreakdown)

		// Analytics
		api.GET("/delivery/analytics", analyticsHandler.GetDeliveryAnalytics)

		// Vehicle Management
		api.PUT("/delivery/vehicle", vehicleHandler.UpdateVehicle)

		// Document Management
		api.POST("/delivery/documents", documentHandler.UploadDocument)

		// Emergency
		api.POST("/delivery/emergency", emergencyHandler.ReportEmergency)
	}

	return router
}