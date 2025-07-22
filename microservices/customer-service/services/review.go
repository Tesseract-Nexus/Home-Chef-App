package services

import (
	"encoding/json"
	"customer-service/models"

	"gorm.io/gorm"
	"go.uber.org/zap"
)

type ReviewService struct {
	db     *gorm.DB
	logger *zap.Logger
}

func NewReviewService(db *gorm.DB, logger *zap.Logger) *ReviewService {
	return &ReviewService{
		db:     db,
		logger: logger,
	}
}

func (s *ReviewService) GetCustomerReviews(customerID string, page, limit int) ([]models.CustomerReview, int64, error) {
	var reviews []models.CustomerReview
	var total int64

	// Get total count
	s.db.Model(&models.CustomerReview{}).Where("customer_id = ?", customerID).Count(&total)

	// Get paginated results
	offset := (page - 1) * limit
	err := s.db.Where("customer_id = ?", customerID).
		Order("created_at DESC").
		Offset(offset).Limit(limit).
		Find(&reviews).Error

	return reviews, total, err
}

func (s *ReviewService) CreateReview(customerID string, reviewCreate *models.ReviewCreate) (*models.CustomerReview, error) {
	review := &models.CustomerReview{
		CustomerID: customerID,
		ChefID:     reviewCreate.ChefID,
		OrderID:    reviewCreate.OrderID,
		Rating:     reviewCreate.Rating,
		ReviewText: reviewCreate.ReviewText,
	}

	if reviewCreate.DishID != nil {
		review.DishID = *reviewCreate.DishID
	}

	if len(reviewCreate.Images) > 0 {
		imagesJSON, _ := json.Marshal(reviewCreate.Images)
		review.Images = string(imagesJSON)
	}

	err := s.db.Create(review).Error
	if err != nil {
		return nil, err
	}

	return review, nil
}

func (s *ReviewService) UpdateReview(reviewID, customerID string, update *models.ReviewUpdate) (*models.CustomerReview, error) {
	var review models.CustomerReview
	err := s.db.Where("id = ? AND customer_id = ?", reviewID, customerID).First(&review).Error
	if err != nil {
		return nil, err
	}

	// Update fields if provided
	if update.Rating != nil {
		review.Rating = *update.Rating
	}
	if update.ReviewText != nil {
		review.ReviewText = *update.ReviewText
	}

	err = s.db.Save(&review).Error
	if err != nil {
		return nil, err
	}

	return &review, nil
}

func (s *ReviewService) DeleteReview(reviewID, customerID string) error {
	return s.db.Where("id = ? AND customer_id = ?", reviewID, customerID).Delete(&models.CustomerReview{}).Error
}