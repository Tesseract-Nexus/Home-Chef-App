package controllers

import (
	"net/http"

	"github.com/Agent-Sphere/home-chef-app/apps/api/database"
	"github.com/Agent-Sphere/home-chef-app/apps/api/models"
	"github.com/gin-gonic/gin"
)

func GetMyOrders(c *gin.Context) {
	user, _ := c.Get("user")
	authedUser := user.(models.User)

	var orders []models.Order
	database.DB.Preload("OrderItems.MenuItem").Where("user_id = ?", authedUser.ID).Order("order_date desc").Find(&orders)

	c.JSON(http.StatusOK, gin.H{"orders": orders})
}

func GetMyOrder(c *gin.Context) {
	user, _ := c.Get("user")
	authedUser := user.(models.User)
	orderID := c.Param("id")

	var order models.Order
	result := database.DB.Preload("OrderItems.MenuItem").Preload("ChefProfile.User").Where("user_id = ?", authedUser.ID).First(&order, orderID)
	
	if result.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Order not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"order": order})
}

func GetOrdersForMyChefProfile(c *gin.Context) {
	user, _ := c.Get("user")
	authedUser := user.(models.User)

	if authedUser.Role != models.ChefRole {
		c.JSON(http.StatusForbidden, gin.H{"error": "Only chefs can view their orders"})
		return
	}

	var chefProfile models.ChefProfile
	database.DB.First(&chefProfile, "user_id = ?", authedUser.ID)
	if chefProfile.ID == 0 {
		c.JSON(http.StatusOK, gin.H{"orders": []models.Order{}})
		return
	}

	var orders []models.Order
	database.DB.Preload("User").Preload("OrderItems.MenuItem").Where("chef_profile_id = ?", chefProfile.ID).Order("order_date desc").Find(&orders)

	c.JSON(http.StatusOK, gin.H{"orders": orders})
}

func UpdateOrderStatus(c *gin.Context) {
	user, _ := c.Get("user")
	authedUser := user.(models.User)
	orderID := c.Param("id")

	if authedUser.Role != models.ChefRole {
		c.JSON(http.StatusForbidden, gin.H{"error": "Only chefs can update orders"})
		return
	}
	
	var body struct {
		Status models.OrderStatus `json:"status"`
	}
	if c.Bind(&body) != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to read body"})
		return
	}

	// Validate status
	switch body.Status {
	case models.OrderStatusProcessing, models.OrderStatusOutForDelivery, models.OrderStatusDelivered, models.OrderStatusCancelled:
		// valid status
	default:
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid status"})
		return
	}

	var chefProfile models.ChefProfile
	database.DB.First(&chefProfile, "user_id = ?", authedUser.ID)
	if chefProfile.ID == 0 {
		c.JSON(http.StatusForbidden, gin.H{"error": "You do not have a chef profile"})
		return
	}

	var order models.Order
	result := database.DB.Where("chef_profile_id = ?", chefProfile.ID).First(&order, orderID)
	if result.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Order not found or does not belong to you"})
		return
	}

	order.Status = body.Status
	database.DB.Save(&order)

	c.JSON(http.StatusOK, gin.H{"order": order})
}

