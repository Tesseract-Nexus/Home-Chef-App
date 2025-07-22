package services

import (
	"encoding/json"
	"messaging-service/models"
	"time"

	"gorm.io/gorm"
	"go.uber.org/zap"
)

type MessagingService struct {
	db     *gorm.DB
	logger *zap.Logger
}

func NewMessagingService(db *gorm.DB, logger *zap.Logger) *MessagingService {
	return &MessagingService{
		db:     db,
		logger: logger,
	}
}

func (s *MessagingService) GetUserConversations(userID, status string, page, limit int) ([]models.ConversationResponse, int64, error) {
	var conversations []models.Conversation
	var total int64

	query := s.db.Model(&models.Conversation{}).
		Joins("JOIN conversation_participants ON conversations.id = conversation_participants.conversation_id").
		Where("conversation_participants.user_id = ?", userID)

	if status != "" && status != "all" {
		query = query.Where("conversations.status = ?", status)
	}

	// Get total count
	query.Count(&total)

	// Get paginated results
	offset := (page - 1) * limit
	err := query.Preload("Participants").
		Preload("Messages", func(db *gorm.DB) *gorm.DB {
			return db.Order("created_at DESC").Limit(1)
		}).
		Offset(offset).Limit(limit).
		Order("conversations.updated_at DESC").
		Find(&conversations).Error

	if err != nil {
		return nil, 0, err
	}

	// Convert to response format
	var responses []models.ConversationResponse
	for _, conv := range conversations {
		response := models.ConversationResponse{
			ID:           conv.ID,
			Participants: conv.Participants,
			OrderID:      conv.OrderID,
			Status:       conv.Status,
			CreatedAt:    conv.CreatedAt,
		}

		// Add last message if exists
		if len(conv.Messages) > 0 {
			msg := conv.Messages[0]
			var metadata map[string]interface{}
			if msg.Metadata != "" {
				json.Unmarshal([]byte(msg.Metadata), &metadata)
			}

			response.LastMessage = &models.MessageResponse{
				ID:             msg.ID,
				ConversationID: msg.ConversationID,
				SenderID:       msg.SenderID,
				SenderName:     msg.SenderName,
				SenderRole:     msg.SenderRole,
				Content:        msg.Content,
				Metadata:       metadata,
				IsRead:         msg.IsRead,
				Timestamp:      msg.CreatedAt,
			}
		}

		// Calculate unread count
		var unreadCount int64
		s.db.Model(&models.Message{}).
			Where("conversation_id = ? AND sender_id != ? AND is_read = ?", conv.ID, userID, false).
			Count(&unreadCount)
		response.UnreadCount = int(unreadCount)

		responses = append(responses, response)
	}

	return responses, total, nil
}

func (s *MessagingService) CreateConversation(userID string, conversationCreate *models.ConversationCreate) (*models.Conversation, error) {
	// Check if conversation already exists for this order
	var existingConv models.Conversation
	err := s.db.Where("order_id = ?", conversationCreate.OrderID).First(&existingConv).Error
	if err == nil {
		// Conversation already exists, return it
		return &existingConv, nil
	}

	// Create new conversation
	conversation := &models.Conversation{
		OrderID: conversationCreate.OrderID,
		Status:  "active",
	}

	err = s.db.Create(conversation).Error
	if err != nil {
		return nil, err
	}

	// Add participants
	participants := []models.ConversationParticipant{
		{
			ConversationID: conversation.ID,
			UserID:         userID,
			UserName:       "Current User", // TODO: Get from user service
			UserRole:       "customer",     // TODO: Get from JWT
			JoinedAt:       time.Now(),
		},
		{
			ConversationID: conversation.ID,
			UserID:         conversationCreate.ParticipantID,
			UserName:       "Participant", // TODO: Get from user service
			UserRole:       "chef",        // TODO: Determine role
			JoinedAt:       time.Now(),
		},
	}

	for _, participant := range participants {
		s.db.Create(&participant)
	}

	// Send initial message if provided
	if conversationCreate.InitialMessage != nil && *conversationCreate.InitialMessage != "" {
		messageCreate := &models.MessageCreate{
			Content: models.MessageContentCreate{
				Type: "text",
				Text: *conversationCreate.InitialMessage,
			},
		}
		s.SendMessage(conversation.ID, userID, messageCreate)
	}

	return conversation, nil
}

func (s *MessagingService) GetConversation(conversationID, userID string) (*models.Conversation, error) {
	var conversation models.Conversation
	err := s.db.Preload("Participants").Preload("Messages").
		Joins("JOIN conversation_participants ON conversations.id = conversation_participants.conversation_id").
		Where("conversations.id = ? AND conversation_participants.user_id = ?", conversationID, userID).
		First(&conversation).Error

	return &conversation, err
}

func (s *MessagingService) GetConversationMessages(conversationID, userID, beforeMessageID string, limit int) ([]models.MessageResponse, error) {
	// Verify user is participant
	var participant models.ConversationParticipant
	err := s.db.Where("conversation_id = ? AND user_id = ?", conversationID, userID).First(&participant).Error
	if err != nil {
		return nil, err
	}

	var messages []models.Message
	query := s.db.Where("conversation_id = ?", conversationID)

	if beforeMessageID != "" {
		var beforeMessage models.Message
		s.db.Where("id = ?", beforeMessageID).First(&beforeMessage)
		query = query.Where("created_at < ?", beforeMessage.CreatedAt)
	}

	err = query.Order("created_at DESC").Limit(limit).Find(&messages).Error
	if err != nil {
		return nil, err
	}

	// Convert to response format
	var responses []models.MessageResponse
	for _, msg := range messages {
		var metadata map[string]interface{}
		if msg.Metadata != "" {
			json.Unmarshal([]byte(msg.Metadata), &metadata)
		}

		responses = append(responses, models.MessageResponse{
			ID:             msg.ID,
			ConversationID: msg.ConversationID,
			SenderID:       msg.SenderID,
			SenderName:     msg.SenderName,
			SenderRole:     msg.SenderRole,
			Content:        msg.Content,
			Metadata:       metadata,
			IsRead:         msg.IsRead,
			Timestamp:      msg.CreatedAt,
		})
	}

	return responses, nil
}

func (s *MessagingService) SendMessage(conversationID, senderID string, messageCreate *models.MessageCreate) (*models.Message, error) {
	// Verify user is participant
	var participant models.ConversationParticipant
	err := s.db.Where("conversation_id = ? AND user_id = ?", conversationID, senderID).First(&participant).Error
	if err != nil {
		return nil, err
	}

	// Create message
	metadataJSON, _ := json.Marshal(messageCreate.Metadata)
	
	message := &models.Message{
		ConversationID: conversationID,
		SenderID:       senderID,
		SenderName:     participant.UserName,
		SenderRole:     participant.UserRole,
		Content: models.MessageContent{
			Type: messageCreate.Content.Type,
			Text: messageCreate.Content.Text,
		},
		Metadata: string(metadataJSON),
	}

	// Handle different content types
	switch messageCreate.Content.Type {
	case "image":
		// TODO: Process and store image
		message.Content.ImageURL = "https://cdn.homechef.com/messages/" + uuid.New().String() + ".jpg"
	case "location":
		if messageCreate.Content.Location != nil {
			message.Content.Location = models.MessageLocation{
				Latitude:  messageCreate.Content.Location.Latitude,
				Longitude: messageCreate.Content.Location.Longitude,
				Address:   messageCreate.Content.Location.Address,
			}
		}
	}

	err = s.db.Create(message).Error
	if err != nil {
		return nil, err
	}

	// Update conversation timestamp
	s.db.Model(&models.Conversation{}).Where("id = ?", conversationID).Update("updated_at", time.Now())

	return message, nil
}

func (s *MessagingService) MarkMessagesAsRead(conversationID, userID, lastReadMessageID string) error {
	// Verify user is participant
	var participant models.ConversationParticipant
	err := s.db.Where("conversation_id = ? AND user_id = ?", conversationID, userID).First(&participant).Error
	if err != nil {
		return err
	}

	// Get the timestamp of the last read message
	var lastMessage models.Message
	err = s.db.Where("id = ?", lastReadMessageID).First(&lastMessage).Error
	if err != nil {
		return err
	}

	// Mark all messages up to this point as read
	err = s.db.Model(&models.Message{}).
		Where("conversation_id = ? AND created_at <= ? AND sender_id != ?", 
			conversationID, lastMessage.CreatedAt, userID).
		Update("is_read", true).Error

	if err != nil {
		return err
	}

	// Update participant's last read timestamp
	participant.LastReadAt = &lastMessage.CreatedAt
	return s.db.Save(&participant).Error
}

func (s *MessagingService) ArchiveConversation(conversationID, userID string) error {
	// Verify user is participant
	var participant models.ConversationParticipant
	err := s.db.Where("conversation_id = ? AND user_id = ?", conversationID, userID).First(&participant).Error
	if err != nil {
		return err
	}

	return s.db.Model(&models.Conversation{}).Where("id = ?", conversationID).Update("status", "archived").Error
}

func (s *MessagingService) BlockConversation(conversationID, userID, reason string) error {
	// Verify user is participant
	var participant models.ConversationParticipant
	err := s.db.Where("conversation_id = ? AND user_id = ?", conversationID, userID).First(&participant).Error
	if err != nil {
		return err
	}

	// Block the participant
	participant.IsBlocked = true
	err = s.db.Save(&participant).Error
	if err != nil {
		return err
	}

	// Update conversation status
	return s.db.Model(&models.Conversation{}).Where("id = ?", conversationID).Update("status", "blocked").Error
}

func (s *MessagingService) GetMessageTemplates(category, userRole string) ([]models.MessageTemplate, error) {
	var templates []models.MessageTemplate
	query := s.db.Where("is_active = ?", true)

	if category != "" {
		query = query.Where("category = ?", category)
	}

	if userRole != "" {
		query = query.Where("user_roles LIKE ?", "%"+userRole+"%")
	}

	err := query.Find(&templates).Error
	return templates, err
}