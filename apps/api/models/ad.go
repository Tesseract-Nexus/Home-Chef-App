package models

import (
	"gorm.io/gorm"
	"time"
)

// AdAccount belongs to a User and is used for billing
type AdAccount struct {
	gorm.Model
	UserID       uint   `json:"user_id"`
	User         User   `json:"user"`
	BusinessName string `json:"business_name"`
	// Add billing details, Stripe Customer ID, etc. here
}

// AdCampaign belongs to an AdAccount
type AdCampaign struct {
	gorm.Model
	AdAccountID uint      `json:"ad_account_id"`
	AdAccount   AdAccount `json:"ad_account"`
	Name        string    `json:"name"`
	Budget      float64   `json:"budget"` // Total budget for the campaign
	StartDate   time.Time `json:"start_date"`
	EndDate     time.Time `json:"end_date"`
	IsActive    bool      `json:"is_active" gorm:"default:false"`
}

// Ad belongs to a Campaign
type Ad struct {
	gorm.Model
	AdCampaignID uint       `json:"ad_campaign_id"`
	AdCampaign   AdCampaign `json:"ad_campaign"`
	Title        string     `json:"title"`
	Content      string     `json:"content"`
	ImageURL     string     `json:"image_url"`
	TargetURL    string     `json:"target_url"` // e.g., link to a chef's profile
}

// AdImpression tracks when an ad is shown
type AdImpression struct {
	gorm.Model
	AdID   uint `json:"ad_id"`
	Ad     Ad   `json:"ad"`
	UserID uint `json:"user_id"` // User who saw the ad
}

// AdClick tracks when an ad is clicked
type AdClick struct {
	gorm.Model
	AdID   uint `json:"ad_id"`
	Ad     Ad   `json:"ad"`
	UserID uint `json:"user_id"` // User who clicked the ad
}
