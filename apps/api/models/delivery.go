package models

import (
	"time"

	"github.com/google/uuid"
)

type DeliveryStatus string

const (
	DeliveryAssigned   DeliveryStatus = "assigned"
	DeliveryPickedUp   DeliveryStatus = "picked_up"
	DeliveryInTransit  DeliveryStatus = "in_transit"
	DeliveryDelivered  DeliveryStatus = "delivered"
	DeliveryCancelled  DeliveryStatus = "cancelled"
)

type DeliveryPartner struct {
	ID              uuid.UUID  `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	UserID          uuid.UUID  `gorm:"type:uuid;uniqueIndex;not null" json:"userId"`
	VehicleType     string     `gorm:"" json:"vehicleType"` // bike, scooter, car
	VehicleNumber   string     `gorm:"" json:"vehicleNumber"`
	LicenseNumber   string     `gorm:"" json:"licenseNumber"`
	IsVerified      bool       `gorm:"default:false" json:"verified"`
	VerifiedAt      *time.Time `gorm:"" json:"verifiedAt"`
	IsActive        bool       `gorm:"default:true" json:"isActive"`
	IsOnline        bool       `gorm:"default:false" json:"isOnline"`
	CurrentLatitude float64    `gorm:"" json:"currentLatitude"`
	CurrentLongitude float64   `gorm:"" json:"currentLongitude"`
	Rating          float64    `gorm:"default:0" json:"rating"`
	TotalDeliveries int        `gorm:"default:0" json:"totalDeliveries"`
	TotalReviews    int        `gorm:"default:0" json:"totalReviews"`

	// Bank/Payout Info
	StripeAccountID string `gorm:"" json:"-"`

	CreatedAt time.Time `gorm:"autoCreateTime" json:"createdAt"`
	UpdatedAt time.Time `gorm:"autoUpdateTime" json:"updatedAt"`

	// Relationships
	User       User       `gorm:"foreignKey:UserID" json:"user,omitempty"`
	Deliveries []Delivery `gorm:"foreignKey:DeliveryPartnerID" json:"deliveries,omitempty"`
}

type Delivery struct {
	ID                uuid.UUID      `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	OrderID           uuid.UUID      `gorm:"type:uuid;uniqueIndex;not null" json:"orderId"`
	DeliveryPartnerID uuid.UUID      `gorm:"type:uuid;not null;index" json:"deliveryPartnerId"`
	Status            DeliveryStatus `gorm:"type:varchar(20);default:'assigned'" json:"status"`

	// Pickup Location (Chef)
	PickupAddressLine1 string  `gorm:"" json:"pickupAddressLine1"`
	PickupAddressCity  string  `gorm:"" json:"pickupAddressCity"`
	PickupLatitude     float64 `gorm:"" json:"pickupLatitude"`
	PickupLongitude    float64 `gorm:"" json:"pickupLongitude"`

	// Dropoff Location (Customer)
	DropoffAddressLine1 string  `gorm:"" json:"dropoffAddressLine1"`
	DropoffAddressCity  string  `gorm:"" json:"dropoffAddressCity"`
	DropoffLatitude     float64 `gorm:"" json:"dropoffLatitude"`
	DropoffLongitude    float64 `gorm:"" json:"dropoffLongitude"`

	// Tracking
	Distance          float64 `gorm:"" json:"distance"` // in km
	EstimatedDuration int     `gorm:"" json:"estimatedDuration"` // in minutes
	ActualDuration    int     `gorm:"" json:"actualDuration"`

	// Earnings
	DeliveryFee float64 `gorm:"default:0" json:"deliveryFee"`
	Tip         float64 `gorm:"default:0" json:"tip"`
	TotalPayout float64 `gorm:"default:0" json:"totalPayout"`

	// Timestamps
	AssignedAt   time.Time  `gorm:"autoCreateTime" json:"assignedAt"`
	PickedUpAt   *time.Time `gorm:"" json:"pickedUpAt,omitempty"`
	DeliveredAt  *time.Time `gorm:"" json:"deliveredAt,omitempty"`
	CancelledAt  *time.Time `gorm:"" json:"cancelledAt,omitempty"`
	CancelReason string     `gorm:"" json:"cancelReason,omitempty"`

	// Relationships
	Order           Order           `gorm:"foreignKey:OrderID" json:"order,omitempty"`
	DeliveryPartner DeliveryPartner `gorm:"foreignKey:DeliveryPartnerID" json:"deliveryPartner,omitempty"`
}

// DTOs
type DeliveryPartnerResponse struct {
	ID              uuid.UUID `json:"id"`
	UserID          uuid.UUID `json:"userId"`
	VehicleType     string    `json:"vehicleType"`
	IsVerified      bool      `json:"verified"`
	IsOnline        bool      `json:"isOnline"`
	Rating          float64   `json:"rating"`
	TotalDeliveries int       `json:"totalDeliveries"`
}

type DeliveryResponse struct {
	ID                uuid.UUID      `json:"id"`
	OrderID           uuid.UUID      `json:"orderId"`
	DeliveryPartnerID uuid.UUID      `json:"deliveryPartnerId"`
	Status            DeliveryStatus `json:"status"`
	Distance          float64        `json:"distance"`
	EstimatedDuration int            `json:"estimatedDuration"`
	DeliveryFee       float64        `json:"deliveryFee"`
	Tip               float64        `json:"tip"`
	TotalPayout       float64        `json:"totalPayout"`
	AssignedAt        time.Time      `json:"assignedAt"`
	PickedUpAt        *time.Time     `json:"pickedUpAt,omitempty"`
	DeliveredAt       *time.Time     `json:"deliveredAt,omitempty"`
}

func (d *Delivery) ToResponse() DeliveryResponse {
	return DeliveryResponse{
		ID:                d.ID,
		OrderID:           d.OrderID,
		DeliveryPartnerID: d.DeliveryPartnerID,
		Status:            d.Status,
		Distance:          d.Distance,
		EstimatedDuration: d.EstimatedDuration,
		DeliveryFee:       d.DeliveryFee,
		Tip:               d.Tip,
		TotalPayout:       d.TotalPayout,
		AssignedAt:        d.AssignedAt,
		PickedUpAt:        d.PickedUpAt,
		DeliveredAt:       d.DeliveredAt,
	}
}
