package handlers

import (
	"net/http"
	"delivery-service/models"
	"delivery-service/services"
	"delivery-service/utils"

	"github.com/gin-gonic/gin"
)

type EmergencyHandler struct {
	emergencyService *services.EmergencyService
}

func NewEmergencyHandler(emergencyService *services.EmergencyService) *EmergencyHandler {
	return &EmergencyHandler{
		emergencyService: emergencyService,
	}
}

// @Summary Report emergency
// @Description Report an emergency situation
// @Tags Emergency
// @Accept json
// @Produce json
// @Param emergency body models.EmergencyReportCreate true "Emergency report data"
// @Success 200 {object} models.APIResponse
// @Security BearerAuth
// @Router /delivery/emergency [post]
func (h *EmergencyHandler) ReportEmergency(c *gin.Context) {
	deliveryPartnerID := c.GetString("delivery_partner_id")
	if deliveryPartnerID == "" {
		deliveryPartnerID = c.GetString("user_id")
	}

	var emergencyReport models.EmergencyReportCreate
	if err := c.ShouldBindJSON(&emergencyReport); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Error:   "invalid_request",
			Message: "Invalid request body",
			Details: utils.GetValidationErrors(err),
		})
		return
	}

	reportID, err := h.emergencyService.ReportEmergency(deliveryPartnerID, &emergencyReport)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Error:   "report_error",
			Message: "Failed to report emergency",
		})
		return
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Message: "Emergency reported successfully",
		Data: gin.H{
			"report_id": reportID,
			"status":    "reported",
		},
	})
}