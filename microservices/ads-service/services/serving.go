package services

import (
	"ads-service/models"
	"time"

	"gorm.io/gorm"
	"go.uber.org/zap"
)

type ServingService struct {
	db     *gorm.DB
	logger *zap.Logger
}

func NewServingService(db *gorm.DB, logger *zap.Logger) *ServingService {
	return &ServingService{
		db:     db,
		logger: logger,
	}
}

func (s *ServingService) GetAdsForUser(adType, placement, userLocation, userID string, limit int) ([]models.AdContent, error) {
	var adContents []models.AdContent

	// Build query to get active campaigns of the specified type
	query := s.db.Table("ad_contents").
		Select("ad_contents.*").
		Joins("JOIN ad_campaigns ON ad_contents.campaign_id = ad_campaigns.id").
		Where("ad_campaigns.status = ?", "active").
		Where("ad_campaigns.type = ?", adType).
		Where("ad_campaigns.start_date <= ?", time.Now()).
		Where("ad_campaigns.end_date >= ?", time.Now())

	// TODO: Add targeting logic based on user profile, location, etc.
	// For now, we'll just get random active ads

	err := query.Limit(limit).Find(&adContents).Error
	if err != nil {
		return nil, err
	}

	// If no ads found, return empty slice
	if len(adContents) == 0 {
		// Return mock ad for development
		mockAd := models.AdContent{
			ID:          "mock-ad-1",
			CampaignID:  "mock-campaign-1",
			Type:        adType,
			Title:       "Special Offer!",
			Description: "Get 20% off on your next order",
			ImageURL:    "https://example.com/ad-image.jpg",
			ActionText:  "Order Now",
			TargetURL:   "https://homechef.com/offers",
			Sponsor:     "HomeChef",
		}
		return []models.AdContent{mockAd}, nil
	}

	return adContents, nil
}