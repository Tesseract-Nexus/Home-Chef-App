package handlers

import (
	"net/http"
	"strconv"
	"reviews-service/models"
	"reviews-service/services"
	"reviews-service/utils"

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

// @Summary Submit review
// @Description Submit a review for a chef or dish
// @Tags Reviews
// @Accept json
// @Produce json
// @Param review body models.ReviewCreate true "Review data"
// @Success 201 {object} models.APIResponse
// @Security BearerAuth
// @Router /reviews [post]
func (h *ReviewHandler) CreateReview(c *gin.Context) {
	customerID := c.GetString("user_id")

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
		if err == gorm.ErrDuplicatedKey {
			c.JSON(http.StatusConflict, models.ErrorResponse{
				Error:   "review_exists",
				Message: "Review already exists for this order",
			})
			return
		}
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

// @Summary Get user reviews
// @Description Get reviews given or received by the user
// @Tags Reviews
// @Accept json
// @Produce json
// @Param type query string false "Review type" Enums(given, received)
// @Param page query int false "Page number" default(1)
// @Param limit query int false "Items per page" default(20)
// @Success 200 {object} models.APIResponse
// @Security BearerAuth
// @Router /reviews [get]
func (h *ReviewHandler) GetReviews(c *gin.Context) {
	userID := c.GetString("user_id")
	reviewType := c.DefaultQuery("type", "given")
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "20"))

	filter := &models.ReviewFilter{
		Page:   page,
		Limit:  limit,
		UserID: userID,
	}

	// Set filter based on type
	if reviewType == "given" {
		// Reviews given by this customer
		filter.CustomerID = userID
	} else if reviewType == "received" {
		// Reviews received by this chef
		filter.ChefID = userID
	}

	reviews, total, err := h.reviewService.GetReviews(filter)
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

// @Summary Get review details
// @Description Get detailed information about a specific review
// @Tags Reviews
// @Accept json
// @Produce json
// @Param review_id path string true "Review ID"
// @Success 200 {object} models.APIResponse
// @Security BearerAuth
// @Router /reviews/{review_id} [get]
func (h *ReviewHandler) GetReview(c *gin.Context) {
	reviewID := c.Param("review_id")
	userID := c.GetString("user_id")

	review, err := h.reviewService.GetReviewByID(reviewID, userID)
	if err != nil {
		c.JSON(http.StatusNotFound, models.ErrorResponse{
			Error:   "review_not_found",
			Message: "Review not found",
		})
		return
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
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
// @Router /reviews/{review_id} [put]
func (h *ReviewHandler) UpdateReview(c *gin.Context) {
	reviewID := c.Param("review_id")
	customerID := c.GetString("user_id")

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
// @Router /reviews/{review_id} [delete]
func (h *ReviewHandler) DeleteReview(c *gin.Context) {
	reviewID := c.Param("review_id")
	customerID := c.GetString("user_id")

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

// @Summary Mark review as helpful
// @Description Mark a review as helpful or remove helpful mark
// @Tags Reviews
// @Accept json
// @Produce json
// @Param review_id path string true "Review ID"
// @Success 200 {object} models.APIResponse
// @Security BearerAuth
// @Router /reviews/{review_id}/helpful [post]
func (h *ReviewHandler) MarkHelpful(c *gin.Context) {
	reviewID := c.Param("review_id")
	userID := c.GetString("user_id")

	err := h.reviewService.MarkHelpful(reviewID, userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Error:   "helpful_error",
			Message: "Failed to mark review as helpful",
		})
		return
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Message: "Review helpful status updated",
	})
}

// @Summary Report review
// @Description Report a review for inappropriate content
// @Tags Reviews
// @Accept json
// @Produce json
// @Param review_id path string true "Review ID"
// @Param report body models.ReviewReportCreate true "Report data"
// @Success 200 {object} models.APIResponse
// @Security BearerAuth
// @Router /reviews/{review_id}/report [post]
func (h *ReviewHandler) ReportReview(c *gin.Context) {
	reviewID := c.Param("review_id")
	reporterID := c.GetString("user_id")

	var reportCreate models.ReviewReportCreate
	if err := c.ShouldBindJSON(&reportCreate); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Error:   "invalid_request",
			Message: "Invalid request body",
			Details: utils.GetValidationErrors(err),
		})
		return
	}

	err := h.reviewService.ReportReview(reviewID, reporterID, &reportCreate)
	if err != nil {
		if err == gorm.ErrDuplicatedKey {
			c.JSON(http.StatusConflict, models.ErrorResponse{
				Error:   "already_reported",
				Message: "You have already reported this review",
			})
			return
		}
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Error:   "report_error",
			Message: "Failed to report review",
		})
		return
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Message: "Review reported successfully",
	})
}

// @Summary Get chef reviews
// @Description Get reviews for a specific chef with filtering
// @Tags Chef Reviews
// @Accept json
// @Produce json
// @Param chef_id path string true "Chef ID"
// @Param rating query int false "Filter by rating"
// @Param sort query string false "Sort order" Enums(newest, oldest, helpful, rating_high, rating_low)
// @Param page query int false "Page number" default(1)
// @Param limit query int false "Items per page" default(20)
// @Success 200 {object} models.APIResponse
// @Router /chefs/{chef_id}/reviews [get]
func (h *ReviewHandler) GetChefReviews(c *gin.Context) {
	chefID := c.Param("chef_id")
	userID := c.GetString("user_id")
	rating, _ := strconv.Atoi(c.Query("rating"))
	sort := c.DefaultQuery("sort", "newest")
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "20"))

	filter := &models.ReviewFilter{
		ChefID: chefID,
		Rating: rating,
		Sort:   sort,
		Page:   page,
		Limit:  limit,
		UserID: userID,
	}

	reviews, total, err := h.reviewService.GetReviews(filter)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Error:   "database_error",
			Message: "Failed to retrieve chef reviews",
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

// @Summary Get chef review statistics
// @Description Get comprehensive review statistics for a chef
// @Tags Chef Reviews
// @Accept json
// @Produce json
// @Param chef_id path string true "Chef ID"
// @Success 200 {object} models.APIResponse
// @Router /chefs/{chef_id}/reviews/stats [get]
func (h *ReviewHandler) GetChefReviewStats(c *gin.Context) {
	chefID := c.Param("chef_id")

	stats, err := h.reviewService.GetChefReviewStats(chefID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Error:   "stats_error",
			Message: "Failed to retrieve review statistics",
		})
		return
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Data:    stats,
	})
}

// @Summary Get dish reviews
// @Description Get reviews for a specific dish
// @Tags Dish Reviews
// @Accept json
// @Produce json
// @Param dish_id path string true "Dish ID"
// @Param page query int false "Page number" default(1)
// @Param limit query int false "Items per page" default(20)
// @Success 200 {object} models.APIResponse
// @Router /dishes/{dish_id}/reviews [get]
func (h *ReviewHandler) GetDishReviews(c *gin.Context) {
	dishID := c.Param("dish_id")
	userID := c.GetString("user_id")
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "20"))

	filter := &models.ReviewFilter{
		DishID: dishID,
		Sort:   "newest",
		Page:   page,
		Limit:  limit,
		UserID: userID,
	}

	reviews, total, err := h.reviewService.GetReviews(filter)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Error:   "database_error",
			Message: "Failed to retrieve dish reviews",
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