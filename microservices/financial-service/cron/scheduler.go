package cron

import (
	"financial-service/services"

	"github.com/robfig/cron/v3"
	"go.uber.org/zap"
)

type Scheduler struct {
	cron             *cron.Cron
	financialService *services.FinancialService
	logger           *zap.Logger
}

func NewScheduler(financialService *services.FinancialService, logger *zap.Logger) *Scheduler {
	return &Scheduler{
		cron:             cron.New(),
		financialService: financialService,
		logger:           logger,
	}
}

func (s *Scheduler) Start() {
	s.logger.Info("Starting financial cron scheduler")

	// Daily financial processing at 1 AM
	s.cron.AddFunc("0 1 * * *", func() {
		s.logger.Info("Running daily financial processing")
		if err := s.financialService.ProcessDailyFinancials(); err != nil {
			s.logger.Error("Daily financial processing failed", zap.Error(err))
		}
	})

	// Weekly financial processing on Mondays at 2 AM
	s.cron.AddFunc("0 2 * * 1", func() {
		s.logger.Info("Running weekly financial processing")
		if err := s.financialService.ProcessWeeklyFinancials(); err != nil {
			s.logger.Error("Weekly financial processing failed", zap.Error(err))
		}
	})

	// Monthly financial processing on 1st of month at 3 AM
	s.cron.AddFunc("0 3 1 * *", func() {
		s.logger.Info("Running monthly financial processing")
		if err := s.financialService.ProcessMonthlyFinancials(); err != nil {
			s.logger.Error("Monthly financial processing failed", zap.Error(err))
		}
	})

	s.cron.Start()
}

func (s *Scheduler) Stop() {
	s.logger.Info("Stopping financial cron scheduler")
	s.cron.Stop()
}