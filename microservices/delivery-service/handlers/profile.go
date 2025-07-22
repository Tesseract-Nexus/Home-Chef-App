package handlers

import (
	"net/http"
	"delivery-service/models"
	"delivery-service/services"
	"delivery-service/utils"

	"github.com/gin-gonic/gin"
)

type ProfileHandler struct {
	deliveryService *services.DeliveryService
}

func NewProfileHandler(deliveryService *services.DeliveryService) *ProfileHandler {
	return &ProfileHandler{
		deliveryService: deliveryService,
	}
}

// @Summary Get delivery partner profile
// @Description Get the profile information for the authenticated delivery partner
// @Tags Delivery Profile
// @Accept json
// @Produce json
// @Success 200 {object} models.APIResponse{data=models.DeliveryPartner}
// @Security BearerAuth
// @Router /delivery/profile [get]
func (h *ProfileHandler) GetProfile(c *gin.Context) {
	deliveryPartnerID := c.GetString("delivery_partner_id")
	if deliveryPartnerID == "" {
		deliveryPartnerID = c.GetString("user_id")
	}

	partner, err := h.deliveryService.GetDeliveryPartnerByID(deliveryPartnerID)
	if err != nil {
		c.JSON(http.StatusNotFound, models.ErrorResponse{
			Error:   "partner_not_found",
			Message: "Delivery partner profile not found",
		})
		return
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Data:    partner,
	})
}

// @Summary Update delivery partner profile
// @Description Update delivery partner profile information
// @Tags Delivery Profile
// @Accept json
// @Produce json
// @Param profile body models.DeliveryPartnerUpdate true "Profile update data"
// @Success 200 {object} models.APIResponse
// @Security BearerAuth
// @Router /delivery/profile [put]
func (h *ProfileHandler) UpdateProfile(c *gin.Context) {
	deliveryPartnerID := c.GetString("delivery_partner_id")
	if deliveryPartnerID == "" {
		deliveryPartnerID = c.GetString("user_id")
	}

	var profileUpdate models.DeliveryPartnerUpdate
	if err := c.ShouldBindJSON(&profileUpdate); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Error:   "invalid_request",
			Message: "Invalid request body",
			Details: utils.GetValidationErrors(err),
		})
		return
	}

	updatedPartner, err := h.deliveryService.UpdateDeliveryPartner(deliveryPartnerID, &profileUpdate)
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
		Data:    updatedPartner,
	})
}

// @Summary Update availability status
// @Description Update delivery partner availability and location
// @Tags Delivery Profile
// @Accept json
// @Produce json
// @Param status body models.StatusUpdate true "Status update data"
// @Success 200 {object} models.APIResponse
// @Security BearerAuth
// @Router /delivery/status [put]
func (h *ProfileHandler) UpdateStatus(c *gin.Context) {
	deliveryPartnerID := c.GetString("delivery_partner_id")
	if deliveryPartnerID == "" {
		deliveryPartnerID = c.GetString("user_id")
	}

	var statusUpdate models.StatusUpdate
	if err := c.ShouldBindJSON(&statusUpdate); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Error:   "invalid_request",
			Message: "Invalid request body",
			Details: utils.GetValidationErrors(err),
		})
		return
	}

	err := h.deliveryService.UpdateAvailabilityStatus(deliveryPartnerID, &statusUpdate)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Error:   "update_error",
			Message: "Failed to update status",
		})
		return
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Message: "Status updated successfully",
	})
}