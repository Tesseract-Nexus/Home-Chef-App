package routes

import (
	"order-service/config"
	"order-service/handlers"
	"order-service/middleware"
	"order-service/services"
	"order-service/websocket"

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
			"service":   "order-service",
			"websocket": gin.H{
				"clients": hub.GetConnectedClients(),
			},
		})
	})

	// Initialize services
	orderService := services.NewOrderService(db, logger)

	// Initialize handlers
	orderHandler := handlers.NewOrderHandler(orderService)
	policyHandler := handlers.NewPolicyHandler(orderService)
	analyticsHandler := handlers.NewAnalyticsHandler()
	notificationHandler := handlers.NewNotificationHandler()

	// WebSocket endpoint
	router.GET("/ws", hub.HandleWebSocket)

	// API routes
	api := router.Group("/v1")
	api.Use(middleware.AuthMiddleware(cfg))
	{
		// Order Management
		api.POST("/orders", orderHandler.CreateOrder)
		api.GET("/orders", orderHandler.GetOrders)
		api.GET("/orders/:order_id/journey", orderHandler.GetOrderJourney)
		api.POST("/orders/:order_id/cancel", orderHandler.CancelOrder)
		api.GET("/orders/:order_id/cancellation-info", orderHandler.GetCancellationInfo)
		api.GET("/orders/:order_id/countdown-status", orderHandler.GetCountdownStatus)
		api.POST("/orders/:order_id/confirm-after-timer", orderHandler.ConfirmAfterTimer)
		api.POST("/orders/:order_id/tip", orderHandler.AddTip)
		api.POST("/orders/:order_id/notifications", orderHandler.SendOrderNotifications)

		// Chef Operations
		api.POST("/orders/:order_id/chef-accept", orderHandler.ChefAcceptOrder)
		api.POST("/orders/:order_id/chef-decline", orderHandler.ChefDeclineOrder)
		api.PUT("/orders/:order_id/update-status", orderHandler.UpdateOrderStatus)

		// Delivery Operations
		api.GET("/delivery/orders/available", orderHandler.GetAvailableDeliveryOrders)
		api.POST("/delivery/orders/:order_id/accept", orderHandler.AcceptDeliveryOrder)

		// Admin routes
		admin := api.Group("/admin")
		admin.Use(middleware.AdminOnlyMiddleware())
		{
			admin.GET("/cancellation-policy", policyHandler.GetCancellationPolicy)
			admin.PUT("/cancellation-policy", policyHandler.UpdateCancellationPolicy)
			admin.GET("/cancellation-analytics", analyticsHandler.GetCancellationAnalytics)
		}

		// Notification routes
		api.POST("/notifications/order-cancellation", notificationHandler.SendCancellationNotifications)
	}

	return router
}