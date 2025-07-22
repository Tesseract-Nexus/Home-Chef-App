package models

import (
	"time"
	"github.com/google/uuid"
)

type MenuItemCreate struct {
	Name             string           `json:"name" validate:"required"`
	Description      string           `json:"description" validate:"required"`
	Price            float64          `json:"price" validate:"required,gt=0"`
	Category         string           `json:"category" validate:"required"`
	CuisineType      string           `json:"cuisine_type"`
	IsVegetarian     bool             `json:"is_vegetarian"`
	IsVegan          bool             `json:"is_vegan"`
	IsGlutenFree     bool             `json:"is_gluten_free"`
	SpiceLevel       string           `json:"spice_level" validate:"oneof=mild medium hot"`
	PreparationTime  int              `json:"preparation_time"`
	Serves           int              `json:"serves"`
	Ingredients      []string         `json:"ingredients"`
	Allergens        []string         `json:"allergens"`
	NutritionalInfo  NutritionalInfo  `json:"nutritional_info"`
	IsAvailable      bool             `json:"is_available"`
}

type MenuItemUpdate struct {
	Name            *string  `json:"name"`
	Description     *string  `json:"description"`
	Price           *float64 `json:"price" validate:"omitempty,gt=0"`
	IsAvailable     *bool    `json:"is_available"`
	PreparationTime *int     `json:"preparation_time"`
}

type MenuItem struct {
	ID              string           `json:"id"`
	ChefID          string           `json:"chef_id"`
	Name            string           `json:"name"`
	Description     string           `json:"description"`
	Price           float64          `json:"price"`
	Category        string           `json:"category"`
	CuisineType     string           `json:"cuisine_type"`
	IsVegetarian    bool             `json:"is_vegetarian"`
	IsVegan         bool             `json:"is_vegan"`
	IsGlutenFree    bool             `json:"is_gluten_free"`
	SpiceLevel      string           `json:"spice_level"`
	PreparationTime int              `json:"preparation_time"`
	Serves          int              `json:"serves"`
	Ingredients     []string         `json:"ingredients"`
	Allergens       []string         `json:"allergens"`
	NutritionalInfo NutritionalInfo  `json:"nutritional_info"`
	Images          []string         `json:"images"`
	IsAvailable     bool             `json:"is_available"`
	CreatedAt       time.Time        `json:"created_at"`
	UpdatedAt       time.Time        `json:"updated_at"`
}

type NutritionalInfo struct {
	Calories int     `json:"calories"`
	Protein  float64 `json:"protein"`
	Carbs    float64 `json:"carbs"`
	Fat      float64 `json:"fat"`
}

type MenuAvailabilityUpdate struct {
	IsAvailable bool    `json:"is_available" validate:"required"`
	Reason      *string `json:"reason"`
}