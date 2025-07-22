package routes

import (
	"github.com/gin-gonic/gin"
	"homechef/webhook-service/handlers"
	"homechef/webhook-service/middleware"
)

// SetupRoutes configures all routes for the webhook service
func SetupRoutes(webhookHandler *handlers.WebhookHandler) *gin.Engine {
	// Create gin router
	router := gin.New()

	// Add middleware
	router.Use(middleware.LoggerMiddleware())
	router.Use(middleware.CORSMiddleware())
	router.Use(gin.Recovery())
	router.Use(middleware.RequestIDMiddleware())

	// Health check route (no auth required)
	router.GET("/health", webhookHandler.HealthCheck)

	// API v1 routes
	v1 := router.Group("/api/v1")
	{
		// Webhook routes (require authentication)
		webhooks := v1.Group("/webhooks")
		webhooks.Use(middleware.AuthMiddleware())
		{
			// Webhook management
			webhooks.GET("", webhookHandler.GetWebhooks)
			webhooks.POST("", webhookHandler.CreateWebhook)
			webhooks.GET("/:webhook_id", webhookHandler.GetWebhookByID)
			webhooks.PUT("/:webhook_id", webhookHandler.UpdateWebhook)
			webhooks.DELETE("/:webhook_id", webhookHandler.DeleteWebhook)

			// Test webhook
			webhooks.POST("/:webhook_id/test", webhookHandler.TestWebhook)

			// Available events (no auth required for this endpoint)
			webhooks.GET("/events", webhookHandler.GetAvailableEvents)

			// Delivery management
			webhooks.GET("/deliveries", webhookHandler.GetDeliveries)
			webhooks.POST("/deliveries/:delivery_id/retry", webhookHandler.RetryDelivery)
		}
	}

	return router
}