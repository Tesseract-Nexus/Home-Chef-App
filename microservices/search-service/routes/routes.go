package routes

import (
	"search-service/config"
	"search-service/handlers"
	"search-service/middleware"
	"search-service/services"
	"search-service/websocket"

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
			"service":   "search-service",
			"websocket": gin.H{
				"clients": hub.GetConnectedClients(),
			},
		})
	})

	// Initialize services
	searchService := services.NewSearchService(db, logger)

	// Initialize handlers
	searchHandler := handlers.NewSearchHandler(searchService)

	// WebSocket endpoint
	router.GET("/ws", hub.HandleWebSocket)

	// API routes
	api := router.Group("/v1")
	
	// Public routes (optional auth)
	public := api.Group("")
	public.Use(middleware.OptionalAuthMiddleware(cfg))
	{
		// Global Search
		public.GET("/search", searchHandler.GlobalSearch)
		public.GET("/search/suggestions", searchHandler.GetSuggestions)
		public.GET("/search/trending", searchHandler.GetTrendingSearches)
		public.GET("/search/popular", searchHandler.GetPopularItems)
		public.GET("/search/filters", searchHandler.GetSearchFilters)
	}
	
	// Protected routes (require authentication)
	protected := api.Group("")
	protected.Use(middleware.AuthMiddleware(cfg))
	{
		// Search History
		protected.GET("/search/history", searchHandler.GetSearchHistory)
		protected.DELETE("/search/history", searchHandler.ClearSearchHistory)

		// Saved Searches
		protected.POST("/search/save", searchHandler.SaveSearch)
		protected.GET("/search/saved", searchHandler.GetSavedSearches)
	}

	return router
}