package cron

import (
	"order-service/services"

	"github.com/robfig/cron/v3"
	"go.uber.org/zap"
)

type Scheduler struct {
	cron         *cron.Cron
	orderService *services.OrderService
	logger       *zap.Logger
}

func NewScheduler(orderService *services.OrderService, logger *zap.Logger) *Scheduler {
	return &Scheduler{
		cron:         cron.New(),
		orderService: orderService,
		logger:       logger,
	}
}

func (s *Scheduler) Start() {
	s.logger.Info("Starting order cron scheduler")

	// Process expired countdown timers every minute
	s.cron.AddFunc("* * * * *", func() {
		if err := s.orderService.ProcessExpiredCountdowns(); err != nil {
			s.logger.Error("Failed to process expired countdowns", zap.Error(err))
		}
	})

	s.cron.Start()
}

func (s *Scheduler) Stop() {
	s.logger.Info("Stopping order cron scheduler")
	s.cron.Stop()
}