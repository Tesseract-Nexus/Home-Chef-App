package models

import (
	"time"
	"github.com/google/uuid"
)

// ChefFinancials represents chef financial records
type ChefFinancials struct {
	ID                string    `json:"id" gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
	ChefID            string    `json:"chef_id" gorm:"not null;index"`
	Date              time.Time `json:"date" gorm:"not null;index"`
	Revenue           float64   `json:"revenue" gorm:"default:0"`
	Expenses          float64   `json:"expenses" gorm:"default:0"`
	PlatformFee       float64   `json:"platform_fee" gorm:"default:0"`
	NetEarnings       float64   `json:"net_earnings" gorm:"default:0"`
	OrderCount        int       `json:"order_count" gorm:"default:0"`
	TipsReceived      float64   `json:"tips_received" gorm:"default:0"`
	BonusEarnings     float64   `json:"bonus_earnings" gorm:"default:0"`
	Deductions        float64   `json:"deductions" gorm:"default:0"`
	PayoutAmount      float64   `json:"payout_amount" gorm:"default:0"`
	PayoutStatus      string    `json:"payout_status" gorm:"default:'pending'"`
	PayoutDate        *time.Time `json:"payout_date"`
	CreatedAt         time.Time `json:"created_at"`
	UpdatedAt         time.Time `json:"updated_at"`
}

// ChefExpense represents individual chef expenses
type ChefExpense struct {
	ID          string    `json:"id" gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
	ChefID      string    `json:"chef_id" gorm:"not null;index"`
	Category    string    `json:"category" gorm:"not null"`
	Description string    `json:"description"`
	Amount      float64   `json:"amount" gorm:"not null"`
	Date        time.Time `json:"date" gorm:"not null"`
	Receipt     string    `json:"receipt"` // Base64 encoded or URL
	Status      string    `json:"status" gorm:"default:'pending'"`
	ApprovedBy  string    `json:"approved_by"`
	ApprovedAt  *time.Time `json:"approved_at"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

// ChefPayout represents payout records
type ChefPayout struct {
	ID              string    `json:"id" gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
	ChefID          string    `json:"chef_id" gorm:"not null;index"`
	Amount          float64   `json:"amount" gorm:"not null"`
	PeriodStart     time.Time `json:"period_start"`
	PeriodEnd       time.Time `json:"period_end"`
	Status          string    `json:"status" gorm:"default:'pending'"`
	PaymentMethod   string    `json:"payment_method"`
	TransactionID   string    `json:"transaction_id"`
	ProcessedAt     *time.Time `json:"processed_at"`
	FailureReason   string    `json:"failure_reason"`
	CreatedAt       time.Time `json:"created_at"`
	UpdatedAt       time.Time `json:"updated_at"`
}

// ProfitLossReport represents P&L calculations
type ProfitLossReport struct {
	ID              string    `json:"id" gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
	ChefID          string    `json:"chef_id" gorm:"not null;index"`
	Period          string    `json:"period" gorm:"not null"` // daily, weekly, monthly, etc.
	StartDate       time.Time `json:"start_date"`
	EndDate         time.Time `json:"end_date"`
	TotalRevenue    float64   `json:"total_revenue"`
	TotalExpenses   float64   `json:"total_expenses"`
	GrossProfit     float64   `json:"gross_profit"`
	NetProfit       float64   `json:"net_profit"`
	ProfitMargin    float64   `json:"profit_margin"`
	ExpenseBreakdown string   `json:"expense_breakdown" gorm:"type:text"` // JSON
	RevenueBreakdown string   `json:"revenue_breakdown" gorm:"type:text"` // JSON
	CreatedAt       time.Time `json:"created_at"`
}

// ExpenseCreate represents expense creation request
type ExpenseCreate struct {
	Category    string  `json:"category" validate:"required"`
	Description string  `json:"description"`
	Amount      float64 `json:"amount" validate:"required,gt=0"`
	Date        string  `json:"date" validate:"required"`
	Receipt     string  `json:"receipt"`
}

// ExpenseUpdate represents expense update request
type ExpenseUpdate struct {
	Category    *string  `json:"category"`
	Description *string  `json:"description"`
	Amount      *float64 `json:"amount" validate:"omitempty,gt=0"`
	Receipt     *string  `json:"receipt"`
}

// PayoutRequest represents payout request
type PayoutRequest struct {
	Amount        float64 `json:"amount" validate:"required,gt=0"`
	PaymentMethod string  `json:"payment_method" validate:"required"`
	Notes         string  `json:"notes"`
}

// FinancialSummary represents chef financial summary
type FinancialSummary struct {
	ChefID          string                    `json:"chef_id"`
	Period          string                    `json:"period"`
	TotalRevenue    float64                   `json:"total_revenue"`
	TotalExpenses   float64                   `json:"total_expenses"`
	NetEarnings     float64                   `json:"net_earnings"`
	PendingPayouts  float64                   `json:"pending_payouts"`
	PaidAmount      float64                   `json:"paid_amount"`
	ProfitMargin    float64                   `json:"profit_margin"`
	ExpenseBreakdown map[string]float64       `json:"expense_breakdown"`
	RevenueBreakdown map[string]float64       `json:"revenue_breakdown"`
	Trends          FinancialTrends           `json:"trends"`
}

// FinancialTrends represents financial trend data
type FinancialTrends struct {
	RevenueGrowth  float64 `json:"revenue_growth"`
	ExpenseGrowth  float64 `json:"expense_growth"`
	ProfitGrowth   float64 `json:"profit_growth"`
	OrderGrowth    float64 `json:"order_growth"`
}

// ProfitLossData represents P&L report data
type ProfitLossData struct {
	Period           string                 `json:"period"`
	StartDate        time.Time              `json:"start_date"`
	EndDate          time.Time              `json:"end_date"`
	Revenue          ProfitLossRevenue      `json:"revenue"`
	Expenses         ProfitLossExpenses     `json:"expenses"`
	Profit           ProfitLossProfit       `json:"profit"`
	Comparison       ProfitLossComparison   `json:"comparison"`
}

// ProfitLossRevenue represents revenue breakdown
type ProfitLossRevenue struct {
	Total       float64            `json:"total"`
	Orders      float64            `json:"orders"`
	Tips        float64            `json:"tips"`
	Bonuses     float64            `json:"bonuses"`
	Breakdown   map[string]float64 `json:"breakdown"`
}

// ProfitLossExpenses represents expense breakdown
type ProfitLossExpenses struct {
	Total       float64            `json:"total"`
	Ingredients float64            `json:"ingredients"`
	Packaging   float64            `json:"packaging"`
	Utilities   float64            `json:"utilities"`
	Other       float64            `json:"other"`
	Breakdown   map[string]float64 `json:"breakdown"`
}

// ProfitLossProfit represents profit calculations
type ProfitLossProfit struct {
	Gross       float64 `json:"gross"`
	Net         float64 `json:"net"`
	Margin      float64 `json:"margin"`
	PerOrder    float64 `json:"per_order"`
}

// ProfitLossComparison represents period comparison
type ProfitLossComparison struct {
	PreviousPeriod ProfitLossProfit `json:"previous_period"`
	Growth         ProfitLossGrowth `json:"growth"`
}

// ProfitLossGrowth represents growth metrics
type ProfitLossGrowth struct {
	Revenue    float64 `json:"revenue"`
	Expenses   float64 `json:"expenses"`
	GrossProfit float64 `json:"gross_profit"`
	NetProfit  float64 `json:"net_profit"`
}

// BeforeCreate hooks
func (cf *ChefFinancials) BeforeCreate(tx *gorm.DB) error {
	if cf.ID == "" {
		cf.ID = uuid.New().String()
	}
	return nil
}

func (ce *ChefExpense) BeforeCreate(tx *gorm.DB) error {
	if ce.ID == "" {
		ce.ID = uuid.New().String()
	}
	return nil
}

func (cp *ChefPayout) BeforeCreate(tx *gorm.DB) error {
	if cp.ID == "" {
		cp.ID = uuid.New().String()
	}
	return nil
}

func (plr *ProfitLossReport) BeforeCreate(tx *gorm.DB) error {
	if plr.ID == "" {
		plr.ID = uuid.New().String()
	}
	return nil
}