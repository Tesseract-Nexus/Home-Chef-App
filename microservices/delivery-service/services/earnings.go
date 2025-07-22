package services

import (
	"delivery-service/models"
	"time"

	"gorm.io/gorm"
	"go.uber.org/zap"
)

type EarningsService struct {
	db     *gorm.DB
	logger *zap.Logger
}

func NewEarningsService(db *gorm.DB, logger *zap.Logger) *EarningsService {
	return &EarningsService{
		db:     db,
		logger: logger,
	}
}

func (s *EarningsService) GetEarningsSummary(partnerID, period string) (*models.DeliveryEarningsSummary, error) {
	var startDate, endDate time.Time
	now := time.Now()

	switch period {
	case "today":
		startDate = time.Date(now.Year(), now.Month(), now.Day(), 0, 0, 0, 0, now.Location())
		endDate = startDate.Add(24 * time.Hour)
	case "this_week":
		startDate = now.AddDate(0, 0, -7)
		endDate = now
	case "this_month":
		startDate = now.AddDate(0, -1, 0)
		endDate = now
	case "last_30_days":
		startDate = now.AddDate(0, 0, -30)
		endDate = now
	default:
		startDate = now.AddDate(0, -1, 0)
		endDate = now
	}

	var earnings []models.DeliveryEarning
	err := s.db.Where("delivery_partner_id = ? AND date BETWEEN ? AND ?", partnerID, startDate, endDate).Find(&earnings).Error
	if err != nil {
		return nil, err
	}

	var totalEarnings, baseEarnings, tips, bonuses, deductions float64
	totalDeliveries := len(earnings)

	for _, earning := range earnings {
		totalEarnings += earning.TotalEarnings
		baseEarnings += earning.BaseEarnings
		tips += earning.Tips
		bonuses += earning.Bonuses
		deductions += earning.Deductions
	}

	avgEarningsPerDelivery := float64(0)
	if totalDeliveries > 0 {
		avgEarningsPerDelivery = totalEarnings / float64(totalDeliveries)
	}

	// Mock payout status
	payoutStatus := models.PayoutStatus{
		PendingAmount: totalEarnings * 0.8, // 80% pending
	}

	summary := &models.DeliveryEarningsSummary{
		TotalEarnings:          totalEarnings,
		BaseEarnings:           baseEarnings,
		Tips:                   tips,
		Bonuses:                bonuses,
		Deductions:             deductions,
		TotalDeliveries:        totalDeliveries,
		AvgEarningsPerDelivery: avgEarningsPerDelivery,
		PayoutStatus:           payoutStatus,
	}

	return summary, nil
}

func (s *EarningsService) GetEarningsBreakdown(partnerID, dateFrom, dateTo string) ([]models.DeliveryEarning, error) {
	var earnings []models.DeliveryEarning
	query := s.db.Where("delivery_partner_id = ?", partnerID)

	if dateFrom != "" {
		query = query.Where("date >= ?", dateFrom)
	}
	if dateTo != "" {
		query = query.Where("date <= ?", dateTo)
	}

	err := query.Order("date DESC").Find(&earnings).Error
	return earnings, err
}