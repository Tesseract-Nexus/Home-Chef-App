package models

import (
	"time"

	"github.com/google/uuid"
	"github.com/lib/pq"
	"gorm.io/gorm"
)

// MenuCategory represents a chef-scoped menu category (e.g., "Starters", "Main Course", "Desserts")
type MenuCategory struct {
	ID          uuid.UUID      `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	ChefID      uuid.UUID      `gorm:"type:uuid;not null;uniqueIndex:idx_menu_categories_chef_name" json:"chefId"`
	Name        string         `gorm:"not null;uniqueIndex:idx_menu_categories_chef_name" json:"name"`
	Description string         `gorm:"type:text" json:"description,omitempty"`
	SortOrder   int            `gorm:"default:0" json:"sortOrder"`
	IsActive    bool           `gorm:"default:true" json:"isActive"`
	CreatedAt   time.Time      `gorm:"autoCreateTime" json:"createdAt"`
	UpdatedAt   time.Time      `gorm:"autoUpdateTime" json:"updatedAt"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`

	Chef ChefProfile `gorm:"foreignKey:ChefID" json:"-"`
}

type MenuItem struct {
	ID           uuid.UUID      `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	ChefID       uuid.UUID      `gorm:"type:uuid;not null;index" json:"chefId"`
	CategoryID   *uuid.UUID     `gorm:"type:uuid;index" json:"categoryId,omitempty"`
	Name         string         `gorm:"not null" json:"name"`
	Description  string         `gorm:"type:text" json:"description,omitempty"`
	Price        float64        `gorm:"not null" json:"price"`
	ComparePrice float64        `gorm:"default:0" json:"comparePrice,omitempty"`
	ImageURL     string         `gorm:"" json:"imageUrl,omitempty"`
	DietaryTags  pq.StringArray `gorm:"type:text[]" json:"dietaryTags"`
	Allergens    pq.StringArray `gorm:"type:text[]" json:"allergens"`
	Ingredients  pq.StringArray `gorm:"type:text[]" json:"ingredients"`
	PrepTime     int            `gorm:"" json:"prepTime"`
	PortionSize  string         `gorm:"" json:"portionSize,omitempty"`
	Serves       int            `gorm:"default:1" json:"serves"`
	SpiceLevel   int            `gorm:"default:0" json:"spiceLevel"`
	IsAvailable  bool           `gorm:"default:true" json:"isAvailable"`
	IsFeatured   bool           `gorm:"default:false" json:"isFeatured"`
	TotalOrders  int            `gorm:"default:0" json:"totalOrders"`
	Rating       float64        `gorm:"default:0" json:"rating"`
	TotalReviews int            `gorm:"default:0" json:"totalReviews"`
	SortOrder    int            `gorm:"default:0" json:"sortOrder"`
	CreatedAt    time.Time      `gorm:"autoCreateTime" json:"createdAt"`
	UpdatedAt    time.Time      `gorm:"autoUpdateTime" json:"updatedAt"`
	DeletedAt    gorm.DeletedAt `gorm:"index" json:"-"`

	// Relationships
	Chef     ChefProfile     `gorm:"foreignKey:ChefID" json:"-"`
	Category *MenuCategory   `gorm:"foreignKey:CategoryID" json:"-"`
	Images   []MenuItemImage `gorm:"foreignKey:MenuItemID" json:"images,omitempty"`
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
	ImageURL    string    `json:"imageUrl,omitempty"`
	PrepTime    int       `json:"prepTime"`
	PortionSize string    `json:"portionSize,omitempty"`
	Serves      int       `json:"serves"`
	DietaryTags []string  `json:"dietaryTags"`
	SpiceLevel  int       `json:"spiceLevel"`
	IsAvailable bool      `json:"isAvailable"`
	IsFeatured  bool      `json:"isFeatured"`
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
		ImageURL:    m.ImageURL,
		PrepTime:    m.PrepTime,
		PortionSize: m.PortionSize,
		Serves:      m.Serves,
		DietaryTags: dietaryTags,
		SpiceLevel:  m.SpiceLevel,
		IsAvailable: m.IsAvailable,
		IsFeatured:  m.IsFeatured,
		Rating:      m.Rating,
	}
}
