package models

import (
	"time"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

// Base model with common fields
type BaseModel struct {
	ID        string         `json:"id" gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `json:"-" gorm:"index"`
}

// User represents the users table
type User struct {
	BaseModel
	Email       string    `json:"email" gorm:"uniqueIndex;not null"`
	Password    string    `json:"-" gorm:"not null"`
	FirstName   string    `json:"first_name"`
	LastName    string    `json:"last_name"`
	Phone       string    `json:"phone" gorm:"uniqueIndex"`
	Role        string    `json:"role" gorm:"default:'customer'"`
	Status      string    `json:"status" gorm:"default:'active'"`
	Avatar      string    `json:"avatar"`
	DateOfBirth time.Time `json:"date_of_birth"`
	
	// Relationships
	ChefProfile     *ChefProfile     `json:"chef_profile,omitempty" gorm:"foreignKey:UserID"`
	DeliveryProfile *DeliveryProfile `json:"delivery_profile,omitempty" gorm:"foreignKey:UserID"`
	Addresses       []Address        `json:"addresses,omitempty" gorm:"foreignKey:UserID"`
	Orders          []Order          `json:"orders,omitempty" gorm:"foreignKey:CustomerID"`
}

// ChefProfile represents chef-specific information
type ChefProfile struct {
	BaseModel
	UserID             string    `json:"user_id" gorm:"uniqueIndex;not null"`
	Name               string    `json:"name" gorm:"not null"`
	Specialty          string    `json:"specialty"`
	Description        string    `json:"description"`
	Avatar             string    `json:"avatar"`
	CoverImage         string    `json:"cover_image"`
	Rating             float64   `json:"rating" gorm:"default:0"`
	TotalReviews       int       `json:"total_reviews" gorm:"default:0"`
	TotalOrders        int       `json:"total_orders" gorm:"default:0"`
	City               string    `json:"city"`
	State              string    `json:"state"`
	Latitude           float64   `json:"latitude"`
	Longitude          float64   `json:"longitude"`
	CuisineTypes       string    `json:"cuisine_types" gorm:"type:text"` // JSON array as string
	DietaryPreferences string    `json:"dietary_preferences" gorm:"type:text"` // JSON array as string
	WorkingHoursStart  string    `json:"working_hours_start"`
	WorkingHoursEnd    string    `json:"working_hours_end"`
	WorkingDays        string    `json:"working_days" gorm:"type:text"` // JSON array as string
	MinOrderAmount     float64   `json:"min_order_amount" gorm:"default:0"`
	DeliveryRadius     float64   `json:"delivery_radius" gorm:"default:5"`
	AvgPrepTime        int       `json:"avg_preparation_time" gorm:"default:30"`
	Status             string    `json:"status" gorm:"default:'pending'"`
	VerificationStatus string    `json:"verification_status" gorm:"default:'pending'"`
	IsAvailable        bool      `json:"is_available" gorm:"default:true"`
	Badges             string    `json:"badges" gorm:"type:text"` // JSON array as string
	
	// Relationships
	User      User       `json:"user" gorm:"foreignKey:UserID"`
	MenuItems []MenuItem `json:"menu_items,omitempty" gorm:"foreignKey:ChefID"`
	Orders    []Order    `json:"orders,omitempty" gorm:"foreignKey:ChefID"`
}

// DeliveryProfile represents delivery partner information
type DeliveryProfile struct {
	BaseModel
	UserID           string  `json:"user_id" gorm:"uniqueIndex;not null"`
	VehicleType      string  `json:"vehicle_type"`
	VehicleNumber    string  `json:"vehicle_number"`
	LicenseNumber    string  `json:"license_number"`
	Rating           float64 `json:"rating" gorm:"default:0"`
	TotalDeliveries  int     `json:"total_deliveries" gorm:"default:0"`
	Status           string  `json:"status" gorm:"default:'pending'"`
	IsAvailable      bool    `json:"is_available" gorm:"default:false"`
	CurrentLatitude  float64 `json:"current_latitude"`
	CurrentLongitude float64 `json:"current_longitude"`
	
	// Relationships
	User User `json:"user" gorm:"foreignKey:UserID"`
}

// Address represents user addresses
type Address struct {
	BaseModel
	UserID      string  `json:"user_id" gorm:"not null"`
	Type        string  `json:"type" gorm:"default:'home'"` // home, work, other
	Street      string  `json:"street" gorm:"not null"`
	City        string  `json:"city" gorm:"not null"`
	State       string  `json:"state" gorm:"not null"`
	Pincode     string  `json:"pincode" gorm:"not null"`
	Latitude    float64 `json:"latitude"`
	Longitude   float64 `json:"longitude"`
	IsDefault   bool    `json:"is_default" gorm:"default:false"`
	
	// Relationships
	User User `json:"user" gorm:"foreignKey:UserID"`
}

// MenuItem represents menu items
type MenuItem struct {
	BaseModel
	ChefID          string  `json:"chef_id" gorm:"not null"`
	Name            string  `json:"name" gorm:"not null"`
	Description     string  `json:"description"`
	Price           float64 `json:"price" gorm:"not null"`
	Category        string  `json:"category" gorm:"not null"`
	CuisineType     string  `json:"cuisine_type"`
	IsVegetarian    bool    `json:"is_vegetarian" gorm:"default:false"`
	IsVegan         bool    `json:"is_vegan" gorm:"default:false"`
	IsGlutenFree    bool    `json:"is_gluten_free" gorm:"default:false"`
	SpiceLevel      string  `json:"spice_level" gorm:"default:'medium'"`
	PreparationTime int     `json:"preparation_time" gorm:"default:30"`
	Serves          int     `json:"serves" gorm:"default:1"`
	Ingredients     string  `json:"ingredients" gorm:"type:text"` // JSON array as string
	Allergens       string  `json:"allergens" gorm:"type:text"`   // JSON array as string
	Images          string  `json:"images" gorm:"type:text"`      // JSON array as string
	Calories        int     `json:"calories" gorm:"default:0"`
	Protein         float64 `json:"protein" gorm:"default:0"`
	Carbs           float64 `json:"carbs" gorm:"default:0"`
	Fat             float64 `json:"fat" gorm:"default:0"`
	IsAvailable     bool    `json:"is_available" gorm:"default:true"`
	
	// Relationships
	Chef ChefProfile `json:"chef" gorm:"foreignKey:ChefID"`
}

// Order represents orders
type Order struct {
	BaseModel
	CustomerID          string      `json:"customer_id" gorm:"not null"`
	ChefID              string      `json:"chef_id" gorm:"not null"`
	DeliveryPartnerID   *string     `json:"delivery_partner_id"`
	Status              string      `json:"status" gorm:"default:'pending'"`
	TotalAmount         float64     `json:"total_amount" gorm:"not null"`
	DeliveryFee         float64     `json:"delivery_fee" gorm:"default:0"`
	TaxAmount           float64     `json:"tax_amount" gorm:"default:0"`
	TipAmount           float64     `json:"tip_amount" gorm:"default:0"`
	DeliveryAddress     string      `json:"delivery_address" gorm:"type:text"` // JSON object as string
	EstimatedDelivery   time.Time   `json:"estimated_delivery"`
	ActualDelivery      *time.Time  `json:"actual_delivery"`
	SpecialInstructions string      `json:"special_instructions"`
	PaymentMethod       string      `json:"payment_method"`
	PaymentStatus       string      `json:"payment_status" gorm:"default:'pending'"`
	
	// Relationships
	Customer        User             `json:"customer" gorm:"foreignKey:CustomerID"`
	Chef            ChefProfile      `json:"chef" gorm:"foreignKey:ChefID"`
	DeliveryPartner *DeliveryProfile `json:"delivery_partner,omitempty" gorm:"foreignKey:DeliveryPartnerID"`
	OrderItems      []OrderItem      `json:"order_items,omitempty" gorm:"foreignKey:OrderID"`
	Reviews         []Review         `json:"reviews,omitempty" gorm:"foreignKey:OrderID"`
}

// OrderItem represents individual items in an order
type OrderItem struct {
	BaseModel
	OrderID     string  `json:"order_id" gorm:"not null"`
	MenuItemID  string  `json:"menu_item_id" gorm:"not null"`
	Quantity    int     `json:"quantity" gorm:"not null"`
	Price       float64 `json:"price" gorm:"not null"`
	Notes       string  `json:"notes"`
	
	// Relationships
	Order    Order    `json:"order" gorm:"foreignKey:OrderID"`
	MenuItem MenuItem `json:"menu_item" gorm:"foreignKey:MenuItemID"`
}

// Review represents order reviews
type Review struct {
	BaseModel
	OrderID      string `json:"order_id" gorm:"not null"`
	CustomerID   string `json:"customer_id" gorm:"not null"`
	ChefID       string `json:"chef_id" gorm:"not null"`
	Rating       int    `json:"rating" gorm:"not null"`
	Comment      string `json:"comment"`
	FoodRating   int    `json:"food_rating"`
	ServiceRating int   `json:"service_rating"`
	DeliveryRating int  `json:"delivery_rating"`
	
	// Relationships
	Order    Order       `json:"order" gorm:"foreignKey:OrderID"`
	Customer User        `json:"customer" gorm:"foreignKey:CustomerID"`
	Chef     ChefProfile `json:"chef" gorm:"foreignKey:ChefID"`
}

// Notification represents system notifications
type Notification struct {
	BaseModel
	UserID    string    `json:"user_id" gorm:"not null"`
	Type      string    `json:"type" gorm:"not null"`
	Title     string    `json:"title" gorm:"not null"`
	Message   string    `json:"message" gorm:"not null"`
	Data      string    `json:"data" gorm:"type:text"` // JSON data as string
	IsRead    bool      `json:"is_read" gorm:"default:false"`
	ReadAt    *time.Time `json:"read_at"`
	
	// Relationships
	User User `json:"user" gorm:"foreignKey:UserID"`
}

// Order management models
type Order struct {
	BaseModel
	CustomerID          string      `json:"customer_id" gorm:"not null"`
	ChefID              string      `json:"chef_id" gorm:"not null"`
	DeliveryPartnerID   *string     `json:"delivery_partner_id"`
	Status              string      `json:"status" gorm:"default:'pending'"`
	TotalAmount         float64     `json:"total_amount" gorm:"not null"`
	DeliveryFee         float64     `json:"delivery_fee" gorm:"default:0"`
	TaxAmount           float64     `json:"tax_amount" gorm:"default:0"`
	TipAmount           float64     `json:"tip_amount" gorm:"default:0"`
	DeliveryAddress     string      `json:"delivery_address" gorm:"type:text"`
	EstimatedDelivery   time.Time   `json:"estimated_delivery"`
	ActualDelivery      *time.Time  `json:"actual_delivery"`
	SpecialInstructions string      `json:"special_instructions"`
	PaymentMethod       string      `json:"payment_method"`
	PaymentStatus       string      `json:"payment_status" gorm:"default:'pending'"`
	CountdownExpiry     *time.Time  `json:"countdown_expiry"`
	CanCancelFree       bool        `json:"can_cancel_free" gorm:"default:true"`
	
	// Relationships
	Customer        User             `json:"customer" gorm:"foreignKey:CustomerID"`
	Chef            ChefProfile      `json:"chef" gorm:"foreignKey:ChefID"`
	DeliveryPartner *DeliveryProfile `json:"delivery_partner,omitempty" gorm:"foreignKey:DeliveryPartnerID"`
	OrderItems      []OrderItem      `json:"order_items,omitempty" gorm:"foreignKey:OrderID"`
	Reviews         []Review         `json:"reviews,omitempty" gorm:"foreignKey:OrderID"`
	Tips            []Tip            `json:"tips,omitempty" gorm:"foreignKey:OrderID"`
}

// OrderItem represents individual items in an order
type OrderItem struct {
	BaseModel
	OrderID     string  `json:"order_id" gorm:"not null"`
	MenuItemID  string  `json:"menu_item_id" gorm:"not null"`
	Quantity    int     `json:"quantity" gorm:"not null"`
	Price       float64 `json:"price" gorm:"not null"`
	Notes       string  `json:"notes"`
	
	// Relationships
	Order    Order    `json:"order" gorm:"foreignKey:OrderID"`
	MenuItem MenuItem `json:"menu_item" gorm:"foreignKey:MenuItemID"`
}

// Tip represents tips given to chefs or delivery partners
type Tip struct {
	BaseModel
	OrderID       string  `json:"order_id" gorm:"not null"`
	CustomerID    string  `json:"customer_id" gorm:"not null"`
	RecipientID   string  `json:"recipient_id" gorm:"not null"`
	RecipientType string  `json:"recipient_type" gorm:"not null"`
	Amount        float64 `json:"amount" gorm:"not null"`
	Message       string  `json:"message"`
	Status        string  `json:"status" gorm:"default:'pending'"`
	TransferID    string  `json:"transfer_id"`
	
	// Relationships
	Order    Order `json:"order" gorm:"foreignKey:OrderID"`
	Customer User  `json:"customer" gorm:"foreignKey:CustomerID"`
}

// Rewards system models
type RewardToken struct {
	BaseModel
	UserID      string  `json:"user_id" gorm:"not null"`
	Amount      int     `json:"amount" gorm:"not null"`
	Type        string  `json:"type" gorm:"not null"`
	Source      string  `json:"source" gorm:"not null"`
	OrderID     *string `json:"order_id"`
	ExpiresAt   *time.Time `json:"expires_at"`
	
	// Relationships
	User User `json:"user" gorm:"foreignKey:UserID"`
}

type RewardRedemption struct {
	BaseModel
	UserID      string  `json:"user_id" gorm:"not null"`
	Tokens      int     `json:"tokens" gorm:"not null"`
	RewardType  string  `json:"reward_type" gorm:"not null"`
	OrderID     *string `json:"order_id"`
	Value       float64 `json:"value"`
	
	// Relationships
	User User `json:"user" gorm:"foreignKey:UserID"`
}

// BeforeCreate hook to generate UUID
func (base *BaseModel) BeforeCreate(tx *gorm.DB) error {
	if base.ID == "" {
		base.ID = uuid.New().String()
	}
	return nil
}