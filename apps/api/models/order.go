package models

import (
	"gorm.io/gorm"
	"time"
)

type OrderStatus string

const (
	OrderStatusPending    OrderStatus = "pending"
	OrderStatusProcessing OrderStatus = "processing"
	OrderStatusOutForDelivery OrderStatus = "out_for_delivery"
	OrderStatusDelivered  OrderStatus = "delivered"
	OrderStatusCancelled  OrderStatus = "cancelled"
)

type Order struct {
	gorm.Model
	UserID        uint        `json:"user_id"`
	User          User        `json:"user"`
	ChefProfileID uint        `json:"chef_profile_id"` // Order belongs to a specific chef
	ChefProfile   ChefProfile `json:"chef_profile"`
	DriverID      *uint       `json:"driver_id"` // Nullable Driver ID
	Driver        User        `json:"driver"`    // Belongs to a Driver (User)
	OrderItems    []OrderItem `json:"order_items"`
	Status        OrderStatus `json:"status" gorm:"default:'pending'"`
	TotalAmount   float64     `json:"total_amount"`
	OrderDate     time.Time   `json:"order_date"`
	DeliveryAddress string      `json:"delivery_address"`
}

type OrderItem struct {
	gorm.Model
	OrderID     uint     `json:"order_id"`
	MenuItemID  uint     `json:"menu_item_id"`
	MenuItem    MenuItem `json:"menu_item"`
	Quantity    uint     `json:"quantity"`
	PriceAtOrder float64  `json:"price_at_order"` // Price might change over time
}
