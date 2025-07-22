package routes

import (
	"financial-service/config"
	"financial-service/handlers"
	"financial-service/middleware"
	"financial-service/services"
	"financial-service/websocket"

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
			"service":   "financial-service",
			"websocket": gin.H{
				"clients": hub.GetConnectedClients(),
			},
		})
	})

	// Initialize services
	financialService := services.NewFinancialService(db, logger)

	// Initialize handlers
	financialHandler := handlers.NewFinancialHandler(financialService)

	// WebSocket endpoint
	router.GET("/ws", hub.HandleWebSocket)

	// API routes
	api := router.Group("/v1")
	api.Use(middleware.AuthMiddleware(cfg))
	api.Use(middleware.ChefOrAdminMiddleware())
	{
		// Chef Financial Management
		api.GET("/financial/chefs/:chef_id/summary", financialHandler.GetChefFinancialSummary)
		api.GET("/financial/chefs/:chef_id/profit-loss", financialHandler.GetChefProfitLoss)
		
		// Chef Expenses
		api.GET("/financial/chefs/:chef_id/expenses", financialHandler.GetChefExpenses)
		api.POST("/financial/chefs/:chef_id/expenses", financialHandler.CreateChefExpense)
		
		// Chef Payouts
		api.GET("/financial/chefs/:chef_id/payouts", financialHandler.GetChefPayouts)
		api.POST("/financial/chefs/:chef_id/payouts", financialHandler.RequestChefPayout)
	}

	return router
}