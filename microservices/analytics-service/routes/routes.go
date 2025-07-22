package routes

import (
	"analytics-service/config"
	"analytics-service/handlers"
	"analytics-service/middleware"
	"analytics-service/websocket"

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
			"service":   "analytics-service",
			"websocket": gin.H{
				"clients": hub.GetConnectedClients(),
			},
		})
	})

	// Initialize handlers
	platformHandler := handlers.NewPlatformHandler()
	revenueHandler := handlers.NewRevenueHandler()
	userHandler := handlers.NewUserHandler()
	orderHandler := handlers.NewOrderHandler()
	chefHandler := handlers.NewChefHandler()
	deliveryHandler := handlers.NewDeliveryHandler()
	financialHandler := handlers.NewFinancialHandler()
	operationalHandler := handlers.NewOperationalHandler()
	reportHandler := handlers.NewReportHandler()

	// WebSocket endpoint
	router.GET("/ws", hub.HandleWebSocket)

	// API routes - require authentication
	api := router.Group("/v1")
	api.Use(middleware.AuthMiddleware(cfg))
	api.Use(middleware.AdminOnlyMiddleware())
	{
		// Admin Analytics (matching the API spec)
		api.GET("/admin/analytics/platform", platformHandler.GetPlatformOverview)

		// Financial Analytics
		api.GET("/analytics/revenue", revenueHandler.GetRevenueAnalytics)
		api.GET("/analytics/financial/dashboard", financialHandler.GetFinancialDashboard)

		// User Analytics
		api.GET("/analytics/users", userHandler.GetUserAnalytics)
		api.GET("/analytics/customers/insights", userHandler.GetCustomerInsights)
		api.GET("/analytics/customers/cohorts", userHandler.GetCohortAnalysis)

		// Order Analytics
		api.GET("/analytics/orders", orderHandler.GetOrderAnalytics)

		// Chef Analytics
		api.GET("/analytics/chefs/:chef_id/performance", chefHandler.GetChefPerformance)
		api.GET("/analytics/chefs/ranking", chefHandler.GetChefRankings)

		// Delivery Analytics
		api.GET("/analytics/delivery/performance", deliveryHandler.GetDeliveryPerformance)

		// Operational Analytics
		api.GET("/analytics/operational/metrics", operationalHandler.GetOperationalMetrics)

		// Custom Reports
		api.POST("/analytics/reports/custom", reportHandler.CreateCustomReport)
		api.GET("/analytics/reports/:report_id", reportHandler.GetReport)

		// Real-time Analytics
		api.GET("/analytics/realtime/dashboard", reportHandler.GetRealTimeDashboard)

		// Data Export
		api.POST("/analytics/export", reportHandler.ExportData)
	}

	return router
}