package handlers

import (
	"net/http"
	"inventory-service/models"
	"inventory-service/services"
	"inventory-service/utils"

	"github.com/gin-gonic/gin"
)

type AvailabilityHandler struct {
	inventoryService *services.InventoryService
}

func NewAvailabilityHandler(inventoryService *services.InventoryService) *AvailabilityHandler {
	return &AvailabilityHandler{
		inventoryService: inventoryService,
	}
}

// @Summary Check ingredient availability for orders
// @Description Check if ingredients are available for multiple orders
// @Tags Availability Check
// @Accept json
// @Produce json
// @Param availability body models.AvailabilityCheck true "Availability check data"
// @Success 200 {object} models.APIResponse{data=models.AvailabilityResult}
// @Security BearerAuth
// @Router /inventory/availability/check [post]
func (h *AvailabilityHandler) CheckAvailability(c *gin.Context) {
	chefID := c.GetString("chef_id")
	if chefID == "" {
		chefID = c.GetString("user_id")
	}

	var availabilityCheck models.AvailabilityCheck
	if err := c.ShouldBindJSON(&availabilityCheck); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Error:   "invalid_request",
			Message: "Invalid request body",
			Details: utils.GetValidationErrors(err),
		})
		return
	}

	result, err := h.inventoryService.CheckAvailability(chefID, &availabilityCheck)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Error:   "availability_error",
			Message: "Failed to check availability",
		})
		return
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Data:    result,
	})
}