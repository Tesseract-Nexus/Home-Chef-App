package routes

import (
	"admin-service/config"
	"admin-service/handlers"
	"admin-service/middleware"
	"admin-service/websocket"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

func SetupRoutes(cfg *config.Config, hub *websocket.Hub, logger *zap.Logger) *gin.Engine {
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
			"service":   "admin-service",
			"websocket": gin.H{
				"clients": hub.GetConnectedClients(),
			},
		})
	})

	// Initialize handlers
	dashboardHandler := handlers.NewDashboardHandler()
	userHandler := handlers.NewUserHandler()
	chefHandler := handlers.NewChefHandler()
	orderHandler := handlers.NewOrderHandler()
	deliveryHandler := handlers.NewDeliveryHandler()
	payoutHandler := handlers.NewPayoutHandler()
	supportHandler := handlers.NewSupportHandler()
	reportHandler := handlers.NewReportHandler()
	settingsHandler := handlers.NewSettingsHandler()
	policyHandler := handlers.NewPolicyHandler()

	// WebSocket endpoint
	router.GET("/ws", hub.HandleWebSocket)

	// API routes - all require admin authentication
	api := router.Group("/v1")
	api.Use(middleware.AuthMiddleware(cfg))
	api.Use(middleware.AdminOnlyMiddleware())
	{
		// Admin Dashboard
		api.GET("/admin/dashboard", dashboardHandler.GetDashboard)
		api.GET("/admin/analytics", dashboardHandler.GetAnalytics)

		// User Management
		api.GET("/admin/users", userHandler.GetUsers)
		api.GET("/admin/users/:user_id", userHandler.GetUser)
		api.PUT("/admin/users/:user_id", userHandler.UpdateUser)
		api.PUT("/admin/users/:user_id/status", userHandler.UpdateUserStatus)

		// Chef Management
		api.GET("/admin/chefs", chefHandler.GetChefs)
		api.POST("/admin/chefs/:chef_id/approve", chefHandler.ApproveChef)
		api.POST("/admin/chefs/:chef_id/reject", chefHandler.RejectChef)
		api.POST("/admin/chefs/:chef_id/suspend", chefHandler.SuspendChef)

		// Order Management
		api.GET("/admin/orders", orderHandler.GetOrders)
		api.POST("/admin/orders/:order_id/refund", orderHandler.ProcessRefund)

		// Delivery Management
		api.GET("/admin/delivery-partners", deliveryHandler.GetDeliveryPartners)
		api.POST("/admin/delivery-partners/:partner_id/approve", deliveryHandler.ApproveDeliveryPartner)

		// Payout Management
		api.GET("/admin/payouts", payoutHandler.GetPayouts)
		api.POST("/admin/payouts", payoutHandler.ProcessBulkPayouts)
		api.POST("/admin/payouts/:payout_id/process", payoutHandler.ProcessPayout)

		// Customer Support
		api.GET("/admin/support/tickets", supportHandler.GetSupportTickets)
		api.PUT("/admin/support/tickets/:ticket_id/assign", supportHandler.AssignTicket)

		// Reports
		api.GET("/admin/reports/revenue", reportHandler.GetRevenueReport)
		api.GET("/admin/reports/orders", reportHandler.GetOrdersReport)

		// Platform Settings
		api.GET("/admin/settings/platform", settingsHandler.GetPlatformSettings)
		api.PUT("/admin/settings/platform", settingsHandler.UpdatePlatformSettings)

		// Policy Management
		api.GET("/admin/cancellation-policy", policyHandler.GetCancellationPolicy)
		api.PUT("/admin/cancellation-policy", policyHandler.UpdateCancellationPolicy)
	}

	return router
}