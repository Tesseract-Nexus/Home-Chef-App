package models

import (
	"time"
)

type AdminDashboard struct {
	Overview          DashboardOverview   `json:"overview"`
	Today             DashboardToday      `json:"today"`
	PendingApprovals  PendingApprovals    `json:"pending_approvals"`
	RecentActivities  []RecentActivity    `json:"recent_activities"`
}

type DashboardOverview struct {
	TotalRevenue            float64 `json:"total_revenue"`
	TotalOrders             int     `json:"total_orders"`
	ActiveUsers             int     `json:"active_users"`
	ActiveChefs             int     `json:"active_chefs"`
	ActiveDeliveryPartners  int     `json:"active_delivery_partners"`
}

type DashboardToday struct {
	Revenue  float64 `json:"revenue"`
	Orders   int     `json:"orders"`
	NewUsers int     `json:"new_users"`
}

type PendingApprovals struct {
	Chefs            int `json:"chefs"`
	DeliveryPartners int `json:"delivery_partners"`
	Payouts          int `json:"payouts"`
}

type RecentActivity struct {
	Type      string    `json:"type"`
	Message   string    `json:"message"`
	Timestamp time.Time `json:"timestamp"`
}

type UserUpdate struct {
	Name   *string `json:"name"`
	Email  *string `json:"email"`
	Phone  *string `json:"phone"`
	Status *string `json:"status" validate:"omitempty,oneof=active inactive suspended"`
}

type UserStatusUpdate struct {
	Status string  `json:"status" validate:"required,oneof=active inactive suspended"`
	Reason *string `json:"reason"`
}

type ChefApproval struct {
	Notes *string `json:"notes"`
}

type ChefRejection struct {
	Reason string  `json:"reason" validate:"required"`
	Notes  *string `json:"notes"`
}

type ChefSuspension struct {
	Reason   string  `json:"reason" validate:"required"`
	Duration *string `json:"duration"`
}

type OrderRefund struct {
	Amount     float64 `json:"amount" validate:"required,gt=0"`
	Reason     string  `json:"reason" validate:"required"`
	RefundType string  `json:"refund_type" validate:"oneof=full partial"`
}

type BulkPayoutProcess struct {
	PayoutIDs []string `json:"payout_ids" validate:"required,min=1"`
	Notes     *string  `json:"notes"`
}

type TicketAssignment struct {
	AgentID string `json:"agent_id" validate:"required"`
}

type PlatformSettings struct {
	Commission PlatformCommission `json:"commission"`
	Delivery   PlatformDelivery   `json:"delivery"`
	Orders     PlatformOrders     `json:"orders"`
	Payments   PlatformPayments   `json:"payments"`
}

type PlatformCommission struct {
	ChefCommissionRate     float64 `json:"chef_commission_rate" validate:"min=0,max=1"`
	DeliveryCommissionRate float64 `json:"delivery_commission_rate" validate:"min=0,max=1"`
}

type PlatformDelivery struct {
	BaseDeliveryFee     float64 `json:"base_delivery_fee" validate:"min=0"`
	PerKmRate          float64 `json:"per_km_rate" validate:"min=0"`
	MaxDeliveryDistance float64 `json:"max_delivery_distance" validate:"min=0"`
}

type PlatformOrders struct {
	MinOrderAmount    float64 `json:"min_order_amount" validate:"min=0"`
	MaxOrderAmount    float64 `json:"max_order_amount" validate:"min=0"`
	AutoAcceptTimeout int     `json:"auto_accept_timeout" validate:"min=0"`
}

type PlatformPayments struct {
	PaymentProcessingFee float64 `json:"payment_processing_fee" validate:"min=0,max=1"`
	PayoutSchedule       string  `json:"payout_schedule" validate:"oneof=daily weekly bi-weekly monthly"`
	MinPayoutAmount      float64 `json:"min_payout_amount" validate:"min=0"`
}

type Analytics struct {
	Period  string                 `json:"period"`
	Metrics map[string]interface{} `json:"metrics"`
}

type CancellationPolicyUpdate struct {
	FreeCancellationWindowSeconds int     `json:"free_cancellation_window_seconds" validate:"min=0,max=300"`
	PenaltyRate                  float64 `json:"penalty_rate" validate:"min=0,max=1"`
	MinPenaltyAmount             float64 `json:"min_penalty_amount"`
	MaxPenaltyAmount             float64 `json:"max_penalty_amount"`
}

type TicketCreate struct {
	Title       string  `json:"title" validate:"required"`
	Description string  `json:"description" validate:"required"`
	Category    string  `json:"category" validate:"required"`
	Priority    string  `json:"priority" validate:"required,oneof=low medium high urgent critical"`
	OrderID     *string `json:"order_id"`
}

type RevenueReport struct {
	Period   string                   `json:"period"`
	Data     []RevenueReportData      `json:"data"`
	Summary  RevenueReportSummary     `json:"summary"`
}

type RevenueReportData struct {
	Date     string  `json:"date"`
	Revenue  float64 `json:"revenue"`
	Orders   int     `json:"orders"`
	AvgOrder float64 `json:"avg_order"`
}

type RevenueReportSummary struct {
	TotalRevenue float64 `json:"total_revenue"`
	TotalOrders  int     `json:"total_orders"`
	AvgOrder     float64 `json:"avg_order"`
	Growth       float64 `json:"growth"`
}

type OrdersReport struct {
	Period  string              `json:"period"`
	Data    []OrdersReportData  `json:"data"`
	Summary OrdersReportSummary `json:"summary"`
}

type OrdersReportData struct {
	Date      string `json:"date"`
	Orders    int    `json:"orders"`
	Completed int    `json:"completed"`
	Cancelled int    `json:"cancelled"`
}

type OrdersReportSummary struct {
	TotalOrders      int     `json:"total_orders"`
	CompletedOrders  int     `json:"completed_orders"`
	CancelledOrders  int     `json:"cancelled_orders"`
	CompletionRate   float64 `json:"completion_rate"`
	CancellationRate float64 `json:"cancellation_rate"`
}