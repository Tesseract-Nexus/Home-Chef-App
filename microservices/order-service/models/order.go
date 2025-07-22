package models

import (
	"time"
	"github.com/google/uuid"
)

type Order struct {
	ID                    string      `json:"id" gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
	CustomerID            string      `json:"customer_id" gorm:"not null;index"`
	ChefID                string      `json:"chef_id" gorm:"not null;index"`
	DeliveryPartnerID     *string     `json:"delivery_partner_id" gorm:"index"`
	Status                string      `json:"status" gorm:"default:'payment_confirmed'"`
	TotalAmount           float64     `json:"total_amount" gorm:"not null"`
	DeliveryFee           float64     `json:"delivery_fee" gorm:"default:0"`
	TaxAmount             float64     `json:"tax_amount" gorm:"default:0"`
	TipAmount             float64     `json:"tip_amount" gorm:"default:0"`
	DeliveryAddress       string      `json:"delivery_address" gorm:"type:text"`
	EstimatedDelivery     *time.Time  `json:"estimated_delivery"`
	ActualDelivery        *time.Time  `json:"actual_delivery"`
	SpecialInstructions   string      `json:"special_instructions"`
	PaymentMethod         string      `json:"payment_method"`
	PaymentStatus         string      `json:"payment_status" gorm:"default:'completed'"`
	CountdownExpiry       *time.Time  `json:"countdown_expiry"`
	CanCancelFree         bool        `json:"can_cancel_free" gorm:"default:true"`
	CancellationReason    string      `json:"cancellation_reason"`
	CancellationNotes     string      `json:"cancellation_notes"`
	CancelledAt           *time.Time  `json:"cancelled_at"`
	CancelledBy           string      `json:"cancelled_by"`
	PenaltyAmount         float64     `json:"penalty_amount" gorm:"default:0"`
	RefundAmount          float64     `json:"refund_amount" gorm:"default:0"`
	RefundStatus          string      `json:"refund_status" gorm:"default:'pending'"`
	ChefAcceptedAt        *time.Time  `json:"chef_accepted_at"`
	ChefDeclinedAt        *time.Time  `json:"chef_declined_at"`
	ChefDeclineReason     string      `json:"chef_decline_reason"`
	EstimatedPrepTime     int         `json:"estimated_prep_time" gorm:"default:0"`
	EstimatedDeliveryTime *time.Time  `json:"estimated_delivery_time"`
	DeliveryAcceptedAt    *time.Time  `json:"delivery_accepted_at"`
	PickupTime            *time.Time  `json:"pickup_time"`
	DeliveryStartedAt     *time.Time  `json:"delivery_started_at"`
	CreatedAt             time.Time   `json:"created_at"`
	UpdatedAt             time.Time   `json:"updated_at"`
	
	// Relationships
	OrderItems            []OrderItem `json:"order_items,omitempty" gorm:"foreignKey:OrderID"`
	Tips                  []Tip       `json:"tips,omitempty" gorm:"foreignKey:OrderID"`
	StatusHistory         []OrderStatusHistory `json:"status_history,omitempty" gorm:"foreignKey:OrderID"`
	Notifications         []OrderNotification  `json:"notifications,omitempty" gorm:"foreignKey:OrderID"`
}

type OrderItem struct {
	ID                  string  `json:"id" gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
	OrderID             string  `json:"order_id" gorm:"not null"`
	DishID              string  `json:"dish_id" gorm:"not null"`
	DishName            string  `json:"dish_name" gorm:"not null"`
	Quantity            int     `json:"quantity" gorm:"not null"`
	Price               float64 `json:"price" gorm:"not null"`
	SpecialInstructions string  `json:"special_instructions"`
	CreatedAt           time.Time `json:"created_at"`
	
	// Relationships
	Order Order `json:"order" gorm:"foreignKey:OrderID"`
}

type Tip struct {
	ID            string    `json:"id" gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
	OrderID       string    `json:"order_id" gorm:"not null"`
	CustomerID    string    `json:"customer_id" gorm:"not null"`
	RecipientID   string    `json:"recipient_id" gorm:"not null"`
	RecipientType string    `json:"recipient_type" gorm:"not null"`
	Amount        float64   `json:"amount" gorm:"not null"`
	Message       string    `json:"message"`
	Status        string    `json:"status" gorm:"default:'pending'"`
	TransferID    string    `json:"transfer_id"`
	ProcessedAt   *time.Time `json:"processed_at"`
	CreatedAt     time.Time `json:"created_at"`
	
	// Relationships
	Order Order `json:"order" gorm:"foreignKey:OrderID"`
}

type OrderStatusHistory struct {
	ID        string    `json:"id" gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
	OrderID   string    `json:"order_id" gorm:"not null"`
	Status    string    `json:"status" gorm:"not null"`
	Message   string    `json:"message"`
	Location  string    `json:"location" gorm:"type:text"` // JSON object as string
	UpdatedBy string    `json:"updated_by"`
	CreatedAt time.Time `json:"created_at"`
	
	// Relationships
	Order Order `json:"order" gorm:"foreignKey:OrderID"`
}

type OrderNotification struct {
	ID               string    `json:"id" gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
	OrderID          string    `json:"order_id" gorm:"not null"`
	NotificationType string    `json:"notification_type" gorm:"not null"`
	RecipientID      string    `json:"recipient_id" gorm:"not null"`
	RecipientType    string    `json:"recipient_type" gorm:"not null"`
	Message          string    `json:"message"`
	Data             string    `json:"data" gorm:"type:text"` // JSON object as string
	Status           string    `json:"status" gorm:"default:'sent'"`
	SentAt           time.Time `json:"sent_at"`
	
	// Relationships
	Order Order `json:"order" gorm:"foreignKey:OrderID"`
}

type CancellationPolicy struct {
	ID                              string    `json:"id" gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
	FreeCancellationWindowSeconds   int       `json:"free_cancellation_window_seconds" gorm:"default:30"`
	PenaltyRate                     float64   `json:"penalty_rate" gorm:"default:0.40"`
	MinPenaltyAmount                float64   `json:"min_penalty_amount" gorm:"default:20.00"`
	MaxPenaltyAmount                float64   `json:"max_penalty_amount" gorm:"default:500.00"`
	PolicyDescription               string    `json:"policy_description"`
	IsActive                        bool      `json:"is_active" gorm:"default:true"`
	CreatedAt                       time.Time `json:"created_at"`
	UpdatedAt                       time.Time `json:"updated_at"`
	UpdatedBy                       string    `json:"updated_by"`
}

type CancellationAnalytics struct {
	ID                    string    `json:"id" gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
	Date                  time.Time `json:"date" gorm:"not null;index"`
	TotalOrders           int       `json:"total_orders" gorm:"default:0"`
	TotalCancellations    int       `json:"total_cancellations" gorm:"default:0"`
	FreeCancellations     int       `json:"free_cancellations" gorm:"default:0"`
	PenaltyCancellations  int       `json:"penalty_cancellations" gorm:"default:0"`
	TotalPenaltyCollected float64   `json:"total_penalty_collected" gorm:"default:0"`
	AvgCancellationTime   float64   `json:"avg_cancellation_time" gorm:"default:0"`
	CreatedAt             time.Time `json:"created_at"`
	UpdatedAt             time.Time `json:"updated_at"`
}

// Request/Response models
type OrderCreate struct {
	ChefID               string      `json:"chef_id" validate:"required"`
	Items                []OrderItemCreate `json:"items" validate:"required,min=1"`
	DeliveryAddressID    string      `json:"delivery_address_id" validate:"required"`
	DeliveryInstructions string      `json:"delivery_instructions"`
	PromoCode            string      `json:"promo_code"`
}

type OrderItemCreate struct {
	DishID               string `json:"dish_id" validate:"required"`
	Quantity             int    `json:"quantity" validate:"required,min=1"`
	SpecialInstructions  string `json:"special_instructions"`
}

type CancellationRequest struct {
	Reason string `json:"reason" validate:"required,oneof=customer_request chef_unavailable payment_failed system_error"`
	Notes  string `json:"notes" validate:"max=500"`
}

type CancellationResult struct {
	OrderID           string    `json:"order_id"`
	CancellationType  string    `json:"cancellation_type"`
	PenaltyAmount     float64   `json:"penalty_amount"`
	RefundAmount      float64   `json:"refund_amount"`
	RefundTimeline    string    `json:"refund_timeline"`
	CancelledAt       time.Time `json:"cancelled_at"`
}

type CancellationInfo struct {
	OrderID                 string                 `json:"order_id"`
	CanCancel               bool                   `json:"can_cancel"`
	IsFreeCancellation      bool                   `json:"is_free_cancellation"`
	TimeSincePlaced         int                    `json:"time_since_placed"`
	FreeCancellationWindow  int                    `json:"free_cancellation_window"`
	PenaltyInfo             CancellationPenaltyInfo `json:"penalty_info"`
}

type CancellationPenaltyInfo struct {
	PenaltyRate    float64 `json:"penalty_rate"`
	PenaltyAmount  float64 `json:"penalty_amount"`
	RefundAmount   float64 `json:"refund_amount"`
	MinPenalty     float64 `json:"min_penalty"`
	MaxPenalty     float64 `json:"max_penalty"`
}

type CountdownStatus struct {
	OrderID            string  `json:"order_id"`
	IsActive           bool    `json:"is_active"`
	TimeRemaining      int     `json:"time_remaining"`
	TotalWindow        int     `json:"total_window"`
	ProgressPercentage float64 `json:"progress_percentage"`
	CanCancelFree      bool    `json:"can_cancel_free"`
	PenaltyAfterExpiry float64 `json:"penalty_after_expiry"`
}

type CountdownTimer struct {
	FreeCancellationWindow int     `json:"free_cancellation_window"`
	TimeRemaining         int     `json:"time_remaining"`
	CanCancelFree         bool    `json:"can_cancel_free"`
	PenaltyAfterExpiry    float64 `json:"penalty_after_expiry"`
}

type CancellationPolicyUpdate struct {
	FreeCancellationWindowSeconds *int     `json:"free_cancellation_window_seconds" validate:"omitempty,min=0,max=300"`
	PenaltyRate                   *float64 `json:"penalty_rate" validate:"omitempty,min=0,max=1"`
	MinPenaltyAmount              *float64 `json:"min_penalty_amount" validate:"omitempty,min=0"`
	MaxPenaltyAmount              *float64 `json:"max_penalty_amount" validate:"omitempty,min=0"`
	PolicyDescription             *string  `json:"policy_description" validate:"omitempty,max=500"`
}

type TipCreate struct {
	RecipientType string  `json:"recipient_type" validate:"required,oneof=chef delivery"`
	Amount        float64 `json:"amount" validate:"required,min=10,max=500"`
	Message       string  `json:"message" validate:"max=200"`
}

// Order Journey models
type OrderJourney struct {
	OrderID          string                 `json:"order_id"`
	CurrentStatus    string                 `json:"current_status"`
	Timeline         []OrderTimelineEvent   `json:"timeline"`
	Participants     OrderParticipants      `json:"participants"`
	CancellationInfo *CancellationInfo      `json:"cancellation_info"`
	TippingInfo      OrderTippingInfo       `json:"tipping_info"`
}

type OrderTimelineEvent struct {
	Status        string     `json:"status"`
	Timestamp     time.Time  `json:"timestamp"`
	Message       string     `json:"message"`
	EstimatedTime *time.Time `json:"estimated_time"`
	Location      *Location  `json:"location"`
}

type OrderParticipants struct {
	Customer        *OrderParticipant `json:"customer"`
	Chef            *OrderParticipant `json:"chef"`
	DeliveryPartner *OrderParticipant `json:"delivery_partner"`
}

type OrderParticipant struct {
	ID     string  `json:"id"`
	Name   string  `json:"name"`
	Phone  string  `json:"phone"`
	Rating float64 `json:"rating"`
	Image  string  `json:"image"`
}

type OrderTippingInfo struct {
	ChefTip         float64 `json:"chef_tip"`
	DeliveryTip     float64 `json:"delivery_tip"`
	CanTipChef      bool    `json:"can_tip_chef"`
	CanTipDelivery  bool    `json:"can_tip_delivery"`
}

type Location struct {
	Latitude  float64 `json:"latitude"`
	Longitude float64 `json:"longitude"`
}

// Chef operation models
type ChefAcceptRequest struct {
	EstimatedPrepTime int    `json:"estimated_preparation_time" validate:"required,min=5,max=120"`
	Notes             string `json:"notes" validate:"max=200"`
}

type ChefDeclineRequest struct {
	Reason string `json:"reason" validate:"required,oneof=unavailable out_of_ingredients too_busy technical_issue"`
	Notes  string `json:"notes" validate:"max=200"`
}

// Order status update models
type OrderStatusUpdate struct {
	Status        string    `json:"status" validate:"required,oneof=preparing ready_for_pickup picked_up out_for_delivery delivered"`
	Message       string    `json:"message" validate:"max=200"`
	EstimatedTime string    `json:"estimated_time"`
	Location      *Location `json:"location"`
}

// Delivery operation models
type DeliveryAcceptRequest struct {
	EstimatedPickupTime *time.Time `json:"estimated_pickup_time"`
	CurrentLocation     *Location  `json:"current_location"`
}

type AvailableDeliveryOrder struct {
	OrderID               string    `json:"order_id"`
	CustomerName          string    `json:"customer_name"`
	ChefName              string    `json:"chef_name"`
	PickupLocation        OrderLocation `json:"pickup_location"`
	DeliveryLocation      OrderLocation `json:"delivery_location"`
	Distance              float64   `json:"distance"`
	EstimatedEarnings     float64   `json:"estimated_earnings"`
	OrderValue            float64   `json:"order_value"`
	EstimatedDeliveryTime int       `json:"estimated_delivery_time"`
	Priority              string    `json:"priority"`
}

type OrderLocation struct {
	Address     string    `json:"address"`
	Coordinates Location  `json:"coordinates"`
}

// Notification models
type OrderNotificationRequest struct {
	NotificationType string                      `json:"notification_type" validate:"required,oneof=status_update chef_assigned delivery_assigned eta_update tip_received"`
	Recipients       []NotificationRecipient     `json:"recipients" validate:"required,min=1"`
	Message          string                      `json:"message"`
	Data             map[string]interface{}      `json:"data"`
}

type NotificationRecipient struct {
	UserID   string `json:"user_id" validate:"required"`
	UserType string `json:"user_type" validate:"required,oneof=customer chef delivery"`
}

// BeforeCreate hooks
func (o *Order) BeforeCreate(tx *gorm.DB) error {
	if o.ID == "" {
		o.ID = uuid.New().String()
	}
	return nil
}

func (oi *OrderItem) BeforeCreate(tx *gorm.DB) error {
	if oi.ID == "" {
		oi.ID = uuid.New().String()
	}
	return nil
}

func (t *Tip) BeforeCreate(tx *gorm.DB) error {
	if t.ID == "" {
		t.ID = uuid.New().String()
	}
	return nil
}

func (osh *OrderStatusHistory) BeforeCreate(tx *gorm.DB) error {
	if osh.ID == "" {
		osh.ID = uuid.New().String()
	}
	return nil
}

func (on *OrderNotification) BeforeCreate(tx *gorm.DB) error {
	if on.ID == "" {
		on.ID = uuid.New().String()
	}
	return nil
}

func (cp *CancellationPolicy) BeforeCreate(tx *gorm.DB) error {
	if cp.ID == "" {
		cp.ID = uuid.New().String()
	}
	return nil
}

func (ca *CancellationAnalytics) BeforeCreate(tx *gorm.DB) error {
	if ca.ID == "" {
		ca.ID = uuid.New().String()
	}
	return nil
}