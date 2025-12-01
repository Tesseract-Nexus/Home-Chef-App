package routes

import (
	"github.com/Agent-Sphere/home-chef-app/apps/api/controllers"
	"github.com/Agent-Sphere/home-chef-app/apps/api/middleware"
	"github.com/gin-gonic/gin"
)

func UserRoutes(router *gin.Engine) {
	router.POST("/signup", controllers.SignUp)
	router.POST("/login", controllers.Login)

	// Protected route
	router.GET("/profile", middleware.RequireAuth, controllers.GetMyProfile)
}
