package routes

import (
	"github.com/Agent-Sphere/home-chef-app/apps/api/controllers"
	"github.com/Agent-Sphere/home-chef-app/apps/api/middleware"
	"github.com/gin-gonic/gin"
)

func AdRoutes(router *gin.Engine) {
	// Public Ad Serving
	router.GET("/ads/serve", controllers.ServeAd)

	adRoutes := router.Group("/ads")
	adRoutes.Use(middleware.RequireAuth) // All ad management routes require authentication
	{
        // Ad Account
		adRoutes.GET("/account", controllers.GetMyAdAccount)
		adRoutes.POST("/account", controllers.CreateOrUpdateAdAccount)

        // Ad Campaigns
        adRoutes.GET("/campaigns", controllers.GetMyCampaigns)
        adRoutes.POST("/campaigns", controllers.CreateAdCampaign)
        adRoutes.PUT("/campaigns/:id", controllers.UpdateAdCampaign)

        // Ads
        adRoutes.GET("/campaign/:campaign_id", controllers.GetAdsForCampaign)
        adRoutes.POST("/", controllers.CreateAd)
	}
}
