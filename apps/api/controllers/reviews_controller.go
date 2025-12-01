package controllers

import (
	"net/http"

	"github.com/Agent-Sphere/home-chef-app/apps/api/database"
	"github.com/Agent-Sphere/home-chef-app/apps/api/models"
	"github.com/gin-gonic/gin"
)

func CreateReview(c *gin.Context) {
	user, _ := c.Get("user")
	authedUser := user.(models.User)

	var body struct {
		OrderID uint   `json:"order_id"`
		Rating  int    `json:"rating"`
		Comment string `json:"comment"`
	}

	if c.Bind(&body) != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to read body"})
		return
	}

	// Validate rating
	if body.Rating < 1 || body.Rating > 5 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Rating must be between 1 and 5"})
		return
	}

	// Find the order
	var order models.Order
	database.DB.First(&order, "id = ? AND user_id = ?", body.OrderID, authedUser.ID)
	if order.ID == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Order not found or does not belong to you"})
		return
	}

	// Check if order status is 'delivered'
	if order.Status != models.OrderStatusDelivered {
		c.JSON(http.StatusBadRequest, gin.H{"error": "You can only review delivered orders"})
		return
	}

	// Check if a review for this order already exists
	var existingReview models.Review
	database.DB.First(&existingReview, "order_id = ?", body.OrderID)
	if existingReview.ID != 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "You have already reviewed this order"})
		return
	}

	review := models.Review{
		OrderID:       body.OrderID,
		UserID:        authedUser.ID,
		ChefProfileID: order.ChefProfileID,
		Rating:        body.Rating,
		Comment:       body.Comment,
		Status:        models.ReviewStatusPending, // All reviews start as pending
	}

	result := database.DB.Create(&review)
	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create review"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"review": review})
}

func AdminListPendingReviews(c *gin.Context) {
	var reviews []models.Review
	database.DB.Preload("User").Preload("ChefProfile").Where("status = ?", models.ReviewStatusPending).Find(&reviews)
	c.JSON(http.StatusOK, gin.H{"reviews": reviews})
}

func AdminUpdateReviewStatus(c *gin.Context) {
	reviewID := c.Param("id")

	var body struct {
		Status models.ReviewStatus `json:"status"`
	}
	if c.Bind(&body) != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to read body"})
		return
	}

	// Validate status
	if body.Status != models.ReviewStatusApproved && body.Status != models.ReviewStatusRejected {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid status. Must be 'approved' or 'rejected'"})
		return
	}

	var review models.Review
	database.DB.First(&review, reviewID)
	if review.ID == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Review not found"})
		return
	}

	review.Status = body.Status
	database.DB.Save(&review)

	c.JSON(http.StatusOK, gin.H{"review": review})
}

func GetReviewsForChef(c *gin.Context) {
	chefProfileID := c.Param("chef_id")

	var reviews []models.Review
	database.DB.Preload("User").Where("chef_profile_id = ? AND status = ?", chefProfileID, models.ReviewStatusApproved).Find(&reviews)

	c.JSON(http.StatusOK, gin.H{"reviews": reviews})
}

