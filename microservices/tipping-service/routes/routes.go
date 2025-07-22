package routes

import (
	"github.com/gin-gonic/gin"
	"homechef/tipping-service/handlers"
	"homechef/tipping-service/middleware"
)

// SetupRoutes configures all routes for the tipping service
func SetupRoutes(tipHandler *handlers.TipHandler) *gin.Engine {
	// Create gin router
	router := gin.New()

	// Add middleware
	router.Use(middleware.LoggerMiddleware())
	router.Use(middleware.CORSMiddleware())
	router.Use(gin.Recovery())
	router.Use(middleware.RequestIDMiddleware())

	// Health check route (no auth required)
	router.GET("/health", tipHandler.HealthCheck)

	// API v1 routes
	v1 := router.Group("/api/v1")
	{
		// Tips routes (require authentication)
		tips := v1.Group("/tips")
		tips.Use(middleware.AuthMiddleware())
		{
			// Send tip (any authenticated user)
			tips.POST("/send", tipHandler.SendTip)

			// Get tip history (any authenticated user)
			tips.GET("/history", tipHandler.GetTipHistory)

			// Get tips received (chef/delivery only)
			tips.GET("/received", 
				middleware.RequireUserType("chef", "delivery"), 
				tipHandler.GetTipsReceived)

			// Get tip analytics (chef/delivery only)
			tips.GET("/analytics", 
				middleware.RequireUserType("chef", "delivery"), 
				tipHandler.GetTipAnalytics)

			// Get specific tip by ID
			tips.GET("/:id", tipHandler.GetTipByID)
		}
	}

	return router
}