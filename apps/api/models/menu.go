package models

import (
	"time"

	"github.com/google/uuid"
	"github.com/lib/pq"
	"gorm.io/gorm"
)

type MenuItem struct {
	ID              uuid.UUID      `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	ChefID          uuid.UUID      `gorm:"type:uuid;not null;index" json:"chefId"`
	Name            string         `gorm:"not null" json:"name"`
	Description     string         `gorm:"type:text" json:"description"`
	Price           float64        `gorm:"not null" json:"price"`
	Category        string         `gorm:"" json:"category"`
	Image           string         `gorm:"" json:"image"`
	PrepTime        int            `gorm:"" json:"prepTime"` // in minutes
	ServingSize     string         `gorm:"" json:"servingSize"`
	Calories        int            `gorm:"" json:"calories"`
	DietaryTags     pq.StringArray `gorm:"type:text[]" json:"dietaryTags"` // vegetarian, vegan, gluten-free, etc.
	Allergens       pq.StringArray `gorm:"type:text[]" json:"allergens"`
	Ingredients     pq.StringArray `gorm:"type:text[]" json:"ingredients"`
	SpiceLevel      int            `gorm:"default:0" json:"spiceLevel"` // 0-5
	IsAvailable     bool           `gorm:"default:true" json:"available"`
	IsFeatured      bool           `gorm:"default:false" json:"featured"`
	TotalOrders     int            `gorm:"default:0" json:"totalOrders"`
	Rating          float64        `gorm:"default:0" json:"rating"`
	TotalReviews    int            `gorm:"default:0" json:"totalReviews"`
	SortOrder       int            `gorm:"default:0" json:"sortOrder"`
	CreatedAt       time.Time      `gorm:"autoCreateTime" json:"createdAt"`
	UpdatedAt       time.Time      `gorm:"autoUpdateTime" json:"updatedAt"`
	DeletedAt       gorm.DeletedAt `gorm:"index" json:"-"`

	// Relationships
	Chef   ChefProfile     `gorm:"foreignKey:ChefID" json:"chef,omitempty"`
	Images []MenuItemImage `gorm:"foreignKey:MenuItemID" json:"images,omitempty"`
}

type MenuItemImage struct {
	ID         uuid.UUID `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	MenuItemID uuid.UUID `gorm:"type:uuid;not null;index" json:"menuItemId"`
	URL        string    `gorm:"not null" json:"url"`
	IsPrimary  bool      `gorm:"default:false" json:"isPrimary"`
	SortOrder  int       `gorm:"default:0" json:"sortOrder"`
	CreatedAt  time.Time `gorm:"autoCreateTime" json:"createdAt"`

	MenuItem MenuItem `gorm:"foreignKey:MenuItemID" json:"-"`
}

// DTOs
type MenuItemResponse struct {
	ID          uuid.UUID `json:"id"`
	ChefID      uuid.UUID `json:"chefId"`
	Name        string    `json:"name"`
	Description string    `json:"description"`
	Price       float64   `json:"price"`
	Category    string    `json:"category"`
	Image       string    `json:"image"`
	PrepTime    int       `json:"prepTime"`
	ServingSize string    `json:"servingSize"`
	Calories    int       `json:"calories"`
	DietaryTags []string  `json:"dietaryTags"`
	SpiceLevel  int       `json:"spiceLevel"`
	IsAvailable bool      `json:"available"`
	IsFeatured  bool      `json:"featured"`
	Rating      float64   `json:"rating"`
}

func (m *MenuItem) ToResponse() MenuItemResponse {
	dietaryTags := []string{}
	if m.DietaryTags != nil {
		dietaryTags = m.DietaryTags
	}

	return MenuItemResponse{
		ID:          m.ID,
		ChefID:      m.ChefID,
		Name:        m.Name,
		Description: m.Description,
		Price:       m.Price,
		Category:    m.Category,
		Image:       m.Image,
		PrepTime:    m.PrepTime,
		ServingSize: m.ServingSize,
		Calories:    m.Calories,
		DietaryTags: dietaryTags,
		SpiceLevel:  m.SpiceLevel,
		IsAvailable: m.IsAvailable,
		IsFeatured:  m.IsFeatured,
		Rating:      m.Rating,
	}
}
