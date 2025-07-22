package services

import (
	"delivery-service/models"
	"time"

	"gorm.io/gorm"
	"go.uber.org/zap"
)

type AnalyticsService struct {
	db     *gorm.DB
	logger *zap.Logger
}

func NewAnalyticsService(db *gorm.DB, logger *zap.Logger) *AnalyticsService {
	return &AnalyticsService{
		db:     db,
		logger: logger,
	}
}

func (s *AnalyticsService) GetDeliveryAnalytics(partnerID, period string) (*models.DeliveryAnalytics, error) {
	var startDate, endDate time.Time
	now := time.Now()

	switch period {
	case "today":
		startDate = time.Date(now.Year(), now.Month(), now.Day(), 0, 0, 0, 0, now.Location())
		endDate = startDate.Add(24 * time.Hour)
	case "this_week":
		startDate = now.AddDate(0, 0, -7)
		endDate = now
	case "this_month":
		startDate = now.AddDate(0, -1, 0)
		endDate = now
	default:
		startDate = now.AddDate(0, -1, 0)
		endDate = now
	}

	// Mock analytics data - in production, this would calculate from actual data
	analytics := &models.DeliveryAnalytics{
		Performance: models.PerformanceMetrics{
			TotalDeliveries:     47,
			CompletedDeliveries: 45,
			CancelledDeliveries: 2,
			CompletionRate:      95.7,
			AvgDeliveryTime:     28.5,
			OnTimePercentage:    92.3,
		},
		Ratings: models.RatingMetrics{
			AvgRating:    4.7,
			TotalRatings: 42,
			RatingDistribution: map[string]int{
				"5": 28,
				"4": 12,
				"3": 2,
				"2": 0,
				"1": 0,
			},
		},
		Earnings: models.EarningsMetrics{
			TotalEarnings:      8650.00,
			AvgEarningsPerHour: 425.50,
			PeakHoursEarnings:  3200.00,
		},
		Distance: models.DistanceMetrics{
			TotalDistance:          156.8,
			AvgDistancePerDelivery: 3.3,
		},
	}

	return analytics, nil
}