package services

import (
	"customer-service/models"

	"gorm.io/gorm"
	"go.uber.org/zap"
)

type RewardsService struct {
	db     *gorm.DB
	logger *zap.Logger
}

func NewRewardsService(db *gorm.DB, logger *zap.Logger) *RewardsService {
	return &RewardsService{
		db:     db,
		logger: logger,
	}
}

func (s *RewardsService) GetRewardsProfile(customerID string) (*models.RewardsProfile, error) {
	// TODO: Fetch actual rewards data from database
	// Mock data for now
	profile := &models.RewardsProfile{
		TotalTokens:      567,
		LifetimeEarned:   1250,
		LifetimeRedeemed: 683,
		CurrentStreak:    7,
		Tier:             "gold",
	}

	return profile, nil
}

func (s *RewardsService) RedeemTokens(customerID string, redemption *models.RewardRedeem) error {
	// TODO: Implement token redemption logic
	s.logger.Info("Tokens redeemed",
		zap.String("customer_id", customerID),
		zap.Int("tokens", redemption.Tokens),
		zap.String("reward_type", redemption.RewardType),
	)
	return nil
}