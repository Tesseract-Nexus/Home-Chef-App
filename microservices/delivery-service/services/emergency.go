package services

import (
	"delivery-service/models"

	"github.com/google/uuid"
	"gorm.io/gorm"
	"go.uber.org/zap"
)

type EmergencyService struct {
	db     *gorm.DB
	logger *zap.Logger
}

func NewEmergencyService(db *gorm.DB, logger *zap.Logger) *EmergencyService {
	return &EmergencyService{
		db:     db,
		logger: logger,
	}
}

func (s *EmergencyService) ReportEmergency(partnerID string, emergencyReport *models.EmergencyReportCreate) (string, error) {
	report := &models.EmergencyReport{
		ID:                uuid.New().String(),
		DeliveryPartnerID: partnerID,
		Type:              emergencyReport.Type,
		Description:       emergencyReport.Description,
		Latitude:          emergencyReport.Location.Latitude,
		Longitude:         emergencyReport.Location.Longitude,
		Status:            "reported",
	}

	if emergencyReport.OrderID != nil {
		report.OrderID = emergencyReport.OrderID
	}

	err := s.db.Create(report).Error
	if err != nil {
		return "", err
	}

	// TODO: Send emergency notifications to admin and support team
	s.logger.Warn("Emergency reported",
		zap.String("report_id", report.ID),
		zap.String("partner_id", partnerID),
		zap.String("type", emergencyReport.Type),
		zap.String("description", emergencyReport.Description),
	)

	return report.ID, nil
}