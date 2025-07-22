package routes

import (
	"inventory-service/config"
	"inventory-service/handlers"
	"inventory-service/middleware"
	"inventory-service/services"
	"inventory-service/websocket"

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
			"service":   "inventory-service",
			"websocket": gin.H{
				"clients": hub.GetConnectedClients(),
			},
		})
	})

	// Initialize services
	inventoryService := services.NewInventoryService(db, logger)

	// Initialize handlers
	ingredientHandler := handlers.NewIngredientHandler(inventoryService)
	recipeHandler := handlers.NewRecipeHandler(inventoryService)
	availabilityHandler := handlers.NewAvailabilityHandler(inventoryService)
	alertHandler := handlers.NewAlertHandler(inventoryService)
	supplierHandler := handlers.NewSupplierHandler()
	reportHandler := handlers.NewReportHandler()

	// WebSocket endpoint
	router.GET("/ws", hub.HandleWebSocket)

	// API routes
	api := router.Group("/v1")
	api.Use(middleware.AuthMiddleware(cfg))
	api.Use(middleware.ChefOnlyMiddleware())
	{
		// Ingredient Management
		api.GET("/inventory/ingredients", ingredientHandler.GetIngredients)
		api.POST("/inventory/ingredients", ingredientHandler.CreateIngredient)
		api.GET("/inventory/ingredients/:ingredient_id", ingredientHandler.GetIngredient)
		api.PUT("/inventory/ingredients/:ingredient_id", ingredientHandler.UpdateIngredient)
		api.DELETE("/inventory/ingredients/:ingredient_id", ingredientHandler.DeleteIngredient)

		// Stock Management
		api.PUT("/inventory/ingredients/:ingredient_id/stock", ingredientHandler.UpdateStock)

		// Recipe Management
		api.GET("/inventory/recipes/:dish_id/ingredients", recipeHandler.GetRecipeIngredients)
		api.PUT("/inventory/recipes/:dish_id/ingredients", recipeHandler.UpdateRecipeIngredients)

		// Availability Check
		api.POST("/inventory/availability/check", availabilityHandler.CheckAvailability)

		// Inventory Alerts
		api.GET("/inventory/alerts", alertHandler.GetAlerts)
		api.GET("/inventory/alerts/settings", alertHandler.GetAlertSettings)
		api.PUT("/inventory/alerts/settings", alertHandler.UpdateAlertSettings)

		// Suppliers
		api.GET("/inventory/suppliers", supplierHandler.GetSuppliers)

		// Reports
		api.GET("/inventory/reports/usage", reportHandler.GetUsageReport)
		api.GET("/inventory/reports/waste", reportHandler.GetWasteReport)
	}

	return router
}