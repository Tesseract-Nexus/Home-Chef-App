package routes

import (
	"chef-service/config"
	"chef-service/handlers"
	"chef-service/middleware"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

func SetupRoutes(cfg *config.Config, logger *zap.Logger) *gin.Engine {
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
		c.JSON(200, gin.H{"status": "healthy", "service": "chef-service"})
	})

	// Initialize handlers
	chefHandler := handlers.NewChefHandler()
	menuHandler := handlers.NewMenuHandler()
	orderHandler := handlers.NewOrderHandler()
	analyticsHandler := handlers.NewAnalyticsHandler()
	earningsHandler := handlers.NewEarningsHandler()
	searchHandler := handlers.NewSearchHandler()
	authHandler := handlers.NewAuthHandler()

	// Public routes
	api := router.Group("/v1")
	{
		// Authentication (no auth required)
		api.POST("/auth/login", authHandler.Login)
		api.POST("/auth/send-otp", authHandler.SendOTP)
		api.POST("/auth/verify-otp", authHandler.VerifyOTP)
		
		// Chef application (no auth required)
		api.POST("/chefs/apply", chefHandler.Apply)
		
		// Chef search (no auth required)
		api.GET("/chefs/search", searchHandler.SearchChefs)
		
		// Public menu access (no auth required)
		api.GET("/chefs/:chef_id/menu", menuHandler.GetChefMenu)
	}

	// Protected routes - require authentication
	protected := api.Group("")
	protected.Use(middleware.AuthMiddleware(cfg))
	protected.Use(middleware.ChefOnlyMiddleware())
	{
		// Chef Profile
		protected.GET("/chefs/profile", chefHandler.GetProfile)
		protected.PUT("/chefs/profile", chefHandler.UpdateProfile)
		protected.PUT("/chefs/availability", chefHandler.UpdateAvailability)
		protected.POST("/chefs/vacation", chefHandler.SetVacation)

		// Menu Management
		protected.GET("/chefs/menu", menuHandler.GetMenu)
		protected.POST("/chefs/menu", menuHandler.CreateMenuItem)
		protected.PUT("/chefs/menu/:dish_id", menuHandler.UpdateMenuItem)
		protected.DELETE("/chefs/menu/:dish_id", menuHandler.DeleteMenuItem)
		protected.POST("/chefs/menu/:dish_id/images", menuHandler.UploadDishImages)
		protected.PUT("/chefs/menu/:dish_id/availability", menuHandler.UpdateMenuAvailability)

		// Order Management
		protected.GET("/chefs/orders", orderHandler.GetOrders)
		protected.PUT("/chefs/orders/:order_id/status", orderHandler.UpdateOrderStatus)

		// Analytics
		protected.GET("/chefs/dashboard", analyticsHandler.GetDashboard)
		protected.GET("/chefs/analytics", analyticsHandler.GetAnalytics)

		// Earnings
		protected.GET("/chefs/earnings", earningsHandler.GetEarnings)
		protected.GET("/chefs/payouts", earningsHandler.GetPayouts)
		protected.POST("/chefs/payouts/request", earningsHandler.RequestPayout)
	}

	return router
}