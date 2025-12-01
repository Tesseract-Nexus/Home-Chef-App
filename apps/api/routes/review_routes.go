package routes

import (
	"github.com/Agent-Sphere/home-chef-app/apps/api/controllers"
	"github.com/Agent-Sphere/home-chef-app/apps/api/middleware"
	"github.com/gin-gonic/gin"
)

func ReviewRoutes(router *gin.Engine) {
	reviewRoutes := router.Group("/reviews")
	{
		// Public route
		reviewRoutes.GET("/chef/:chef_id", controllers.GetReviewsForChef)

		// Customer-only route
		reviewRoutes.POST("/", middleware.RequireAuth, controllers.CreateReview)

		// Admin-only routes
		adminReviews := reviewRoutes.Group("/admin")
		adminReviews.Use(middleware.RequireAdmin)
		{
			adminReviews.GET("/pending", controllers.AdminListPendingReviews)
			adminReviews.PUT("/:id/status", controllers.AdminUpdateReviewStatus)
		}
	}
}
