package models

import (
	"time"
	"github.com/google/uuid"
)

type DeliveryPartner struct {
	ID                string                 `json:"id" gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
	UserID            string                 `json:"user_id" gorm:"uniqueIndex;not null"`
	Name              string                 `json:"name"`
	Phone             string                 `json:"phone"`
	Email             string                 `json:"email"`
	Avatar            string                 `json:"avatar"`
	Rating            float64                `json:"rating" gorm:"default:0"`
	TotalDeliveries   int                    `json:"total_deliveries" gorm:"default:0"`
	Status            string                 `json:"status" gorm:"default:'pending'"`
	IsAvailable       bool                   `json:"is_available" gorm:"default:false"`
	CurrentLatitude   float64                `json:"current_latitude"`
	CurrentLongitude  float64                `json:"current_longitude"`
	Vehicle           VehicleInfo            `json:"vehicle" gorm:"embedded"`
	Documents         DocumentInfo           `json:"documents" gorm:"embedded"`
	BankDetails       BankDetails            `json:"bank_details" gorm:"embedded"`
	EmergencyContact  EmergencyContact       `json:"emergency_contact" gorm:"embedded"`
	CreatedAt         time.Time              `json:"created_at"`
	UpdatedAt         time.Time              `json:"updated_at"`
	
	// Relationships
	DeliveryOrders    []DeliveryOrder        `json:"delivery_orders,omitempty" gorm:"foreignKey:DeliveryPartnerID"`
	Earnings          []DeliveryEarning      `json:"earnings,omitempty" gorm:"foreignKey:DeliveryPartnerID"`
}

type VehicleInfo struct {
	Type               string    `json:"type" gorm:"column:vehicle_type"`
	Brand              string    `json:"brand" gorm:"column:vehicle_brand"`
	Model              string    `json:"model" gorm:"column:vehicle_model"`
	RegistrationNumber string    `json:"registration_number" gorm:"column:vehicle_registration_number"`
	Color              string    `json:"color" gorm:"column:vehicle_color"`
	InsuranceExpiry    time.Time `json:"insurance_expiry" gorm:"column:vehicle_insurance_expiry"`
}

type DocumentInfo struct {
	DrivingLicenseNumber     string    `json:"driving_license_number" gorm:"column:driving_license_number"`
	DrivingLicenseExpiry     time.Time `json:"driving_license_expiry" gorm:"column:driving_license_expiry"`
	DrivingLicenseVerified   bool      `json:"driving_license_verified" gorm:"column:driving_license_verified;default:false"`
	VehicleRegistrationVerified bool   `json:"vehicle_registration_verified" gorm:"column:vehicle_registration_verified;default:false"`
	InsuranceVerified        bool      `json:"insurance_verified" gorm:"column:insurance_verified;default:false"`
	IdentityProofVerified    bool      `json:"identity_proof_verified" gorm:"column:identity_proof_verified;default:false"`
}

type BankDetails struct {
	AccountNumber     string `json:"account_number" gorm:"column:bank_account_number"`
	IFSCCode         string `json:"ifsc_code" gorm:"column:bank_ifsc_code"`
	AccountHolderName string `json:"account_holder_name" gorm:"column:bank_account_holder_name"`
}

type EmergencyContact struct {
	Name     string `json:"name" gorm:"column:emergency_contact_name"`
	Phone    string `json:"phone" gorm:"column:emergency_contact_phone"`
	Relation string `json:"relation" gorm:"column:emergency_contact_relation"`
}

type DeliveryOrder struct {
	ID                  string      `json:"id" gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
	OrderID             string      `json:"order_id" gorm:"not null;index"`
	DeliveryPartnerID   string      `json:"delivery_partner_id" gorm:"not null;index"`
	CustomerID          string      `json:"customer_id" gorm:"not null"`
	ChefID              string      `json:"chef_id" gorm:"not null"`
	Status              string      `json:"status" gorm:"default:'assigned'"`
	Priority            string      `json:"priority" gorm:"default:'medium'"`
	OrderValue          float64     `json:"order_value"`
	DeliveryFee         float64     `json:"delivery_fee"`
	Tips                float64     `json:"tips" gorm:"default:0"`
	TotalEarnings       float64     `json:"total_earnings"`
	Distance            float64     `json:"distance"`
	EstimatedTime       int         `json:"estimated_time"`
	PaymentMethod       string      `json:"payment_method"`
	PickupLocation      Location    `json:"pickup_location" gorm:"embedded;embeddedPrefix:pickup_"`
	DeliveryLocation    Location    `json:"delivery_location" gorm:"embedded;embeddedPrefix:delivery_"`
	SpecialInstructions string      `json:"special_instructions"`
	AcceptedAt          *time.Time  `json:"accepted_at"`
	PickupTime          *time.Time  `json:"pickup_time"`
	DeliveryTime        *time.Time  `json:"delivery_time"`
	DeliveryProof       string      `json:"delivery_proof"`
	CustomerSignature   string      `json:"customer_signature"`
	Notes               string      `json:"notes"`
	CreatedAt           time.Time   `json:"created_at"`
	UpdatedAt           time.Time   `json:"updated_at"`
}

type Location struct {
	Address     string  `json:"address" gorm:"column:address"`
	Latitude    float64 `json:"latitude" gorm:"column:latitude"`
	Longitude   float64 `json:"longitude" gorm:"column:longitude"`
}

type DeliveryEarning struct {
	ID                string    `json:"id" gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
	DeliveryPartnerID string    `json:"delivery_partner_id" gorm:"not null;index"`
	OrderID           string    `json:"order_id" gorm:"not null"`
	Date              time.Time `json:"date" gorm:"not null;index"`
	BaseEarnings      float64   `json:"base_earnings"`
	Tips              float64   `json:"tips" gorm:"default:0"`
	Bonuses           float64   `json:"bonuses" gorm:"default:0"`
	Deductions        float64   `json:"deductions" gorm:"default:0"`
	TotalEarnings     float64   `json:"total_earnings"`
	Distance          float64   `json:"distance"`
	DeliveryTime      int       `json:"delivery_time"`
	CreatedAt         time.Time `json:"created_at"`
}

type DeliveryTracking struct {
	ID                string    `json:"id" gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
	OrderID           string    `json:"order_id" gorm:"not null;index"`
	DeliveryPartnerID string    `json:"delivery_partner_id" gorm:"not null"`
	Latitude          float64   `json:"latitude"`
	Longitude         float64   `json:"longitude"`
	EstimatedArrival  *time.Time `json:"estimated_arrival"`
	Timestamp         time.Time `json:"timestamp" gorm:"default:CURRENT_TIMESTAMP"`
}

type EmergencyReport struct {
	ID                string    `json:"id" gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
	DeliveryPartnerID string    `json:"delivery_partner_id" gorm:"not null"`
	Type              string    `json:"type" gorm:"not null"`
	Description       string    `json:"description" gorm:"not null"`
	Latitude          float64   `json:"latitude"`
	Longitude         float64   `json:"longitude"`
	OrderID           *string   `json:"order_id"`
	Status            string    `json:"status" gorm:"default:'reported'"`
	ResolvedAt        *time.Time `json:"resolved_at"`
	CreatedAt         time.Time `json:"created_at"`
}

// Request/Response models
type DeliveryPartnerUpdate struct {
	Name             *string           `json:"name"`
	Phone            *string           `json:"phone"`
	Avatar           *string           `json:"avatar"`
	EmergencyContact *EmergencyContact `json:"emergency_contact"`
}

type StatusUpdate struct {
	IsAvailable bool      `json:"is_available" validate:"required"`
	Location    *Location `json:"location"`
}

type PickupUpdate struct {
	PickupTime *time.Time `json:"pickup_time"`
	Location   *Location  `json:"location"`
	Notes      string     `json:"notes"`
}

type DeliveryUpdate struct {
	DeliveryTime      time.Time `json:"delivery_time" validate:"required"`
	Location          Location  `json:"location" validate:"required"`
	DeliveryProof     string    `json:"delivery_proof"`
	CustomerSignature string    `json:"customer_signature"`
	Notes             string    `json:"notes"`
}

type LocationUpdate struct {
	Location          Location   `json:"location" validate:"required"`
	EstimatedArrival  *time.Time `json:"estimated_arrival"`
}

type VehicleUpdate struct {
	Type               string    `json:"type" validate:"omitempty,oneof=motorcycle scooter bicycle car"`
	Brand              string    `json:"brand"`
	Model              string    `json:"model"`
	RegistrationNumber string    `json:"registration_number"`
	Color              string    `json:"color"`
	InsuranceExpiry    time.Time `json:"insurance_expiry"`
}

type EmergencyReportCreate struct {
	Type        string    `json:"type" validate:"required,oneof=accident vehicle_breakdown safety_concern medical"`
	Description string    `json:"description" validate:"required"`
	Location    Location  `json:"location" validate:"required"`
	OrderID     *string   `json:"order_id"`
}

type DeliveryEarningsSummary struct {
	TotalEarnings         float64                `json:"total_earnings"`
	BaseEarnings          float64                `json:"base_earnings"`
	Tips                  float64                `json:"tips"`
	Bonuses               float64                `json:"bonuses"`
	Deductions            float64                `json:"deductions"`
	TotalDeliveries       int                    `json:"total_deliveries"`
	AvgEarningsPerDelivery float64               `json:"avg_earnings_per_delivery"`
	PayoutStatus          PayoutStatus           `json:"payout_status"`
}

type PayoutStatus struct {
	PendingAmount   float64    `json:"pending_amount"`
	LastPayoutDate  *time.Time `json:"last_payout_date"`
	NextPayoutDate  *time.Time `json:"next_payout_date"`
}

type DeliveryAnalytics struct {
	Performance PerformanceMetrics `json:"performance"`
	Ratings     RatingMetrics      `json:"ratings"`
	Earnings    EarningsMetrics    `json:"earnings"`
	Distance    DistanceMetrics    `json:"distance"`
}

type PerformanceMetrics struct {
	TotalDeliveries     int     `json:"total_deliveries"`
	CompletedDeliveries int     `json:"completed_deliveries"`
	CancelledDeliveries int     `json:"cancelled_deliveries"`
	CompletionRate      float64 `json:"completion_rate"`
	AvgDeliveryTime     float64 `json:"avg_delivery_time"`
	OnTimePercentage    float64 `json:"on_time_percentage"`
}

type RatingMetrics struct {
	AvgRating           float64           `json:"avg_rating"`
	TotalRatings        int               `json:"total_ratings"`
	RatingDistribution  map[string]int    `json:"rating_distribution"`
}

type EarningsMetrics struct {
	TotalEarnings       float64 `json:"total_earnings"`
	AvgEarningsPerHour  float64 `json:"avg_earnings_per_hour"`
	PeakHoursEarnings   float64 `json:"peak_hours_earnings"`
}

type DistanceMetrics struct {
	TotalDistance           float64 `json:"total_distance"`
	AvgDistancePerDelivery  float64 `json:"avg_distance_per_delivery"`
}

// BeforeCreate hooks
func (dp *DeliveryPartner) BeforeCreate(tx *gorm.DB) error {
	if dp.ID == "" {
		dp.ID = uuid.New().String()
	}
	return nil
}

func (do *DeliveryOrder) BeforeCreate(tx *gorm.DB) error {
	if do.ID == "" {
		do.ID = uuid.New().String()
	}
	return nil
}

func (de *DeliveryEarning) BeforeCreate(tx *gorm.DB) error {
	if de.ID == "" {
		de.ID = uuid.New().String()
	}
	return nil
}

func (dt *DeliveryTracking) BeforeCreate(tx *gorm.DB) error {
	if dt.ID == "" {
		dt.ID = uuid.New().String()
	}
	return nil
}

func (er *EmergencyReport) BeforeCreate(tx *gorm.DB) error {
	if er.ID == "" {
		er.ID = uuid.New().String()
	}
	return nil
}