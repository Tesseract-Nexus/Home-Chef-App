package handlers

import (
	"net/http"
	"strconv"
	"customer-service/models"
	"customer-service/services"
	"customer-service/utils"

	"github.com/gin-gonic/gin"
)

type ReviewHandler struct {
	reviewService *services.ReviewService
}

func NewReviewHandler(reviewService *services.ReviewService) *ReviewHandler {
	return &ReviewHandler{
		reviewService: reviewService,
	}
}

// @Summary Get chef reviews with filtering
// @Description Get reviews for a specific chef with filtering options
// @Tags Reviews
// @Accept json
// @Produce json
// @Param chef_id path string true "Chef ID"
// @Param rating query integer false "Filter by rating"
// @Param sort query string false "Sort order" Enums(newest, oldest, helpful, rating_high, rating_low)
// @Success 200 {object} models.APIResponse
// @Router /chefs/{chef_id}/reviews [get]
func (h *ReviewHandler) GetChefReviews(c *gin.Context) {
	chefID := c.Param("chef_id")
	rating, _ := strconv.Atoi(c.Query("rating"))
	sort := c.DefaultQuery("sort", "newest")

	// TODO: Fetch chef reviews from database with filters
	reviews := []gin.H{
		{
			"id":           "review-1",
			"customer_name": "John D.",
			"rating":       5,
			"review_text":  "Excellent food! Will order again.",
			"created_at":   "2024-01-20T15:30:00Z",
		},
		{
			"id":           "review-2",
			"customer_name": "Sarah M.",
			"rating":       4,
			"review_text":  "Good taste, delivered on time.",
			"created_at":   "2024-01-19T12:15:00Z",
		},
	}

	// Apply rating filter
	if rating > 0 {
		filteredReviews := []gin.H{}
		for _, review := range reviews {
			if review["rating"].(int) == rating {
				filteredReviews = append(filteredReviews, review)
			}
		}
		reviews = filteredReviews
	}

	// TODO: Apply sorting based on sort parameter

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Data:    reviews,
	})
}

// @Summary Get customer reviews
// @Description Retrieve reviews written by the authenticated customer
// @Tags Reviews
// @Accept json
// @Produce json
// @Param page query int false "Page number" default(1)
// @Param limit query int false "Items per page" default(20)
// @Success 200 {object} models.APIResponse{data=models.PaginationResponse}
// @Security BearerAuth
// @Router /customers/reviews [get]
func (h *ReviewHandler) GetReviews(c *gin.Context) {
	customerID := c.GetString("customer_id")
	if customerID == "" {
		customerID = c.GetString("user_id")
	}

	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "20"))

	reviews, total, err := h.reviewService.GetCustomerReviews(customerID, page, limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Error:   "database_error",
			Message: "Failed to retrieve reviews",
		})
		return
	}

	totalPages := int(total) / limit
	if int(total)%limit != 0 {
		totalPages++
	}

	response := models.PaginationResponse{
		Data:       reviews,
		Page:       page,
		Limit:      limit,
		Total:      total,
		TotalPages: totalPages,
		HasNext:    page < totalPages,
		HasPrev:    page > 1,
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Data:    response,
	})
}

// @Summary Submit review
// @Description Submit a review for an order
// @Tags Reviews
// @Accept json
// @Produce json
// @Param review body models.ReviewCreate true "Review data"
// @Success 201 {object} models.APIResponse
// @Failure 400 {object} models.ErrorResponse
// @Security BearerAuth
// @Router /customers/reviews [post]
func (h *ReviewHandler) CreateReview(c *gin.Context) {
	customerID := c.GetString("customer_id")
	if customerID == "" {
		customerID = c.GetString("user_id")
	}

	var reviewCreate models.ReviewCreate
	if err := c.ShouldBindJSON(&reviewCreate); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Error:   "invalid_request",
			Message: "Invalid request body",
			Details: utils.GetValidationErrors(err),
		})
		return
	}

	review, err := h.reviewService.CreateReview(customerID, &reviewCreate)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Error:   "creation_error",
			Message: "Failed to create review",
		})
		return
	}

	c.JSON(http.StatusCreated, models.APIResponse{
		Success: true,
		Message: "Review submitted successfully",
		Data:    review,
	})
}

// @Summary Update review
// @Description Update an existing review
// @Tags Reviews
// @Accept json
// @Produce json
// @Param review_id path string true "Review ID"
// @Param review body models.ReviewUpdate true "Review update data"
// @Success 200 {object} models.APIResponse
// @Security BearerAuth
// @Router /customers/reviews/{review_id} [put]
func (h *ReviewHandler) UpdateReview(c *gin.Context) {
	reviewID := c.Param("review_id")
	customerID := c.GetString("customer_id")
	if customerID == "" {
		customerID = c.GetString("user_id")
	}

	var reviewUpdate models.ReviewUpdate
	if err := c.ShouldBindJSON(&reviewUpdate); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Error:   "invalid_request",
			Message: "Invalid request body",
			Details: utils.GetValidationErrors(err),
		})
		return
	}

	updatedReview, err := h.reviewService.UpdateReview(reviewID, customerID, &reviewUpdate)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Error:   "update_error",
			Message: "Failed to update review",
		})
		return
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Message: "Review updated successfully",
		Data:    updatedReview,
	})
}

// @Summary Delete review
// @Description Delete a review
// @Tags Reviews
// @Accept json
// @Produce json
// @Param review_id path string true "Review ID"
// @Success 200 {object} models.APIResponse
// @Security BearerAuth
// @Router /customers/reviews/{review_id} [delete]
func (h *ReviewHandler) DeleteReview(c *gin.Context) {
	reviewID := c.Param("review_id")
	customerID := c.GetString("customer_id")
	if customerID == "" {
		customerID = c.GetString("user_id")
	}

	err := h.reviewService.DeleteReview(reviewID, customerID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Error:   "deletion_error",
			Message: "Failed to delete review",
		})
		return
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Message: "Review deleted successfully",
	})
}