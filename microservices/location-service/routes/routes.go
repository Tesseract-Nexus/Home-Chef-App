package routes

import (
	"location-service/config"
	"location-service/handlers"
	"location-service/middleware"
	"location-service/services"
	"location-service/websocket"

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
			"service":   "location-service",
			"websocket": gin.H{
				"clients": hub.GetConnectedClients(),
			},
		})
	})

	// Initialize services
	locationService := services.NewLocationService(db, cfg, logger)

	// Initialize handlers
	locationHandler := handlers.NewLocationHandler(locationService)

	// WebSocket endpoint
	router.GET("/ws", hub.HandleWebSocket)

	// API routes
	api := router.Group("/v1")
	{
		// Public routes (no auth required)
		public := api.Group("")
		{
			// Location services
			public.GET("/locations/cities", locationHandler.GetSupportedCities)
			public.GET("/locations/areas", locationHandler.GetServiceableAreas)
			public.POST("/locations/validate", locationHandler.ValidateLocation)
			public.POST("/locations/geocode", locationHandler.GeocodeAddress)
			public.POST("/locations/reverse-geocode", locationHandler.ReverseGeocode)
			public.GET("/locations/nearby", locationHandler.FindNearbyLocations)
			public.POST("/locations/distance", locationHandler.CalculateDistance)
			public.POST("/locations/route", locationHandler.GetRoute)
			public.GET("/locations/delivery-zones", locationHandler.GetDeliveryZones)
			public.POST("/locations/delivery-zones/check", locationHandler.CheckDeliveryZone)
		}

		// Protected routes (require authentication)
		protected := api.Group("")
		protected.Use(middleware.AuthMiddleware(cfg))
		{
			// Additional authenticated endpoints can be added here
		}
	}

	return router
}