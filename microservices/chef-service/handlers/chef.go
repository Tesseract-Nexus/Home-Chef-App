package handlers

import (
	"net/http"
	"chef-service/models"
	"chef-service/utils"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type ChefHandler struct {
	// In a real implementation, you would inject database and other dependencies here
}

func NewChefHandler() *ChefHandler {
	return &ChefHandler{}
}

// @Summary Submit chef application
// @Description Submit a new chef application for review
// @Tags Chef Onboarding
// @Accept json
// @Produce json
// @Param application body models.ChefApplication true "Chef application data"
// @Success 201 {object} models.APIResponse
// @Failure 400 {object} models.ErrorResponse
// @Router /chefs/apply [post]
func (h *ChefHandler) Apply(c *gin.Context) {
	var application models.ChefApplication
	
	if err := c.ShouldBindJSON(&application); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Error:   "invalid_request",
			Message: "Invalid request body",
			Details: utils.GetValidationErrors(err),
		})
		return
	}

	// TODO: Validate and save application to database
	applicationID := uuid.New().String()

	c.JSON(http.StatusCreated, models.APIResponse{
		Success: true,
		Message: "Application submitted successfully",
		Data: gin.H{
			"application_id": applicationID,
			"status": "pending_review",
		},
	})
}

// @Summary Get chef profile
// @Description Get the profile information for the authenticated chef
// @Tags Chef Profile
// @Accept json
// @Produce json
// @Success 200 {object} models.APIResponse{data=models.ChefProfile}
// @Failure 401 {object} models.ErrorResponse
// @Security BearerAuth
// @Router /chefs/profile [get]
func (h *ChefHandler) GetProfile(c *gin.Context) {
	chefID, _ := c.Get("chef_id")
	
	// TODO: Fetch profile from database
	profile := &models.ChefProfile{
		ID:          chefID.(string),
		UserID:      c.GetString("user_id"),
		Name:        "Sample Chef",
		Specialty:   "North Indian Cuisine",
		Description: "Expert in authentic North Indian dishes",
		Avatar:      "https://cdn.homechef.com/avatars/chef1.jpg",
		Rating:      4.8,
		TotalReviews: 156,
		TotalOrders:  445,
		Status:      "active",
		VerificationStatus: "verified",
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Data:    profile,
	})
}

// @Summary Update chef profile
// @Description Update chef profile information
// @Tags Chef Profile
// @Accept json
// @Produce json
// @Param profile body models.ChefProfileUpdate true "Profile update data"
// @Success 200 {object} models.APIResponse
// @Failure 400 {object} models.ErrorResponse
// @Security BearerAuth
// @Router /chefs/profile [put]
func (h *ChefHandler) UpdateProfile(c *gin.Context) {
	var update models.ChefProfileUpdate
	
	if err := c.ShouldBindJSON(&update); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Error:   "invalid_request",
			Message: "Invalid request body",
			Details: utils.GetValidationErrors(err),
		})
		return
	}

	chefID := c.GetString("chef_id")
	// TODO: Update profile in database

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Message: "Profile updated successfully",
		Data: gin.H{
			"chef_id": chefID,
		},
	})
}

// @Summary Update availability status
// @Description Update chef's availability status
// @Tags Chef Profile
// @Accept json
// @Produce json
// @Param availability body models.AvailabilityUpdate true "Availability data"
// @Success 200 {object} models.APIResponse
// @Failure 400 {object} models.ErrorResponse
// @Security BearerAuth
// @Router /chefs/availability [put]
func (h *ChefHandler) UpdateAvailability(c *gin.Context) {
	var availability models.AvailabilityUpdate
	
	if err := c.ShouldBindJSON(&availability); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Error:   "invalid_request",
			Message: "Invalid request body",
			Details: utils.GetValidationErrors(err),
		})
		return
	}

	chefID := c.GetString("chef_id")
	// TODO: Update availability in database

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Message: "Availability updated successfully",
		Data: gin.H{
			"chef_id": chefID,
			"is_available": availability.IsAvailable,
		},
	})
}

// @Summary Set vacation mode
// @Description Set chef's vacation schedule
// @Tags Chef Profile
// @Accept json
// @Produce json
// @Param vacation body models.VacationRequest true "Vacation data"
// @Success 200 {object} models.APIResponse
// @Failure 400 {object} models.ErrorResponse
// @Security BearerAuth
// @Router /chefs/vacation [post]
func (h *ChefHandler) SetVacation(c *gin.Context) {
	var vacation models.VacationRequest
	
	if err := c.ShouldBindJSON(&vacation); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Error:   "invalid_request",
			Message: "Invalid request body",
			Details: utils.GetValidationErrors(err),
		})
		return
	}

	chefID := c.GetString("chef_id")
	// TODO: Set vacation schedule in database

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Message: "Vacation mode set successfully",
		Data: gin.H{
			"chef_id": chefID,
			"vacation_period": gin.H{
				"start_date": vacation.StartDate,
				"end_date":   vacation.EndDate,
			},
		},
	})
}