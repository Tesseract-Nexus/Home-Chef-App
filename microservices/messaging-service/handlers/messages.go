package handlers

import (
	"net/http"
	"strconv"
	"messaging-service/models"
	"messaging-service/services"
	"messaging-service/utils"

	"github.com/gin-gonic/gin"
)

type MessageHandler struct {
	messagingService *services.MessagingService
}

func NewMessageHandler(messagingService *services.MessagingService) *MessageHandler {
	return &MessageHandler{
		messagingService: messagingService,
	}
}

// @Summary Get conversation messages
// @Description Retrieve messages from a conversation
// @Tags Messages
// @Accept json
// @Produce json
// @Param conversation_id path string true "Conversation ID"
// @Param before query string false "Message ID to paginate before"
// @Param limit query int false "Number of messages" default(50)
// @Success 200 {object} models.APIResponse{data=[]models.MessageResponse}
// @Security BearerAuth
// @Router /messages/conversations/{conversation_id}/messages [get]
func (h *MessageHandler) GetMessages(c *gin.Context) {
	conversationID := c.Param("conversation_id")
	userID := c.GetString("user_id")
	beforeMessageID := c.Query("before")
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "50"))

	messages, err := h.messagingService.GetConversationMessages(conversationID, userID, beforeMessageID, limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Error:   "database_error",
			Message: "Failed to retrieve messages",
		})
		return
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Data:    messages,
	})
}

// @Summary Send message
// @Description Send a message in a conversation
// @Tags Messages
// @Accept json
// @Produce json
// @Param conversation_id path string true "Conversation ID"
// @Param message body models.MessageCreate true "Message data"
// @Success 201 {object} models.APIResponse
// @Security BearerAuth
// @Router /messages/conversations/{conversation_id}/messages [post]
func (h *MessageHandler) SendMessage(c *gin.Context) {
	conversationID := c.Param("conversation_id")
	userID := c.GetString("user_id")

	var messageCreate models.MessageCreate
	if err := c.ShouldBindJSON(&messageCreate); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Error:   "invalid_request",
			Message: "Invalid request body",
			Details: utils.GetValidationErrors(err),
		})
		return
	}

	message, err := h.messagingService.SendMessage(conversationID, userID, &messageCreate)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Error:   "send_error",
			Message: "Failed to send message",
		})
		return
	}

	c.JSON(http.StatusCreated, models.APIResponse{
		Success: true,
		Message: "Message sent successfully",
		Data:    message,
	})
}

// @Summary Mark messages as read
// @Description Mark messages as read up to a specific message
// @Tags Messages
// @Accept json
// @Produce json
// @Param conversation_id path string true "Conversation ID"
// @Param read_update body models.MessageReadUpdate true "Read update data"
// @Success 200 {object} models.APIResponse
// @Security BearerAuth
// @Router /messages/conversations/{conversation_id}/read [put]
func (h *MessageHandler) MarkAsRead(c *gin.Context) {
	conversationID := c.Param("conversation_id")
	userID := c.GetString("user_id")

	var readUpdate models.MessageReadUpdate
	if err := c.ShouldBindJSON(&readUpdate); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Error:   "invalid_request",
			Message: "Invalid request body",
			Details: utils.GetValidationErrors(err),
		})
		return
	}

	err := h.messagingService.MarkMessagesAsRead(conversationID, userID, readUpdate.LastReadMessageID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Error:   "read_error",
			Message: "Failed to mark messages as read",
		})
		return
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Message: "Messages marked as read",
	})
}