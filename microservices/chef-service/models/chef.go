package models

import (
	"time"
	"github.com/google/uuid"
)

type ChefSearch struct {
	ID           string   `json:"id"`
	Name         string   `json:"name"`
	Specialty    string   `json:"specialty"`
	CuisineTypes []string `json:"cuisine_types"`
	Rating       float64  `json:"rating"`
	ReviewCount  int      `json:"review_count"`
	Location     string   `json:"location"`
	Distance     string   `json:"distance"`
	DeliveryTime string   `json:"delivery_time"`
	DeliveryFee  float64  `json:"delivery_fee"`
	MinOrder     float64  `json:"min_order"`
	IsOpen       bool     `json:"is_open"`
	HasOffers    bool     `json:"has_offers"`
	Discount     *string  `json:"discount"`
	Badges       []string `json:"badges"`
	Image        string   `json:"image"`
}

type ChefApplication struct {
	PersonalInfo     PersonalInfo     `json:"personal_info" validate:"required"`
	ProfessionalInfo ProfessionalInfo `json:"professional_info" validate:"required"`
	BusinessInfo     BusinessInfo     `json:"business_info" validate:"required"`
	Documents        Documents        `json:"documents" validate:"required"`
}

type PersonalInfo struct {
	Name        string    `json:"name" validate:"required"`
	Email       string    `json:"email" validate:"required,email"`
	Phone       string    `json:"phone" validate:"required,regex=^\\+91[6-9]\\d{9}$"`
	DateOfBirth time.Time `json:"date_of_birth"`
	Address     Address   `json:"address" validate:"required"`
}

type ProfessionalInfo struct {
	Specialty           string   `json:"specialty" validate:"required"`
	Experience          string   `json:"experience" validate:"required"`
	Description         string   `json:"description"`
	CuisineTypes        []string `json:"cuisine_types"`
	DietaryPreferences  []string `json:"dietary_preferences"`
	CookingStyle        string   `json:"cooking_style"`
}

type BusinessInfo struct {
	KitchenType      string      `json:"kitchen_type" validate:"oneof=home commercial"`
	Capacity         string      `json:"capacity"`
	WorkingHours     WorkingHours `json:"working_hours"`
	WorkingDays      []string    `json:"working_days"`
	MinOrderAmount   float64     `json:"min_order_amount"`
	DeliveryRadius   float64     `json:"delivery_radius"`
}

type WorkingHours struct {
	Start string `json:"start" validate:"required"`
	End   string `json:"end" validate:"required"`
}

type Documents struct {
	IdentityProof  string      `json:"identity_proof"`
	AddressProof   string      `json:"address_proof"`
	FSSAILicense   string      `json:"fssai_license"`
	BankDetails    BankDetails `json:"bank_details"`
}

type Address struct {
	Street      string      `json:"street" validate:"required"`
	City        string      `json:"city" validate:"required"`
	State       string      `json:"state" validate:"required"`
	Pincode     string      `json:"pincode" validate:"required,regex=^[1-9][0-9]{5}$"`
	Coordinates Coordinates `json:"coordinates"`
}

type Coordinates struct {
	Latitude  float64 `json:"latitude"`
	Longitude float64 `json:"longitude"`
}

type BankDetails struct {
	AccountNumber     string `json:"account_number" validate:"required"`
	IFSCCode         string `json:"ifsc_code" validate:"required,regex=^[A-Z]{4}0[A-Z0-9]{6}$"`
	AccountHolderName string `json:"account_holder_name" validate:"required"`
	BankName         string `json:"bank_name" validate:"required"`
}

type ChefProfile struct {
	ID                 string               `json:"id"`
	UserID             string               `json:"user_id"`
	Name               string               `json:"name"`
	Specialty          string               `json:"specialty"`
	Description        string               `json:"description"`
	Avatar             string               `json:"avatar"`
	CoverImage         string               `json:"cover_image"`
	Rating             float64              `json:"rating"`
	TotalReviews       int                  `json:"total_reviews"`
	TotalOrders        int                  `json:"total_orders"`
	Location           Location             `json:"location"`
	CuisineTypes       []string             `json:"cuisine_types"`
	DietaryPreferences []string             `json:"dietary_preferences"`
	BusinessInfo       ChefBusinessInfo     `json:"business_info"`
	Status             string               `json:"status"`
	VerificationStatus string               `json:"verification_status"`
	Badges             []string             `json:"badges"`
	CreatedAt          time.Time            `json:"created_at"`
}

type Location struct {
	City        string      `json:"city"`
	State       string      `json:"state"`
	Coordinates Coordinates `json:"coordinates"`
}

type ChefBusinessInfo struct {
	WorkingHours          WorkingHours `json:"working_hours"`
	WorkingDays           []string     `json:"working_days"`
	MinOrderAmount        float64      `json:"min_order_amount"`
	DeliveryRadius        float64      `json:"delivery_radius"`
	AvgPreparationTime    int          `json:"avg_preparation_time"`
}

type ChefProfileUpdate struct {
	Description  string           `json:"description"`
	CuisineTypes []string         `json:"cuisine_types"`
	BusinessInfo ChefBusinessInfo `json:"business_info"`
}

type AvailabilityUpdate struct {
	IsAvailable       bool       `json:"is_available" validate:"required"`
	UnavailableReason *string    `json:"unavailable_reason"`
	EstimatedReturn   *time.Time `json:"estimated_return"`
}

type VacationRequest struct {
	StartDate time.Time `json:"start_date" validate:"required"`
	EndDate   time.Time `json:"end_date" validate:"required"`
	Reason    string    `json:"reason"`
}