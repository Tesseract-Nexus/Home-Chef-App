package controllers

import (
	"net/http"

	"github.com/Agent-Sphere/home-chef-app/apps/api/database"
	"github.com/Agent-Sphere/home-chef-app/apps/api/models"
	"github.com/gin-gonic/gin"
)

func CreateOrUpdateChefProfile(c *gin.Context) {
	// Get user from context
	user, _ := c.Get("user")

	// Check if user is a chef
	if user.(models.User).Role != models.ChefRole {
		c.JSON(http.StatusForbidden, gin.H{"error": "Only chefs can create or update profiles"})
		return
	}

	var body struct {
		KitchenName   string
		Bio           string
		Address       string
		City          string
		State         string
		ZipCode       string
		CertificateURL string
	}

	if c.Bind(&body) != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to read body"})
		return
	}

	// Look for existing profile
	var profile models.ChefProfile
	database.DB.First(&profile, "user_id = ?", user.(models.User).ID)

	// Update or create profile
	profile.UserID = user.(models.User).ID
	profile.KitchenName = body.KitchenName
	profile.Bio = body.Bio
	profile.Address = body.Address
	profile.City = body.City
	profile.State = body.State
	profile.ZipCode = body.ZipCode
	profile.CertificateURL = body.CertificateURL

	result := database.DB.Save(&profile)

	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save profile"})
		return
	}

	// Preload the user to include it in the response
	database.DB.Preload("User").First(&profile, profile.ID)

	responseProfile := profile.ToChefProfileResponse()
	c.JSON(http.StatusOK, gin.H{"profile": responseProfile})
}

func GetChefProfile(c *gin.Context) {
	// Get id from url
	id := c.Param("id")

	var profile models.ChefProfile
	result := database.DB.Preload("User").First(&profile, "user_id = ?", id)

	if result.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Profile not found"})
		return
	}

	// Convert to response model to avoid exposing sensitive user data
	responseProfile := profile.ToChefProfileResponse()
	c.JSON(http.StatusOK, gin.H{"profile": responseProfile})
}

func GetAllChefProfiles(c *gin.Context) {
	var profiles []models.ChefProfile
	
	// Start with a base query to get only verified chefs
	queryBuilder := database.DB.Preload("User").Where("is_verified = ?", true)

	// Get query parameters
	searchQuery := c.Query("query")
	city := c.Query("city")

	// Apply filters
	if searchQuery != "" {
		searchQuery = "%" + searchQuery + "%" // For LIKE queries
		queryBuilder = queryBuilder.Where(
			database.DB.Where("kitchen_name ILIKE ?", searchQuery).Or("bio ILIKE ?", searchQuery),
		)
	}

	if city != "" {
		city = "%" + city + "%" // For LIKE queries
		queryBuilder = queryBuilder.Where("city ILIKE ?", city)
	}

	queryBuilder.Find(&profiles)

	// Convert to response models
	var responseProfiles []models.ChefProfileResponse
	for _, p := range profiles {
		responseProfiles = append(responseProfiles, p.ToChefProfileResponse())
	}

	c.JSON(http.StatusOK, gin.H{"profiles": responseProfiles})
}
