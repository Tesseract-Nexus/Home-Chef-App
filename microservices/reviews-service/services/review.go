package services

import (
	"encoding/json"
	"reviews-service/models"
	"time"

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

func (s *ReviewService) CreateReview(customerID string, reviewCreate *models.ReviewCreate) (*models.Review, error) {
	// Check if review already exists for this order
	var existingReview models.Review
	err := s.db.Where("customer_id = ? AND order_id = ?", customerID, reviewCreate.OrderID).First(&existingReview).Error
	if err == nil {
		return nil, gorm.ErrDuplicatedKey
	}

	// Convert images to JSON
	imagesJSON, _ := json.Marshal(reviewCreate.Images)

	review := &models.Review{
		CustomerID: customerID,
		ChefID:     reviewCreate.ChefID,
		OrderID:    reviewCreate.OrderID,
		DishID:     reviewCreate.DishID,
		Rating:     reviewCreate.Rating,
		ReviewText: reviewCreate.ReviewText,
		Images:     string(imagesJSON),
		IsVerified: true, // Auto-verify for now
		Status:     "active",
	}

	err = s.db.Create(review).Error
	if err != nil {
		return nil, err
	}

	// Update chef's average rating
	go s.updateChefRating(reviewCreate.ChefID)

	return review, nil
}

func (s *ReviewService) GetReviews(filter *models.ReviewFilter) ([]models.ReviewResponse, int64, error) {
	var reviews []models.Review
	var total int64

	query := s.db.Model(&models.Review{}).Where("status = ?", "active")

	// Apply filters
	if filter.ChefID != "" {
		query = query.Where("chef_id = ?", filter.ChefID)
	}
	if filter.DishID != "" {
		query = query.Where("dish_id = ?", filter.DishID)
	}
	if filter.Rating > 0 {
		query = query.Where("rating = ?", filter.Rating)
	}

	// Get total count
	query.Count(&total)

	// Apply sorting
	switch filter.Sort {
	case "newest":
		query = query.Order("created_at DESC")
	case "oldest":
		query = query.Order("created_at ASC")
	case "helpful":
		query = query.Order("helpful_count DESC")
	case "rating_high":
		query = query.Order("rating DESC")
	case "rating_low":
		query = query.Order("rating ASC")
	default:
		query = query.Order("created_at DESC")
	}

	// Apply pagination
	offset := (filter.Page - 1) * filter.Limit
	err := query.Offset(offset).Limit(filter.Limit).Find(&reviews).Error
	if err != nil {
		return nil, 0, err
	}

	// Convert to response format
	var responses []models.ReviewResponse
	for _, review := range reviews {
		response := s.convertToResponse(&review, filter.UserID)
		responses = append(responses, response)
	}

	return responses, total, nil
}

func (s *ReviewService) GetReviewByID(reviewID, userID string) (*models.ReviewResponse, error) {
	var review models.Review
	err := s.db.Where("id = ? AND status = ?", reviewID, "active").First(&review).Error
	if err != nil {
		return nil, err
	}

	response := s.convertToResponse(&review, userID)
	return &response, nil
}

func (s *ReviewService) UpdateReview(reviewID, customerID string, update *models.ReviewUpdate) (*models.Review, error) {
	var review models.Review
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

	// Update chef's average rating
	go s.updateChefRating(review.ChefID)

	return &review, nil
}

func (s *ReviewService) DeleteReview(reviewID, customerID string) error {
	var review models.Review
	err := s.db.Where("id = ? AND customer_id = ?", reviewID, customerID).First(&review).Error
	if err != nil {
		return err
	}

	// Soft delete by updating status
	review.Status = "deleted"
	err = s.db.Save(&review).Error
	if err != nil {
		return err
	}

	// Update chef's average rating
	go s.updateChefRating(review.ChefID)

	return nil
}

func (s *ReviewService) MarkHelpful(reviewID, userID string) error {
	// Check if already marked helpful
	var existing models.ReviewHelpful
	err := s.db.Where("review_id = ? AND user_id = ?", reviewID, userID).First(&existing).Error
	if err == nil {
		// Already marked, remove the helpful vote
		s.db.Delete(&existing)
		s.db.Model(&models.Review{}).Where("id = ?", reviewID).Update("helpful_count", gorm.Expr("helpful_count - 1"))
		return nil
	}

	// Add helpful vote
	helpful := &models.ReviewHelpful{
		ReviewID: reviewID,
		UserID:   userID,
	}

	err = s.db.Create(helpful).Error
	if err != nil {
		return err
	}

	// Update helpful count
	s.db.Model(&models.Review{}).Where("id = ?", reviewID).Update("helpful_count", gorm.Expr("helpful_count + 1"))

	return nil
}

func (s *ReviewService) ReportReview(reviewID, reporterID string, reportCreate *models.ReviewReportCreate) error {
	// Check if already reported by this user
	var existing models.ReviewReport
	err := s.db.Where("review_id = ? AND reporter_id = ?", reviewID, reporterID).First(&existing).Error
	if err == nil {
		return gorm.ErrDuplicatedKey
	}

	report := &models.ReviewReport{
		ReviewID:    reviewID,
		ReporterID:  reporterID,
		Reason:      reportCreate.Reason,
		Description: reportCreate.Description,
		Status:      "pending",
	}

	err = s.db.Create(report).Error
	if err != nil {
		return err
	}

	// Update report count
	s.db.Model(&models.Review{}).Where("id = ?", reviewID).Update("report_count", gorm.Expr("report_count + 1"))

	return nil
}

func (s *ReviewService) GetChefReviewStats(chefID string) (*models.ReviewStats, error) {
	var stats models.ReviewStats
	stats.ChefID = chefID

	// Get total reviews and average rating
	var totalReviews int64
	var avgRating float64
	
	s.db.Model(&models.Review{}).Where("chef_id = ? AND status = ?", chefID, "active").Count(&totalReviews)
	s.db.Model(&models.Review{}).Where("chef_id = ? AND status = ?", chefID, "active").Select("AVG(rating)").Scan(&avgRating)

	stats.TotalReviews = int(totalReviews)
	stats.AverageRating = avgRating

	// Get rating distribution
	ratingDist := make(map[string]int)
	for i := 1; i <= 5; i++ {
		var count int64
		s.db.Model(&models.Review{}).Where("chef_id = ? AND rating = ? AND status = ?", chefID, i, "active").Count(&count)
		ratingDist[fmt.Sprintf("%d", i)] = int(count)
	}
	stats.RatingDistribution = ratingDist

	// Get recent reviews
	var recentReviews []models.Review
	s.db.Where("chef_id = ? AND status = ?", chefID, "active").
		Order("created_at DESC").Limit(5).Find(&recentReviews)

	for _, review := range recentReviews {
		stats.RecentReviews = append(stats.RecentReviews, models.ReviewSummary{
			ID:           review.ID,
			CustomerName: "Customer", // TODO: Get from user service
			Rating:       review.Rating,
			ReviewText:   review.ReviewText,
			CreatedAt:    review.CreatedAt,
			HelpfulCount: review.HelpfulCount,
		})
	}

	// Get monthly trend (last 6 months)
	for i := 5; i >= 0; i-- {
		month := time.Now().AddDate(0, -i, 0)
		startOfMonth := time.Date(month.Year(), month.Month(), 1, 0, 0, 0, 0, month.Location())
		endOfMonth := startOfMonth.AddDate(0, 1, 0)

		var count int64
		var avgRating float64
		
		s.db.Model(&models.Review{}).
			Where("chef_id = ? AND status = ? AND created_at >= ? AND created_at < ?", 
				chefID, "active", startOfMonth, endOfMonth).
			Count(&count)
		
		s.db.Model(&models.Review{}).
			Where("chef_id = ? AND status = ? AND created_at >= ? AND created_at < ?", 
				chefID, "active", startOfMonth, endOfMonth).
			Select("AVG(rating)").Scan(&avgRating)

		stats.MonthlyTrend = append(stats.MonthlyTrend, models.MonthlyReviewData{
			Month:         month.Format("2006-01"),
			ReviewCount:   int(count),
			AverageRating: avgRating,
		})
	}

	return &stats, nil
}

func (s *ReviewService) convertToResponse(review *models.Review, userID string) models.ReviewResponse {
	var images []string
	if review.Images != "" {
		json.Unmarshal([]byte(review.Images), &images)
	}

	// Check if user has marked this review as helpful
	var isHelpful bool
	if userID != "" {
		var helpful models.ReviewHelpful
		err := s.db.Where("review_id = ? AND user_id = ?", review.ID, userID).First(&helpful).Error
		isHelpful = (err == nil)
	}

	response := models.ReviewResponse{
		ID:             review.ID,
		CustomerID:     review.CustomerID,
		CustomerName:   "Customer", // TODO: Get from user service
		CustomerAvatar: "",         // TODO: Get from user service
		ChefID:         review.ChefID,
		OrderID:        review.OrderID,
		DishID:         review.DishID,
		DishName:       nil, // TODO: Get from menu service
		Rating:         review.Rating,
		ReviewText:     review.ReviewText,
		Images:         images,
		IsVerified:     review.IsVerified,
		HelpfulCount:   review.HelpfulCount,
		IsHelpful:      isHelpful,
		CanEdit:        userID == review.CustomerID,
		CanDelete:      userID == review.CustomerID,
		CreatedAt:      review.CreatedAt,
		UpdatedAt:      review.UpdatedAt,
	}

	return response
}

func (s *ReviewService) updateChefRating(chefID string) {
	var avgRating float64
	s.db.Model(&models.Review{}).Where("chef_id = ? AND status = ?", chefID, "active").Select("AVG(rating)").Scan(&avgRating)
	
	// TODO: Update chef's rating in chef service
	s.logger.Info("Chef rating updated", zap.String("chef_id", chefID), zap.Float64("rating", avgRating))
}