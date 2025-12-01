package routes

import (
	"github.com/Agent-Sphere/home-chef-app/apps/api/controllers"
	"github.com/Agent-Sphere/home-chef-app/apps/api/middleware"
	"github.com/gin-gonic/gin"
)

func PaymentRoutes(router *gin.Engine) {
	paymentRoutes := router.Group("/payments")
	paymentRoutes.Use(middleware.RequireAuth)
	{
		paymentRoutes.POST("/create-payment-intent", controllers.CreatePaymentIntent)
	}
}
