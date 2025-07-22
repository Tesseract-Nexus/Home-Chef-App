package handlers

import (
	"net/http"
	"strconv"
	"admin-service/models"
	"admin-service/utils"

	"github.com/gin-gonic/gin"
)

type SupportHandler struct {
	// Dependencies would be injected here
}

func NewSupportHandler() *SupportHandler {
	return &SupportHandler{}
}

// @Summary Get support tickets
// @Description Retrieve all support tickets with filtering and pagination
// @Tags Customer Support
// @Accept json
// @Produce json
// @Param status query string false "Filter by status"
// @Param priority query string false "Filter by priority"
// @Param assigned_to query string false "Filter by assigned agent"
// @Param page query int false "Page number" default(1)
// @Param limit query int false "Items per page" default(20)
// @Success 200 {object} models.APIResponse{data=models.PaginationResponse}
// @Security BearerAuth
// @Router /admin/support/tickets [get]
func (h *SupportHandler) GetSupportTickets(c *gin.Context) {
	status := c.Query("status")
	priority := c.Query("priority")
	assignedTo := c.Query("assigned_to")
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "20"))

	// TODO: Fetch support tickets from database
	tickets := []gin.H{
		{
			"id":          "ticket-1",
			"customer_id": "user-1",
			"subject":     "Order not delivered",
			"status":      "open",
			"priority":    "high",
			"assigned_to": "agent-1",
			"created_at":  "2024-01-20T14:30:00Z",
		},
	}

	totalPages := 8
	response := models.PaginationResponse{
		Data:       tickets,
		Page:       page,
		Limit:      limit,
		Total:      160,
		TotalPages: totalPages,
		HasNext:    page < totalPages,
		HasPrev:    page > 1,
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Data:    response,
	})
}

// @Summary Assign ticket to agent
// @Description Assign a support ticket to an agent
// @Tags Customer Support
// @Accept json
// @Produce json
// @Param ticket_id path string true "Ticket ID"
// @Param assignment body models.TicketAssignment true "Assignment data"
// @Success 200 {object} models.APIResponse
// @Security BearerAuth
// @Router /admin/support/tickets/{ticket_id}/assign [put]
func (h *SupportHandler) AssignTicket(c *gin.Context) {
	ticketID := c.Param("ticket_id")

	var assignment models.TicketAssignment
	if err := c.ShouldBindJSON(&assignment); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Error:   "invalid_request",
			Message: "Invalid request body",
			Details: utils.GetValidationErrors(err),
		})
		return
	}

	// TODO: Assign ticket to agent
	// TODO: Send notification to agent

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Message: "Ticket assigned successfully",
		Data: gin.H{
			"ticket_id":   ticketID,
			"assigned_to": assignment.AgentID,
		},
	})
}