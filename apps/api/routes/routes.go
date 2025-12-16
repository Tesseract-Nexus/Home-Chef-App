package routes

import (
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/homechef/api/config"
	"github.com/homechef/api/handlers"
	"github.com/homechef/api/middleware"
	"github.com/homechef/api/models"
	"github.com/prometheus/client_golang/prometheus/promhttp"
)

func SetupRouter() *gin.Engine {
	// Set Gin mode
	if config.IsProduction() {
		gin.SetMode(gin.ReleaseMode)
	}

	r := gin.Default()

	// Prometheus metrics middleware
	r.Use(middleware.PrometheusMiddleware())

	// CORS configuration
	corsConfig := cors.DefaultConfig()
	corsConfig.AllowOrigins = []string{"http://localhost:5173", "http://localhost:3000", "https://homechef.app"}
	corsConfig.AllowMethods = []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"}
	corsConfig.AllowHeaders = []string{"Origin", "Content-Type", "Accept", "Authorization"}
	corsConfig.AllowCredentials = true
	r.Use(cors.New(corsConfig))

	// Initialize handlers
	authHandler := handlers.NewAuthHandler()
	chefHandler := handlers.NewChefHandler()
	orderHandler := handlers.NewOrderHandler()
	healthHandler := handlers.NewHealthHandler()

	// Health check endpoints
	r.GET("/health", healthHandler.Health)
	r.GET("/health/live", healthHandler.Liveness)
	r.GET("/health/ready", healthHandler.Readiness)
	r.GET("/health/stats", healthHandler.SystemStats)

	// Prometheus metrics endpoint
	r.GET("/metrics", gin.WrapH(promhttp.Handler()))

	// API v1 routes
	v1 := r.Group("/api/v1")
	{
		// Auth routes (public)
		auth := v1.Group("/auth")
		{
			auth.POST("/register", authHandler.Register)
			auth.POST("/login", authHandler.Login)
			auth.POST("/oauth", authHandler.OAuthLogin)
			auth.POST("/refresh", authHandler.RefreshToken)
			auth.POST("/logout", authHandler.Logout)
			auth.POST("/forgot-password", authHandler.ForgotPassword)
		}

		// Profile routes (authenticated)
		profile := v1.Group("/profile")
		profile.Use(middleware.AuthMiddleware())
		{
			profile.GET("", authHandler.GetProfile)
			profile.PUT("", authHandler.UpdateProfile)
			profile.PUT("/password", authHandler.ChangePassword)
		}

		// Public chef routes
		chefs := v1.Group("/chefs")
		chefs.Use(middleware.OptionalAuthMiddleware())
		{
			chefs.GET("", chefHandler.ListChefs)
			chefs.GET("/:id", chefHandler.GetChef)
			chefs.GET("/:id/menu", chefHandler.GetChefMenu)
			chefs.GET("/:id/reviews", chefHandler.GetChefReviews)
		}

		// Chef dashboard routes (chef only)
		chefDashboard := v1.Group("/chef")
		chefDashboard.Use(middleware.AuthMiddleware(), middleware.RequireChef())
		{
			chefDashboard.GET("/dashboard", chefHandler.GetChefDashboard)
			chefDashboard.GET("/profile", chefHandler.GetChefDashboard) // Same data
			chefDashboard.PUT("/profile", chefHandler.UpdateChefProfile)
			chefDashboard.GET("/orders", chefHandler.GetChefOrders)
			chefDashboard.PUT("/orders/:orderId/status", chefHandler.UpdateOrderStatus)
			// Menu management endpoints would go here
			// chefDashboard.GET("/menu", menuHandler.GetChefMenu)
			// chefDashboard.POST("/menu", menuHandler.CreateMenuItem)
			// chefDashboard.PUT("/menu/:itemId", menuHandler.UpdateMenuItem)
			// chefDashboard.DELETE("/menu/:itemId", menuHandler.DeleteMenuItem)
		}

		// Customer order routes
		orders := v1.Group("/orders")
		orders.Use(middleware.AuthMiddleware())
		{
			orders.POST("", orderHandler.CreateOrder)
			orders.GET("", orderHandler.GetOrders)
			orders.GET("/:id", orderHandler.GetOrder)
			orders.POST("/:id/cancel", orderHandler.CancelOrder)
			orders.GET("/:id/track", orderHandler.TrackOrder)
		}

		// Cart routes
		cart := v1.Group("/cart")
		cart.Use(middleware.AuthMiddleware())
		{
			// cart.GET("", cartHandler.GetCart)
			// cart.POST("/items", cartHandler.AddItem)
			// cart.PUT("/items/:itemId", cartHandler.UpdateItem)
			// cart.DELETE("/items/:itemId", cartHandler.RemoveItem)
			// cart.DELETE("", cartHandler.ClearCart)
		}

		// Social feed routes
		social := v1.Group("/social")
		social.Use(middleware.OptionalAuthMiddleware())
		{
			// social.GET("/feed", socialHandler.GetFeed)
			// social.GET("/posts/:id", socialHandler.GetPost)
			// social.POST("/posts/:id/like", socialHandler.LikePost) // requires auth
			// social.POST("/posts/:id/comments", socialHandler.AddComment) // requires auth
		}

		// Chef social posts (chef only)
		chefSocial := v1.Group("/chef/posts")
		chefSocial.Use(middleware.AuthMiddleware(), middleware.RequireChef())
		{
			// chefSocial.GET("", socialHandler.GetChefPosts)
			// chefSocial.POST("", socialHandler.CreatePost)
			// chefSocial.PUT("/:id", socialHandler.UpdatePost)
			// chefSocial.DELETE("/:id", socialHandler.DeletePost)
		}

		// Catering routes
		catering := v1.Group("/catering")
		catering.Use(middleware.AuthMiddleware())
		{
			// Customer catering
			// catering.POST("/requests", cateringHandler.CreateRequest)
			// catering.GET("/requests", cateringHandler.GetMyRequests)
			// catering.GET("/requests/:id", cateringHandler.GetRequest)
			// catering.GET("/requests/:id/quotes", cateringHandler.GetQuotes)
			// catering.POST("/quotes/:id/accept", cateringHandler.AcceptQuote)
		}

		// Chef catering (chef only)
		chefCatering := v1.Group("/chef/catering")
		chefCatering.Use(middleware.AuthMiddleware(), middleware.RequireChef())
		{
			// chefCatering.GET("/requests", cateringHandler.GetAvailableRequests)
			// chefCatering.POST("/requests/:id/quote", cateringHandler.SubmitQuote)
			// chefCatering.GET("/quotes", cateringHandler.GetChefQuotes)
		}

		// Delivery partner routes
		delivery := v1.Group("/delivery")
		delivery.Use(middleware.AuthMiddleware(), middleware.RequireDelivery())
		{
			// delivery.GET("/stats", deliveryHandler.GetStats)
			// delivery.GET("/current", deliveryHandler.GetCurrentDelivery)
			// delivery.GET("/available", deliveryHandler.GetAvailableDeliveries)
			// delivery.POST("/:id/accept", deliveryHandler.AcceptDelivery)
			// delivery.PUT("/:id/status", deliveryHandler.UpdateDeliveryStatus)
			// delivery.GET("/orders", deliveryHandler.GetDeliveryHistory)
			// delivery.GET("/earnings", deliveryHandler.GetEarnings)
		}

		// Admin routes
		admin := v1.Group("/admin")
		admin.Use(middleware.AuthMiddleware(), middleware.RequireAdmin())
		{
			// Dashboard
			// admin.GET("/dashboard", adminHandler.GetDashboard)
			// admin.GET("/analytics", adminHandler.GetAnalytics)

			// User management
			// admin.GET("/users", adminHandler.GetUsers)
			// admin.GET("/users/:id", adminHandler.GetUser)
			// admin.PUT("/users/:id/suspend", adminHandler.SuspendUser)
			// admin.PUT("/users/:id/activate", adminHandler.ActivateUser)

			// Chef management
			// admin.GET("/chefs", adminHandler.GetChefs)
			// admin.PUT("/chefs/:id/verify", adminHandler.VerifyChef)
			// admin.PUT("/chefs/:id/reject", adminHandler.RejectChef)
			// admin.PUT("/chefs/:id/suspend", adminHandler.SuspendChef)

			// Order management
			// admin.GET("/orders", adminHandler.GetAllOrders)
			// admin.GET("/orders/:id", adminHandler.GetOrderDetails)

			// Settings
			// admin.GET("/settings", adminHandler.GetSettings)
			// admin.PUT("/settings", adminHandler.UpdateSettings)

			// Content moderation
			// admin.GET("/moderation/posts", adminHandler.GetFlaggedPosts)
			// admin.PUT("/moderation/posts/:id/approve", adminHandler.ApprovePost)
			// admin.PUT("/moderation/posts/:id/reject", adminHandler.RejectPost)
		}

		// Addresses
		addresses := v1.Group("/addresses")
		addresses.Use(middleware.AuthMiddleware())
		{
			// addresses.GET("", addressHandler.GetAddresses)
			// addresses.POST("", addressHandler.CreateAddress)
			// addresses.PUT("/:id", addressHandler.UpdateAddress)
			// addresses.DELETE("/:id", addressHandler.DeleteAddress)
			// addresses.PUT("/:id/default", addressHandler.SetDefaultAddress)
		}

		// Payment methods
		payments := v1.Group("/payment-methods")
		payments.Use(middleware.AuthMiddleware())
		{
			// payments.GET("", paymentHandler.GetPaymentMethods)
			// payments.POST("", paymentHandler.AddPaymentMethod)
			// payments.DELETE("/:id", paymentHandler.RemovePaymentMethod)
			// payments.PUT("/:id/default", paymentHandler.SetDefaultPaymentMethod)
		}

		// Reviews
		reviews := v1.Group("/reviews")
		reviews.Use(middleware.AuthMiddleware())
		{
			// reviews.POST("", reviewHandler.CreateReview)
			// reviews.PUT("/:id", reviewHandler.UpdateReview)
			// reviews.DELETE("/:id", reviewHandler.DeleteReview)
		}

		// Notifications
		notifications := v1.Group("/notifications")
		notifications.Use(middleware.AuthMiddleware())
		{
			// notifications.GET("", notificationHandler.GetNotifications)
			// notifications.PUT("/:id/read", notificationHandler.MarkAsRead)
			// notifications.PUT("/read-all", notificationHandler.MarkAllAsRead)
		}
	}

	return r
}

// RoleToPermissions returns permissions for debugging
func RoleToPermissions(role models.UserRole) []middleware.Permission {
	return middleware.RolePermissions[role]
}
