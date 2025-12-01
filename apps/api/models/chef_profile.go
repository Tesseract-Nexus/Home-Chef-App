package models

import "gorm.io/gorm"

type ChefProfile struct {
	gorm.Model
	UserID        uint   `json:"user_id" gorm:"unique"`
	User          User   `json:"user"`
	KitchenName   string `json:"kitchen_name"`
	Bio           string `json:"bio"`
	Address       string `json:"address"`
	City          string `json:"city"`
	State         string `json:"state"`
	ZipCode       string `json:"zip_code"`
	CertificateURL string `json:"certificate_url"`
	IsVerified    bool   `json:"is_verified" gorm:"default:false"`
}
