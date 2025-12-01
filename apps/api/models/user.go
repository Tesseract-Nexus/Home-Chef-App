package models

import "gorm.io/gorm"

type Role string

const (
	AdminRole    Role = "admin"
	ChefRole     Role = "chef"
	DriverRole   Role = "driver"
	CustomerRole Role = "customer"
)

type User struct {
	gorm.Model
	Name     string `json:"name"`
	Email    string `json:"email" gorm:"unique"`
	Password string `json:"-"` // Omit from JSON responses
	Role     Role   `json:"role"`
	AvatarURL string `json:"avatar_url"`
	Phone    string `json:"phone"`
	Points   int    `json:"points" gorm:"default:0"`
}
