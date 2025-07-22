package models

import "time"

type ChefDashboard struct {
	Today     DashboardPeriod `json:"today"`
	ThisWeek  DashboardPeriod `json:"this_week"`
	ThisMonth DashboardPeriod `json:"this_month"`
	Rating    RatingInfo      `json:"rating"`
	PopularDishes []PopularDish `json:"popular_dishes"`
	RecentReviews []RecentReview `json:"recent_reviews"`
}

type DashboardPeriod struct {
	Orders         int     `json:"orders"`
	Revenue        float64 `json:"revenue"`
	AvgOrderValue  float64 `json:"avg_order_value"`
}

type RatingInfo struct {
	Current      float64 `json:"current"`
	Trend        string  `json:"trend"`
	TotalReviews int     `json:"total_reviews"`
}

type PopularDish struct {
	DishID  string  `json:"dish_id"`
	Name    string  `json:"name"`
	Orders  int     `json:"orders"`
	Revenue float64 `json:"revenue"`
}

type RecentReview struct {
	ID           string    `json:"id"`
	CustomerName string    `json:"customer_name"`
	Rating       int       `json:"rating"`
	Comment      string    `json:"comment"`
	CreatedAt    time.Time `json:"created_at"`
}

type EarningsSummary struct {
	TotalEarnings   float64         `json:"total_earnings"`
	PlatformFee     float64         `json:"platform_fee"`
	NetEarnings     float64         `json:"net_earnings"`
	PendingAmount   float64         `json:"pending_amount"`
	PaidAmount      float64         `json:"paid_amount"`
	Breakdown       EarningsBreakdown `json:"breakdown"`
	PayoutSchedule  string          `json:"payout_schedule"`
	NextPayoutDate  time.Time       `json:"next_payout_date"`
}

type EarningsBreakdown struct {
	OrderRevenue float64 `json:"order_revenue"`
	Tips         float64 `json:"tips"`
	Bonuses      float64 `json:"bonuses"`
	Deductions   float64 `json:"deductions"`
}

type PayoutRequest struct {
	Amount float64 `json:"amount" validate:"required,gt=0"`
	Reason string  `json:"reason"`
}