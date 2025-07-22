package models

import (
	"time"
	"github.com/google/uuid"
)

type Address struct {
	ID           string      `json:"id" gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
	UserID       string      `json:"user_id" gorm:"not null"`
	Type         string      `json:"type" gorm:"not null"`
	Label        string      `json:"label"`
	FullAddress  string      `json:"full_address" gorm:"not null"`
	Landmark     string      `json:"landmark"`
	Pincode      string      `json:"pincode" gorm:"not null"`
	City         string      `json:"city" gorm:"not null"`
	State        string      `json:"state" gorm:"not null"`
	IsDefault    bool        `json:"is_default" gorm:"default:false"`
	Coordinates  Coordinates `json:"coordinates" gorm:"embedded"`
	Instructions string      `json:"instructions"`
	CreatedAt    time.Time   `json:"created_at"`
	UpdatedAt    time.Time   `json:"updated_at"`
}

type Coordinates struct {
	Latitude  float64 `json:"latitude" gorm:"column:latitude"`
	Longitude float64 `json:"longitude" gorm:"column:longitude"`
}

type AddressCreate struct {
	Type         string       `json:"type" validate:"required,oneof=home work holiday temporary"`
	Label        string       `json:"label"`
	FullAddress  string       `json:"full_address" validate:"required"`
	Landmark     string       `json:"landmark"`
	Pincode      string       `json:"pincode" validate:"required,regex=^[1-9][0-9]{5}$"`
	City         string       `json:"city" validate:"required"`
	State        string       `json:"state" validate:"required"`
	IsDefault    bool         `json:"is_default"`
	Coordinates  *Coordinates `json:"coordinates"`
	Instructions string       `json:"instructions"`
}

type AddressUpdate struct {
	Label        *string `json:"label"`
	FullAddress  *string `json:"full_address"`
	Landmark     *string `json:"landmark"`
	Instructions *string `json:"instructions"`
}

type AddressValidation struct {
	Address string `json:"address" validate:"required"`
	Pincode string `json:"pincode" validate:"required"`
	City    string `json:"city"`
	State   string `json:"state"`
}

type ValidationResult struct {
	IsValid       bool        `json:"is_valid"`
	IsServiceable bool        `json:"is_serviceable"`
	Coordinates   Coordinates `json:"coordinates"`
	Suggestions   []string    `json:"suggestions"`
}

// GeocodeResponse represents response from geocoding service
type GeocodeResponse struct {
	Results []struct {
		FormattedAddress string `json:"formatted_address"`
		Geometry         struct {
			Location struct {
				Lat float64 `json:"lat"`
				Lng float64 `json:"lng"`
			} `json:"location"`
		} `json:"geometry"`
		AddressComponents []struct {
			LongName  string   `json:"long_name"`
			ShortName string   `json:"short_name"`
			Types     []string `json:"types"`
		} `json:"address_components"`
	} `json:"results"`
	Status string `json:"status"`
}

// ServiceabilityCheck represents areas where service is available
type ServiceabilityCheck struct {
	Pincode       string  `json:"pincode"`
	City          string  `json:"city"`
	State         string  `json:"state"`
	IsServiceable bool    `json:"is_serviceable"`
	DeliveryTime  int     `json:"delivery_time"` // in minutes
	DeliveryFee   float64 `json:"delivery_fee"`
}