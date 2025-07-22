package services

import (
	"encoding/json"
	"rewards-service/models"
	"time"

	"gorm.io/gorm"
	"go.uber.org/zap"
)

type SubscriptionService struct {
	db     *gorm.DB
	logger *zap.Logger
}

func NewSubscriptionService(db *gorm.DB, logger *zap.Logger) *SubscriptionService {
	return &SubscriptionService{
		db:     db,
		logger: logger,
	}
}

func (s *SubscriptionService) GetSubscriptionPlans() ([]models.SubscriptionPlanResponse, error) {
	var plans []models.SubscriptionPlan
	err := s.db.Where("is_active = ?", true).Find(&plans).Error
	if err != nil {
		return nil, err
	}

	var responses []models.SubscriptionPlanResponse
	for _, plan := range plans {
		var benefits []string
		if plan.Benefits != "" {
			json.Unmarshal([]byte(plan.Benefits), &benefits)
		}

		responses = append(responses, models.SubscriptionPlanResponse{
			ID:              plan.ID,
			Name:            plan.Name,
			Description:     plan.Description,
			Price:           plan.Price,
			Duration:        plan.Duration,
			Benefits:        benefits,
			TokenMultiplier: plan.TokenMultiplier,
			FreeDelivery:    plan.FreeDelivery,
			PrioritySupport: plan.PrioritySupport,
		})
	}

	return responses, nil
}

func (s *SubscriptionService) CreateSubscription(userID string, request *models.SubscriptionCreateRequest) (*models.UserSubscription, error) {
	// Check if user already has active subscription
	var existingSub models.UserSubscription
	err := s.db.Where("user_id = ? AND status = ?", userID, "active").First(&existingSub).Error
	if err == nil {
		return nil, gorm.ErrDuplicatedKey
	}

	// Get plan details
	var plan models.SubscriptionPlan
	err = s.db.Where("id = ? AND is_active = ?", request.PlanID, true).First(&plan).Error
	if err != nil {
		return nil, err
	}

	// Calculate subscription period
	startDate := time.Now()
	var endDate time.Time
	if plan.Duration == "monthly" {
		endDate = startDate.AddDate(0, 1, 0)
	} else if plan.Duration == "yearly" {
		endDate = startDate.AddDate(1, 0, 0)
	}

	// Create subscription
	subscription := &models.UserSubscription{
		UserID:          userID,
		PlanID:          request.PlanID,
		Status:          "active",
		StartDate:       startDate,
		EndDate:         endDate,
		AutoRenew:       true,
		PaymentMethodID: request.PaymentMethodID,
	}

	err = s.db.Create(subscription).Error
	if err != nil {
		return nil, err
	}

	// Create initial payment record
	payment := &models.SubscriptionPayment{
		SubscriptionID: subscription.ID,
		Amount:         plan.Price,
		Status:         "completed",
		PaymentDate:    startDate,
		PeriodStart:    startDate,
		PeriodEnd:      endDate,
		TransactionID:  "txn_" + time.Now().Format("20060102150405"),
	}
	s.db.Create(payment)

	// Load plan relationship
	s.db.Preload("Plan").First(subscription, "id = ?", subscription.ID)

	return subscription, nil
}

func (s *SubscriptionService) GetCurrentSubscription(userID string) (*models.UserSubscriptionResponse, error) {
	var subscription models.UserSubscription
	err := s.db.Preload("Plan").Where("user_id = ? AND status = ?", userID, "active").First(&subscription).Error
	if err != nil {
		return nil, err
	}

	// Parse benefits
	var benefits []string
	if subscription.Plan.Benefits != "" {
		json.Unmarshal([]byte(subscription.Plan.Benefits), &benefits)
	}

	// Calculate days remaining
	daysRemaining := int(time.Until(subscription.EndDate).Hours() / 24)
	if daysRemaining < 0 {
		daysRemaining = 0
	}

	return &models.UserSubscriptionResponse{
		ID: subscription.ID,
		Plan: models.SubscriptionPlanResponse{
			ID:              subscription.Plan.ID,
			Name:            subscription.Plan.Name,
			Description:     subscription.Plan.Description,
			Price:           subscription.Plan.Price,
			Duration:        subscription.Plan.Duration,
			Benefits:        benefits,
			TokenMultiplier: subscription.Plan.TokenMultiplier,
			FreeDelivery:    subscription.Plan.FreeDelivery,
			PrioritySupport: subscription.Plan.PrioritySupport,
		},
		Status:            subscription.Status,
		StartDate:         subscription.StartDate,
		EndDate:           subscription.EndDate,
		AutoRenew:         subscription.AutoRenew,
		CancelAtPeriodEnd: subscription.CancelAtPeriodEnd,
		DaysRemaining:     daysRemaining,
	}, nil
}

func (s *SubscriptionService) UpdateSubscription(userID string, request *models.SubscriptionUpdateRequest) (*models.UserSubscription, error) {
	var subscription models.UserSubscription
	err := s.db.Where("user_id = ? AND status = ?", userID, "active").First(&subscription).Error
	if err != nil {
		return nil, err
	}

	// Update fields if provided
	if request.PlanID != nil {
		subscription.PlanID = *request.PlanID
		// TODO: Handle plan change logic (prorating, etc.)
	}
	if request.AutoRenew != nil {
		subscription.AutoRenew = *request.AutoRenew
	}

	err = s.db.Save(&subscription).Error
	if err != nil {
		return nil, err
	}

	return &subscription, nil
}

func (s *SubscriptionService) CancelSubscription(userID string, request *models.SubscriptionCancelRequest) error {
	var subscription models.UserSubscription
	err := s.db.Where("user_id = ? AND status = ?", userID, "active").First(&subscription).Error
	if err != nil {
		return err
	}

	if request.CancelAtPeriodEnd {
		// Cancel at period end
		subscription.CancelAtPeriodEnd = true
		subscription.AutoRenew = false
	} else {
		// Cancel immediately
		subscription.Status = "cancelled"
		now := time.Now()
		subscription.CancelledAt = &now
	}

	subscription.CancelReason = request.Reason

	return s.db.Save(&subscription).Error
}

// ProcessSubscriptionRenewals processes subscription renewals
func (s *SubscriptionService) ProcessSubscriptionRenewals() error {
	s.logger.Info("Processing subscription renewals")

	var subscriptions []models.UserSubscription
	err := s.db.Preload("Plan").Where("status = ? AND end_date <= ? AND auto_renew = ?", 
		"active", time.Now(), true).Find(&subscriptions).Error
	if err != nil {
		return err
	}

	for _, subscription := range subscriptions {
		// Calculate new period
		startDate := subscription.EndDate
		var endDate time.Time
		if subscription.Plan.Duration == "monthly" {
			endDate = startDate.AddDate(0, 1, 0)
		} else if subscription.Plan.Duration == "yearly" {
			endDate = startDate.AddDate(1, 0, 0)
		}

		// Update subscription
		subscription.StartDate = startDate
		subscription.EndDate = endDate
		s.db.Save(&subscription)

		// Create payment record
		payment := &models.SubscriptionPayment{
			SubscriptionID: subscription.ID,
			Amount:         subscription.Plan.Price,
			Status:         "completed",
			PaymentDate:    startDate,
			PeriodStart:    startDate,
			PeriodEnd:      endDate,
			TransactionID:  "renewal_" + time.Now().Format("20060102150405"),
		}
		s.db.Create(payment)

		s.logger.Info("Subscription renewed", 
			zap.String("subscription_id", subscription.ID),
			zap.String("user_id", subscription.UserID))
	}

	return nil
}

// ProcessExpiredSubscriptions processes expired subscriptions
func (s *SubscriptionService) ProcessExpiredSubscriptions() error {
	s.logger.Info("Processing expired subscriptions")

	var subscriptions []models.UserSubscription
	err := s.db.Where("status = ? AND end_date <= ? AND (auto_renew = ? OR cancel_at_period_end = ?)", 
		"active", time.Now(), false, true).Find(&subscriptions).Error
	if err != nil {
		return err
	}

	for _, subscription := range subscriptions {
		subscription.Status = "expired"
		s.db.Save(&subscription)

		s.logger.Info("Subscription expired", 
			zap.String("subscription_id", subscription.ID),
			zap.String("user_id", subscription.UserID))
	}

	return nil
}