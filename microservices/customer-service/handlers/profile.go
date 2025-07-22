package handlers

import (
	"encoding/json"
	"net/http"
	"customer-service/models"
	"customer-service/services"
	"customer-service/utils"

	"github.com/gin-gonic/gin"
)

type ProfileHandler struct {
	customerService *services.CustomerService
}

func NewProfileHandler(customerService *services.CustomerService) *ProfileHandler {
	return &ProfileHandler{
		customerService: customerService,
	}
}

// @Summary Get customer profile
// @Description Get the profile information for the authenticated customer
// @Tags Customer Profile
// @Accept json
// @Produce json
// @Success 200 {object} models.APIResponse{data=models.Customer}
// @Failure 401 {object} models.ErrorResponse
// @Security BearerAuth
// @Router /customers/profile [get]
func (h *ProfileHandler) GetProfile(c *gin.Context) {
	customerID := c.GetString("customer_id")
	if customerID == "" {
		customerID = c.GetString("user_id") // Fallback to user_id
	}

	customer, err := h.customerService.GetCustomerByID(customerID)
	if err != nil {
		c.JSON(http.StatusNotFound, models.ErrorResponse{
			Error:   "customer_not_found",
			Message: "Customer profile not found",
		})
		return
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Data:    customer,
	})
}

// @Summary Update customer profile
// @Description Update customer profile information
// @Tags Customer Profile
// @Accept json
// @Produce json
// @Param profile body models.CustomerProfileUpdate true "Profile update data"
// @Success 200 {object} models.APIResponse
// @Failure 400 {object} models.ErrorResponse
// @Security BearerAuth
// @Router /customers/profile [put]
func (h *ProfileHandler) UpdateProfile(c *gin.Context) {
	customerID := c.GetString("customer_id")
	if customerID == "" {
		customerID = c.GetString("user_id")
	}

	var profileUpdate models.CustomerProfileUpdate
	if err := c.ShouldBindJSON(&profileUpdate); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Error:   "invalid_request",
			Message: "Invalid request body",
			Details: utils.GetValidationErrors(err),
		})
		return
	}

	updatedCustomer, err := h.customerService.UpdateCustomer(customerID, &profileUpdate)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Error:   "update_error",
			Message: "Failed to update profile",
		})
		return
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Message: "Profile updated successfully",
		Data:    updatedCustomer,
	})
}

// @Summary Get customer activity summary
// @Description Get customer activity and statistics
// @Tags Customer Analytics
// @Accept json
// @Produce json
// @Success 200 {object} models.APIResponse{data=models.CustomerActivity}
// @Security BearerAuth
// @Router /customers/activity [get]
func (h *ProfileHandler) GetActivity(c *gin.Context) {
	customerID := c.GetString("customer_id")
	if customerID == "" {
		customerID = c.GetString("user_id")
	}

	activity, err := h.customerService.GetCustomerActivity(customerID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Error:   "activity_error",
			Message: "Failed to retrieve activity data",
		})
		return
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Data:    activity,
	})
}