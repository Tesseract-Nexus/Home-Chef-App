package models

import (
	"time"
)

type PlatformOverview struct {
	Revenue RevenueMetrics `json:"revenue"`
	Orders  OrderMetrics   `json:"orders"`
	Users   UserMetrics    `json:"users"`
}

type RevenueMetrics struct {
	Total  float64 `json:"total"`
	Growth float64 `json:"growth"`
	Trend  string  `json:"trend"`
}

type OrderMetrics struct {
	Total          int     `json:"total"`
	Growth         float64 `json:"growth"`
	CompletionRate float64 `json:"completion_rate"`
}

type UserMetrics struct {
	TotalActive   int     `json:"total_active"`
	NewUsers      int     `json:"new_users"`
	RetentionRate float64 `json:"retention_rate"`
}

type RevenueAnalytics struct {
	Period    string                   `json:"period"`
	GroupBy   string                   `json:"group_by"`
	Data      []RevenueDataPoint       `json:"data"`
	Summary   RevenueSummary           `json:"summary"`
	Breakdown map[string]float64       `json:"breakdown,omitempty"`
}

type RevenueDataPoint struct {
	Date     string  `json:"date"`
	Revenue  float64 `json:"revenue"`
	Orders   int     `json:"orders"`
	AvgOrder float64 `json:"avg_order"`
}

type RevenueSummary struct {
	TotalRevenue float64 `json:"total_revenue"`
	TotalOrders  int     `json:"total_orders"`
	AvgOrder     float64 `json:"avg_order"`
	Growth       float64 `json:"growth"`
}

type UserAnalytics struct {
	Period  string              `json:"period"`
	Segment string              `json:"segment"`
	Data    []UserDataPoint     `json:"data"`
	Summary UserAnalyticsSummary `json:"summary"`
}

type UserDataPoint struct {
	Date        string `json:"date"`
	NewUsers    int    `json:"new_users"`
	ActiveUsers int    `json:"active_users"`
	Retention   float64 `json:"retention"`
}

type UserAnalyticsSummary struct {
	TotalUsers    int     `json:"total_users"`
	NewUsers      int     `json:"new_users"`
	ActiveUsers   int     `json:"active_users"`
	RetentionRate float64 `json:"retention_rate"`
	Growth        float64 `json:"growth"`
}

type OrderAnalytics struct {
	Period   string               `json:"period"`
	GroupBy  string               `json:"group_by"`
	Data     []OrderDataPoint     `json:"data"`
	Summary  OrderAnalyticsSummary `json:"summary"`
	Location string               `json:"location,omitempty"`
	ChefID   string               `json:"chef_id,omitempty"`
}

type OrderDataPoint struct {
	Date      string  `json:"date"`
	Orders    int     `json:"orders"`
	Completed int     `json:"completed"`
	Cancelled int     `json:"cancelled"`
	Revenue   float64 `json:"revenue"`
}

type OrderAnalyticsSummary struct {
	TotalOrders      int     `json:"total_orders"`
	CompletedOrders  int     `json:"completed_orders"`
	CancelledOrders  int     `json:"cancelled_orders"`
	CompletionRate   float64 `json:"completion_rate"`
	CancellationRate float64 `json:"cancellation_rate"`
	TotalRevenue     float64 `json:"total_revenue"`
}

type ChefPerformance struct {
	ChefID   string                    `json:"chef_id"`
	Period   string                    `json:"period"`
	Metrics  ChefPerformanceMetrics    `json:"metrics"`
	Rankings ChefRankings              `json:"rankings"`
	Trends   map[string]float64        `json:"trends"`
}

type ChefPerformanceMetrics struct {
	Revenue         float64 `json:"revenue"`
	Orders          int     `json:"orders"`
	Rating          float64 `json:"rating"`
	CompletionRate  float64 `json:"completion_rate"`
	AvgPrepTime     int     `json:"avg_prep_time"`
	CustomerReturn  float64 `json:"customer_return_rate"`
}

type ChefRankings struct {
	RevenueRank int `json:"revenue_rank"`
	OrdersRank  int `json:"orders_rank"`
	RatingRank  int `json:"rating_rank"`
	OverallRank int `json:"overall_rank"`
}

type ChefRankingList struct {
	Metric   string             `json:"metric"`
	Period   string             `json:"period"`
	Location string             `json:"location,omitempty"`
	Rankings []ChefRankingEntry `json:"rankings"`
}

type ChefRankingEntry struct {
	Rank     int     `json:"rank"`
	ChefID   string  `json:"chef_id"`
	ChefName string  `json:"chef_name"`
	Value    float64 `json:"value"`
	Change   float64 `json:"change"`
}

type DeliveryPerformance struct {
	PartnerID string                     `json:"partner_id,omitempty"`
	Period    string                     `json:"period"`
	Location  string                     `json:"location,omitempty"`
	Metrics   DeliveryPerformanceMetrics `json:"metrics"`
	Trends    map[string]interface{}     `json:"trends"`
}

type DeliveryPerformanceMetrics struct {
	TotalDeliveries   int     `json:"total_deliveries"`
	CompletedDeliveries int   `json:"completed_deliveries"`
	AvgDeliveryTime   int     `json:"avg_delivery_time"`
	OnTimeRate        float64 `json:"on_time_rate"`
	CustomerRating    float64 `json:"customer_rating"`
	EarningsTotal     float64 `json:"earnings_total"`
}

type CustomerInsights struct {
	Segment string                    `json:"segment"`
	Period  string                    `json:"period"`
	Metrics CustomerInsightsMetrics   `json:"metrics"`
	Behavior CustomerBehaviorMetrics  `json:"behavior"`
}

type CustomerInsightsMetrics struct {
	TotalCustomers   int     `json:"total_customers"`
	AvgOrderValue    float64 `json:"avg_order_value"`
	OrderFrequency   float64 `json:"order_frequency"`
	LifetimeValue    float64 `json:"lifetime_value"`
	ChurnRate        float64 `json:"churn_rate"`
}

type CustomerBehaviorMetrics struct {
	PreferredCuisines []string               `json:"preferred_cuisines"`
	OrderTimes        map[string]int         `json:"order_times"`
	PaymentMethods    map[string]int         `json:"payment_methods"`
	AvgSessionTime    int                    `json:"avg_session_time"`
}

type CohortAnalysis struct {
	CohortType string              `json:"cohort_type"`
	StartDate  time.Time           `json:"start_date"`
	EndDate    time.Time           `json:"end_date"`
	Cohorts    []CohortData        `json:"cohorts"`
	Summary    CohortSummary       `json:"summary"`
}

type CohortData struct {
	CohortPeriod string             `json:"cohort_period"`
	Size         int                `json:"size"`
	Retention    map[string]float64 `json:"retention"`
	Revenue      map[string]float64 `json:"revenue"`
}

type CohortSummary struct {
	AvgRetention map[string]float64 `json:"avg_retention"`
	AvgRevenue   map[string]float64 `json:"avg_revenue"`
}

type FinancialDashboard struct {
	Period   string                    `json:"period"`
	Revenue  FinancialRevenueMetrics   `json:"revenue"`
	Costs    FinancialCostMetrics      `json:"costs"`
	Profit   FinancialProfitMetrics    `json:"profit"`
	Payouts  FinancialPayoutMetrics    `json:"payouts"`
}

type FinancialRevenueMetrics struct {
	Gross       float64                `json:"gross"`
	Net         float64                `json:"net"`
	Breakdown   map[string]float64     `json:"breakdown"`
	Growth      float64                `json:"growth"`
}

type FinancialCostMetrics struct {
	Total       float64                `json:"total"`
	Breakdown   map[string]float64     `json:"breakdown"`
	Percentage  float64                `json:"percentage"`
}

type FinancialProfitMetrics struct {
	Gross       float64 `json:"gross"`
	Net         float64 `json:"net"`
	Margin      float64 `json:"margin"`
	Growth      float64 `json:"growth"`
}

type FinancialPayoutMetrics struct {
	Total       float64 `json:"total"`
	Pending     float64 `json:"pending"`
	Processed   float64 `json:"processed"`
	Count       int     `json:"count"`
}

type OperationalMetrics struct {
	Period     string                        `json:"period"`
	Department string                        `json:"department"`
	Kitchen    OperationalKitchenMetrics     `json:"kitchen,omitempty"`
	Delivery   OperationalDeliveryMetrics    `json:"delivery,omitempty"`
	Support    OperationalSupportMetrics     `json:"support,omitempty"`
}

type OperationalKitchenMetrics struct {
	AvgPrepTime     int     `json:"avg_prep_time"`
	OrderAccuracy   float64 `json:"order_accuracy"`
	WastePercentage float64 `json:"waste_percentage"`
	Efficiency      float64 `json:"efficiency"`
}

type OperationalDeliveryMetrics struct {
	AvgDeliveryTime int     `json:"avg_delivery_time"`
	OnTimeRate      float64 `json:"on_time_rate"`
	SuccessRate     float64 `json:"success_rate"`
	PartnerUtilization float64 `json:"partner_utilization"`
}

type OperationalSupportMetrics struct {
	TicketVolume    int     `json:"ticket_volume"`
	ResolutionTime  int     `json:"avg_resolution_time"`
	SatisfactionRate float64 `json:"satisfaction_rate"`
	FirstCallResolution float64 `json:"first_call_resolution"`
}

type CustomReportCreate struct {
	Name        string                 `json:"name" validate:"required"`
	Description string                 `json:"description"`
	Metrics     []string               `json:"metrics" validate:"required,min=1"`
	Dimensions  []string               `json:"dimensions" validate:"required,min=1"`
	Filters     map[string]interface{} `json:"filters"`
	Schedule    *ReportSchedule        `json:"schedule"`
}

type ReportSchedule struct {
	Frequency  string   `json:"frequency" validate:"oneof=daily weekly monthly"`
	Recipients []string `json:"recipients" validate:"required,min=1"`
}

type CustomReport struct {
	ID          string                 `json:"id"`
	Name        string                 `json:"name"`
	Description string                 `json:"description"`
	Data        []map[string]interface{} `json:"data"`
	Metadata    ReportMetadata         `json:"metadata"`
	CreatedAt   time.Time              `json:"created_at"`
}

type ReportMetadata struct {
	TotalRows   int                    `json:"total_rows"`
	Columns     []string               `json:"columns"`
	Filters     map[string]interface{} `json:"filters"`
	GeneratedAt time.Time              `json:"generated_at"`
}

type RealTimeDashboard struct {
	ActiveUsers     int                    `json:"active_users"`
	ActiveOrders    int                    `json:"active_orders"`
	ActiveChefs     int                    `json:"active_chefs"`
	ActiveDelivery  int                    `json:"active_delivery"`
	RevenueToday    float64                `json:"revenue_today"`
	OrdersToday     int                    `json:"orders_today"`
	RecentActivity  []ActivityEvent        `json:"recent_activity"`
	SystemHealth    SystemHealthMetrics    `json:"system_health"`
}

type ActivityEvent struct {
	Type      string    `json:"type"`
	Message   string    `json:"message"`
	Timestamp time.Time `json:"timestamp"`
	UserID    string    `json:"user_id,omitempty"`
}

type SystemHealthMetrics struct {
	DatabaseStatus string  `json:"database_status"`
	RedisStatus    string  `json:"redis_status"`
	APILatency     float64 `json:"api_latency"`
	ErrorRate      float64 `json:"error_rate"`
}

type DataExportRequest struct {
	DataType  string                 `json:"data_type" validate:"required,oneof=orders users chefs revenue reviews"`
	Format    string                 `json:"format" validate:"required,oneof=csv json excel"`
	DateRange *DateRange             `json:"date_range"`
	Filters   map[string]interface{} `json:"filters"`
}

type DateRange struct {
	StartDate time.Time `json:"start_date"`
	EndDate   time.Time `json:"end_date"`
}

type ExportJob struct {
	ID        string    `json:"id"`
	Status    string    `json:"status"`
	Progress  int       `json:"progress"`
	DownloadURL string  `json:"download_url,omitempty"`
	CreatedAt time.Time `json:"created_at"`
	CompletedAt *time.Time `json:"completed_at,omitempty"`
}