package routes

import (
	"github.com/Agent-Sphere/home-chef-app/apps/api/controllers"
	"github.com/Agent-Sphere/home-chef-app/apps/api/middleware"
	"github.com/gin-gonic/gin"
)

func ChefProfileRoutes(router *gin.Engine) {
	profileRoutes := router.Group("/profiles")
	{
		// Public routes
		profileRoutes.GET("/chefs", controllers.GetAllChefProfiles)
		profileRoutes.GET("/chef/:id", controllers.GetChefProfile)
		
		// Protected route
		profileRoutes.PUT("/chef", middleware.RequireAuth, controllers.CreateOrUpdateChefProfile)
	}
}
