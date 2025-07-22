package models

import (
	"time"
	"github.com/google/uuid"
)

type Customer struct {
	ID                string                 `json:"id" gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
	UserID            string                 `json:"user_id" gorm:"uniqueIndex;not null"`
	Name              string                 `json:"name"`
	Phone             string                 `json:"phone"`
	Avatar            string                 `json:"avatar"`
	Preferences       CustomerPreferences    `json:"preferences" gorm:"embedded"`
	NotificationSettings NotificationSettings `json:"notification_settings" gorm:"embedded"`
	LoyaltyPoints     int                    `json:"loyalty_points" gorm:"default:0"`
	TotalOrders       int                    `json:"total_orders" gorm:"default:0"`
	TotalSpent        float64                `json:"total_spent" gorm:"default:0"`
	AvgOrderValue     float64                `json:"avg_order_value" gorm:"default:0"`
	LastOrderDate     *time.Time             `json:"last_order_date"`
	CreatedAt         time.Time              `json:"created_at"`
	UpdatedAt         time.Time              `json:"updated_at"`
	
	// Relationships
	Addresses       []CustomerAddress    `json:"addresses,omitempty" gorm:"foreignKey:CustomerID"`
	PaymentMethods  []PaymentMethod      `json:"payment_methods,omitempty" gorm:"foreignKey:CustomerID"`
	FavoriteChefs   []FavoriteChef       `json:"favorite_chefs,omitempty" gorm:"foreignKey:CustomerID"`
	FavoriteDishes  []FavoriteDish       `json:"favorite_dishes,omitempty" gorm:"foreignKey:CustomerID"`
	Reviews         []CustomerReview     `json:"reviews,omitempty" gorm:"foreignKey:CustomerID"`
}

type CustomerPreferences struct {
	Dietary           string `json:"dietary" gorm:"column:dietary;type:text"`           // JSON array as string
	CuisinePreferences string `json:"cuisine_preferences" gorm:"column:cuisine_preferences;type:text"` // JSON array as string
	SpicePreference   string `json:"spice_preference" gorm:"column:spice_preference;default:'medium'"`
}

type NotificationSettings struct {
	EmailOrderUpdates    bool `json:"email_order_updates" gorm:"column:email_order_updates;default:true"`
	EmailPromotions      bool `json:"email_promotions" gorm:"column:email_promotions;default:false"`
	EmailNewsletter      bool `json:"email_newsletter" gorm:"column:email_newsletter;default:true"`
	PushOrderUpdates     bool `json:"push_order_updates" gorm:"column:push_order_updates;default:true"`
	PushPromotions       bool `json:"push_promotions" gorm:"column:push_promotions;default:true"`
	PushChatMessages     bool `json:"push_chat_messages" gorm:"column:push_chat_messages;default:true"`
	SMSOrderUpdates      bool `json:"sms_order_updates" gorm:"column:sms_order_updates;default:true"`
	SMSOTP               bool `json:"sms_otp" gorm:"column:sms_otp;default:true"`
	SMSPromotions        bool `json:"sms_promotions" gorm:"column:sms_promotions;default:false"`
}

type CustomerAddress struct {
	ID                   string      `json:"id" gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
	CustomerID           string      `json:"customer_id" gorm:"not null"`
	Type                 string      `json:"type" gorm:"not null"`
	Label                string      `json:"label"`
	FullAddress          string      `json:"full_address" gorm:"not null"`
	Landmark             string      `json:"landmark"`
	City                 string      `json:"city" gorm:"not null"`
	State                string      `json:"state" gorm:"not null"`
	Pincode              string      `json:"pincode" gorm:"not null"`
	Coordinates          Coordinates `json:"coordinates" gorm:"embedded"`
	IsDefault            bool        `json:"is_default" gorm:"default:false"`
	DeliveryInstructions string      `json:"delivery_instructions"`
	CreatedAt            time.Time   `json:"created_at"`
	UpdatedAt            time.Time   `json:"updated_at"`
}

type Coordinates struct {
	Latitude  float64 `json:"latitude" gorm:"column:latitude"`
	Longitude float64 `json:"longitude" gorm:"column:longitude"`
}

type PaymentMethod struct {
	ID         string    `json:"id" gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
	CustomerID string    `json:"customer_id" gorm:"not null"`
	Type       string    `json:"type" gorm:"not null"`
	CardInfo   string    `json:"card_info" gorm:"type:text"`   // JSON object as string
	UPIInfo    string    `json:"upi_info" gorm:"type:text"`    // JSON object as string
	IsDefault  bool      `json:"is_default" gorm:"default:false"`
	CreatedAt  time.Time `json:"created_at"`
	UpdatedAt  time.Time `json:"updated_at"`
}

type FavoriteChef struct {
	ID         string    `json:"id" gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
	CustomerID string    `json:"customer_id" gorm:"not null"`
	ChefID     string    `json:"chef_id" gorm:"not null"`
	CreatedAt  time.Time `json:"created_at"`
}

type FavoriteDish struct {
	ID         string    `json:"id" gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
	CustomerID string    `json:"customer_id" gorm:"not null"`
	DishID     string    `json:"dish_id" gorm:"not null"`
	CreatedAt  time.Time `json:"created_at"`
}

type CustomerReview struct {
	ID         string    `json:"id" gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
	CustomerID string    `json:"customer_id" gorm:"not null"`
	ChefID     string    `json:"chef_id" gorm:"not null"`
	OrderID    string    `json:"order_id" gorm:"not null"`
	DishID     string    `json:"dish_id"`
	Rating     int       `json:"rating" gorm:"not null"`
	ReviewText string    `json:"review_text"`
	Images     string    `json:"images" gorm:"type:text"` // JSON array as string
	CreatedAt  time.Time `json:"created_at"`
	UpdatedAt  time.Time `json:"updated_at"`
}

// Request/Response models
type CustomerProfileUpdate struct {
	Name        *string                      `json:"name"`
	Phone       *string                      `json:"phone"`
	Avatar      *string                      `json:"avatar"`
	Preferences *CustomerPreferencesUpdate   `json:"preferences"`
}

type CustomerPreferencesUpdate struct {
	Dietary            []string `json:"dietary"`
	CuisinePreferences []string `json:"cuisine_preferences"`
	SpicePreference    string   `json:"spice_preference" validate:"omitempty,oneof=mild medium hot"`
}

type AddressCreate struct {
	Type                 string       `json:"type" validate:"required,oneof=home work other"`
	Label                string       `json:"label"`
	FullAddress          string       `json:"full_address" validate:"required"`
	Landmark             string       `json:"landmark"`
	City                 string       `json:"city" validate:"required"`
	State                string       `json:"state" validate:"required"`
	Pincode              string       `json:"pincode" validate:"required,regex=^[1-9][0-9]{5}$"`
	Coordinates          *Coordinates `json:"coordinates"`
	IsDefault            bool         `json:"is_default"`
	DeliveryInstructions string       `json:"delivery_instructions"`
}

type AddressUpdate struct {
	Label                *string `json:"label"`
	FullAddress          *string `json:"full_address"`
	Landmark             *string `json:"landmark"`
	DeliveryInstructions *string `json:"delivery_instructions"`
}

type PaymentMethodCreate struct {
	Type string                 `json:"type" validate:"required,oneof=card upi wallet netbanking"`
	Card *PaymentMethodCardInfo `json:"card"`
	UPI  *PaymentMethodUPIInfo  `json:"upi"`
}

type PaymentMethodCardInfo struct {
	Number   string `json:"number" validate:"required"`
	ExpMonth int    `json:"exp_month" validate:"required,min=1,max=12"`
	ExpYear  int    `json:"exp_year" validate:"required"`
	CVC      string `json:"cvc" validate:"required"`
	Name     string `json:"name" validate:"required"`
}

type PaymentMethodUPIInfo struct {
	VPA string `json:"vpa" validate:"required"`
}

type ReviewCreate struct {
	ChefID     string   `json:"chef_id" validate:"required"`
	OrderID    string   `json:"order_id" validate:"required"`
	DishID     *string  `json:"dish_id"`
	Rating     int      `json:"rating" validate:"required,min=1,max=5"`
	ReviewText string   `json:"review_text" validate:"required,max=1000"`
	Images     []string `json:"images"`
}

type ReviewUpdate struct {
	Rating     *int    `json:"rating" validate:"omitempty,min=1,max=5"`
	ReviewText *string `json:"review_text" validate:"omitempty,max=1000"`
}

type NotificationSettingsUpdate struct {
	EmailNotifications *EmailNotificationSettings `json:"email_notifications"`
	PushNotifications  *PushNotificationSettings  `json:"push_notifications"`
	SMSNotifications   *SMSNotificationSettings   `json:"sms_notifications"`
}

type EmailNotificationSettings struct {
	OrderUpdates *bool `json:"order_updates"`
	Promotions   *bool `json:"promotions"`
	Newsletter   *bool `json:"newsletter"`
}

type PushNotificationSettings struct {
	OrderUpdates *bool `json:"order_updates"`
	Promotions   *bool `json:"promotions"`
	ChatMessages *bool `json:"chat_messages"`
}

type SMSNotificationSettings struct {
	OrderUpdates *bool `json:"order_updates"`
	OTP          *bool `json:"otp"`
	Promotions   *bool `json:"promotions"`
}

type CustomerActivity struct {
	TotalOrders      int       `json:"total_orders"`
	TotalSpent       float64   `json:"total_spent"`
	FavoriteCuisines []string  `json:"favorite_cuisines"`
	AvgOrderValue    float64   `json:"avg_order_value"`
	LastOrderDate    time.Time `json:"last_order_date"`
	LoyaltyPoints    int       `json:"loyalty_points"`
	ReviewsGiven     int       `json:"reviews_given"`
	AvgRatingGiven   float64   `json:"avg_rating_given"`
}

type Recommendation struct {
	Type        string      `json:"type"`
	ID          string      `json:"id"`
	Name        string      `json:"name"`
	Description string      `json:"description"`
	ImageURL    string      `json:"image_url"`
	Rating      float64     `json:"rating"`
	Price       float64     `json:"price,omitempty"`
	Reason      string      `json:"reason"`
}

// Order management models
type OrderCreate struct {
	ChefID              string      `json:"chef_id" validate:"required"`
	Items               []OrderItem `json:"items" validate:"required,min=1"`
	DeliveryAddressID   string      `json:"delivery_address_id" validate:"required"`
	DeliveryInstructions string     `json:"delivery_instructions"`
	PromoCode           string      `json:"promo_code"`
}

type OrderItem struct {
	DishID               string `json:"dish_id" validate:"required"`
	Quantity             int    `json:"quantity" validate:"required,min=1"`
	SpecialInstructions  string `json:"special_instructions"`
}

type CountdownTimer struct {
	FreeCancellationWindow int     `json:"free_cancellation_window"`
	TimeRemaining         int     `json:"time_remaining"`
	CanCancelFree         bool    `json:"can_cancel_free"`
	PenaltyAfterExpiry    float64 `json:"penalty_after_expiry"`
}

type CountdownStatus struct {
	OrderID            string  `json:"order_id"`
	IsActive           bool    `json:"is_active"`
	TimeRemaining      int     `json:"time_remaining"`
	ProgressPercentage float64 `json:"progress_percentage"`
	CanCancelFree      bool    `json:"can_cancel_free"`
	PenaltyAmount      float64 `json:"penalty_amount"`
}

type CancellationResult struct {
	OrderID         string  `json:"order_id"`
	CancellationType string  `json:"cancellation_type"`
	PenaltyAmount   float64 `json:"penalty_amount"`
	RefundAmount    float64 `json:"refund_amount"`
	RefundTimeline  string  `json:"refund_timeline"`
}

// Tipping system models
type TipCreate struct {
	RecipientType string  `json:"recipient_type" validate:"required,oneof=chef delivery"`
	Amount        float64 `json:"amount" validate:"required,min=10,max=500"`
	Message       string  `json:"message" validate:"max=200"`
}

// Rewards system models
type RewardsProfile struct {
	TotalTokens      int    `json:"total_tokens"`
	LifetimeEarned   int    `json:"lifetime_earned"`
	LifetimeRedeemed int    `json:"lifetime_redeemed"`
	CurrentStreak    int    `json:"current_streak"`
	Tier             string `json:"tier"`
}

type RewardRedeem struct {
	Tokens     int    `json:"tokens" validate:"required,min=50,max=1000"`
	RewardType string `json:"reward_type" validate:"required,oneof=discount cashback free_delivery"`
	OrderID    string `json:"order_id"`
}

// BeforeCreate hooks
func (c *Customer) BeforeCreate(tx *gorm.DB) error {
	if c.ID == "" {
		c.ID = uuid.New().String()
	}
	return nil
}

func (ca *CustomerAddress) BeforeCreate(tx *gorm.DB) error {
	if ca.ID == "" {
		ca.ID = uuid.New().String()
	}
	return nil
}

func (pm *PaymentMethod) BeforeCreate(tx *gorm.DB) error {
	if pm.ID == "" {
		pm.ID = uuid.New().String()
	}
	return nil
}

func (fc *FavoriteChef) BeforeCreate(tx *gorm.DB) error {
	if fc.ID == "" {
		fc.ID = uuid.New().String()
	}
	return nil
}

func (fd *FavoriteDish) BeforeCreate(tx *gorm.DB) error {
	if fd.ID == "" {
		fd.ID = uuid.New().String()
	}
	return nil
}

func (cr *CustomerReview) BeforeCreate(tx *gorm.DB) error {
	if cr.ID == "" {
		cr.ID = uuid.New().String()
	}
	return nil
}