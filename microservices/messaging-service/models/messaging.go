package models

import (
	"time"
	"github.com/google/uuid"
)

type Conversation struct {
	ID           string                `json:"id" gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
	OrderID      string                `json:"order_id" gorm:"not null;index"`
	Status       string                `json:"status" gorm:"default:'active'"`
	CreatedAt    time.Time             `json:"created_at"`
	UpdatedAt    time.Time             `json:"updated_at"`
	
	// Relationships
	Participants []ConversationParticipant `json:"participants,omitempty" gorm:"foreignKey:ConversationID"`
	Messages     []Message                 `json:"messages,omitempty" gorm:"foreignKey:ConversationID"`
}

type ConversationParticipant struct {
	ID             string    `json:"id" gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
	ConversationID string    `json:"conversation_id" gorm:"not null"`
	UserID         string    `json:"user_id" gorm:"not null"`
	UserName       string    `json:"user_name" gorm:"not null"`
	UserRole       string    `json:"user_role" gorm:"not null"`
	UserAvatar     string    `json:"user_avatar"`
	LastReadAt     *time.Time `json:"last_read_at"`
	IsBlocked      bool      `json:"is_blocked" gorm:"default:false"`
	JoinedAt       time.Time `json:"joined_at"`
	
	// Relationships
	Conversation Conversation `json:"conversation" gorm:"foreignKey:ConversationID"`
}

type Message struct {
	ID             string      `json:"id" gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
	ConversationID string      `json:"conversation_id" gorm:"not null;index"`
	SenderID       string      `json:"sender_id" gorm:"not null"`
	SenderName     string      `json:"sender_name" gorm:"not null"`
	SenderRole     string      `json:"sender_role" gorm:"not null"`
	Content        MessageContent `json:"content" gorm:"embedded"`
	Metadata       string      `json:"metadata" gorm:"type:text"` // JSON object as string
	IsRead         bool        `json:"is_read" gorm:"default:false"`
	IsEdited       bool        `json:"is_edited" gorm:"default:false"`
	EditedAt       *time.Time  `json:"edited_at"`
	CreatedAt      time.Time   `json:"created_at"`
	
	// Relationships
	Conversation Conversation `json:"conversation" gorm:"foreignKey:ConversationID"`
}

type MessageContent struct {
	Type      string            `json:"type" gorm:"column:content_type;not null"`
	Text      string            `json:"text" gorm:"column:content_text"`
	ImageURL  string            `json:"image_url" gorm:"column:content_image_url"`
	Location  MessageLocation   `json:"location" gorm:"embedded;embeddedPrefix:location_"`
}

type MessageLocation struct {
	Latitude  float64 `json:"latitude" gorm:"column:latitude"`
	Longitude float64 `json:"longitude" gorm:"column:longitude"`
	Address   string  `json:"address" gorm:"column:address"`
}

type MessageTemplate struct {
	ID        string    `json:"id" gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
	Category  string    `json:"category" gorm:"not null"`
	Title     string    `json:"title" gorm:"not null"`
	Content   string    `json:"content" gorm:"not null"`
	Variables string    `json:"variables" gorm:"type:text"` // JSON array as string
	UserRoles string    `json:"user_roles" gorm:"type:text"` // JSON array as string
	IsActive  bool      `json:"is_active" gorm:"default:true"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

type MessageRead struct {
	ID             string    `json:"id" gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
	MessageID      string    `json:"message_id" gorm:"not null"`
	ConversationID string    `json:"conversation_id" gorm:"not null"`
	UserID         string    `json:"user_id" gorm:"not null"`
	ReadAt         time.Time `json:"read_at"`
	
	// Relationships
	Message      Message      `json:"message" gorm:"foreignKey:MessageID"`
	Conversation Conversation `json:"conversation" gorm:"foreignKey:ConversationID"`
}

// Request/Response models
type ConversationCreate struct {
	ParticipantID  string  `json:"participant_id" validate:"required"`
	OrderID        string  `json:"order_id" validate:"required"`
	InitialMessage *string `json:"initial_message"`
}

type MessageCreate struct {
	Content  MessageContentCreate `json:"content" validate:"required"`
	Metadata map[string]interface{} `json:"metadata"`
}

type MessageContentCreate struct {
	Type     string                   `json:"type" validate:"required,oneof=text image location order_update"`
	Text     string                   `json:"text" validate:"max=1000"`
	Image    string                   `json:"image"` // Base64 encoded
	Location *MessageLocationCreate   `json:"location"`
}

type MessageLocationCreate struct {
	Latitude  float64 `json:"latitude" validate:"required"`
	Longitude float64 `json:"longitude" validate:"required"`
	Address   string  `json:"address"`
}

type ConversationResponse struct {
	ID           string                      `json:"id"`
	Participants []ConversationParticipant   `json:"participants"`
	LastMessage  *MessageResponse            `json:"last_message"`
	UnreadCount  int                         `json:"unread_count"`
	OrderID      string                      `json:"order_id"`
	Status       string                      `json:"status"`
	CreatedAt    time.Time                   `json:"created_at"`
}

type MessageResponse struct {
	ID             string         `json:"id"`
	ConversationID string         `json:"conversation_id"`
	SenderID       string         `json:"sender_id"`
	SenderName     string         `json:"sender_name"`
	SenderRole     string         `json:"sender_role"`
	Content        MessageContent `json:"content"`
	Metadata       map[string]interface{} `json:"metadata"`
	IsRead         bool           `json:"is_read"`
	Timestamp      time.Time      `json:"timestamp"`
}

type ConversationBlock struct {
	Reason string `json:"reason" validate:"required"`
}

type MessageReadUpdate struct {
	LastReadMessageID string `json:"last_read_message_id" validate:"required"`
}

// BeforeCreate hooks
func (c *Conversation) BeforeCreate(tx *gorm.DB) error {
	if c.ID == "" {
		c.ID = uuid.New().String()
	}
	return nil
}

func (cp *ConversationParticipant) BeforeCreate(tx *gorm.DB) error {
	if cp.ID == "" {
		cp.ID = uuid.New().String()
	}
	return nil
}

func (m *Message) BeforeCreate(tx *gorm.DB) error {
	if m.ID == "" {
		m.ID = uuid.New().String()
	}
	return nil
}

func (mt *MessageTemplate) BeforeCreate(tx *gorm.DB) error {
	if mt.ID == "" {
		mt.ID = uuid.New().String()
	}
	return nil
}

func (mr *MessageRead) BeforeCreate(tx *gorm.DB) error {
	if mr.ID == "" {
		mr.ID = uuid.New().String()
	}
	return nil
}