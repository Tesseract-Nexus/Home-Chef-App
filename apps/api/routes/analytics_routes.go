package routes

import (
	"github.com/Agent-Sphere/home-chef-app/apps/api/controllers"
	"github.com/Agent-Sphere/home-chef-app/apps/api/middleware"
	"github.com/gin-gonic/gin"
)

func AnalyticsRoutes(router *gin.Engine) {
	analyticsRoutes := router.Group("/analytics")
	analyticsRoutes.Use(middleware.RequireAdmin) // All analytics routes require admin privileges
	{
		analyticsRoutes.GET("/summary", controllers.GetAnalyticsSummary)
		analyticsRoutes.GET("/sales", controllers.GetSalesOverTime)
	}
}
