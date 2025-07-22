package handlers

import (
	"net/http"
	"strconv"
	"messaging-service/models"
	"messaging-service/services"
	"messaging-service/utils"

	"github.com/gin-gonic/gin"
)

type ConversationHandler struct {
	messagingService *services.MessagingService
}

func NewConversationHandler(messagingService *services.MessagingService) *ConversationHandler {
	return &ConversationHandler{
		messagingService: messagingService,
	}
}

// @Summary Get user conversations
// @Description Retrieve conversations for the authenticated user
// @Tags Conversations
// @Accept json
// @Produce json
// @Param status query string false "Filter by status"
// @Param page query int false "Page number" default(1)
// @Param limit query int false "Items per page" default(20)
// @Success 200 {object} models.APIResponse{data=[]models.ConversationResponse}
// @Security BearerAuth
// @Router /messages/conversations [get]
func (h *ConversationHandler) GetConversations(c *gin.Context) {
	userID := c.GetString("user_id")
	status := c.DefaultQuery("status", "active")
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "20"))

	conversations, total, err := h.messagingService.GetUserConversations(userID, status, page, limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Error:   "database_error",
			Message: "Failed to retrieve conversations",
		})
		return
	}

	totalPages := int(total) / limit
	if int(total)%limit != 0 {
		totalPages++
	}

	response := models.PaginationResponse{
		Data:       conversations,
		Page:       page,
		Limit:      limit,
		Total:      total,
		TotalPages: totalPages,
		HasNext:    page < totalPages,
		HasPrev:    page > 1,
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Data:    response,
	})
}

// @Summary Create conversation
// @Description Create a new conversation
// @Tags Conversations
// @Accept json
// @Produce json
// @Param conversation body models.ConversationCreate true "Conversation data"
// @Success 201 {object} models.APIResponse
// @Security BearerAuth
// @Router /messages/conversations [post]
func (h *ConversationHandler) CreateConversation(c *gin.Context) {
	userID := c.GetString("user_id")

	var conversationCreate models.ConversationCreate
	if err := c.ShouldBindJSON(&conversationCreate); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Error:   "invalid_request",
			Message: "Invalid request body",
			Details: utils.GetValidationErrors(err),
		})
		return
	}

	conversation, err := h.messagingService.CreateConversation(userID, &conversationCreate)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Error:   "creation_error",
			Message: "Failed to create conversation",
		})
		return
	}

	c.JSON(http.StatusCreated, models.APIResponse{
		Success: true,
		Message: "Conversation created successfully",
		Data:    conversation,
	})
}

// @Summary Get conversation details
// @Description Get details of a specific conversation
// @Tags Conversations
// @Accept json
// @Produce json
// @Param conversation_id path string true "Conversation ID"
// @Success 200 {object} models.APIResponse{data=models.Conversation}
// @Security BearerAuth
// @Router /messages/conversations/{conversation_id} [get]
func (h *ConversationHandler) GetConversation(c *gin.Context) {
	conversationID := c.Param("conversation_id")
	userID := c.GetString("user_id")

	conversation, err := h.messagingService.GetConversation(conversationID, userID)
	if err != nil {
		c.JSON(http.StatusNotFound, models.ErrorResponse{
			Error:   "conversation_not_found",
			Message: "Conversation not found",
		})
		return
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Data:    conversation,
	})
}

// @Summary Archive conversation
// @Description Archive a conversation
// @Tags Conversations
// @Accept json
// @Produce json
// @Param conversation_id path string true "Conversation ID"
// @Success 200 {object} models.APIResponse
// @Security BearerAuth
// @Router /messages/conversations/{conversation_id}/archive [put]
func (h *ConversationHandler) ArchiveConversation(c *gin.Context) {
	conversationID := c.Param("conversation_id")
	userID := c.GetString("user_id")

	err := h.messagingService.ArchiveConversation(conversationID, userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Error:   "archive_error",
			Message: "Failed to archive conversation",
		})
		return
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Message: "Conversation archived successfully",
	})
}

// @Summary Block conversation
// @Description Block a conversation
// @Tags Conversations
// @Accept json
// @Produce json
// @Param conversation_id path string true "Conversation ID"
// @Param block body models.ConversationBlock true "Block reason"
// @Success 200 {object} models.APIResponse
// @Security BearerAuth
// @Router /messages/conversations/{conversation_id}/block [put]
func (h *ConversationHandler) BlockConversation(c *gin.Context) {
	conversationID := c.Param("conversation_id")
	userID := c.GetString("user_id")

	var blockRequest models.ConversationBlock
	if err := c.ShouldBindJSON(&blockRequest); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Error:   "invalid_request",
			Message: "Invalid request body",
			Details: utils.GetValidationErrors(err),
		})
		return
	}

	err := h.messagingService.BlockConversation(conversationID, userID, blockRequest.Reason)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Error:   "block_error",
			Message: "Failed to block conversation",
		})
		return
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Message: "Conversation blocked successfully",
	})
}