package routes

import (
	"reviews-service/config"
	"reviews-service/handlers"
	"reviews-service/middleware"
	"reviews-service/services"
	"reviews-service/websocket"

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
			"service":   "reviews-service",
			"websocket": gin.H{
				"clients": hub.GetConnectedClients(),
			},
		})
	})

	// Initialize services
	reviewService := services.NewReviewService(db, logger)

	// Initialize handlers
	reviewHandler := handlers.NewReviewHandler(reviewService)

	// WebSocket endpoint
	router.GET("/ws", hub.HandleWebSocket)

	// API routes
	api := router.Group("/v1")
	
	// Public routes (no auth required)
	public := api.Group("")
	{
		// Chef reviews (public access)
		public.GET("/chefs/:chef_id/reviews", reviewHandler.GetChefReviews)
		public.GET("/chefs/:chef_id/reviews/stats", reviewHandler.GetChefReviewStats)
		public.GET("/dishes/:dish_id/reviews", reviewHandler.GetDishReviews)
	}
	
	// Protected routes (require authentication)
	api.Use(middleware.AuthMiddleware(cfg))
	{
		// Review Management
		api.POST("/reviews", reviewHandler.CreateReview)
		api.GET("/reviews", reviewHandler.GetReviews)
		api.GET("/reviews/:review_id", reviewHandler.GetReview)
		api.PUT("/reviews/:review_id", reviewHandler.UpdateReview)
		api.DELETE("/reviews/:review_id", reviewHandler.DeleteReview)
		api.POST("/reviews/:review_id/helpful", reviewHandler.MarkHelpful)
		api.POST("/reviews/:review_id/report", reviewHandler.ReportReview)
	}

	return router
}