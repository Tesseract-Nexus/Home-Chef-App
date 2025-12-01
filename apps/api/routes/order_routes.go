package routes

import (
	"github.com/Agent-Sphere/home-chef-app/apps/api/controllers"
	"github.com/Agent-Sphere/home-chef-app/apps/api/middleware"
	"github.com/gin-gonic/gin"
)

func OrderRoutes(router *gin.Engine) {
	orderRoutes := router.Group("/orders")
	orderRoutes.Use(middleware.RequireAuth)
	{
		// Customer routes
		orderRoutes.GET("/", controllers.GetMyOrders)
		orderRoutes.GET("/:id", controllers.GetMyOrder)

		// Chef routes
		chefOrders := orderRoutes.Group("/chef")
		{
			chefOrders.GET("/", controllers.GetOrdersForMyChefProfile)
			chefOrders.PUT("/:id/status", controllers.UpdateOrderStatus)
		}
	}
}
