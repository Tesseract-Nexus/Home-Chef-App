package main

import (
	"net/http"
	"github.com/Agent-Sphere/home-chef-app/apps/api/database"
	"github.com/Agent-Sphere/home-chef-app/apps/api/initializers"
	"github.com/Agent-Sphere/home-chef-app/apps/api/routes" // Import routes
	"github.com/gin-gonic/gin"
)

func init() {
	initializers.LoadEnvVariables()
	database.ConnectToDB()
}

func main() {
	router := gin.Default()

	// Set up routes
	routes.UserRoutes(router)
	routes.ChefProfileRoutes(router)
	routes.MenuItemRoutes(router)
	routes.OrderRoutes(router)
	routes.CartRoutes(router)
	routes.PaymentRoutes(router)
	routes.AdminRoutes(router)
	routes.ReviewRoutes(router)
	routes.AnalyticsRoutes(router)
	routes.AdRoutes(router)
	routes.DeliveryRoutes(router)

	router.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "ok"})
	})

	router.Run(":8080") // listen and serve on 0.0.0.0:8080
}
