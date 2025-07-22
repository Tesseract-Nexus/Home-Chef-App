package models

import (
	"time"
	"github.com/google/uuid"
)

type Review struct {
	ID             string    `json:"id" gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
	CustomerID     string    `json:"customer_id" gorm:"not null;index"`
	ChefID         string    `json:"chef_id" gorm:"not null;index"`
	OrderID        string    `json:"order_id" gorm:"not null;index"`
	DishID         *string   `json:"dish_id" gorm:"index"`
	Rating         int       `json:"rating" gorm:"not null"`
	ReviewText     string    `json:"review_text" gorm:"not null"`
	Images         string    `json:"images" gorm:"type:text"` // JSON array as string
	IsVerified     bool      `json:"is_verified" gorm:"default:false"`
	HelpfulCount   int       `json:"helpful_count" gorm:"default:0"`
	ReportCount    int       `json:"report_count" gorm:"default:0"`
	Status         string    `json:"status" gorm:"default:'active'"`
	CreatedAt      time.Time `json:"created_at"`
	UpdatedAt      time.Time `json:"updated_at"`
	
	// Relationships
	HelpfulVotes   []ReviewHelpful `json:"helpful_votes,omitempty" gorm:"foreignKey:ReviewID"`
	Reports        []ReviewReport  `json:"reports,omitempty" gorm:"foreignKey:ReviewID"`
}

type ReviewHelpful struct {
	ID        string    `json:"id" gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
	ReviewID  string    `json:"review_id" gorm:"not null"`
	UserID    string    `json:"user_id" gorm:"not null"`
	CreatedAt time.Time `json:"created_at"`
	
	// Relationships
	Review Review `json:"review" gorm:"foreignKey:ReviewID"`
}

type ReviewReport struct {
	ID          string    `json:"id" gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
	ReviewID    string    `json:"review_id" gorm:"not null"`
	ReporterID  string    `json:"reporter_id" gorm:"not null"`
	Reason      string    `json:"reason" gorm:"not null"`
	Description string    `json:"description"`
	Status      string    `json:"status" gorm:"default:'pending'"`
	CreatedAt   time.Time `json:"created_at"`
	
	// Relationships
	Review Review `json:"review" gorm:"foreignKey:ReviewID"`
}

type ReviewStats struct {
	ChefID            string                 `json:"chef_id"`
	TotalReviews      int                    `json:"total_reviews"`
	AverageRating     float64                `json:"average_rating"`
	RatingDistribution map[string]int        `json:"rating_distribution"`
	RecentReviews     []ReviewSummary        `json:"recent_reviews"`
	MonthlyTrend      []MonthlyReviewData    `json:"monthly_trend"`
}

type ReviewSummary struct {
	ID           string    `json:"id"`
	CustomerName string    `json:"customer_name"`
	Rating       int       `json:"rating"`
	ReviewText   string    `json:"review_text"`
	CreatedAt    time.Time `json:"created_at"`
	HelpfulCount int       `json:"helpful_count"`
}

type MonthlyReviewData struct {
	Month         string  `json:"month"`
	ReviewCount   int     `json:"review_count"`
	AverageRating float64 `json:"average_rating"`
}

// Request/Response models
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

type ReviewResponse struct {
	ID             string                 `json:"id"`
	CustomerID     string                 `json:"customer_id"`
	CustomerName   string                 `json:"customer_name"`
	CustomerAvatar string                 `json:"customer_avatar"`
	ChefID         string                 `json:"chef_id"`
	OrderID        string                 `json:"order_id"`
	DishID         *string                `json:"dish_id"`
	DishName       *string                `json:"dish_name"`
	Rating         int                    `json:"rating"`
	ReviewText     string                 `json:"review_text"`
	Images         []string               `json:"images"`
	IsVerified     bool                   `json:"is_verified"`
	HelpfulCount   int                    `json:"helpful_count"`
	IsHelpful      bool                   `json:"is_helpful"`
	CanEdit        bool                   `json:"can_edit"`
	CanDelete      bool                   `json:"can_delete"`
	CreatedAt      time.Time              `json:"created_at"`
	UpdatedAt      time.Time              `json:"updated_at"`
}

type ReviewReportCreate struct {
	Reason      string `json:"reason" validate:"required,oneof=inappropriate spam fake offensive"`
	Description string `json:"description" validate:"max=500"`
}

type ReviewFilter struct {
	ChefID   string
	DishID   string
	Rating   int
	Sort     string
	Page     int
	Limit    int
	UserID   string
}

// BeforeCreate hooks
func (r *Review) BeforeCreate(tx *gorm.DB) error {
	if r.ID == "" {
		r.ID = uuid.New().String()
	}
	return nil
}

func (rh *ReviewHelpful) BeforeCreate(tx *gorm.DB) error {
	if rh.ID == "" {
		rh.ID = uuid.New().String()
	}
	return nil
}

func (rr *ReviewReport) BeforeCreate(tx *gorm.DB) error {
	if rr.ID == "" {
		rr.ID = uuid.New().String()
	}
	return nil
}