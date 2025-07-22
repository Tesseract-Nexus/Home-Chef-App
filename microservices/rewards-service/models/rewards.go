package models

import (
	"time"
	"github.com/google/uuid"
)

type RewardToken struct {
	ID          string    `json:"id" gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
	UserID      string    `json:"user_id" gorm:"not null;index"`
	Amount      int       `json:"amount" gorm:"not null"`
	Type        string    `json:"type" gorm:"not null"` // earned, redeemed, bonus, expired
	Source      string    `json:"source" gorm:"not null"` // order, referral, bonus, subscription
	OrderID     *string   `json:"order_id" gorm:"index"`
	Description string    `json:"description"`
	ExpiresAt   *time.Time `json:"expires_at"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

type RewardRedemption struct {
	ID          string    `json:"id" gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
	UserID      string    `json:"user_id" gorm:"not null;index"`
	Tokens      int       `json:"tokens" gorm:"not null"`
	RewardType  string    `json:"reward_type" gorm:"not null"` // discount, cashback, free_delivery
	OrderID     *string   `json:"order_id"`
	Value       float64   `json:"value" gorm:"not null"`
	Status      string    `json:"status" gorm:"default:'active'"`
	ExpiresAt   *time.Time `json:"expires_at"`
	UsedAt      *time.Time `json:"used_at"`
	CreatedAt   time.Time `json:"created_at"`
}

type UserRewardsProfile struct {
	ID                string    `json:"id" gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
	UserID            string    `json:"user_id" gorm:"uniqueIndex;not null"`
	TotalTokens       int       `json:"total_tokens" gorm:"default:0"`
	LifetimeEarned    int       `json:"lifetime_earned" gorm:"default:0"`
	LifetimeRedeemed  int       `json:"lifetime_redeemed" gorm:"default:0"`
	CurrentStreak     int       `json:"current_streak" gorm:"default:0"`
	Tier              string    `json:"tier" gorm:"default:'bronze'"`
	TierProgress      int       `json:"tier_progress" gorm:"default:0"`
	LastOrderDate     *time.Time `json:"last_order_date"`
	CreatedAt         time.Time `json:"created_at"`
	UpdatedAt         time.Time `json:"updated_at"`
}

type SubscriptionPlan struct {
	ID               string    `json:"id" gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
	Name             string    `json:"name" gorm:"not null"`
	Description      string    `json:"description"`
	Price            float64   `json:"price" gorm:"not null"`
	Duration         string    `json:"duration" gorm:"not null"` // monthly, yearly
	Benefits         string    `json:"benefits" gorm:"type:text"` // JSON array as string
	TokenMultiplier  float64   `json:"token_multiplier" gorm:"default:1.0"`
	FreeDelivery     bool      `json:"free_delivery" gorm:"default:false"`
	PrioritySupport  bool      `json:"priority_support" gorm:"default:false"`
	IsActive         bool      `json:"is_active" gorm:"default:true"`
	CreatedAt        time.Time `json:"created_at"`
	UpdatedAt        time.Time `json:"updated_at"`
}

type UserSubscription struct {
	ID                string     `json:"id" gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
	UserID            string     `json:"user_id" gorm:"not null;index"`
	PlanID            string     `json:"plan_id" gorm:"not null"`
	Status            string     `json:"status" gorm:"default:'active'"` // active, cancelled, expired, paused
	StartDate         time.Time  `json:"start_date"`
	EndDate           time.Time  `json:"end_date"`
	AutoRenew         bool       `json:"auto_renew" gorm:"default:true"`
	PaymentMethodID   string     `json:"payment_method_id"`
	CancelReason      string     `json:"cancel_reason"`
	CancelledAt       *time.Time `json:"cancelled_at"`
	CancelAtPeriodEnd bool       `json:"cancel_at_period_end" gorm:"default:false"`
	CreatedAt         time.Time  `json:"created_at"`
	UpdatedAt         time.Time  `json:"updated_at"`
	
	// Relationships
	Plan SubscriptionPlan `json:"plan" gorm:"foreignKey:PlanID"`
}

type SubscriptionPayment struct {
	ID             string    `json:"id" gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
	SubscriptionID string    `json:"subscription_id" gorm:"not null"`
	Amount         float64   `json:"amount" gorm:"not null"`
	Status         string    `json:"status" gorm:"default:'pending'"`
	PaymentDate    time.Time `json:"payment_date"`
	PeriodStart    time.Time `json:"period_start"`
	PeriodEnd      time.Time `json:"period_end"`
	TransactionID  string    `json:"transaction_id"`
	CreatedAt      time.Time `json:"created_at"`
	
	// Relationships
	Subscription UserSubscription `json:"subscription" gorm:"foreignKey:SubscriptionID"`
}

// Request/Response models
type RewardsEarnRequest struct {
	OrderID         string  `json:"order_id" validate:"required"`
	Amount          float64 `json:"amount" validate:"required,gt=0"`
	BonusMultiplier float64 `json:"bonus_multiplier" validate:"omitempty,gt=0"`
}

type RewardsRedeemRequest struct {
	Tokens     int     `json:"tokens" validate:"required,min=10,max=10000"`
	RewardType string  `json:"reward_type" validate:"required,oneof=discount cashback free_delivery"`
	OrderID    *string `json:"order_id"`
}

type SubscriptionCreateRequest struct {
	PlanID          string `json:"plan_id" validate:"required"`
	PaymentMethodID string `json:"payment_method_id" validate:"required"`
}

type SubscriptionUpdateRequest struct {
	PlanID    *string `json:"plan_id"`
	AutoRenew *bool   `json:"auto_renew"`
}

type SubscriptionCancelRequest struct {
	Reason              string `json:"reason" validate:"max=500"`
	CancelAtPeriodEnd   bool   `json:"cancel_at_period_end"`
}

type RewardsProfileResponse struct {
	TotalTokens      int    `json:"total_tokens"`
	LifetimeEarned   int    `json:"lifetime_earned"`
	LifetimeRedeemed int    `json:"lifetime_redeemed"`
	CurrentStreak    int    `json:"current_streak"`
	Tier             string `json:"tier"`
	NextTierTokens   int    `json:"next_tier_tokens"`
	TierProgress     int    `json:"tier_progress"`
}

type RewardTransaction struct {
	ID          string    `json:"id"`
	Type        string    `json:"type"`
	Amount      int       `json:"amount"`
	Source      string    `json:"source"`
	Description string    `json:"description"`
	OrderID     *string   `json:"order_id"`
	CreatedAt   time.Time `json:"created_at"`
}

type SubscriptionPlanResponse struct {
	ID              string   `json:"id"`
	Name            string   `json:"name"`
	Description     string   `json:"description"`
	Price           float64  `json:"price"`
	Duration        string   `json:"duration"`
	Benefits        []string `json:"benefits"`
	TokenMultiplier float64  `json:"token_multiplier"`
	FreeDelivery    bool     `json:"free_delivery"`
	PrioritySupport bool     `json:"priority_support"`
}

type UserSubscriptionResponse struct {
	ID                string                   `json:"id"`
	Plan              SubscriptionPlanResponse `json:"plan"`
	Status            string                   `json:"status"`
	StartDate         time.Time                `json:"start_date"`
	EndDate           time.Time                `json:"end_date"`
	AutoRenew         bool                     `json:"auto_renew"`
	CancelAtPeriodEnd bool                     `json:"cancel_at_period_end"`
	DaysRemaining     int                      `json:"days_remaining"`
}

// Tier thresholds
var TierThresholds = map[string]int{
	"bronze":   0,
	"silver":   500,
	"gold":     1500,
	"platinum": 5000,
}

// BeforeCreate hooks
func (rt *RewardToken) BeforeCreate(tx *gorm.DB) error {
	if rt.ID == "" {
		rt.ID = uuid.New().String()
	}
	return nil
}

func (rr *RewardRedemption) BeforeCreate(tx *gorm.DB) error {
	if rr.ID == "" {
		rr.ID = uuid.New().String()
	}
	return nil
}

func (urp *UserRewardsProfile) BeforeCreate(tx *gorm.DB) error {
	if urp.ID == "" {
		urp.ID = uuid.New().String()
	}
	return nil
}

func (sp *SubscriptionPlan) BeforeCreate(tx *gorm.DB) error {
	if sp.ID == "" {
		sp.ID = uuid.New().String()
	}
	return nil
}

func (us *UserSubscription) BeforeCreate(tx *gorm.DB) error {
	if us.ID == "" {
		us.ID = uuid.New().String()
	}
	return nil
}

func (sp *SubscriptionPayment) BeforeCreate(tx *gorm.DB) error {
	if sp.ID == "" {
		sp.ID = uuid.New().String()
	}
	return nil
}