package handlers

import (
	"net/http"
	"strconv"
	"strings"
	"chef-service/models"

	"github.com/gin-gonic/gin"
)

type SearchHandler struct {
	// Dependencies would be injected here
}

func NewSearchHandler() *SearchHandler {
	return &SearchHandler{}
}

// @Summary Search chefs with filtering
// @Description Search chefs with various filters and sorting options
// @Tags Chef Discovery
// @Accept json
// @Produce json
// @Param q query string false "Search query"
// @Param cuisine_type query array false "Filter by cuisine type" collectionFormat(multi)
// @Param rating_min query number false "Minimum rating filter"
// @Param delivery_time_max query integer false "Maximum delivery time in minutes"
// @Param has_offers query boolean false "Filter chefs with offers"
// @Param distance_max query number false "Maximum distance in km"
// @Param sort query string false "Sort by" Enums(rating, distance, delivery_time, popularity)
// @Success 200 {object} models.APIResponse{data=[]models.ChefSearch}
// @Router /chefs/search [get]
func (h *SearchHandler) SearchChefs(c *gin.Context) {
	query := c.Query("q")
	cuisineTypes := c.QueryArray("cuisine_type")
	ratingMin, _ := strconv.ParseFloat(c.Query("rating_min"), 64)
	deliveryTimeMax, _ := strconv.Atoi(c.Query("delivery_time_max"))
	hasOffers, _ := strconv.ParseBool(c.Query("has_offers"))
	distanceMax, _ := strconv.ParseFloat(c.Query("distance_max"), 64)
	sort := c.DefaultQuery("sort", "rating")

	// TODO: Implement actual search logic with database queries
	chefs := []models.ChefSearch{
		{
			ID:           "chef-1",
			Name:         "Priya's Kitchen",
			Specialty:    "North Indian Cuisine",
			CuisineTypes: []string{"north_indian", "punjabi", "mughlai"},
			Rating:       4.8,
			ReviewCount:  156,
			Location:     "Andheri West, Mumbai",
			Distance:     "2.3 km",
			DeliveryTime: "25-30 mins",
			DeliveryFee:  25.00,
			MinOrder:     200.00,
			IsOpen:       true,
			HasOffers:    true,
			Discount:     stringPtr("20% OFF"),
			Badges:       []string{"top_rated", "fast_delivery"},
			Image:        "https://example.com/chef1.jpg",
		},
		{
			ID:           "chef-2",
			Name:         "Rajesh's South Delights",
			Specialty:    "South Indian Cuisine",
			CuisineTypes: []string{"south_indian", "tamil", "kerala"},
			Rating:       4.6,
			ReviewCount:  89,
			Location:     "Bandra East, Mumbai",
			Distance:     "3.1 km",
			DeliveryTime: "30-35 mins",
			DeliveryFee:  30.00,
			MinOrder:     150.00,
			IsOpen:       true,
			HasOffers:    false,
			Badges:       []string{"authentic"},
			Image:        "https://example.com/chef2.jpg",
		},
	}

	// Apply filters
	filteredChefs := []models.ChefSearch{}
	for _, chef := range chefs {
		// Apply search query filter
		if query != "" && !strings.Contains(strings.ToLower(chef.Name), strings.ToLower(query)) &&
			!strings.Contains(strings.ToLower(chef.Specialty), strings.ToLower(query)) {
			continue
		}

		// Apply cuisine type filter
		if len(cuisineTypes) > 0 {
			hasMatchingCuisine := false
			for _, filterCuisine := range cuisineTypes {
				for _, chefCuisine := range chef.CuisineTypes {
					if chefCuisine == filterCuisine {
						hasMatchingCuisine = true
						break
					}
				}
				if hasMatchingCuisine {
					break
				}
			}
			if !hasMatchingCuisine {
				continue
			}
		}

		// Apply rating filter
		if ratingMin > 0 && chef.Rating < ratingMin {
			continue
		}

		// Apply delivery time filter
		if deliveryTimeMax > 0 {
			// Extract delivery time from string (simplified)
			if strings.Contains(chef.DeliveryTime, "35") && deliveryTimeMax < 35 {
				continue
			}
		}

		// Apply offers filter
		if hasOffers && !chef.HasOffers {
			continue
		}

		// Apply distance filter
		if distanceMax > 0 {
			// Extract distance from string (simplified)
			if strings.Contains(chef.Distance, "3.1") && distanceMax < 3.1 {
				continue
			}
		}

		filteredChefs = append(filteredChefs, chef)
	}

	// TODO: Apply sorting based on sort parameter

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Data:    filteredChefs,
	})
}

func stringPtr(s string) *string {
	return &s
}