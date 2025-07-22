package services

import (
	"encoding/json"
	"rewards-service/models"
	"time"

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

func (s *RewardsService) GetRewardsProfile(userID string) (*models.RewardsProfileResponse, error) {
	var profile models.UserRewardsProfile
	err := s.db.Where("user_id = ?", userID).First(&profile).Error
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			// Create new profile
			profile = models.UserRewardsProfile{
				UserID:           userID,
				TotalTokens:      0,
				LifetimeEarned:   0,
				LifetimeRedeemed: 0,
				CurrentStreak:    0,
				Tier:             "bronze",
				TierProgress:     0,
			}
			s.db.Create(&profile)
		} else {
			return nil, err
		}
	}

	// Calculate next tier tokens
	nextTierTokens := s.calculateNextTierTokens(profile.Tier, profile.LifetimeEarned)

	return &models.RewardsProfileResponse{
		TotalTokens:      profile.TotalTokens,
		LifetimeEarned:   profile.LifetimeEarned,
		LifetimeRedeemed: profile.LifetimeRedeemed,
		CurrentStreak:    profile.CurrentStreak,
		Tier:             profile.Tier,
		NextTierTokens:   nextTierTokens,
		TierProgress:     profile.TierProgress,
	}, nil
}

func (s *RewardsService) EarnTokens(userID string, request *models.RewardsEarnRequest) error {
	// Calculate tokens earned (1 token per 10 rupees spent)
	baseTokens := int(request.Amount / 10)
	bonusTokens := int(float64(baseTokens) * (request.BonusMultiplier - 1))
	totalTokens := baseTokens + bonusTokens

	// Create reward token record
	rewardToken := &models.RewardToken{
		UserID:      userID,
		Amount:      totalTokens,
		Type:        "earned",
		Source:      "order",
		OrderID:     &request.OrderID,
		Description: "Tokens earned from order",
		ExpiresAt:   timePtr(time.Now().AddDate(1, 0, 0)), // Expire in 1 year
	}

	err := s.db.Create(rewardToken).Error
	if err != nil {
		return err
	}

	// Update user profile
	return s.updateUserProfile(userID, totalTokens, 0)
}

func (s *RewardsService) RedeemTokens(userID string, request *models.RewardsRedeemRequest) (*models.RewardRedemption, error) {
	// Check if user has enough tokens
	profile, err := s.GetRewardsProfile(userID)
	if err != nil {
		return nil, err
	}

	if profile.TotalTokens < request.Tokens {
		return nil, gorm.ErrInvalidData
	}

	// Calculate redemption value
	var value float64
	var expiresAt *time.Time

	switch request.RewardType {
	case "discount":
		value = float64(request.Tokens) * 0.1 // 1 token = 0.1 rupee discount
		expiresAt = timePtr(time.Now().AddDate(0, 0, 30)) // 30 days
	case "cashback":
		value = float64(request.Tokens) * 0.08 // 1 token = 0.08 rupee cashback
		expiresAt = timePtr(time.Now().AddDate(0, 0, 90)) // 90 days
	case "free_delivery":
		value = 50.0 // Fixed free delivery value
		expiresAt = timePtr(time.Now().AddDate(0, 0, 7)) // 7 days
	}

	// Create redemption record
	redemption := &models.RewardRedemption{
		UserID:     userID,
		Tokens:     request.Tokens,
		RewardType: request.RewardType,
		OrderID:    request.OrderID,
		Value:      value,
		Status:     "active",
		ExpiresAt:  expiresAt,
	}

	err = s.db.Create(redemption).Error
	if err != nil {
		return nil, err
	}

	// Create deduction token record
	deductionToken := &models.RewardToken{
		UserID:      userID,
		Amount:      -request.Tokens,
		Type:        "redeemed",
		Source:      "redemption",
		Description: "Tokens redeemed for " + request.RewardType,
	}
	s.db.Create(deductionToken)

	// Update user profile
	s.updateUserProfile(userID, -request.Tokens, request.Tokens)

	return redemption, nil
}

func (s *RewardsService) GetRewardTransactions(userID, transactionType string, page, limit int) ([]models.RewardTransaction, int64, error) {
	var tokens []models.RewardToken
	var total int64

	query := s.db.Model(&models.RewardToken{}).Where("user_id = ?", userID)

	if transactionType != "" && transactionType != "all" {
		query = query.Where("type = ?", transactionType)
	}

	// Get total count
	query.Count(&total)

	// Get paginated results
	offset := (page - 1) * limit
	err := query.Order("created_at DESC").Offset(offset).Limit(limit).Find(&tokens).Error
	if err != nil {
		return nil, 0, err
	}

	// Convert to response format
	var transactions []models.RewardTransaction
	for _, token := range tokens {
		transactions = append(transactions, models.RewardTransaction{
			ID:          token.ID,
			Type:        token.Type,
			Amount:      token.Amount,
			Source:      token.Source,
			Description: token.Description,
			OrderID:     token.OrderID,
			CreatedAt:   token.CreatedAt,
		})
	}

	return transactions, total, nil
}

func (s *RewardsService) updateUserProfile(userID string, tokensDelta, redeemedDelta int) error {
	var profile models.UserRewardsProfile
	err := s.db.Where("user_id = ?", userID).First(&profile).Error
	if err != nil {
		return err
	}

	// Update tokens
	profile.TotalTokens += tokensDelta
	if tokensDelta > 0 {
		profile.LifetimeEarned += tokensDelta
	}
	if redeemedDelta > 0 {
		profile.LifetimeRedeemed += redeemedDelta
	}

	// Update tier
	newTier := s.calculateTier(profile.LifetimeEarned)
	if newTier != profile.Tier {
		profile.Tier = newTier
		// TODO: Send tier upgrade notification
	}

	// Update tier progress
	profile.TierProgress = s.calculateTierProgress(profile.Tier, profile.LifetimeEarned)

	return s.db.Save(&profile).Error
}

func (s *RewardsService) calculateTier(lifetimeEarned int) string {
	if lifetimeEarned >= models.TierThresholds["platinum"] {
		return "platinum"
	} else if lifetimeEarned >= models.TierThresholds["gold"] {
		return "gold"
	} else if lifetimeEarned >= models.TierThresholds["silver"] {
		return "silver"
	}
	return "bronze"
}

func (s *RewardsService) calculateTierProgress(tier string, lifetimeEarned int) int {
	currentThreshold := models.TierThresholds[tier]
	var nextThreshold int

	switch tier {
	case "bronze":
		nextThreshold = models.TierThresholds["silver"]
	case "silver":
		nextThreshold = models.TierThresholds["gold"]
	case "gold":
		nextThreshold = models.TierThresholds["platinum"]
	case "platinum":
		return 100 // Max tier
	}

	if nextThreshold == 0 {
		return 100
	}

	progress := ((lifetimeEarned - currentThreshold) * 100) / (nextThreshold - currentThreshold)
	if progress > 100 {
		progress = 100
	}
	return progress
}

func (s *RewardsService) calculateNextTierTokens(tier string, lifetimeEarned int) int {
	switch tier {
	case "bronze":
		return models.TierThresholds["silver"] - lifetimeEarned
	case "silver":
		return models.TierThresholds["gold"] - lifetimeEarned
	case "gold":
		return models.TierThresholds["platinum"] - lifetimeEarned
	case "platinum":
		return 0 // Max tier
	}
	return 0
}

// ProcessExpiredTokens processes expired reward tokens
func (s *RewardsService) ProcessExpiredTokens() error {
	s.logger.Info("Processing expired reward tokens")

	var expiredTokens []models.RewardToken
	err := s.db.Where("expires_at <= ? AND type = ?", time.Now(), "earned").Find(&expiredTokens).Error
	if err != nil {
		return err
	}

	for _, token := range expiredTokens {
		// Create expiry record
		expiryToken := &models.RewardToken{
			UserID:      token.UserID,
			Amount:      -token.Amount,
			Type:        "expired",
			Source:      "expiry",
			Description: "Tokens expired",
		}
		s.db.Create(expiryToken)

		// Update user profile
		s.updateUserProfile(token.UserID, -token.Amount, 0)

		// Mark original token as processed
		token.Type = "expired"
		s.db.Save(&token)
	}

	return nil
}

func timePtr(t time.Time) *time.Time {
	return &t
}