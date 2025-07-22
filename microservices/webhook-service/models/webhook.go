package models

import (
	"database/sql/driver"
	"encoding/json"
	"errors"
	"time"
)

// WebhookEndpoint represents a webhook endpoint
type WebhookEndpoint struct {
	BaseModel
	ID          string       `json:"id" gorm:"type:varchar(255);uniqueIndex"`
	UserID      string       `json:"user_id" gorm:"type:varchar(255);not null;index"`
	URL         string       `json:"url" gorm:"type:text;not null"`
	Events      StringArray  `json:"events" gorm:"type:text"`
	Secret      string       `json:"secret" gorm:"type:varchar(255);not null"`
	Description string       `json:"description" gorm:"type:text"`
	IsActive    bool         `json:"is_active" gorm:"default:true"`
	RetryPolicy RetryPolicy  `json:"retry_policy" gorm:"type:jsonb"`
}

// WebhookEvent represents available webhook events
type WebhookEvent struct {
	EventType     string      `json:"event_type"`
	Description   string      `json:"description"`
	PayloadSchema interface{} `json:"payload_schema"`
}

// WebhookDelivery represents a webhook delivery attempt
type WebhookDelivery struct {
	BaseModel
	ID           string                 `json:"id" gorm:"type:varchar(255);uniqueIndex"`
	WebhookID    string                 `json:"webhook_id" gorm:"type:varchar(255);not null;index"`
	EventType    string                 `json:"event_type" gorm:"type:varchar(100);not null"`
	Payload      map[string]interface{} `json:"payload" gorm:"type:jsonb"`
	Status       DeliveryStatus         `json:"status" gorm:"type:varchar(50);default:'pending'"`
	HTTPStatus   int                    `json:"http_status"`
	Response     string                 `json:"response" gorm:"type:text"`
	AttemptCount int                    `json:"attempt_count" gorm:"default:0"`
	NextRetryAt  *time.Time             `json:"next_retry_at"`
	DeliveredAt  *time.Time             `json:"delivered_at"`
	FailedAt     *time.Time             `json:"failed_at"`
	ErrorMessage string                 `json:"error_message" gorm:"type:text"`
}

// DeliveryStatus represents the status of a webhook delivery
type DeliveryStatus string

const (
	DeliveryStatusPending DeliveryStatus = "pending"
	DeliveryStatusSuccess DeliveryStatus = "success"
	DeliveryStatusFailed  DeliveryStatus = "failed"
)

// RetryPolicy represents webhook retry configuration
type RetryPolicy struct {
	MaxRetries int `json:"max_retries"`
	RetryDelay int `json:"retry_delay"`
}

// StringArray is a custom type for handling string arrays in GORM
type StringArray []string

// Scan implements the Scanner interface for database deserialization
func (sa *StringArray) Scan(value interface{}) error {
	if value == nil {
		*sa = StringArray{}
		return nil
	}

	switch v := value.(type) {
	case []byte:
		return json.Unmarshal(v, sa)
	case string:
		return json.Unmarshal([]byte(v), sa)
	default:
		return errors.New("cannot scan into StringArray")
	}
}

// Value implements the Valuer interface for database serialization
func (sa StringArray) Value() (driver.Value, error) {
	return json.Marshal(sa)
}

// WebhookCreate represents webhook creation request
type WebhookCreate struct {
	URL         string      `json:"url" validate:"required,url"`
	Events      []string    `json:"events" validate:"required,min=1"`
	Description string      `json:"description" validate:"max=500"`
	RetryPolicy RetryPolicy `json:"retry_policy"`
}

// WebhookUpdate represents webhook update request
type WebhookUpdate struct {
	URL         string      `json:"url" validate:"omitempty,url"`
	Events      []string    `json:"events" validate:"omitempty,min=1"`
	IsActive    *bool       `json:"is_active"`
	RetryPolicy RetryPolicy `json:"retry_policy"`
}

// WebhookTest represents webhook test request
type WebhookTest struct {
	EventType string `json:"event_type" validate:"required"`
}

// WebhookPayload represents the payload sent to webhook endpoints
type WebhookPayload struct {
	Event      string                 `json:"event"`
	Data       map[string]interface{} `json:"data"`
	Timestamp  time.Time              `json:"timestamp"`
	WebhookID  string                 `json:"webhook_id"`
	DeliveryID string                 `json:"delivery_id"`
}

// DeliveryQuery represents query parameters for delivery logs
type DeliveryQuery struct {
	WebhookID string         `json:"webhook_id" form:"webhook_id"`
	EventType string         `json:"event_type" form:"event_type"`
	Status    DeliveryStatus `json:"status" form:"status" validate:"omitempty,oneof=pending success failed"`
	Page      int            `json:"page" form:"page" validate:"min=1"`
	Limit     int            `json:"limit" form:"limit" validate:"min=1,max=100"`
}

// Available webhook events
var AvailableEvents = []WebhookEvent{
	{
		EventType:   "order.created",
		Description: "Triggered when a new order is placed",
		PayloadSchema: map[string]interface{}{
			"type": "object",
			"properties": map[string]interface{}{
				"order_id":     map[string]string{"type": "string"},
				"customer_id":  map[string]string{"type": "string"},
				"chef_id":      map[string]string{"type": "string"},
				"total_amount": map[string]string{"type": "number"},
				"status":       map[string]string{"type": "string"},
			},
		},
	},
	{
		EventType:   "order.completed",
		Description: "Triggered when an order is completed",
		PayloadSchema: map[string]interface{}{
			"type": "object",
			"properties": map[string]interface{}{
				"order_id":      map[string]string{"type": "string"},
				"completed_at":  map[string]string{"type": "string", "format": "date-time"},
				"delivery_time": map[string]string{"type": "number"},
			},
		},
	},
	{
		EventType:   "order.cancelled",
		Description: "Triggered when an order is cancelled",
		PayloadSchema: map[string]interface{}{
			"type": "object",
			"properties": map[string]interface{}{
				"order_id":        map[string]string{"type": "string"},
				"cancelled_at":    map[string]string{"type": "string", "format": "date-time"},
				"cancellation_reason": map[string]string{"type": "string"},
			},
		},
	},
	{
		EventType:   "payment.success",
		Description: "Triggered when a payment is successful",
		PayloadSchema: map[string]interface{}{
			"type": "object",
			"properties": map[string]interface{}{
				"payment_id":     map[string]string{"type": "string"},
				"order_id":       map[string]string{"type": "string"},
				"amount":         map[string]string{"type": "number"},
				"payment_method": map[string]string{"type": "string"},
			},
		},
	},
	{
		EventType:   "payment.failed",
		Description: "Triggered when a payment fails",
		PayloadSchema: map[string]interface{}{
			"type": "object",
			"properties": map[string]interface{}{
				"payment_id":    map[string]string{"type": "string"},
				"order_id":      map[string]string{"type": "string"},
				"error_message": map[string]string{"type": "string"},
			},
		},
	},
	{
		EventType:   "tip.received",
		Description: "Triggered when a tip is received",
		PayloadSchema: map[string]interface{}{
			"type": "object",
			"properties": map[string]interface{}{
				"tip_id":      map[string]string{"type": "string"},
				"recipient_id": map[string]string{"type": "string"},
				"amount":      map[string]string{"type": "number"},
				"from_user":   map[string]string{"type": "string"},
			},
		},
	},
	{
		EventType:   "chef.approved",
		Description: "Triggered when a chef is approved",
		PayloadSchema: map[string]interface{}{
			"type": "object",
			"properties": map[string]interface{}{
				"chef_id":     map[string]string{"type": "string"},
				"approved_at": map[string]string{"type": "string", "format": "date-time"},
			},
		},
	},
	{
		EventType:   "delivery.assigned",
		Description: "Triggered when a delivery partner is assigned to an order",
		PayloadSchema: map[string]interface{}{
			"type": "object",
			"properties": map[string]interface{}{
				"order_id":     map[string]string{"type": "string"},
				"delivery_id":  map[string]string{"type": "string"},
				"assigned_at":  map[string]string{"type": "string", "format": "date-time"},
			},
		},
	},
}

// TableName returns the table name for WebhookEndpoint
func (WebhookEndpoint) TableName() string {
	return "webhook_endpoints"
}

// TableName returns the table name for WebhookDelivery
func (WebhookDelivery) TableName() string {
	return "webhook_deliveries"
}