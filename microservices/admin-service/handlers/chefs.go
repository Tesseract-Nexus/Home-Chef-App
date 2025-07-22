package handlers

import (
	"net/http"
	"strconv"
	"admin-service/models"
	"admin-service/utils"

	"github.com/gin-gonic/gin"
)

type ChefHandler struct {
	// Dependencies would be injected here
}

func NewChefHandler() *ChefHandler {
	return &ChefHandler{}
}

// @Summary Get all chefs
// @Description Retrieve all chefs with filtering and pagination
// @Tags Chef Management
// @Accept json
// @Produce json
// @Param status query string false "Filter by status"
// @Param page query int false "Page number" default(1)
// @Param limit query int false "Items per page" default(20)
// @Success 200 {object} models.APIResponse{data=models.PaginationResponse}
// @Security BearerAuth
// @Router /admin/chefs [get]
func (h *ChefHandler) GetChefs(c *gin.Context) {
	status := c.Query("status")
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "20"))

	// TODO: Fetch chefs from database with filters
	chefs := []gin.H{
		{
			"id":                "chef-1",
			"name":              "Priya Sharma",
			"email":             "priya@example.com",
			"specialty":         "North Indian Cuisine",
			"status":            "active",
			"verification_status": "verified",
			"rating":            4.8,
			"total_orders":      445,
			"created_at":        "2024-01-10T14:20:00Z",
		},
	}

	totalPages := 3
	response := models.PaginationResponse{
		Data:       chefs,
		Page:       page,
		Limit:      limit,
		Total:      50,
		TotalPages: totalPages,
		HasNext:    page < totalPages,
		HasPrev:    page > 1,
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Data:    response,
	})
}

// @Summary Approve chef application
// @Description Approve a chef's application
// @Tags Chef Management
// @Accept json
// @Produce json
// @Param chef_id path string true "Chef ID"
// @Param approval body models.ChefApproval true "Approval data"
// @Success 200 {object} models.APIResponse
// @Security BearerAuth
// @Router /admin/chefs/{chef_id}/approve [post]
func (h *ChefHandler) ApproveChef(c *gin.Context) {
	chefID := c.Param("chef_id")

	var approval models.ChefApproval
	if err := c.ShouldBindJSON(&approval); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Error:   "invalid_request",
			Message: "Invalid request body",
			Details: utils.GetValidationErrors(err),
		})
		return
	}

	// TODO: Update chef status to approved
	// TODO: Send approval notification to chef

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Message: "Chef approved successfully",
		Data: gin.H{
			"chef_id": chefID,
			"status":  "approved",
		},
	})
}

// @Summary Reject chef application
// @Description Reject a chef's application
// @Tags Chef Management
// @Accept json
// @Produce json
// @Param chef_id path string true "Chef ID"
// @Param rejection body models.ChefRejection true "Rejection data"
// @Success 200 {object} models.APIResponse
// @Security BearerAuth
// @Router /admin/chefs/{chef_id}/reject [post]
func (h *ChefHandler) RejectChef(c *gin.Context) {
	chefID := c.Param("chef_id")

	var rejection models.ChefRejection
	if err := c.ShouldBindJSON(&rejection); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Error:   "invalid_request",
			Message: "Invalid request body",
			Details: utils.GetValidationErrors(err),
		})
		return
	}

	// TODO: Update chef status to rejected
	// TODO: Send rejection notification with reason

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Message: "Chef rejected successfully",
		Data: gin.H{
			"chef_id": chefID,
			"status":  "rejected",
			"reason":  rejection.Reason,
		},
	})
}

// @Summary Suspend chef
// @Description Suspend a chef's account
// @Tags Chef Management
// @Accept json
// @Produce json
// @Param chef_id path string true "Chef ID"
// @Param suspension body models.ChefSuspension true "Suspension data"
// @Success 200 {object} models.APIResponse
// @Security BearerAuth
// @Router /admin/chefs/{chef_id}/suspend [post]
func (h *ChefHandler) SuspendChef(c *gin.Context) {
	chefID := c.Param("chef_id")

	var suspension models.ChefSuspension
	if err := c.ShouldBindJSON(&suspension); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Error:   "invalid_request",
			Message: "Invalid request body",
			Details: utils.GetValidationErrors(err),
		})
		return
	}

	// TODO: Update chef status to suspended
	// TODO: Send suspension notification

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Message: "Chef suspended successfully",
		Data: gin.H{
			"chef_id":  chefID,
			"status":   "suspended",
			"reason":   suspension.Reason,
			"duration": suspension.Duration,
		},
	})
}