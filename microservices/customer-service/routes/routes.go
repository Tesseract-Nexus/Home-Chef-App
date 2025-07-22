package routes

import (
	"customer-service/config"
	"customer-service/handlers"
	"customer-service/middleware"
	"customer-service/services"
	"customer-service/websocket"

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
			"service":   "customer-service",
			"websocket": gin.H{
				"clients": hub.GetConnectedClients(),
			},
		})
	})

	// Initialize services
	customerService := services.NewCustomerService(db, logger)
	addressService := services.NewAddressService(db, logger)
	paymentService := services.NewPaymentService(db, logger)
	favoriteService := services.NewFavoriteService(db, logger)
	orderService := services.NewOrderService(db, logger)
	reviewService := services.NewReviewService(db, logger)
	notificationService := services.NewNotificationService(db, logger)
	recommendationService := services.NewRecommendationService(db, logger)
	rewardsService := services.NewRewardsService(db, logger)

	// Initialize handlers
	profileHandler := handlers.NewProfileHandler(customerService)
	addressHandler := handlers.NewAddressHandler(addressService)
	paymentHandler := handlers.NewPaymentHandler(paymentService)
	favoriteHandler := handlers.NewFavoriteHandler(favoriteService)
	orderHandler := handlers.NewOrderHandler(orderService)
	reviewHandler := handlers.NewReviewHandler(reviewService)
	notificationHandler := handlers.NewNotificationHandler(notificationService)
	recommendationHandler := handlers.NewRecommendationHandler(recommendationService)
	rewardsHandler := handlers.NewRewardsHandler(rewardsService)
	supportHandler := handlers.NewSupportHandler()

	// WebSocket endpoint
	router.GET("/ws", hub.HandleWebSocket)

	// API routes
	api := router.Group("/v1")
	
	// Public routes (no auth required)
	public := api.Group("")
	{
		// Chef reviews (public access)
		public.GET("/chefs/:chef_id/reviews", reviewHandler.GetChefReviews)
	}
	
	// Protected routes (require authentication)
	api.Use(middleware.AuthMiddleware(cfg))
	api.Use(middleware.CustomerOnlyMiddleware())
	{
		// Order Management
		api.POST("/orders", orderHandler.CreateOrder)
		api.GET("/orders", orderHandler.GetOrders)
		api.POST("/orders/:order_id/cancel", orderHandler.CancelOrder)
		api.GET("/orders/:order_id/countdown-status", orderHandler.GetCountdownStatus)
		api.POST("/orders/:order_id/confirm-after-timer", orderHandler.ConfirmAfterTimer)
		api.POST("/orders/:order_id/tip", orderHandler.AddTip)

		// Rewards System
		api.GET("/rewards/profile", rewardsHandler.GetRewardsProfile)
		api.POST("/rewards/redeem", rewardsHandler.RedeemTokens)

		// Customer Profile
		api.GET("/customers/profile", profileHandler.GetProfile)
		api.PUT("/customers/profile", profileHandler.UpdateProfile)
		api.GET("/customers/activity", profileHandler.GetActivity)

		// Address Management
		api.GET("/customers/addresses", addressHandler.GetAddresses)
		api.POST("/customers/addresses", addressHandler.CreateAddress)
		api.PUT("/customers/addresses/:address_id", addressHandler.UpdateAddress)
		api.DELETE("/customers/addresses/:address_id", addressHandler.DeleteAddress)
		api.PUT("/customers/addresses/:address_id/default", addressHandler.SetDefaultAddress)

		// Payment Methods
		api.GET("/customers/payment-methods", paymentHandler.GetPaymentMethods)
		api.POST("/customers/payment-methods", paymentHandler.CreatePaymentMethod)
		api.DELETE("/customers/payment-methods/:payment_method_id", paymentHandler.DeletePaymentMethod)

		// Favorites
		api.GET("/customers/favorites/chefs", favoriteHandler.GetFavoriteChefs)
		api.POST("/customers/favorites/chefs", favoriteHandler.AddFavoriteChef)
		api.DELETE("/customers/favorites/chefs/:chef_id", favoriteHandler.RemoveFavoriteChef)
		api.GET("/customers/favorites/dishes", favoriteHandler.GetFavoriteDishes)
		api.POST("/customers/favorites/dishes", favoriteHandler.AddFavoriteDish)

		// Reviews
		api.GET("/customers/reviews", reviewHandler.GetReviews)
		api.POST("/customers/reviews", reviewHandler.CreateReview)
		api.PUT("/customers/reviews/:review_id", reviewHandler.UpdateReview)
		api.DELETE("/customers/reviews/:review_id", reviewHandler.DeleteReview)

		// Notifications
		api.GET("/customers/notifications/settings", notificationHandler.GetNotificationSettings)
		api.PUT("/customers/notifications/settings", notificationHandler.UpdateNotificationSettings)

		// Recommendations
		api.GET("/customers/recommendations", recommendationHandler.GetRecommendations)

		// Support System
		api.GET("/support/tickets", supportHandler.GetTickets)
		api.POST("/support/tickets", supportHandler.CreateTicket)
	}

	return router
}