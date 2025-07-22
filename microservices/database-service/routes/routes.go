package routes

import (
	"database-service/config"
	"database-service/database"
	"database-service/handlers"
	"database-service/middleware"
	websocketHub "database-service/websocket"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

func SetupRoutes(cfg *config.Config, postgres *database.PostgresDB, redis *database.RedisClient, hub *websocketHub.Hub, logger *zap.Logger) *gin.Engine {
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
			"status":  "healthy",
			"service": "database-service",
			"database": gin.H{
				"postgres": "connected",
				"redis":    "connected",
			},
			"websocket": gin.H{
				"clients": hub.GetConnectedClients(),
			},
		})
	})

	// Initialize handlers
	dbHandler := handlers.NewDatabaseHandler(postgres, redis, logger)
	cacheHandler := handlers.NewCacheHandler(redis, logger)
	wsHandler := handlers.NewWebSocketHandler(hub, logger)

	// API routes
	api := router.Group("/v1")
	{
		// Database routes
		database := api.Group("/database")
		{
			database.GET("/users", dbHandler.GetUsers)
			database.GET("/users/:id", dbHandler.GetUserByID)
			database.GET("/chefs", dbHandler.GetChefs)
			database.GET("/menu-items", dbHandler.GetMenuItems)
			database.GET("/orders", dbHandler.GetOrders)
			database.POST("/test-order", dbHandler.CreateTestOrder)
		}

		// Cache routes
		cache := api.Group("/cache")
		{
			cache.GET("/:key", cacheHandler.GetCache)
			cache.POST("/:key", cacheHandler.SetCache)
			cache.DELETE("/:key", cacheHandler.DeleteCache)
			cache.GET("/chef-availability/:chef_id", cacheHandler.GetChefAvailability)
			cache.PUT("/chef-availability/:chef_id", cacheHandler.UpdateChefAvailability)
			cache.GET("/popular-dishes", cacheHandler.GetPopularDishes)
			cache.GET("/delivery-location/:delivery_id", cacheHandler.GetDeliveryLocation)
			cache.PUT("/delivery-location/:delivery_id", cacheHandler.UpdateDeliveryLocation)
			cache.GET("/stats", cacheHandler.GetCacheStats)
		}

		// WebSocket routes
		websocket := api.Group("/ws")
		{
			websocket.POST("/broadcast", wsHandler.BroadcastToAll)
			websocket.POST("/broadcast/user/:user_id", wsHandler.BroadcastToUser)
			websocket.POST("/broadcast/role/:role", wsHandler.BroadcastToRole)
			websocket.POST("/order-update", wsHandler.SendOrderUpdate)
			websocket.POST("/delivery-location", wsHandler.SendDeliveryLocation)
			websocket.GET("/stats", wsHandler.GetWebSocketStats)
		}
	}

	// WebSocket endpoint
	router.GET("/ws", wsHandler.HandleWebSocket)

	return router
}