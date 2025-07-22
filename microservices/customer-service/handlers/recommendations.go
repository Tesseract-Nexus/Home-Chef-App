package handlers

import (
	"net/http"
	"strconv"
	"customer-service/models"
	"customer-service/services"

	"github.com/gin-gonic/gin"
)

type RecommendationHandler struct {
	recommendationService *services.RecommendationService
}

func NewRecommendationHandler(recommendationService *services.RecommendationService) *RecommendationHandler {
	return &RecommendationHandler{
		recommendationService: recommendationService,
	}
}

// @Summary Get personalized recommendations
// @Description Get personalized recommendations for the authenticated customer
// @Tags Recommendations
// @Accept json
// @Produce json
// @Param type query string false "Recommendation type" Enums(chefs, dishes, cuisines) default(chefs)
// @Param limit query int false "Number of recommendations" default(10)
// @Success 200 {object} models.APIResponse{data=[]models.Recommendation}
// @Security BearerAuth
// @Router /customers/recommendations [get]
func (h *RecommendationHandler) GetRecommendations(c *gin.Context) {
	customerID := c.GetString("customer_id")
	if customerID == "" {
		customerID = c.GetString("user_id")
	}

	recommendationType := c.DefaultQuery("type", "chefs")
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))

	recommendations, err := h.recommendationService.GetRecommendations(customerID, recommendationType, limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Error:   "recommendation_error",
			Message: "Failed to generate recommendations",
		})
		return
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Data:    recommendations,
	})
}