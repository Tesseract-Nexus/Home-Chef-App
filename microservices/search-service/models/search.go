package models

import (
	"time"
	"github.com/google/uuid"
)

type SearchQuery struct {
	ID          string    `json:"id" gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
	UserID      string    `json:"user_id" gorm:"index"`
	Query       string    `json:"query" gorm:"not null"`
	SearchType  string    `json:"search_type" gorm:"not null"`
	Filters     string    `json:"filters" gorm:"type:text"` // JSON object as string
	Location    string    `json:"location"`
	ResultCount int       `json:"result_count" gorm:"default:0"`
	CreatedAt   time.Time `json:"created_at"`
}

type SavedSearch struct {
	ID                string    `json:"id" gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
	UserID            string    `json:"user_id" gorm:"not null;index"`
	Name              string    `json:"name" gorm:"not null"`
	Query             string    `json:"query" gorm:"not null"`
	Filters           string    `json:"filters" gorm:"type:text"` // JSON object as string
	NotifyNewResults  bool      `json:"notify_new_results" gorm:"default:false"`
	LastNotified      *time.Time `json:"last_notified"`
	CreatedAt         time.Time `json:"created_at"`
	UpdatedAt         time.Time `json:"updated_at"`
}

type TrendingSearch struct {
	ID          string    `json:"id" gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
	Query       string    `json:"query" gorm:"not null;index"`
	SearchCount int       `json:"search_count" gorm:"default:1"`
	Location    string    `json:"location" gorm:"index"`
	Period      string    `json:"period" gorm:"not null"` // today, week, month
	Date        time.Time `json:"date" gorm:"not null;index"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

type PopularItem struct {
	ID          string    `json:"id" gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
	ItemID      string    `json:"item_id" gorm:"not null"`
	ItemType    string    `json:"item_type" gorm:"not null"` // chef, dish, cuisine
	Name        string    `json:"name" gorm:"not null"`
	SearchCount int       `json:"search_count" gorm:"default:0"`
	OrderCount  int       `json:"order_count" gorm:"default:0"`
	ViewCount   int       `json:"view_count" gorm:"default:0"`
	Score       float64   `json:"score" gorm:"default:0"`
	Location    string    `json:"location" gorm:"index"`
	Period      string    `json:"period" gorm:"not null"`
	Date        time.Time `json:"date" gorm:"not null;index"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

type SearchAnalytics struct {
	ID              string    `json:"id" gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
	Date            time.Time `json:"date" gorm:"not null;index"`
	TotalSearches   int       `json:"total_searches" gorm:"default:0"`
	UniqueUsers     int       `json:"unique_users" gorm:"default:0"`
	AvgResultCount  float64   `json:"avg_result_count" gorm:"default:0"`
	ZeroResultCount int       `json:"zero_result_count" gorm:"default:0"`
	TopQueries      string    `json:"top_queries" gorm:"type:text"` // JSON array as string
	CreatedAt       time.Time `json:"created_at"`
	UpdatedAt       time.Time `json:"updated_at"`
}

// Request/Response models
type SearchRequest struct {
	Query    string                 `json:"query" validate:"required"`
	Type     string                 `json:"type" validate:"omitempty,oneof=all chefs dishes cuisines"`
	Location string                 `json:"location"`
	Radius   float64                `json:"radius"`
	Filters  map[string]interface{} `json:"filters"`
	Sort     string                 `json:"sort"`
	Page     int                    `json:"page"`
	Limit    int                    `json:"limit"`
}

type SearchResults struct {
	Query        string                 `json:"query"`
	TotalResults int                    `json:"total_results"`
	Results      SearchResultsData      `json:"results"`
	Facets       SearchFacets           `json:"facets"`
	Pagination   PaginationInfo         `json:"pagination"`
}

type SearchResultsData struct {
	Chefs    []ChefSearchResult    `json:"chefs"`
	Dishes   []DishSearchResult    `json:"dishes"`
	Cuisines []CuisineSearchResult `json:"cuisines"`
}

type ChefSearchResult struct {
	ID            string   `json:"id"`
	Name          string   `json:"name"`
	Specialty     string   `json:"specialty"`
	Rating        float64  `json:"rating"`
	ReviewCount   int      `json:"review_count"`
	Location      string   `json:"location"`
	Distance      float64  `json:"distance"`
	DeliveryTime  string   `json:"delivery_time"`
	MinOrder      float64  `json:"min_order"`
	IsOpen        bool     `json:"is_open"`
	Image         string   `json:"image"`
	PopularDishes []string `json:"popular_dishes"`
}

type DishSearchResult struct {
	ID            string  `json:"id"`
	Name          string  `json:"name"`
	Description   string  `json:"description"`
	Price         float64 `json:"price"`
	ChefID        string  `json:"chef_id"`
	ChefName      string  `json:"chef_name"`
	CuisineType   string  `json:"cuisine_type"`
	IsVegetarian  bool    `json:"is_vegetarian"`
	Rating        float64 `json:"rating"`
	Image         string  `json:"image"`
}

type CuisineSearchResult struct {
	Name          string   `json:"name"`
	ChefCount     int      `json:"chef_count"`
	DishCount     int      `json:"dish_count"`
	AvgPrice      float64  `json:"avg_price"`
	PopularDishes []string `json:"popular_dishes"`
}

type SearchSuggestion struct {
	Text     string                 `json:"text"`
	Type     string                 `json:"type"`
	Metadata map[string]interface{} `json:"metadata"`
}

type SearchFacets struct {
	CuisineTypes    []FacetItem `json:"cuisine_types"`
	PriceRanges     []FacetItem `json:"price_ranges"`
	DietaryOptions  []FacetItem `json:"dietary_options"`
	DeliveryTimes   []FacetItem `json:"delivery_times"`
}

type FacetItem struct {
	ID    string `json:"id"`
	Name  string `json:"name"`
	Count int    `json:"count"`
}

type PaginationInfo struct {
	Page    int  `json:"page"`
	Limit   int  `json:"limit"`
	Total   int  `json:"total"`
	HasNext bool `json:"has_next"`
}

type SearchFilters struct {
	CuisineTypes   []FilterOption `json:"cuisine_types"`
	PriceRanges    []PriceRange   `json:"price_ranges"`
	DietaryOptions []FilterOption `json:"dietary_options"`
	DeliveryTimes  []TimeRange    `json:"delivery_times"`
}

type FilterOption struct {
	ID    string `json:"id"`
	Name  string `json:"name"`
	Count int    `json:"count"`
}

type PriceRange struct {
	Min   float64 `json:"min"`
	Max   float64 `json:"max"`
	Label string  `json:"label"`
}

type TimeRange struct {
	MaxTime int    `json:"max_time"`
	Label   string `json:"label"`
	Count   int    `json:"count"`
}

type SavedSearchCreate struct {
	Query            string                 `json:"query" validate:"required"`
	Filters          map[string]interface{} `json:"filters" validate:"required"`
	Name             string                 `json:"name"`
	NotifyNewResults bool                   `json:"notify_new_results"`
}

type TrendingSearchResponse struct {
	Query       string `json:"query"`
	SearchCount int    `json:"search_count"`
	Trend       string `json:"trend"` // up, down, stable
}

type PopularItemResponse struct {
	ID       string  `json:"id"`
	Name     string  `json:"name"`
	Type     string  `json:"type"`
	Score    float64 `json:"score"`
	Image    string  `json:"image"`
	Subtitle string  `json:"subtitle"`
}

// BeforeCreate hooks
func (sq *SearchQuery) BeforeCreate(tx *gorm.DB) error {
	if sq.ID == "" {
		sq.ID = uuid.New().String()
	}
	return nil
}

func (ss *SavedSearch) BeforeCreate(tx *gorm.DB) error {
	if ss.ID == "" {
		ss.ID = uuid.New().String()
	}
	return nil
}

func (ts *TrendingSearch) BeforeCreate(tx *gorm.DB) error {
	if ts.ID == "" {
		ts.ID = uuid.New().String()
	}
	return nil
}

func (pi *PopularItem) BeforeCreate(tx *gorm.DB) error {
	if pi.ID == "" {
		pi.ID = uuid.New().String()
	}
	return nil
}

func (sa *SearchAnalytics) BeforeCreate(tx *gorm.DB) error {
	if sa.ID == "" {
		sa.ID = uuid.New().String()
	}
	return nil
}