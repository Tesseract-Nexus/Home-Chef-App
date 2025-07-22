package handlers

import (
	"net/http"
	"customer-service/models"
	"customer-service/utils"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type SupportHandler struct {
	// Dependencies would be injected here
}

func NewSupportHandler() *SupportHandler {
	return &SupportHandler{}
}

// @Summary Get support tickets
// @Description Get support tickets for the authenticated user
// @Tags Support
// @Accept json
// @Produce json
// @Param status query string false "Filter by status"
// @Success 200 {object} models.APIResponse
// @Security BearerAuth
// @Router /support/tickets [get]
func (h *SupportHandler) GetTickets(c *gin.Context) {
	userID := c.GetString("user_id")
	status := c.Query("status")

	// TODO: Fetch tickets from database
	tickets := []gin.H{
		{
			"id":          "ticket-1",
			"title":       "Order not delivered",
			"description": "My order was not delivered on time",
			"category":    "delivery",
			"priority":    "high",
			"status":      "open",
			"created_at":  "2024-01-20T14:30:00Z",
		},
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Data:    tickets,
	})
}

// @Summary Create support ticket
// @Description Create a new support ticket
// @Tags Support
// @Accept json
// @Produce json
// @Param ticket body object true "Ticket data"
// @Success 201 {object} models.APIResponse
// @Security BearerAuth
// @Router /support/tickets [post]
func (h *SupportHandler) CreateTicket(c *gin.Context) {
	userID := c.GetString("user_id")

	var request struct {
		Title       string  `json:"title" binding:"required"`
		Description string  `json:"description" binding:"required"`
		Category    string  `json:"category" binding:"required"`
		Priority    string  `json:"priority" binding:"required"`
		OrderID     *string `json:"order_id"`
	}

	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Error:   "invalid_request",
			Message: "Invalid request body",
			Details: utils.GetValidationErrors(err),
		})
		return
	}

	// TODO: Create ticket in database
	ticketID := uuid.New().String()

	c.JSON(http.StatusCreated, models.APIResponse{
		Success: true,
		Message: "Support ticket created successfully",
		Data: gin.H{
			"ticket_id": ticketID,
			"status":    "open",
		},
	})
}