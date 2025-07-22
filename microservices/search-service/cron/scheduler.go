package cron

import (
	"search-service/services"

	"github.com/robfig/cron/v3"
	"go.uber.org/zap"
)

type Scheduler struct {
	cron          *cron.Cron
	searchService *services.SearchService
	logger        *zap.Logger
}

func NewScheduler(searchService *services.SearchService, logger *zap.Logger) *Scheduler {
	return &Scheduler{
		cron:          cron.New(),
		searchService: searchService,
		logger:        logger,
	}
}

func (s *Scheduler) Start() {
	s.logger.Info("Starting search cron scheduler")

	// Process search analytics daily at 2 AM
	s.cron.AddFunc("0 2 * * *", func() {
		s.logger.Info("Processing search analytics")
		if err := s.searchService.ProcessSearchAnalytics(); err != nil {
			s.logger.Error("Failed to process search analytics", zap.Error(err))
		}
	})

	s.cron.Start()
}

func (s *Scheduler) Stop() {
	s.logger.Info("Stopping search cron scheduler")
	s.cron.Stop()
}