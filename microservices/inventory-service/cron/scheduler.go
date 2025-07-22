package cron

import (
	"inventory-service/services"

	"github.com/robfig/cron/v3"
	"go.uber.org/zap"
)

type Scheduler struct {
	cron             *cron.Cron
	inventoryService *services.InventoryService
	logger           *zap.Logger
}

func NewScheduler(inventoryService *services.InventoryService, logger *zap.Logger) *Scheduler {
	return &Scheduler{
		cron:             cron.New(),
		inventoryService: inventoryService,
		logger:           logger,
	}
}

func (s *Scheduler) Start() {
	s.logger.Info("Starting inventory cron scheduler")

	// Daily expiry check at 2 AM
	s.cron.AddFunc("0 2 * * *", func() {
		s.logger.Info("Running daily expiry check")
		if err := s.inventoryService.ProcessExpiredIngredients(); err != nil {
			s.logger.Error("Daily expiry check failed", zap.Error(err))
		}
	})

	s.cron.Start()
}

func (s *Scheduler) Stop() {
	s.logger.Info("Stopping inventory cron scheduler")
	s.cron.Stop()
}