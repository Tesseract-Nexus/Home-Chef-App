package routes

import (
	"github.com/Agent-Sphere/home-chef-app/apps/api/controllers"
	"github.com/Agent-Sphere/home-chef-app/apps/api/middleware"
	"github.com/gin-gonic/gin"
)

func MenuItemRoutes(router *gin.Engine) {
	menuRoutes := router.Group("/menu")
	{
		// Public route
		menuRoutes.GET("/chef/:chef_id", controllers.GetMenuItemsForChef)

		// Protected chef-specific routes
		chefMenu := menuRoutes.Group("/")
		chefMenu.Use(middleware.RequireAuth)
		{
			chefMenu.POST("/", controllers.CreateMenuItem)
			chefMenu.PUT("/:item_id", controllers.UpdateMenuItem)
			chefMenu.DELETE("/:item_id", controllers.DeleteMenuItem)
			chefMenu.GET("/my-menu", controllers.GetMyMenuItems)
		}
	}
}
