package routes

import (
	"github.com/Agent-Sphere/home-chef-app/apps/api/controllers"
	"github.com/Agent-Sphere/home-chef-app/apps/api/middleware"
	"github.com/gin-gonic/gin"
)

func CartRoutes(router *gin.Engine) {
	cartRoutes := router.Group("/cart")
	cartRoutes.Use(middleware.RequireAuth) // All cart routes require authentication
	{
		cartRoutes.POST("/", controllers.AddItemToCart)
		cartRoutes.GET("/", controllers.GetCart)
		cartRoutes.DELETE("/item/:cart_item_id", controllers.RemoveItemFromCart)
		cartRoutes.PUT("/item/:cart_item_id", controllers.UpdateCartItemQuantity)
		cartRoutes.POST("/checkout", controllers.Checkout)
	}
}
