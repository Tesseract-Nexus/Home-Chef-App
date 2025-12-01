package models

import "gorm.io/gorm"

type Cart struct {
	gorm.Model
	UserID  uint     `json:"user_id" gorm:"unique"` // A user has only one cart
	User    User     `json:"user"`
	CartItems []CartItem `json:"cart_items"`
}

type CartItem struct {
	gorm.Model
	CartID      uint     `json:"cart_id"`
	MenuItemID  uint     `json:"menu_item_id"`
	MenuItem    MenuItem `json:"menu_item"`
	Quantity    uint     `json:"quantity"`
}
