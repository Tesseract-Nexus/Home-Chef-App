package models

import (
	"time"
	"github.com/google/uuid"
)

type City struct {
	ID            string      `json:"id" gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
	Name          string      `json:"name" gorm:"not null"`
	State         string      `json:"state" gorm:"not null"`
	Country       string      `json:"country" gorm:"default:'India'"`
	Coordinates   Coordinates `json:"coordinates" gorm:"embedded"`
	IsServiceable bool        `json:"is_serviceable" gorm:"default:false"`
	ChefCount     int         `json:"chef_count" gorm:"default:0"`
	PopularAreas  string      `json:"popular_areas" gorm:"type:text"` // JSON array as string
	CreatedAt     time.Time   `json:"created_at"`
	UpdatedAt     time.Time   `json:"updated_at"`
	
	// Relationships
	Areas         []ServiceableArea `json:"areas,omitempty" gorm:"foreignKey:CityID"`
	DeliveryZones []DeliveryZone    `json:"delivery_zones,omitempty" gorm:"foreignKey:CityID"`
}

type Coordinates struct {
	Latitude  float64 `json:"latitude" gorm:"column:latitude"`
	Longitude float64 `json:"longitude" gorm:"column:longitude"`
}

type ServiceableArea struct {
	ID          string      `json:"id" gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
	CityID      string      `json:"city_id" gorm:"not null"`
	Name        string      `json:"name" gorm:"not null"`
	Pincode     string      `json:"pincode" gorm:"not null"`
	Coordinates Coordinates `json:"coordinates" gorm:"embedded"`
	DeliveryFee float64     `json:"delivery_fee" gorm:"default:0"`
	DeliveryTime int        `json:"delivery_time" gorm:"default:30"` // in minutes
	IsActive    bool        `json:"is_active" gorm:"default:true"`
	CreatedAt   time.Time   `json:"created_at"`
	UpdatedAt   time.Time   `json:"updated_at"`
	
	// Relationships
	City City `json:"city" gorm:"foreignKey:CityID"`
}

type DeliveryZone struct {
	ID          string      `json:"id" gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
	ChefID      string      `json:"chef_id" gorm:"not null"`
	CityID      string      `json:"city_id" gorm:"not null"`
	Name        string      `json:"name" gorm:"not null"`
	Center      Coordinates `json:"center" gorm:"embedded;embeddedPrefix:center_"`
	Radius      float64     `json:"radius" gorm:"not null"` // in kilometers
	Polygon     string      `json:"polygon" gorm:"type:text"` // JSON array of coordinates
	DeliveryFee float64     `json:"delivery_fee" gorm:"default:0"`
	MinOrder    float64     `json:"min_order" gorm:"default:0"`
	IsActive    bool        `json:"is_active" gorm:"default:true"`
	CreatedAt   time.Time   `json:"created_at"`
	UpdatedAt   time.Time   `json:"updated_at"`
	
	// Relationships
	City City `json:"city" gorm:"foreignKey:CityID"`
}

type LocationCache struct {
	ID            string      `json:"id" gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
	Address       string      `json:"address" gorm:"not null;index"`
	Coordinates   Coordinates `json:"coordinates" gorm:"embedded"`
	FormattedAddr string      `json:"formatted_address"`
	Components    string      `json:"components" gorm:"type:text"` // JSON object as string
	Accuracy      string      `json:"accuracy" gorm:"default:'approximate'"`
	Source        string      `json:"source" gorm:"default:'google_maps'"`
	CreatedAt     time.Time   `json:"created_at"`
	ExpiresAt     time.Time   `json:"expires_at"`
}

// Request/Response models
type LocationValidationRequest struct {
	Address     string       `json:"address" validate:"required"`
	Pincode     string       `json:"pincode"`
	Coordinates *Coordinates `json:"coordinates"`
}

type LocationValidation struct {
	IsValid          bool                   `json:"is_valid"`
	IsServiceable    bool                   `json:"is_serviceable"`
	Coordinates      Coordinates            `json:"coordinates"`
	FormattedAddress string                 `json:"formatted_address"`
	Components       LocationComponents     `json:"components"`
	Suggestions      []string               `json:"suggestions"`
}

type LocationComponents struct {
	Street   string `json:"street"`
	Area     string `json:"area"`
	City     string `json:"city"`
	State    string `json:"state"`
	Pincode  string `json:"pincode"`
	Country  string `json:"country"`
}

type GeocodingRequest struct {
	Address string `json:"address" validate:"required"`
}

type GeocodingResult struct {
	Coordinates      Coordinates        `json:"coordinates"`
	FormattedAddress string             `json:"formatted_address"`
	Components       LocationComponents `json:"components"`
	Accuracy         string             `json:"accuracy"`
}

type ReverseGeocodingRequest struct {
	Latitude  float64 `json:"latitude" validate:"required"`
	Longitude float64 `json:"longitude" validate:"required"`
}

type DistanceRequest struct {
	Origin      Coordinates `json:"origin" validate:"required"`
	Destination Coordinates `json:"destination" validate:"required"`
	Mode        string      `json:"mode" validate:"omitempty,oneof=driving walking bicycling"`
}

type DistanceResult struct {
	Distance DistanceInfo `json:"distance"`
	Duration DurationInfo `json:"duration"`
	Mode     string       `json:"mode"`
}

type DistanceInfo struct {
	Value float64 `json:"value"` // in kilometers
	Text  string  `json:"text"`
}

type DurationInfo struct {
	Value int    `json:"value"` // in seconds
	Text  string `json:"text"`
}

type RouteRequest struct {
	Origin      Coordinates   `json:"origin" validate:"required"`
	Destination Coordinates   `json:"destination" validate:"required"`
	Waypoints   []Coordinates `json:"waypoints"`
	Mode        string        `json:"mode" validate:"omitempty,oneof=driving walking bicycling"`
	Optimize    bool          `json:"optimize"`
}

type RouteResult struct {
	Distance     DistanceInfo    `json:"distance"`
	Duration     DurationInfo    `json:"duration"`
	Steps        []RouteStep     `json:"steps"`
	Polyline     string          `json:"polyline"`
	Bounds       RouteBounds     `json:"bounds"`
}

type RouteStep struct {
	Distance     DistanceInfo `json:"distance"`
	Duration     DurationInfo `json:"duration"`
	Instruction  string       `json:"instruction"`
	StartLocation Coordinates `json:"start_location"`
	EndLocation   Coordinates `json:"end_location"`
}

type RouteBounds struct {
	Northeast Coordinates `json:"northeast"`
	Southwest Coordinates `json:"southwest"`
}

type DeliveryZoneCheck struct {
	Latitude  float64 `json:"latitude" validate:"required"`
	Longitude float64 `json:"longitude" validate:"required"`
	ChefID    string  `json:"chef_id" validate:"required"`
}

type DeliveryZoneResult struct {
	IsInZone     bool    `json:"is_in_zone"`
	ZoneName     string  `json:"zone_name"`
	DeliveryFee  float64 `json:"delivery_fee"`
	MinOrder     float64 `json:"min_order"`
	Distance     float64 `json:"distance"`
	EstimatedTime int    `json:"estimated_time"`
}

type NearbyLocation struct {
	ID          string      `json:"id"`
	Name        string      `json:"name"`
	Type        string      `json:"type"`
	Coordinates Coordinates `json:"coordinates"`
	Distance    float64     `json:"distance"`
	Address     string      `json:"address"`
	Rating      float64     `json:"rating"`
	IsAvailable bool        `json:"is_available"`
}

// BeforeCreate hooks
func (c *City) BeforeCreate(tx *gorm.DB) error {
	if c.ID == "" {
		c.ID = uuid.New().String()
	}
	return nil
}

func (sa *ServiceableArea) BeforeCreate(tx *gorm.DB) error {
	if sa.ID == "" {
		sa.ID = uuid.New().String()
	}
	return nil
}

func (dz *DeliveryZone) BeforeCreate(tx *gorm.DB) error {
	if dz.ID == "" {
		dz.ID = uuid.New().String()
	}
	return nil
}

func (lc *LocationCache) BeforeCreate(tx *gorm.DB) error {
	if lc.ID == "" {
		lc.ID = uuid.New().String()
	}
	return nil
}