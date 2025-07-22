package models

import (
	"time"
)

type Order struct {
	ID                  string      `json:"id"`
	CustomerID          string      `json:"customer_id"`
	ChefID              string      `json:"chef_id"`
	Items               []OrderItem `json:"items"`
	Status              string      `json:"status"`
	TotalAmount         float64     `json:"total_amount"`
	DeliveryAddress     Address     `json:"delivery_address"`
	EstimatedDelivery   time.Time   `json:"estimated_delivery"`
	SpecialInstructions string      `json:"special_instructions"`
	CreatedAt           time.Time   `json:"created_at"`
	UpdatedAt           time.Time   `json:"updated_at"`
}

type OrderItem struct {
	DishID   string  `json:"dish_id"`
	Name     string  `json:"name"`
	Quantity int     `json:"quantity"`
	Price    float64 `json:"price"`
	Notes    string  `json:"notes"`
}

type OrderStatusUpdate struct {
	Status                    string  `json:"status" validate:"required,oneof=confirmed preparing ready cancelled"`
	Notes                     *string `json:"notes"`
	EstimatedPreparationTime  *int    `json:"estimated_preparation_time"`
}