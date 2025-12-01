package models

import (
	"gorm.io/gorm"
)

type MenuItem struct {
	gorm.Model
	ChefProfileID uint   `json:"chef_profile_id"`
	ChefProfile   ChefProfile `json:"chef_profile"`
	Name          string `json:"name"`
	Description   string `json:"description"`
	Price         float64 `json:"price"`
	ImageURL      string `json:"image_url"`
	IsAvailable   bool   `json:"is_available" gorm:"default:true"`
}
