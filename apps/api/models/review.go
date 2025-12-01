package models

import "gorm.io/gorm"

type ReviewStatus string

const (
    ReviewStatusPending  ReviewStatus = "pending"
    ReviewStatusApproved ReviewStatus = "approved"
    ReviewStatusRejected ReviewStatus = "rejected"
)

type Review struct {
	gorm.Model
	OrderID       uint        `json:"order_id" gorm:"unique"` // One review per order
	Order         Order       `json:"order"`
	UserID        uint        `json:"user_id"` // The user who wrote the review
	User          User        `json:"user"`
	ChefProfileID uint        `json:"chef_profile_id"`
	ChefProfile   ChefProfile `json:"chef_profile"`
	Rating        int         `json:"rating"` // e.g., 1 to 5
	Comment       string      `json:"comment"`
	Status        ReviewStatus `json:"status" gorm:"default:'pending'"`
}
