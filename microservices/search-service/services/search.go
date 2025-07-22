package services

import (
	"encoding/json"
	"search-service/models"
	"strings"
	"time"

	"gorm.io/gorm"
	"go.uber.org/zap"
)

type SearchService struct {
	db     *gorm.DB
	logger *zap.Logger
}

func NewSearchService(db *gorm.DB, logger *zap.Logger) *SearchService {
	return &SearchService{
		db:     db,
		logger: logger,
	}
}

func (s *SearchService) GlobalSearch(userID string, request *models.SearchRequest) (*models.SearchResults, error) {
	// Log search query for analytics
	go s.logSearchQuery(userID, request)

	results := &models.SearchResults{
		Query:        request.Query,
		TotalResults: 0,
		Results: models.SearchResultsData{
			Chefs:    []models.ChefSearchResult{},
			Dishes:   []models.DishSearchResult{},
			Cuisines: []models.CuisineSearchResult{},
		},
		Facets: models.SearchFacets{
			CuisineTypes:   []models.FacetItem{},
			PriceRanges:    []models.FacetItem{},
			DietaryOptions: []models.FacetItem{},
			DeliveryTimes:  []models.FacetItem{},
		},
		Pagination: models.PaginationInfo{
			Page:    request.Page,
			Limit:   request.Limit,
			Total:   0,
			HasNext: false,
		},
	}

	// Search based on type
	if request.Type == "all" || request.Type == "chefs" {
		chefs := s.searchChefs(request)
		results.Results.Chefs = chefs
		results.TotalResults += len(chefs)
	}

	if request.Type == "all" || request.Type == "dishes" {
		dishes := s.searchDishes(request)
		results.Results.Dishes = dishes
		results.TotalResults += len(dishes)
	}

	if request.Type == "all" || request.Type == "cuisines" {
		cuisines := s.searchCuisines(request)
		results.Results.Cuisines = cuisines
		results.TotalResults += len(cuisines)
	}

	// Generate facets
	results.Facets = s.generateFacets(request.Location)

	return results, nil
}

func (s *SearchService) GetSuggestions(query, searchType string, limit int) ([]models.SearchSuggestion, error) {
	var suggestions []models.SearchSuggestion

	// Mock suggestions based on query
	queryLower := strings.ToLower(query)

	// Chef suggestions
	if searchType == "" || searchType == "chefs" {
		chefSuggestions := []models.SearchSuggestion{
			{
				Text: "Priya's Kitchen",
				Type: "chef",
				Metadata: map[string]interface{}{
					"id":       "chef-1",
					"image":    "https://example.com/chef1.jpg",
					"subtitle": "North Indian Cuisine",
				},
			},
		}

		for _, suggestion := range chefSuggestions {
			if strings.Contains(strings.ToLower(suggestion.Text), queryLower) {
				suggestions = append(suggestions, suggestion)
			}
		}
	}

	// Dish suggestions
	if searchType == "" || searchType == "dishes" {
		dishSuggestions := []models.SearchSuggestion{
			{
				Text: "Butter Chicken",
				Type: "dish",
				Metadata: map[string]interface{}{
					"id":       "dish-1",
					"image":    "https://example.com/butter-chicken.jpg",
					"subtitle": "Rich and creamy curry",
				},
			},
			{
				Text: "Biryani",
				Type: "dish",
				Metadata: map[string]interface{}{
					"id":       "dish-2",
					"image":    "https://example.com/biryani.jpg",
					"subtitle": "Aromatic rice dish",
				},
			},
		}

		for _, suggestion := range dishSuggestions {
			if strings.Contains(strings.ToLower(suggestion.Text), queryLower) {
				suggestions = append(suggestions, suggestion)
			}
		}
	}

	// Apply limit
	if len(suggestions) > limit {
		suggestions = suggestions[:limit]
	}

	return suggestions, nil
}

func (s *SearchService) GetTrendingSearches(location, period string, limit int) ([]models.TrendingSearchResponse, error) {
	var trending []models.TrendingSearch
	query := s.db.Where("period = ?", period)

	if location != "" {
		query = query.Where("location = ?", location)
	}

	err := query.Order("search_count DESC").Limit(limit).Find(&trending).Error
	if err != nil {
		return nil, err
	}

	var responses []models.TrendingSearchResponse
	for _, item := range trending {
		responses = append(responses, models.TrendingSearchResponse{
			Query:       item.Query,
			SearchCount: item.SearchCount,
			Trend:       "up", // TODO: Calculate actual trend
		})
	}

	return responses, nil
}

func (s *SearchService) GetPopularItems(itemType, location, period string, limit int) ([]models.PopularItemResponse, error) {
	var popular []models.PopularItem
	query := s.db.Where("period = ?", period)

	if itemType != "" {
		query = query.Where("item_type = ?", itemType)
	}
	if location != "" {
		query = query.Where("location = ?", location)
	}

	err := query.Order("score DESC").Limit(limit).Find(&popular).Error
	if err != nil {
		return nil, err
	}

	var responses []models.PopularItemResponse
	for _, item := range popular {
		responses = append(responses, models.PopularItemResponse{
			ID:       item.ItemID,
			Name:     item.Name,
			Type:     item.ItemType,
			Score:    item.Score,
			Image:    "https://example.com/" + item.ItemType + ".jpg",
			Subtitle: s.getItemSubtitle(item.ItemType, item.Name),
		})
	}

	return responses, nil
}

func (s *SearchService) GetSearchFilters(location string) (*models.SearchFilters, error) {
	filters := &models.SearchFilters{
		CuisineTypes: []models.FilterOption{
			{ID: "north_indian", Name: "North Indian", Count: 45},
			{ID: "south_indian", Name: "South Indian", Count: 32},
			{ID: "chinese", Name: "Chinese", Count: 28},
			{ID: "italian", Name: "Italian", Count: 15},
		},
		PriceRanges: []models.PriceRange{
			{Min: 0, Max: 200, Label: "Under ₹200"},
			{Min: 200, Max: 500, Label: "₹200 - ₹500"},
			{Min: 500, Max: 1000, Label: "₹500 - ₹1000"},
			{Min: 1000, Max: 0, Label: "Above ₹1000"},
		},
		DietaryOptions: []models.FilterOption{
			{ID: "vegetarian", Name: "Vegetarian", Count: 67},
			{ID: "vegan", Name: "Vegan", Count: 23},
			{ID: "gluten_free", Name: "Gluten Free", Count: 18},
		},
		DeliveryTimes: []models.TimeRange{
			{MaxTime: 30, Label: "Under 30 mins", Count: 45},
			{MaxTime: 45, Label: "30-45 mins", Count: 32},
			{MaxTime: 60, Label: "45-60 mins", Count: 18},
		},
	}

	return filters, nil
}

func (s *SearchService) GetSearchHistory(userID string, limit int) ([]models.SearchQuery, error) {
	var history []models.SearchQuery
	err := s.db.Where("user_id = ?", userID).
		Order("created_at DESC").
		Limit(limit).
		Find(&history).Error

	return history, err
}

func (s *SearchService) ClearSearchHistory(userID string) error {
	return s.db.Where("user_id = ?", userID).Delete(&models.SearchQuery{}).Error
}

func (s *SearchService) SaveSearch(userID string, request *models.SavedSearchCreate) (*models.SavedSearch, error) {
	filtersJSON, _ := json.Marshal(request.Filters)

	savedSearch := &models.SavedSearch{
		UserID:           userID,
		Name:             request.Name,
		Query:            request.Query,
		Filters:          string(filtersJSON),
		NotifyNewResults: request.NotifyNewResults,
	}

	if savedSearch.Name == "" {
		savedSearch.Name = request.Query
	}

	err := s.db.Create(savedSearch).Error
	if err != nil {
		return nil, err
	}

	return savedSearch, nil
}

func (s *SearchService) GetSavedSearches(userID string) ([]models.SavedSearch, error) {
	var savedSearches []models.SavedSearch
	err := s.db.Where("user_id = ?", userID).
		Order("created_at DESC").
		Find(&savedSearches).Error

	return savedSearches, err
}

func (s *SearchService) searchChefs(request *models.SearchRequest) []models.ChefSearchResult {
	// Mock chef search results
	chefs := []models.ChefSearchResult{
		{
			ID:            "chef-1",
			Name:          "Priya's Kitchen",
			Specialty:     "North Indian Cuisine",
			Rating:        4.8,
			ReviewCount:   156,
			Location:      "Andheri West, Mumbai",
			Distance:      2.3,
			DeliveryTime:  "25-30 mins",
			MinOrder:      200.00,
			IsOpen:        true,
			Image:         "https://example.com/chef1.jpg",
			PopularDishes: []string{"Butter Chicken", "Naan", "Dal Makhani"},
		},
		{
			ID:            "chef-2",
			Name:          "Rajesh's South Delights",
			Specialty:     "South Indian Cuisine",
			Rating:        4.6,
			ReviewCount:   89,
			Location:      "Bandra East, Mumbai",
			Distance:      3.1,
			DeliveryTime:  "30-35 mins",
			MinOrder:      150.00,
			IsOpen:        true,
			Image:         "https://example.com/chef2.jpg",
			PopularDishes: []string{"Dosa", "Idli", "Sambar"},
		},
	}

	// Apply query filter
	if request.Query != "" {
		var filteredChefs []models.ChefSearchResult
		queryLower := strings.ToLower(request.Query)
		for _, chef := range chefs {
			if strings.Contains(strings.ToLower(chef.Name), queryLower) ||
				strings.Contains(strings.ToLower(chef.Specialty), queryLower) {
				filteredChefs = append(filteredChefs, chef)
			}
		}
		chefs = filteredChefs
	}

	return chefs
}

func (s *SearchService) searchDishes(request *models.SearchRequest) []models.DishSearchResult {
	// Mock dish search results
	dishes := []models.DishSearchResult{
		{
			ID:           "dish-1",
			Name:         "Butter Chicken",
			Description:  "Rich and creamy tomato-based curry",
			Price:        280.00,
			ChefID:       "chef-1",
			ChefName:     "Priya's Kitchen",
			CuisineType:  "North Indian",
			IsVegetarian: false,
			Rating:       4.7,
			Image:        "https://example.com/butter-chicken.jpg",
		},
		{
			ID:           "dish-2",
			Name:         "Paneer Tikka Masala",
			Description:  "Grilled cottage cheese in rich tomato gravy",
			Price:        250.00,
			ChefID:       "chef-1",
			ChefName:     "Priya's Kitchen",
			CuisineType:  "North Indian",
			IsVegetarian: true,
			Rating:       4.5,
			Image:        "https://example.com/paneer-tikka.jpg",
		},
	}

	// Apply query filter
	if request.Query != "" {
		var filteredDishes []models.DishSearchResult
		queryLower := strings.ToLower(request.Query)
		for _, dish := range dishes {
			if strings.Contains(strings.ToLower(dish.Name), queryLower) ||
				strings.Contains(strings.ToLower(dish.Description), queryLower) {
				filteredDishes = append(filteredDishes, dish)
			}
		}
		dishes = filteredDishes
	}

	return dishes
}

func (s *SearchService) searchCuisines(request *models.SearchRequest) []models.CuisineSearchResult {
	// Mock cuisine search results
	cuisines := []models.CuisineSearchResult{
		{
			Name:          "North Indian",
			ChefCount:     45,
			DishCount:     234,
			AvgPrice:      275.00,
			PopularDishes: []string{"Butter Chicken", "Naan", "Biryani"},
		},
		{
			Name:          "South Indian",
			ChefCount:     32,
			DishCount:     189,
			AvgPrice:      185.00,
			PopularDishes: []string{"Dosa", "Idli", "Sambar"},
		},
	}

	// Apply query filter
	if request.Query != "" {
		var filteredCuisines []models.CuisineSearchResult
		queryLower := strings.ToLower(request.Query)
		for _, cuisine := range cuisines {
			if strings.Contains(strings.ToLower(cuisine.Name), queryLower) {
				filteredCuisines = append(filteredCuisines, cuisine)
			}
		}
		cuisines = filteredCuisines
	}

	return cuisines
}

func (s *SearchService) generateFacets(location string) models.SearchFacets {
	return models.SearchFacets{
		CuisineTypes: []models.FacetItem{
			{ID: "north_indian", Name: "North Indian", Count: 45},
			{ID: "south_indian", Name: "South Indian", Count: 32},
			{ID: "chinese", Name: "Chinese", Count: 28},
		},
		PriceRanges: []models.FacetItem{
			{ID: "under_200", Name: "Under ₹200", Count: 23},
			{ID: "200_500", Name: "₹200-₹500", Count: 67},
			{ID: "above_500", Name: "Above ₹500", Count: 34},
		},
		DietaryOptions: []models.FacetItem{
			{ID: "vegetarian", Name: "Vegetarian", Count: 89},
			{ID: "vegan", Name: "Vegan", Count: 23},
		},
		DeliveryTimes: []models.FacetItem{
			{ID: "under_30", Name: "Under 30 mins", Count: 45},
			{ID: "30_45", Name: "30-45 mins", Count: 32},
		},
	}
}

func (s *SearchService) logSearchQuery(userID string, request *models.SearchRequest) {
	filtersJSON, _ := json.Marshal(request.Filters)

	searchQuery := &models.SearchQuery{
		UserID:      userID,
		Query:       request.Query,
		SearchType:  request.Type,
		Filters:     string(filtersJSON),
		Location:    request.Location,
		ResultCount: 0, // TODO: Set actual result count
	}

	s.db.Create(searchQuery)

	// Update trending searches
	s.updateTrendingSearches(request.Query, request.Location)
}

func (s *SearchService) updateTrendingSearches(query, location string) {
	today := time.Now().Truncate(24 * time.Hour)

	var trending models.TrendingSearch
	err := s.db.Where("query = ? AND location = ? AND period = ? AND date = ?",
		query, location, "today", today).First(&trending).Error

	if err != nil {
		if err == gorm.ErrRecordNotFound {
			trending = models.TrendingSearch{
				Query:       query,
				SearchCount: 1,
				Location:    location,
				Period:      "today",
				Date:        today,
			}
			s.db.Create(&trending)
		}
	} else {
		trending.SearchCount++
		s.db.Save(&trending)
	}
}

func (s *SearchService) getItemSubtitle(itemType, name string) string {
	switch itemType {
	case "chef":
		return "Chef"
	case "dish":
		return "Popular dish"
	case "cuisine":
		return "Cuisine type"
	default:
		return ""
	}
}

// ProcessSearchAnalytics processes daily search analytics
func (s *SearchService) ProcessSearchAnalytics() error {
	s.logger.Info("Processing search analytics")

	today := time.Now().Truncate(24 * time.Hour)
	yesterday := today.AddDate(0, 0, -1)

	// Calculate analytics for yesterday
	var totalSearches int64
	var uniqueUsers int64
	var zeroResultCount int64

	s.db.Model(&models.SearchQuery{}).
		Where("created_at >= ? AND created_at < ?", yesterday, today).
		Count(&totalSearches)

	s.db.Model(&models.SearchQuery{}).
		Where("created_at >= ? AND created_at < ?", yesterday, today).
		Distinct("user_id").
		Count(&uniqueUsers)

	s.db.Model(&models.SearchQuery{}).
		Where("created_at >= ? AND created_at < ? AND result_count = 0", yesterday, today).
		Count(&zeroResultCount)

	// Get top queries
	var topQueries []struct {
		Query string
		Count int64
	}
	s.db.Model(&models.SearchQuery{}).
		Select("query, COUNT(*) as count").
		Where("created_at >= ? AND created_at < ?", yesterday, today).
		Group("query").
		Order("count DESC").
		Limit(10).
		Scan(&topQueries)

	topQueriesJSON, _ := json.Marshal(topQueries)

	// Create or update analytics record
	analytics := models.SearchAnalytics{
		Date:            yesterday,
		TotalSearches:   int(totalSearches),
		UniqueUsers:     int(uniqueUsers),
		ZeroResultCount: int(zeroResultCount),
		TopQueries:      string(topQueriesJSON),
	}

	if totalSearches > 0 {
		var avgResults float64
		s.db.Model(&models.SearchQuery{}).
			Where("created_at >= ? AND created_at < ?", yesterday, today).
			Select("AVG(result_count)").
			Scan(&avgResults)
		analytics.AvgResultCount = avgResults
	}

	s.db.Create(&analytics)

	return nil
}