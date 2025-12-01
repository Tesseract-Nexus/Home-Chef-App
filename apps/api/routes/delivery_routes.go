package routes

import (
	"github.com/Agent-Sphere/home-chef-app/apps/api/controllers"
	"github.com/Agent-Sphere/home-chef-app/apps/api/middleware"
	"github.com/gin-gonic/gin"
)

func DeliveryRoutes(router *gin.Engine) {
	deliveryRoutes := router.Group("/delivery")
	deliveryRoutes.Use(middleware.RequireAuth) // Drivers must be logged in
	{
		deliveryRoutes.GET("/orders", controllers.GetMyAssignedOrders)
		deliveryRoutes.PUT("/orders/:id/status", controllers.UpdateDeliveryStatus)
	}
}
