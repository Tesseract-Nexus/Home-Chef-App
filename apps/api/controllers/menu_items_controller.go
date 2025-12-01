package controllers

import (
	"net/http"

	"github.com/Agent-Sphere/home-chef-app/apps/api/database"
	"github.com/Agent-Sphere/home-chef-app/apps/api/models"
	"github.com/gin-gonic/gin"
)

func CreateMenuItem(c *gin.Context) {
	// Get user from context
	user, _ := c.Get("user")
	authedUser := user.(models.User)

	// Check if user is a chef
	if authedUser.Role != models.ChefRole {
		c.JSON(http.StatusForbidden, gin.H{"error": "Only chefs can create menu items"})
		return
	}

	// Get chef profile
	var chefProfile models.ChefProfile
	database.DB.First(&chefProfile, "user_id = ?", authedUser.ID)
	if chefProfile.ID == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Chef profile not found"})
		return
	}

	var body struct {
		Name        string
		Description string
		Price       float64
		ImageURL    string
		IsAvailable bool
	}

	if c.Bind(&body) != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to read body"})
		return
	}

	menuItem := models.MenuItem{
		ChefProfileID: chefProfile.ID,
		Name:          body.Name,
		Description:   body.Description,
		Price:         body.Price,
		ImageURL:      body.ImageURL,
		IsAvailable:   body.IsAvailable,
	}

	result := database.DB.Create(&menuItem)
	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create menu item"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"menuItem": menuItem})
}

func GetMenuItemsForChef(c *gin.Context) {
	chefID := c.Param("chef_id")

	var menuItems []models.MenuItem
	database.DB.Where("chef_profile_id = ?", chefID).Find(&menuItems)

	c.JSON(http.StatusOK, gin.H{"menuItems": menuItems})
}

func UpdateMenuItem(c *gin.Context) {
	itemID := c.Param("item_id")
	
	// Get user from context
	user, _ := c.Get("user")
	authedUser := user.(models.User)

	// Check if user is a chef
	if authedUser.Role != models.ChefRole {
		c.JSON(http.StatusForbidden, gin.H{"error": "Only chefs can update menu items"})
		return
	}

	// Find the menu item
	var menuItem models.MenuItem
	database.DB.Preload("ChefProfile").First(&menuItem, itemID)
	if menuItem.ID == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Menu item not found"})
		return
	}
	
	// Check if the authed user owns the menu item
	if menuItem.ChefProfile.UserID != authedUser.ID {
		c.JSON(http.StatusForbidden, gin.H{"error": "You do not have permission to update this menu item"})
		return
	}

	var body struct {
		Name        string
		Description string
		Price       float64
		ImageURL    string
		IsAvailable bool
	}

	if c.Bind(&body) != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to read body"})
		return
	}

	menuItem.Name = body.Name
	menuItem.Description = body.Description
	menuItem.Price = body.Price
	menuItem.ImageURL = body.ImageURL
	menuItem.IsAvailable = body.IsAvailable
	
	database.DB.Save(&menuItem)

	c.JSON(http.StatusOK, gin.H{"menuItem": menuItem})
}

func DeleteMenuItem(c *gin.Context) {
	itemID := c.Param("item_id")
	
	// Get user from context
	user, _ := c.Get("user")
	authedUser := user.(models.User)

	// Check if user is a chef
	if authedUser.Role != models.ChefRole {
		c.JSON(http.StatusForbidden, gin.H{"error": "Only chefs can delete menu items"})
		return
	}
	
	// Find the menu item
	var menuItem models.MenuItem
	database.DB.Preload("ChefProfile").First(&menuItem, itemID)
	if menuItem.ID == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Menu item not found"})
		return
	}
	
	// Check if the authed user owns the menu item
	if menuItem.ChefProfile.UserID != authedUser.ID {
		c.JSON(http.StatusForbidden, gin.H{"error": "You do not have permission to delete this menu item"})
		return
	}

	database.DB.Delete(&menuItem)

	c.JSON(http.StatusOK, gin.H{"menuItem": menuItem})
}

func GetMyMenuItems(c *gin.Context) {
	// Get user from context
	user, _ := c.Get("user")
	authedUser := user.(models.User)

	// Check if user is a chef
	if authedUser.Role != models.ChefRole {
		c.JSON(http.StatusForbidden, gin.H{"error": "Only chefs can view their menu items"})
		return
	}

	// Get chef profile
	var chefProfile models.ChefProfile
	database.DB.First(&chefProfile, "user_id = ?", authedUser.ID)
	if chefProfile.ID == 0 {
		// Return empty list if profile doesn't exist yet, it's not an error
		c.JSON(http.StatusOK, gin.H{"menuItems": []models.MenuItem{}})
		return
	}
	
	var menuItems []models.MenuItem
	database.DB.Where("chef_profile_id = ?", chefProfile.ID).Find(&menuItems)

	c.JSON(http.StatusOK, gin.H{"menuItems": menuItems})
}
