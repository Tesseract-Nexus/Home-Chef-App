package routes

import (
	"github.com/Agent-Sphere/home-chef-app/apps/api/controllers"
	"github.com/Agent-Sphere/home-chef-app/apps/api/middleware"
	"github.com/gin-gonic/gin"
)

func AdminRoutes(router *gin.Engine) {
	adminRoutes := router.Group("/admin")
	adminRoutes.Use(middleware.RequireAdmin) // All admin routes require admin privileges
	{
		adminRoutes.GET("/users", controllers.AdminListUsers)
		adminRoutes.GET("/chefs", controllers.AdminListChefProfiles)
		adminRoutes.PUT("/chefs/:id/verify", controllers.AdminVerifyChef)
		adminRoutes.DELETE("/users/:id/suspend", controllers.AdminSuspendUser)
		adminRoutes.POST("/orders/assign-driver", controllers.AdminAssignDriver)
	}
}
