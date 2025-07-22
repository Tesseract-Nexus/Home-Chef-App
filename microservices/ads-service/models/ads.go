package models

import (
	"time"
	"github.com/google/uuid"
)

type AdCampaign struct {
	ID          string              `json:"id" gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
	Name        string              `json:"name" gorm:"not null"`
	Type        string              `json:"type" gorm:"not null"`
	Status      string              `json:"status" gorm:"default:'draft'"`
	Budget      CampaignBudget      `json:"budget" gorm:"embedded"`
	Targeting   CampaignTargeting   `json:"targeting" gorm:"embedded"`
	Schedule    CampaignSchedule    `json:"schedule" gorm:"embedded"`
	Performance CampaignPerformance `json:"performance" gorm:"embedded"`
	CreatedAt   time.Time           `json:"created_at"`
	UpdatedAt   time.Time           `json:"updated_at"`
	
	// Relationships
	AdContents []AdContent `json:"ad_contents,omitempty" gorm:"foreignKey:CampaignID"`
}

type CampaignBudget struct {
	TotalBudget        float64 `json:"total_budget" gorm:"column:total_budget"`
	DailyBudget        float64 `json:"daily_budget" gorm:"column:daily_budget"`
	CostPerClick       float64 `json:"cost_per_click" gorm:"column:cost_per_click"`
	CostPerImpression  float64 `json:"cost_per_impression" gorm:"column:cost_per_impression"`
}

type CampaignTargeting struct {
	UserTypes  string `json:"user_types" gorm:"column:user_types;type:text"`     // JSON array as string
	Locations  string `json:"locations" gorm:"column:locations;type:text"`       // JSON array as string
	AgeGroups  string `json:"age_groups" gorm:"column:age_groups;type:text"`     // JSON array as string
	Interests  string `json:"interests" gorm:"column:interests;type:text"`       // JSON array as string
}

type CampaignSchedule struct {
	StartDate time.Time `json:"start_date" gorm:"column:start_date"`
	EndDate   time.Time `json:"end_date" gorm:"column:end_date"`
	TimeSlots string    `json:"time_slots" gorm:"column:time_slots;type:text"` // JSON array as string
}

type CampaignPerformance struct {
	Impressions int     `json:"impressions" gorm:"column:impressions;default:0"`
	Clicks      int     `json:"clicks" gorm:"column:clicks;default:0"`
	Conversions int     `json:"conversions" gorm:"column:conversions;default:0"`
	CTR         float64 `json:"ctr" gorm:"column:ctr;default:0"`
	Cost        float64 `json:"cost" gorm:"column:cost;default:0"`
}

type AdContent struct {
	ID          string    `json:"id" gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
	CampaignID  string    `json:"campaign_id" gorm:"not null"`
	Type        string    `json:"type" gorm:"not null"`
	Title       string    `json:"title"`
	Description string    `json:"description"`
	ImageURL    string    `json:"image_url"`
	VideoURL    string    `json:"video_url"`
	ActionText  string    `json:"action_text"`
	TargetURL   string    `json:"target_url"`
	Sponsor     string    `json:"sponsor"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
	
	// Relationships
	Campaign AdCampaign `json:"campaign" gorm:"foreignKey:CampaignID"`
}

type AdImpression struct {
	ID         string    `json:"id" gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
	AdID       string    `json:"ad_id" gorm:"not null"`
	CampaignID string    `json:"campaign_id" gorm:"not null"`
	UserID     string    `json:"user_id"`
	Placement  string    `json:"placement"`
	UserAgent  string    `json:"user_agent"`
	IPAddress  string    `json:"ip_address"`
	Timestamp  time.Time `json:"timestamp" gorm:"default:CURRENT_TIMESTAMP"`
}

type AdClick struct {
	ID         string    `json:"id" gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
	AdID       string    `json:"ad_id" gorm:"not null"`
	CampaignID string    `json:"campaign_id" gorm:"not null"`
	UserID     string    `json:"user_id"`
	Placement  string    `json:"placement"`
	TargetURL  string    `json:"target_url"`
	UserAgent  string    `json:"user_agent"`
	IPAddress  string    `json:"ip_address"`
	Timestamp  time.Time `json:"timestamp" gorm:"default:CURRENT_TIMESTAMP"`
}

type CampaignCreate struct {
	Name      string                   `json:"name" validate:"required"`
	Type      string                   `json:"type" validate:"required,oneof=banner interstitial native video sponsored_content"`
	Content   CampaignContentCreate    `json:"content" validate:"required"`
	Targeting CampaignTargetingCreate  `json:"targeting" validate:"required"`
	Budget    CampaignBudgetCreate     `json:"budget" validate:"required"`
	Schedule  CampaignScheduleCreate   `json:"schedule" validate:"required"`
}

type CampaignContentCreate struct {
	Title       string `json:"title"`
	Description string `json:"description"`
	ImageURL    string `json:"image_url"`
	VideoURL    string `json:"video_url"`
	ActionText  string `json:"action_text"`
	TargetURL   string `json:"target_url"`
}

type CampaignTargetingCreate struct {
	UserTypes []string `json:"user_types"`
	Locations []string `json:"locations"`
	AgeGroups []string `json:"age_groups"`
	Interests []string `json:"interests"`
}

type CampaignBudgetCreate struct {
	TotalBudget       float64 `json:"total_budget" validate:"required,gt=0"`
	DailyBudget       float64 `json:"daily_budget"`
	CostPerClick      float64 `json:"cost_per_click"`
	CostPerImpression float64 `json:"cost_per_impression"`
}

type CampaignScheduleCreate struct {
	StartDate time.Time `json:"start_date" validate:"required"`
	EndDate   time.Time `json:"end_date" validate:"required"`
	TimeSlots []string  `json:"time_slots"`
}

type CampaignUpdate struct {
	Name      *string                  `json:"name"`
	Status    *string                  `json:"status" validate:"omitempty,oneof=active paused completed draft"`
	Budget    *CampaignBudgetUpdate    `json:"budget"`
	Targeting *CampaignTargetingCreate `json:"targeting"`
	Schedule  *CampaignScheduleCreate  `json:"schedule"`
}

type CampaignBudgetUpdate struct {
	DailyBudget  *float64 `json:"daily_budget"`
	CostPerClick *float64 `json:"cost_per_click"`
}

type AdServeRequest struct {
	Type         string `json:"type" validate:"required,oneof=banner interstitial native video sponsored_content"`
	Placement    string `json:"placement"`
	UserLocation string `json:"user_location"`
	Limit        int    `json:"limit"`
}

type ImpressionTrack struct {
	AdID       string `json:"ad_id" validate:"required"`
	CampaignID string `json:"campaign_id" validate:"required"`
	Placement  string `json:"placement"`
	UserAgent  string `json:"user_agent"`
	IPAddress  string `json:"ip_address"`
}

type ClickTrack struct {
	AdID       string `json:"ad_id" validate:"required"`
	CampaignID string `json:"campaign_id" validate:"required"`
	Placement  string `json:"placement"`
	TargetURL  string `json:"target_url"`
	UserAgent  string `json:"user_agent"`
	IPAddress  string `json:"ip_address"`
}

// BeforeCreate hook to generate UUID
func (ac *AdCampaign) BeforeCreate(tx *gorm.DB) error {
	if ac.ID == "" {
		ac.ID = uuid.New().String()
	}
	return nil
}

func (ad *AdContent) BeforeCreate(tx *gorm.DB) error {
	if ad.ID == "" {
		ad.ID = uuid.New().String()
	}
	return nil
}

func (ai *AdImpression) BeforeCreate(tx *gorm.DB) error {
	if ai.ID == "" {
		ai.ID = uuid.New().String()
	}
	return nil
}

func (ac *AdClick) BeforeCreate(tx *gorm.DB) error {
	if ac.ID == "" {
		ac.ID = uuid.New().String()
	}
	return nil
}