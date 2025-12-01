package controllers

import (
	"net/http"

	"github.com/Agent-Sphere/home-chef-app/apps/api/database"
	"github.com/Agent-Sphere/home-chef-app/apps/api/models"
	"github.com/gin-gonic/gin"
)

func AdminListUsers(c *gin.Context) {
	var users []models.User
	database.DB.Find(&users)
	c.JSON(http.StatusOK, gin.H{"users": users})
}

func AdminListChefProfiles(c *gin.Context) {
	var profiles []models.ChefProfile
	database.DB.Preload("User").Find(&profiles)
	c.JSON(http.StatusOK, gin.H{"profiles": profiles})
}

func AdminVerifyChef(c *gin.Context) {
	chefProfileID := c.Param("id")

	var profile models.ChefProfile
	database.DB.First(&profile, chefProfileID)
	if profile.ID == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Chef profile not found"})
		return
	}

	profile.IsVerified = true
	database.DB.Save(&profile)

	c.JSON(http.StatusOK, gin.H{"profile": profile})
}

func AdminSuspendUser(c *gin.Context) {
	userID := c.Param("id")

	var user models.User
	database.DB.First(&user, userID)
	if user.ID == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	// In a real app, you'd have a 'status' field. For now, we can't truly "suspend"
	// a user without adding a new field to the model. A soft delete is one option.
	database.DB.Delete(&user)

	c.JSON(http.StatusOK, gin.H{"message": "User has been suspended (deleted)"})
}

func AdminAssignDriver(c *gin.Context) {
    var body struct {
        OrderID  uint `json:"order_id"`
        DriverID uint `json:"driver_id"`
    }
    if err := c.Bind(&body); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to read body"})
        return
    }

    // Check if the user to be assigned is actually a driver
    var driver models.User
    database.DB.First(&driver, body.DriverID)
    if driver.ID == 0 || driver.Role != models.DriverRole {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid driver ID"})
        return
    }

    var order models.Order
    database.DB.First(&order, body.OrderID)
    if order.ID == 0 {
        c.JSON(http.StatusNotFound, gin.H{"error": "Order not found"})
        return
    }

    order.DriverID = &body.DriverID
    database.DB.Save(&order)

    c.JSON(http.StatusOK, gin.H{"order": order})
}
