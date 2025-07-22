package cron

import (
	"rewards-service/services"

	"github.com/robfig/cron/v3"
	"go.uber.org/zap"
)

type Scheduler struct {
	cron                *cron.Cron
	rewardsService      *services.RewardsService
	subscriptionService *services.SubscriptionService
	logger              *zap.Logger
}

func NewScheduler(rewardsService *services.RewardsService, subscriptionService *services.SubscriptionService, logger *zap.Logger) *Scheduler {
	return &Scheduler{
		cron:                cron.New(),
		rewardsService:      rewardsService,
		subscriptionService: subscriptionService,
		logger:              logger,
	}
}

func (s *Scheduler) Start() {
	s.logger.Info("Starting rewards cron scheduler")

	// Process expired tokens daily at 2 AM
	s.cron.AddFunc("0 2 * * *", func() {
		s.logger.Info("Processing expired reward tokens")
		if err := s.rewardsService.ProcessExpiredTokens(); err != nil {
			s.logger.Error("Failed to process expired tokens", zap.Error(err))
		}
	})

	// Process subscription renewals daily at 3 AM
	s.cron.AddFunc("0 3 * * *", func() {
		s.logger.Info("Processing subscription renewals")
		if err := s.subscriptionService.ProcessSubscriptionRenewals(); err != nil {
			s.logger.Error("Failed to process subscription renewals", zap.Error(err))
		}
	})

	// Process expired subscriptions daily at 4 AM
	s.cron.AddFunc("0 4 * * *", func() {
		s.logger.Info("Processing expired subscriptions")
		if err := s.subscriptionService.ProcessExpiredSubscriptions(); err != nil {
			s.logger.Error("Failed to process expired subscriptions", zap.Error(err))
		}
	})

	s.cron.Start()
}

func (s *Scheduler) Stop() {
	s.logger.Info("Stopping rewards cron scheduler")
	s.cron.Stop()
}