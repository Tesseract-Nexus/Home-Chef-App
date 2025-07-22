package handlers

import (
	"net/http"
	"strconv"
	"search-service/models"
	"search-service/services"
	"search-service/utils"

	"github.com/gin-gonic/gin"
)

type SearchHandler struct {
	searchService *services.SearchService
}

func NewSearchHandler(searchService *services.SearchService) *SearchHandler {
	return &SearchHandler{
		searchService: searchService,
	}
}

// @Summary Global search across platform
// @Description Search for chefs, dishes, and cuisines with advanced filtering
// @Tags Global Search
// @Accept json
// @Produce json
// @Param q query string true "Search query"
// @Param type query string false "Search type" Enums(all, chefs, dishes, cuisines)
// @Param location query string false "Location filter"
// @Param radius query number false "Search radius in km"
// @Param sort query string false "Sort order"
// @Param page query int false "Page number" default(1)
// @Param limit query int false "Items per page" default(20)
// @Success 200 {object} models.APIResponse{data=models.SearchResults}
// @Router /search [get]
func (h *SearchHandler) GlobalSearch(c *gin.Context) {
	userID := c.GetString("user_id")
	if userID == "" {
		userID = "anonymous"
	}

	query := c.Query("q")
	if query == "" {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Error:   "invalid_request",
			Message: "Search query is required",
		})
		return
	}

	searchType := c.DefaultQuery("type", "all")
	location := c.Query("location")
	radius, _ := strconv.ParseFloat(c.DefaultQuery("radius", "10.0"), 64)
	sort := c.DefaultQuery("sort", "relevance")
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "20"))

	request := &models.SearchRequest{
		Query:    query,
		Type:     searchType,
		Location: location,
		Radius:   radius,
		Filters:  make(map[string]interface{}),
		Sort:     sort,
		Page:     page,
		Limit:    limit,
	}

	// Parse filters from query parameters
	if cuisineTypes := c.QueryArray("cuisine_type"); len(cuisineTypes) > 0 {
		request.Filters["cuisine_type"] = cuisineTypes
	}
	if ratingMin := c.Query("rating_min"); ratingMin != "" {
		if rating, err := strconv.ParseFloat(ratingMin, 64); err == nil {
			request.Filters["rating_min"] = rating
		}
	}
	if isVegetarian := c.Query("is_vegetarian"); isVegetarian != "" {
		if veg, err := strconv.ParseBool(isVegetarian); err == nil {
			request.Filters["is_vegetarian"] = veg
		}
	}

	results, err := h.searchService.GlobalSearch(userID, request)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Error:   "search_error",
			Message: "Failed to perform search",
		})
		return
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Data:    results,
	})
}

// @Summary Get search suggestions
// @Description Get auto-complete suggestions for search queries
// @Tags Search Suggestions
// @Accept json
// @Produce json
// @Param q query string true "Search query"
// @Param type query string false "Suggestion type"
// @Param limit query int false "Number of suggestions" default(10)
// @Success 200 {object} models.APIResponse{data=[]models.SearchSuggestion}
// @Router /search/suggestions [get]
func (h *SearchHandler) GetSuggestions(c *gin.Context) {
	query := c.Query("q")
	if len(query) < 2 {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Error:   "invalid_request",
			Message: "Query must be at least 2 characters",
		})
		return
	}

	searchType := c.Query("type")
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))

	suggestions, err := h.searchService.GetSuggestions(query, searchType, limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Error:   "suggestions_error",
			Message: "Failed to get suggestions",
		})
		return
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Data:    suggestions,
	})
}

// @Summary Get trending searches
// @Description Get trending search queries for a location and period
// @Tags Trending Search
// @Accept json
// @Produce json
// @Param location query string false "Location filter"
// @Param period query string false "Time period" Enums(today, week, month)
// @Param limit query int false "Number of results" default(10)
// @Success 200 {object} models.APIResponse{data=[]models.TrendingSearchResponse}
// @Router /search/trending [get]
func (h *SearchHandler) GetTrendingSearches(c *gin.Context) {
	location := c.Query("location")
	period := c.DefaultQuery("period", "week")
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))

	trending, err := h.searchService.GetTrendingSearches(location, period, limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Error:   "trending_error",
			Message: "Failed to get trending searches",
		})
		return
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Data:    trending,
	})
}

// @Summary Get popular items
// @Description Get popular chefs, dishes, or cuisines
// @Tags Popular Search
// @Accept json
// @Produce json
// @Param type query string false "Item type" Enums(chefs, dishes, cuisines)
// @Param location query string false "Location filter"
// @Param period query string false "Time period"
// @Param limit query int false "Number of results" default(10)
// @Success 200 {object} models.APIResponse{data=[]models.PopularItemResponse}
// @Router /search/popular [get]
func (h *SearchHandler) GetPopularItems(c *gin.Context) {
	itemType := c.Query("type")
	location := c.Query("location")
	period := c.DefaultQuery("period", "week")
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))

	popular, err := h.searchService.GetPopularItems(itemType, location, period, limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Error:   "popular_error",
			Message: "Failed to get popular items",
		})
		return
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Data:    popular,
	})
}

// @Summary Get available search filters
// @Description Get all available search filters for a location
// @Tags Search Filters
// @Accept json
// @Produce json
// @Param location query string false "Location filter"
// @Success 200 {object} models.APIResponse{data=models.SearchFilters}
// @Router /search/filters [get]
func (h *SearchHandler) GetSearchFilters(c *gin.Context) {
	location := c.Query("location")

	filters, err := h.searchService.GetSearchFilters(location)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Error:   "filters_error",
			Message: "Failed to get search filters",
		})
		return
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Data:    filters,
	})
}

// @Summary Get user search history
// @Description Get search history for the authenticated user
// @Tags Search History
// @Accept json
// @Produce json
// @Param limit query int false "Number of results" default(20)
// @Success 200 {object} models.APIResponse{data=[]models.SearchQuery}
// @Security BearerAuth
// @Router /search/history [get]
func (h *SearchHandler) GetSearchHistory(c *gin.Context) {
	userID := c.GetString("user_id")
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "20"))

	history, err := h.searchService.GetSearchHistory(userID, limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Error:   "history_error",
			Message: "Failed to get search history",
		})
		return
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Data:    history,
	})
}

// @Summary Clear search history
// @Description Clear all search history for the authenticated user
// @Tags Search History
// @Accept json
// @Produce json
// @Success 200 {object} models.APIResponse
// @Security BearerAuth
// @Router /search/history [delete]
func (h *SearchHandler) ClearSearchHistory(c *gin.Context) {
	userID := c.GetString("user_id")

	err := h.searchService.ClearSearchHistory(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Error:   "clear_error",
			Message: "Failed to clear search history",
		})
		return
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Message: "Search history cleared successfully",
	})
}

// @Summary Save search query
// @Description Save a search query for future use
// @Tags Saved Searches
// @Accept json
// @Produce json
// @Param search body models.SavedSearchCreate true "Saved search data"
// @Success 201 {object} models.APIResponse
// @Security BearerAuth
// @Router /search/save [post]
func (h *SearchHandler) SaveSearch(c *gin.Context) {
	userID := c.GetString("user_id")

	var request models.SavedSearchCreate
	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Error:   "invalid_request",
			Message: "Invalid request body",
			Details: utils.GetValidationErrors(err),
		})
		return
	}

	savedSearch, err := h.searchService.SaveSearch(userID, &request)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Error:   "save_error",
			Message: "Failed to save search",
		})
		return
	}

	c.JSON(http.StatusCreated, models.APIResponse{
		Success: true,
		Message: "Search saved successfully",
		Data:    savedSearch,
	})
}

// @Summary Get saved searches
// @Description Get all saved searches for the authenticated user
// @Tags Saved Searches
// @Accept json
// @Produce json
// @Success 200 {object} models.APIResponse{data=[]models.SavedSearch}
// @Security BearerAuth
// @Router /search/saved [get]
func (h *SearchHandler) GetSavedSearches(c *gin.Context) {
	userID := c.GetString("user_id")

	savedSearches, err := h.searchService.GetSavedSearches(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Error:   "saved_error",
			Message: "Failed to get saved searches",
		})
		return
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Data:    savedSearches,
	})
}