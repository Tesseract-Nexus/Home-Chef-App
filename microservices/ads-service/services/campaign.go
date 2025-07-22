package services

import (
	"ads-service/models"
	"encoding/json"

	"gorm.io/gorm"
	"go.uber.org/zap"
)

type CampaignService struct {
	db     *gorm.DB
	logger *zap.Logger
}

func NewCampaignService(db *gorm.DB, logger *zap.Logger) *CampaignService {
	return &CampaignService{
		db:     db,
		logger: logger,
	}
}

func (s *CampaignService) GetCampaigns(status, adType string, page, limit int) ([]models.AdCampaign, int64, error) {
	var campaigns []models.AdCampaign
	var total int64

	query := s.db.Model(&models.AdCampaign{})

	if status != "" {
		query = query.Where("status = ?", status)
	}
	if adType != "" {
		query = query.Where("type = ?", adType)
	}

	// Get total count
	query.Count(&total)

	// Get paginated results
	offset := (page - 1) * limit
	err := query.Preload("AdContents").Offset(offset).Limit(limit).Find(&campaigns).Error

	return campaigns, total, err
}

func (s *CampaignService) CreateCampaign(campaign *models.AdCampaign) (*models.AdCampaign, error) {
	err := s.db.Create(campaign).Error
	if err != nil {
		return nil, err
	}
	return campaign, nil
}

func (s *CampaignService) CreateAdContent(adContent *models.AdContent) (*models.AdContent, error) {
	err := s.db.Create(adContent).Error
	if err != nil {
		return nil, err
	}
	return adContent, nil
}

func (s *CampaignService) GetCampaignByID(campaignID string) (*models.AdCampaign, error) {
	var campaign models.AdCampaign
	err := s.db.Preload("AdContents").First(&campaign, "id = ?", campaignID).Error
	if err != nil {
		return nil, err
	}
	return &campaign, nil
}

func (s *CampaignService) UpdateCampaign(campaignID string, update *models.CampaignUpdate) (*models.AdCampaign, error) {
	var campaign models.AdCampaign
	err := s.db.First(&campaign, "id = ?", campaignID).Error
	if err != nil {
		return nil, err
	}

	// Update fields if provided
	if update.Name != nil {
		campaign.Name = *update.Name
	}
	if update.Status != nil {
		campaign.Status = *update.Status
	}
	if update.Budget != nil {
		if update.Budget.DailyBudget != nil {
			campaign.Budget.DailyBudget = *update.Budget.DailyBudget
		}
		if update.Budget.CostPerClick != nil {
			campaign.Budget.CostPerClick = *update.Budget.CostPerClick
		}
	}
	if update.Targeting != nil {
		userTypesJSON, _ := json.Marshal(update.Targeting.UserTypes)
		locationsJSON, _ := json.Marshal(update.Targeting.Locations)
		ageGroupsJSON, _ := json.Marshal(update.Targeting.AgeGroups)
		interestsJSON, _ := json.Marshal(update.Targeting.Interests)

		campaign.Targeting.UserTypes = string(userTypesJSON)
		campaign.Targeting.Locations = string(locationsJSON)
		campaign.Targeting.AgeGroups = string(ageGroupsJSON)
		campaign.Targeting.Interests = string(interestsJSON)
	}
	if update.Schedule != nil {
		campaign.Schedule.StartDate = update.Schedule.StartDate
		campaign.Schedule.EndDate = update.Schedule.EndDate
		timeSlotsJSON, _ := json.Marshal(update.Schedule.TimeSlots)
		campaign.Schedule.TimeSlots = string(timeSlotsJSON)
	}

	err = s.db.Save(&campaign).Error
	if err != nil {
		return nil, err
	}

	return &campaign, nil
}

func (s *CampaignService) DeleteCampaign(campaignID string) error {
	// Delete associated ad contents first
	err := s.db.Where("campaign_id = ?", campaignID).Delete(&models.AdContent{}).Error
	if err != nil {
		return err
	}

	// Delete campaign
	return s.db.Delete(&models.AdCampaign{}, "id = ?", campaignID).Error
}

func (s *CampaignService) GetCampaignPerformance(campaignID, period string) (map[string]interface{}, error) {
	var campaign models.AdCampaign
	err := s.db.First(&campaign, "id = ?", campaignID).Error
	if err != nil {
		return nil, err
	}

	// TODO: Implement actual performance calculation based on period
	performance := map[string]interface{}{
		"campaign_id": campaignID,
		"period":      period,
		"impressions": campaign.Performance.Impressions,
		"clicks":      campaign.Performance.Clicks,
		"conversions": campaign.Performance.Conversions,
		"ctr":         campaign.Performance.CTR,
		"cost":        campaign.Performance.Cost,
		"roi":         0.0, // Calculate ROI
	}

	return performance, nil
}