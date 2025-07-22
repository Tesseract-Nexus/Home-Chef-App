package services

import (
	"ads-service/models"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
	"go.uber.org/zap"
)

type TrackingService struct {
	db     *gorm.DB
	logger *zap.Logger
}

func NewTrackingService(db *gorm.DB, logger *zap.Logger) *TrackingService {
	return &TrackingService{
		db:     db,
		logger: logger,
	}
}

func (s *TrackingService) TrackImpression(impressionTrack *models.ImpressionTrack, userID string) error {
	impression := &models.AdImpression{
		ID:         uuid.New().String(),
		AdID:       impressionTrack.AdID,
		CampaignID: impressionTrack.CampaignID,
		UserID:     userID,
		Placement:  impressionTrack.Placement,
		UserAgent:  impressionTrack.UserAgent,
		IPAddress:  impressionTrack.IPAddress,
		Timestamp:  time.Now(),
	}

	err := s.db.Create(impression).Error
	if err != nil {
		return err
	}

	// Update campaign performance
	go s.updateCampaignImpressions(impressionTrack.CampaignID)

	return nil
}

func (s *TrackingService) TrackClick(clickTrack *models.ClickTrack, userID string) error {
	click := &models.AdClick{
		ID:         uuid.New().String(),
		AdID:       clickTrack.AdID,
		CampaignID: clickTrack.CampaignID,
		UserID:     userID,
		Placement:  clickTrack.Placement,
		TargetURL:  clickTrack.TargetURL,
		UserAgent:  clickTrack.UserAgent,
		IPAddress:  clickTrack.IPAddress,
		Timestamp:  time.Now(),
	}

	err := s.db.Create(click).Error
	if err != nil {
		return err
	}

	// Update campaign performance
	go s.updateCampaignClicks(clickTrack.CampaignID)

	return nil
}

func (s *TrackingService) updateCampaignImpressions(campaignID string) {
	var count int64
	s.db.Model(&models.AdImpression{}).Where("campaign_id = ?", campaignID).Count(&count)

	s.db.Model(&models.AdCampaign{}).Where("id = ?", campaignID).
		Update("impressions", count)

	// Update CTR
	s.updateCampaignCTR(campaignID)
}

func (s *TrackingService) updateCampaignClicks(campaignID string) {
	var count int64
	s.db.Model(&models.AdClick{}).Where("campaign_id = ?", campaignID).Count(&count)

	s.db.Model(&models.AdCampaign{}).Where("id = ?", campaignID).
		Update("clicks", count)

	// Update CTR
	s.updateCampaignCTR(campaignID)
}

func (s *TrackingService) updateCampaignCTR(campaignID string) {
	var campaign models.AdCampaign
	err := s.db.First(&campaign, "id = ?", campaignID).Error
	if err != nil {
		return
	}

	var ctr float64
	if campaign.Performance.Impressions > 0 {
		ctr = float64(campaign.Performance.Clicks) / float64(campaign.Performance.Impressions) * 100
	}

	s.db.Model(&models.AdCampaign{}).Where("id = ?", campaignID).
		Update("ctr", ctr)
}