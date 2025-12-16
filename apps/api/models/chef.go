package models

import (
	"time"

	"github.com/google/uuid"
	"github.com/lib/pq"
)

type ChefProfile struct {
	ID             uuid.UUID      `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	UserID         uuid.UUID      `gorm:"type:uuid;uniqueIndex;not null" json:"userId"`
	BusinessName   string         `gorm:"not null" json:"businessName"`
	Description    string         `gorm:"type:text" json:"description"`
	ProfileImage   string         `gorm:"" json:"profileImage"`
	BannerImage    string         `gorm:"" json:"bannerImage"`
	Cuisines       pq.StringArray `gorm:"type:text[]" json:"cuisines"`
	Specialties    pq.StringArray `gorm:"type:text[]" json:"specialties"`
	PrepTime       string         `gorm:"" json:"prepTime"` // e.g., "30-45 min"
	MinimumOrder   float64        `gorm:"default:0" json:"minimumOrder"`
	DeliveryRadius float64        `gorm:"default:10" json:"deliveryRadius"` // in km
	ServiceRadius  float64        `gorm:"default:10" json:"serviceRadius"`  // in km
	Rating         float64        `gorm:"default:0" json:"rating"`
	TotalReviews   int            `gorm:"default:0" json:"totalReviews"`
	TotalOrders    int            `gorm:"default:0" json:"totalOrders"`
	IsVerified     bool           `gorm:"default:false" json:"verified"`
	VerifiedAt     *time.Time     `gorm:"" json:"verifiedAt"`
	IsActive       bool           `gorm:"default:true" json:"isActive"`
	AcceptingOrders bool          `gorm:"default:true" json:"acceptingOrders"`

	// Address
	AddressLine1 string  `gorm:"" json:"addressLine1"`
	AddressLine2 string  `gorm:"" json:"addressLine2"`
	City         string  `gorm:"" json:"city"`
	State        string  `gorm:"" json:"state"`
	PostalCode   string  `gorm:"" json:"postalCode"`
	Latitude     float64 `gorm:"" json:"latitude"`
	Longitude    float64 `gorm:"" json:"longitude"`

	// Bank/Payout Info
	StripeAccountID string `gorm:"" json:"-"`

	CreatedAt time.Time `gorm:"autoCreateTime" json:"createdAt"`
	UpdatedAt time.Time `gorm:"autoUpdateTime" json:"updatedAt"`

	// Relationships
	User      User           `gorm:"foreignKey:UserID" json:"user,omitempty"`
	MenuItems []MenuItem     `gorm:"foreignKey:ChefID" json:"menuItems,omitempty"`
	Schedules []ChefSchedule `gorm:"foreignKey:ChefID" json:"schedules,omitempty"`
	Orders    []Order        `gorm:"foreignKey:ChefID" json:"orders,omitempty"`
	Reviews   []Review       `gorm:"foreignKey:ChefID" json:"reviews,omitempty"`
	Posts     []Post         `gorm:"foreignKey:ChefID" json:"posts,omitempty"`
}

type ChefSchedule struct {
	ID        uuid.UUID `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	ChefID    uuid.UUID `gorm:"type:uuid;not null;index" json:"chefId"`
	DayOfWeek int       `gorm:"not null" json:"dayOfWeek"` // 0-6, Sunday-Saturday
	OpenTime  string    `gorm:"" json:"openTime"`          // HH:MM format
	CloseTime string    `gorm:"" json:"closeTime"`         // HH:MM format
	IsClosed  bool      `gorm:"default:false" json:"isClosed"`
	CreatedAt time.Time `gorm:"autoCreateTime" json:"createdAt"`
	UpdatedAt time.Time `gorm:"autoUpdateTime" json:"updatedAt"`

	Chef ChefProfile `gorm:"foreignKey:ChefID" json:"-"`
}

// DTOs
type ChefProfileResponse struct {
	ID              uuid.UUID `json:"id"`
	UserID          uuid.UUID `json:"userId"`
	BusinessName    string    `json:"businessName"`
	Description     string    `json:"description"`
	ProfileImage    string    `json:"profileImage"`
	BannerImage     string    `json:"bannerImage"`
	Cuisines        []string  `json:"cuisines"`
	Specialties     []string  `json:"specialties"`
	PrepTime        string    `json:"prepTime"`
	MinimumOrder    float64   `json:"minimumOrder"`
	ServiceRadius   float64   `json:"serviceRadius"`
	Rating          float64   `json:"rating"`
	TotalReviews    int       `json:"totalReviews"`
	TotalOrders     int       `json:"totalOrders"`
	IsVerified      bool      `json:"verified"`
	AcceptingOrders bool      `json:"acceptingOrders"`
	City            string    `json:"city"`
	State           string    `json:"state"`
}

func (c *ChefProfile) ToResponse() ChefProfileResponse {
	cuisines := []string{}
	if c.Cuisines != nil {
		cuisines = c.Cuisines
	}
	specialties := []string{}
	if c.Specialties != nil {
		specialties = c.Specialties
	}

	return ChefProfileResponse{
		ID:              c.ID,
		UserID:          c.UserID,
		BusinessName:    c.BusinessName,
		Description:     c.Description,
		ProfileImage:    c.ProfileImage,
		BannerImage:     c.BannerImage,
		Cuisines:        cuisines,
		Specialties:     specialties,
		PrepTime:        c.PrepTime,
		MinimumOrder:    c.MinimumOrder,
		ServiceRadius:   c.ServiceRadius,
		Rating:          c.Rating,
		TotalReviews:    c.TotalReviews,
		TotalOrders:     c.TotalOrders,
		IsVerified:      c.IsVerified,
		AcceptingOrders: c.AcceptingOrders,
		City:            c.City,
		State:           c.State,
	}
}
