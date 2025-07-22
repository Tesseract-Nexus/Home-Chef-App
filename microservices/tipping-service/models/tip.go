package models

import (
	"time"
)

// TipStatus represents the status of a tip
type TipStatus string

const (
	TipStatusPending   TipStatus = "pending"
	TipStatusCompleted TipStatus = "completed"
	TipStatusFailed    TipStatus = "failed"
)

// RecipientType represents the type of tip recipient
type RecipientType string

const (
	RecipientTypeChef     RecipientType = "chef"
	RecipientTypeDelivery RecipientType = "delivery"
)

// TipTransaction represents a tip transaction
type TipTransaction struct {
	BaseModel
	ID              string        `json:"id" gorm:"type:varchar(255);uniqueIndex"`
	FromUserID      string        `json:"from_user_id" gorm:"type:varchar(255);not null;index"`
	FromUserName    string        `json:"from_user_name" gorm:"type:varchar(255)"`
	ToUserID        string        `json:"to_user_id" gorm:"type:varchar(255);not null;index"`
	ToUserName      string        `json:"to_user_name" gorm:"type:varchar(255)"`
	ToUserType      RecipientType `json:"to_user_type" gorm:"type:varchar(50);not null"`
	Amount          float64       `json:"amount" gorm:"type:decimal(10,2);not null"`
	Message         string        `json:"message" gorm:"type:text"`
	OrderID         string        `json:"order_id" gorm:"type:varchar(255);not null;index"`
	Status          TipStatus     `json:"status" gorm:"type:varchar(50);default:'pending'"`
	TransactionID   string        `json:"transaction_id" gorm:"type:varchar(255);index"`
	PaymentMethodID string        `json:"payment_method_id" gorm:"type:varchar(255)"`
	ProcessedAt     *time.Time    `json:"processed_at"`
	FailureReason   string        `json:"failure_reason,omitempty" gorm:"type:text"`
}

// TipRequest represents a request to send a tip
type TipRequest struct {
	RecipientID     string        `json:"recipient_id" validate:"required"`
	RecipientType   RecipientType `json:"recipient_type" validate:"required,oneof=chef delivery"`
	Amount          float64       `json:"amount" validate:"required,min=10,max=500"`
	Message         string        `json:"message" validate:"max=200"`
	OrderID         string        `json:"order_id" validate:"required"`
	PaymentMethodID string        `json:"payment_method_id"`
}

// TipHistoryQuery represents query parameters for tip history
type TipHistoryQuery struct {
	Type          string        `json:"type" form:"type" validate:"omitempty,oneof=sent received"`
	RecipientType RecipientType `json:"recipient_type" form:"recipient_type" validate:"omitempty,oneof=chef delivery"`
	Page          int           `json:"page" form:"page" validate:"min=1"`
	Limit         int           `json:"limit" form:"limit" validate:"min=1,max=100"`
}

// TipAnalyticsQuery represents query parameters for tip analytics
type TipAnalyticsQuery struct {
	Period string `json:"period" form:"period" validate:"omitempty,oneof=today week month year"`
}

// TipAnalytics represents tip analytics data
type TipAnalytics struct {
	TotalTips   float64       `json:"total_tips"`
	TipCount    int64         `json:"tip_count"`
	AvgTip      float64       `json:"avg_tip"`
	TopTippers  []TopTipper   `json:"top_tippers"`
	PeriodStats []PeriodStats `json:"period_stats,omitempty"`
}

// TopTipper represents a top tipper
type TopTipper struct {
	CustomerName string  `json:"customer_name"`
	TotalTips    float64 `json:"total_tips"`
	TipCount     int64   `json:"tip_count"`
}

// PeriodStats represents statistics for a period
type PeriodStats struct {
	Date      string  `json:"date"`
	TotalTips float64 `json:"total_tips"`
	TipCount  int64   `json:"tip_count"`
}

// TipReceivedQuery represents query parameters for tips received
type TipReceivedQuery struct {
	Period string `json:"period" form:"period" validate:"omitempty,oneof=today week month all"`
	Page   int    `json:"page" form:"page" validate:"min=1"`
	Limit  int    `json:"limit" form:"limit" validate:"min=1,max=100"`
}

// TipSummary represents a summary of tips
type TipSummary struct {
	TotalAmount float64 `json:"total_amount"`
	Count       int64   `json:"count"`
	Period      string  `json:"period"`
}

// NotificationPayload represents notification data
type NotificationPayload struct {
	Type      string      `json:"type"`
	UserID    string      `json:"user_id"`
	Title     string      `json:"title"`
	Message   string      `json:"message"`
	Data      interface{} `json:"data"`
	CreatedAt time.Time   `json:"created_at"`
}

// TableName returns the table name for TipTransaction
func (TipTransaction) TableName() string {
	return "tip_transactions"
}