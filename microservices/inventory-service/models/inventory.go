package models

import (
	"time"
	"github.com/google/uuid"
)

type Ingredient struct {
	ID              string          `json:"id" gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
	ChefID          string          `json:"chef_id" gorm:"not null;index"`
	Name            string          `json:"name" gorm:"not null"`
	Category        string          `json:"category" gorm:"not null"`
	CurrentStock    IngredientStock `json:"current_stock" gorm:"embedded"`
	MinimumStock    float64         `json:"minimum_stock" gorm:"not null"`
	CostPerUnit     float64         `json:"cost_per_unit" gorm:"default:0"`
	Supplier        string          `json:"supplier"`
	ExpiryDate      *time.Time      `json:"expiry_date"`
	StorageLocation string          `json:"storage_location"`
	Status          string          `json:"status" gorm:"default:'in_stock'"`
	CreatedAt       time.Time       `json:"created_at"`
	UpdatedAt       time.Time       `json:"updated_at"`
	LastUpdated     time.Time       `json:"last_updated" gorm:"default:CURRENT_TIMESTAMP"`
	
	// Relationships
	StockMovements []StockMovement `json:"stock_movements,omitempty" gorm:"foreignKey:IngredientID"`
	RecipeItems    []RecipeIngredient `json:"recipe_items,omitempty" gorm:"foreignKey:IngredientID"`
}

type IngredientStock struct {
	Quantity float64 `json:"quantity" gorm:"column:quantity;default:0"`
	Unit     string  `json:"unit" gorm:"column:unit;not null"`
}

type StockMovement struct {
	ID           string    `json:"id" gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
	IngredientID string    `json:"ingredient_id" gorm:"not null;index"`
	ChefID       string    `json:"chef_id" gorm:"not null"`
	Type         string    `json:"type" gorm:"not null"` // add, subtract, set, waste, expired
	Quantity     float64   `json:"quantity" gorm:"not null"`
	Unit         string    `json:"unit" gorm:"not null"`
	PreviousQty  float64   `json:"previous_quantity"`
	NewQty       float64   `json:"new_quantity"`
	Reason       string    `json:"reason"`
	OrderID      *string   `json:"order_id"`
	Cost         float64   `json:"cost" gorm:"default:0"`
	CreatedAt    time.Time `json:"created_at"`
	
	// Relationships
	Ingredient Ingredient `json:"ingredient" gorm:"foreignKey:IngredientID"`
}

type RecipeIngredient struct {
	ID           string  `json:"id" gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
	DishID       string  `json:"dish_id" gorm:"not null;index"`
	IngredientID string  `json:"ingredient_id" gorm:"not null"`
	Quantity     float64 `json:"quantity" gorm:"not null"`
	Unit         string  `json:"unit" gorm:"not null"`
	IsOptional   bool    `json:"is_optional" gorm:"default:false"`
	Substitutes  string  `json:"substitutes" gorm:"type:text"` // JSON array as string
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
	
	// Relationships
	Ingredient Ingredient `json:"ingredient" gorm:"foreignKey:IngredientID"`
}

type InventoryAlert struct {
	ID           string    `json:"id" gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
	ChefID       string    `json:"chef_id" gorm:"not null;index"`
	IngredientID string    `json:"ingredient_id" gorm:"not null"`
	Type         string    `json:"type" gorm:"not null"` // low_stock, expiry, out_of_stock
	Priority     string    `json:"priority" gorm:"default:'medium'"`
	Message      string    `json:"message" gorm:"not null"`
	IsRead       bool      `json:"is_read" gorm:"default:false"`
	IsResolved   bool      `json:"is_resolved" gorm:"default:false"`
	CreatedAt    time.Time `json:"created_at"`
	ResolvedAt   *time.Time `json:"resolved_at"`
	
	// Relationships
	Ingredient Ingredient `json:"ingredient" gorm:"foreignKey:IngredientID"`
}

type AlertSettings struct {
	ID                  string  `json:"id" gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
	ChefID              string  `json:"chef_id" gorm:"uniqueIndex;not null"`
	LowStockThreshold   float64 `json:"low_stock_threshold" gorm:"default:10"`
	ExpiryWarningDays   int     `json:"expiry_warning_days" gorm:"default:3"`
	EmailNotifications  bool    `json:"email_notifications" gorm:"default:true"`
	PushNotifications   bool    `json:"push_notifications" gorm:"default:true"`
	SMSNotifications    bool    `json:"sms_notifications" gorm:"default:false"`
	CreatedAt           time.Time `json:"created_at"`
	UpdatedAt           time.Time `json:"updated_at"`
}

type Supplier struct {
	ID          string    `json:"id" gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
	Name        string    `json:"name" gorm:"not null"`
	ContactInfo string    `json:"contact_info" gorm:"type:text"` // JSON object as string
	Location    string    `json:"location"`
	Categories  string    `json:"categories" gorm:"type:text"` // JSON array as string
	Rating      float64   `json:"rating" gorm:"default:0"`
	IsActive    bool      `json:"is_active" gorm:"default:true"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

// Request/Response models
type IngredientCreate struct {
	Name            string          `json:"name" validate:"required"`
	Category        string          `json:"category" validate:"required,oneof=vegetables spices dairy meat grains others"`
	CurrentStock    IngredientStock `json:"current_stock" validate:"required"`
	MinimumStock    float64         `json:"minimum_stock" validate:"required,gt=0"`
	CostPerUnit     float64         `json:"cost_per_unit"`
	Supplier        string          `json:"supplier"`
	ExpiryDate      *time.Time      `json:"expiry_date"`
	StorageLocation string          `json:"storage_location"`
}

type IngredientUpdate struct {
	Name            *string    `json:"name"`
	MinimumStock    *float64   `json:"minimum_stock" validate:"omitempty,gt=0"`
	CostPerUnit     *float64   `json:"cost_per_unit"`
	Supplier        *string    `json:"supplier"`
	ExpiryDate      *time.Time `json:"expiry_date"`
	StorageLocation *string    `json:"storage_location"`
}

type StockUpdate struct {
	Quantity  float64 `json:"quantity" validate:"required,gt=0"`
	Unit      string  `json:"unit" validate:"required,oneof=kg grams liters ml pieces packets"`
	Operation string  `json:"operation" validate:"oneof=add subtract set"`
	Reason    string  `json:"reason"`
}

type RecipeIngredientCreate struct {
	IngredientID   string   `json:"ingredient_id" validate:"required"`
	IngredientName string   `json:"ingredient_name"`
	Quantity       float64  `json:"quantity" validate:"required,gt=0"`
	Unit           string   `json:"unit" validate:"required"`
	IsOptional     bool     `json:"is_optional"`
	Substitutes    []string `json:"substitutes"`
}

type AvailabilityCheck struct {
	Orders []OrderCheck `json:"orders" validate:"required,min=1"`
}

type OrderCheck struct {
	DishID   string `json:"dish_id" validate:"required"`
	Quantity int    `json:"quantity" validate:"required,min=1"`
}

type AvailabilityResult struct {
	CanFulfill         bool                    `json:"can_fulfill"`
	MissingIngredients []MissingIngredient     `json:"missing_ingredients"`
}

type MissingIngredient struct {
	IngredientName     string  `json:"ingredient_name"`
	RequiredQuantity   float64 `json:"required_quantity"`
	AvailableQuantity  float64 `json:"available_quantity"`
	Shortage           float64 `json:"shortage"`
	Unit               string  `json:"unit"`
}

type AlertSettingsUpdate struct {
	LowStockThreshold   *float64 `json:"low_stock_threshold"`
	ExpiryWarningDays   *int     `json:"expiry_warning_days"`
	EmailNotifications  *bool    `json:"email_notifications"`
	PushNotifications   *bool    `json:"push_notifications"`
	SMSNotifications    *bool    `json:"sms_notifications"`
}

type UsageReport struct {
	Period      string              `json:"period"`
	StartDate   time.Time           `json:"start_date"`
	EndDate     time.Time           `json:"end_date"`
	Ingredients []IngredientUsage   `json:"ingredients"`
	Summary     UsageReportSummary  `json:"summary"`
}

type IngredientUsage struct {
	IngredientID   string  `json:"ingredient_id"`
	IngredientName string  `json:"ingredient_name"`
	TotalUsed      float64 `json:"total_used"`
	Unit           string  `json:"unit"`
	TotalCost      float64 `json:"total_cost"`
	OrderCount     int     `json:"order_count"`
}

type UsageReportSummary struct {
	TotalIngredients int     `json:"total_ingredients"`
	TotalCost        float64 `json:"total_cost"`
	TotalOrders      int     `json:"total_orders"`
	AvgCostPerOrder  float64 `json:"avg_cost_per_order"`
}

type WasteReport struct {
	Period    string            `json:"period"`
	StartDate time.Time         `json:"start_date"`
	EndDate   time.Time         `json:"end_date"`
	WasteData []IngredientWaste `json:"waste_data"`
	Summary   WasteReportSummary `json:"summary"`
}

type IngredientWaste struct {
	IngredientID   string  `json:"ingredient_id"`
	IngredientName string  `json:"ingredient_name"`
	WastedQuantity float64 `json:"wasted_quantity"`
	Unit           string  `json:"unit"`
	WasteCost      float64 `json:"waste_cost"`
	Reason         string  `json:"reason"`
}

type WasteReportSummary struct {
	TotalWasteValue    float64 `json:"total_waste_value"`
	TotalWasteQuantity float64 `json:"total_waste_quantity"`
	WastePercentage    float64 `json:"waste_percentage"`
	TopWasteReasons    []string `json:"top_waste_reasons"`
}

// BeforeCreate hooks
func (i *Ingredient) BeforeCreate(tx *gorm.DB) error {
	if i.ID == "" {
		i.ID = uuid.New().String()
	}
	return nil
}

func (sm *StockMovement) BeforeCreate(tx *gorm.DB) error {
	if sm.ID == "" {
		sm.ID = uuid.New().String()
	}
	return nil
}

func (ri *RecipeIngredient) BeforeCreate(tx *gorm.DB) error {
	if ri.ID == "" {
		ri.ID = uuid.New().String()
	}
	return nil
}

func (ia *InventoryAlert) BeforeCreate(tx *gorm.DB) error {
	if ia.ID == "" {
		ia.ID = uuid.New().String()
	}
	return nil
}

func (as *AlertSettings) BeforeCreate(tx *gorm.DB) error {
	if as.ID == "" {
		as.ID = uuid.New().String()
	}
	return nil
}

func (s *Supplier) BeforeCreate(tx *gorm.DB) error {
	if s.ID == "" {
		s.ID = uuid.New().String()
	}
	return nil
}