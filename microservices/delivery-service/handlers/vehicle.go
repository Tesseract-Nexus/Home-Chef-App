package handlers

import (
	"net/http"
	"delivery-service/models"
	"delivery-service/services"
	"delivery-service/utils"

	"github.com/gin-gonic/gin"
)

type VehicleHandler struct {
	vehicleService *services.VehicleService
}

func NewVehicleHandler(vehicleService *services.VehicleService) *VehicleHandler {
	return &VehicleHandler{
		vehicleService: vehicleService,
	}
}

// @Summary Update vehicle information
// @Description Update delivery partner vehicle details
// @Tags Vehicle Management
// @Accept json
// @Produce json
// @Param vehicle body models.VehicleUpdate true "Vehicle update data"
// @Success 200 {object} models.APIResponse
// @Security BearerAuth
// @Router /delivery/vehicle [put]
func (h *VehicleHandler) UpdateVehicle(c *gin.Context) {
	deliveryPartnerID := c.GetString("delivery_partner_id")
	if deliveryPartnerID == "" {
		deliveryPartnerID = c.GetString("user_id")
	}

	var vehicleUpdate models.VehicleUpdate
	if err := c.ShouldBindJSON(&vehicleUpdate); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Error:   "invalid_request",
			Message: "Invalid request body",
			Details: utils.GetValidationErrors(err),
		})
		return
	}

	err := h.vehicleService.UpdateVehicle(deliveryPartnerID, &vehicleUpdate)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Error:   "update_error",
			Message: "Failed to update vehicle information",
		})
		return
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Message: "Vehicle information updated successfully",
	})
}