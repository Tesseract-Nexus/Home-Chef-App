package routes

import (
	"ads-service/config"
	"ads-service/handlers"
	"ads-service/middleware"
	"ads-service/services"
	"ads-service/websocket"

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
			"service":   "ads-service",
			"websocket": gin.H{
				"clients": hub.GetConnectedClients(),
			},
		})
	})

	// Initialize services
	campaignService := services.NewCampaignService(db, logger)
	servingService := services.NewServingService(db, logger)
	trackingService := services.NewTrackingService(db, logger)

	// Initialize handlers
	campaignHandler := handlers.NewCampaignHandler(campaignService)
	servingHandler := handlers.NewServingHandler(servingService)
	trackingHandler := handlers.NewTrackingHandler(trackingService)

	// WebSocket endpoint
	router.GET("/ws", hub.HandleWebSocket)

	// API routes
	api := router.Group("/v1")
	{
		// Public ad serving (no auth required)
		api.GET("/ads/serve", servingHandler.ServeAds)

		// Public tracking endpoints (no auth required)
		api.POST("/ads/track/impression", trackingHandler.TrackImpression)
		api.POST("/ads/track/click", trackingHandler.TrackClick)

		// Protected routes (require authentication)
		protected := api.Group("")
		protected.Use(middleware.AuthMiddleware(cfg))
		{
			// Campaign management (admin only)
			admin := protected.Group("")
			admin.Use(middleware.AdminOnlyMiddleware())
			{
				admin.GET("/ads/campaigns", campaignHandler.GetCampaigns)
				admin.POST("/ads/campaigns", campaignHandler.CreateCampaign)
				admin.GET("/ads/campaigns/:campaign_id", campaignHandler.GetCampaign)
				admin.PUT("/ads/campaigns/:campaign_id", campaignHandler.UpdateCampaign)
				admin.DELETE("/ads/campaigns/:campaign_id", campaignHandler.DeleteCampaign)
				admin.GET("/ads/campaigns/:campaign_id/performance", campaignHandler.GetCampaignPerformance)
			}
		}
	}

	return router
}