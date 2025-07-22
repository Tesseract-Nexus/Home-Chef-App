package handlers

import (
	"net/http"
	"messaging-service/models"
	"messaging-service/services"

	"github.com/gin-gonic/gin"
)

type TemplateHandler struct {
	messagingService *services.MessagingService
}

func NewTemplateHandler(messagingService *services.MessagingService) *TemplateHandler {
	return &TemplateHandler{
		messagingService: messagingService,
	}
}

// @Summary Get message templates
// @Description Retrieve message templates for quick responses
// @Tags Message Templates
// @Accept json
// @Produce json
// @Param category query string false "Template category"
// @Param user_role query string false "User role filter"
// @Success 200 {object} models.APIResponse{data=[]models.MessageTemplate}
// @Security BearerAuth
// @Router /messages/templates [get]
func (h *TemplateHandler) GetTemplates(c *gin.Context) {
	category := c.Query("category")
	userRole := c.Query("user_role")

	templates, err := h.messagingService.GetMessageTemplates(category, userRole)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Error:   "database_error",
			Message: "Failed to retrieve templates",
		})
		return
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Data:    templates,
	})
}