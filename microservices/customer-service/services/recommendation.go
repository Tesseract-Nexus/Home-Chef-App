package services

import (
	"customer-service/models"

	"gorm.io/gorm"
	"go.uber.org/zap"
)

type RecommendationService struct {
	db     *gorm.DB
	logger *zap.Logger
}

func NewRecommendationService(db *gorm.DB, logger *zap.Logger) *RecommendationService {
	return &RecommendationService{
		db:     db,
		logger: logger,
	}
}

func (s *RecommendationService) GetRecommendations(customerID, recommendationType string, limit int) ([]models.Recommendation, error) {
	// Mock recommendation data - in production, this would use ML algorithms
	var recommendations []models.Recommendation

	switch recommendationType {
	case "chefs":
		recommendations = []models.Recommendation{
			{
				Type:        "chef",
				ID:          "chef-1",
				Name:        "Priya Sharma",
				Description: "Authentic North Indian Cuisine",
				ImageURL:    "https://example.com/chef1.jpg",
				Rating:      4.8,
				Reason:      "Based on your love for North Indian food",
			},
			{
				Type:        "chef",
				ID:          "chef-2",
				Name:        "Rajesh Kumar",
				Description: "South Indian Specialties",
				ImageURL:    "https://example.com/chef2.jpg",
				Rating:      4.6,
				Reason:      "Highly rated in your area",
			},
		}
	case "dishes":
		recommendations = []models.Recommendation{
			{
				Type:        "dish",
				ID:          "dish-1",
				Name:        "Butter Chicken",
				Description: "Rich and creamy tomato-based curry",
				ImageURL:    "https://example.com/butter-chicken.jpg",
				Rating:      4.7,
				Price:       280.00,
				Reason:      "Popular among customers with similar taste",
			},
			{
				Type:        "dish",
				ID:          "dish-2",
				Name:        "Biryani",
				Description: "Aromatic basmati rice with spices",
				ImageURL:    "https://example.com/biryani.jpg",
				Rating:      4.9,
				Price:       350.00,
				Reason:      "Trending in your location",
			},
		}
	case "cuisines":
		recommendations = []models.Recommendation{
			{
				Type:        "cuisine",
				ID:          "cuisine-1",
				Name:        "Chinese",
				Description: "Indo-Chinese fusion dishes",
				ImageURL:    "https://example.com/chinese.jpg",
				Rating:      4.5,
				Reason:      "You might like this based on your order history",
			},
		}
	}

	// Limit results
	if len(recommendations) > limit {
		recommendations = recommendations[:limit]
	}

	return recommendations, nil
}