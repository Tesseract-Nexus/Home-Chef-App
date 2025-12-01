package controllers

import (
	"net/http"

	"github.com/Agent-Sphere/home-chef-app/apps/api/database"
	"github.com/Agent-Sphere/home-chef-app/apps/api/models"
	"github.com/gin-gonic/gin"
)

func GetMyAssignedOrders(c *gin.Context) {
	user, _ := c.Get("user")
	authedUser := user.(models.User)

	if authedUser.Role != models.DriverRole {
		c.JSON(http.StatusForbidden, gin.H{"error": "Only drivers can view assigned orders."})
		return
	}

	var orders []models.Order
	database.DB.Preload("User").Preload("ChefProfile.User").Preload("OrderItems.MenuItem").
		Where("driver_id = ? AND status IN (?)", authedUser.ID, []models.OrderStatus{models.OrderStatusProcessing, models.OrderStatusOutForDelivery}).
		Order("order_date asc").
		Find(&orders)

	c.JSON(http.StatusOK, gin.H{"orders": orders})
}

func UpdateDeliveryStatus(c *gin.Context) {
	user, _ := c.Get("user")
	authedUser := user.(models.User)
	orderID := c.Param("id")

	if authedUser.Role != models.DriverRole {
		c.JSON(http.StatusForbidden, gin.H{"error": "Only drivers can update delivery status."})
		return
	}
	
	var body struct {
		Status models.OrderStatus `json:"status"`
	}
	if c.Bind(&body) != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to read body"})
		return
	}

	// Drivers can only mark as out_for_delivery or delivered
	if body.Status != models.OrderStatusOutForDelivery && body.Status != models.OrderStatusDelivered {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid status update for driver."})
		return
	}

	var order models.Order
	result := database.DB.Where("id = ? AND driver_id = ?", orderID, authedUser.ID).First(&order)
	if result.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Order not found or not assigned to you."})
		return
	}

	order.Status = body.Status
	database.DB.Save(&order)

	c.JSON(http.StatusOK, gin.H{"order": order})
}
