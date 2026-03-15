package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type DeliveryZone struct {
	ID    uuid.UUID `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	Name  string    `gorm:"type:varchar(100);not null" json:"name"`
	City  string    `gorm:"type:varchar(100);not null;index" json:"city"`
	State string    `gorm:"type:varchar(100)" json:"state"`

	// Bounding box for quick filtering
	MinLatitude  float64 `gorm:"" json:"minLatitude"`
	MaxLatitude  float64 `gorm:"" json:"maxLatitude"`
	MinLongitude float64 `gorm:"" json:"minLongitude"`
	MaxLongitude float64 `gorm:"" json:"maxLongitude"`

	// Detailed boundary (GeoJSON)
	Boundary string `gorm:"type:jsonb;default:'{}'" json:"boundary"` // GeoJSON polygon

	// Pricing
	BaseFare        float64 `gorm:"default:0" json:"baseFare"`
	PerKmRate       float64 `gorm:"default:0" json:"perKmRate"`
	MinimumFare     float64 `gorm:"default:0" json:"minimumFare"`
	SurgeMultiplier float64 `gorm:"default:1.0" json:"surgeMultiplier"`

	IsActive  bool           `gorm:"default:true" json:"isActive"`
	CreatedAt time.Time      `gorm:"autoCreateTime" json:"createdAt"`
	UpdatedAt time.Time      `gorm:"autoUpdateTime" json:"updatedAt"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
}

type DeliveryZoneResponse struct {
	ID              uuid.UUID `json:"id"`
	Name            string    `json:"name"`
	City            string    `json:"city"`
	State           string    `json:"state"`
	MinLatitude     float64   `json:"minLatitude"`
	MaxLatitude     float64   `json:"maxLatitude"`
	MinLongitude    float64   `json:"minLongitude"`
	MaxLongitude    float64   `json:"maxLongitude"`
	BaseFare        float64   `json:"baseFare"`
	PerKmRate       float64   `json:"perKmRate"`
	MinimumFare     float64   `json:"minimumFare"`
	SurgeMultiplier float64   `json:"surgeMultiplier"`
	IsActive        bool      `json:"isActive"`
	CreatedAt       time.Time `json:"createdAt"`
}

func (z *DeliveryZone) ToResponse() DeliveryZoneResponse {
	return DeliveryZoneResponse{
		ID:              z.ID,
		Name:            z.Name,
		City:            z.City,
		State:           z.State,
		MinLatitude:     z.MinLatitude,
		MaxLatitude:     z.MaxLatitude,
		MinLongitude:    z.MinLongitude,
		MaxLongitude:    z.MaxLongitude,
		BaseFare:        z.BaseFare,
		PerKmRate:       z.PerKmRate,
		MinimumFare:     z.MinimumFare,
		SurgeMultiplier: z.SurgeMultiplier,
		IsActive:        z.IsActive,
		CreatedAt:       z.CreatedAt,
	}
}
