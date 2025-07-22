package services

import (
	"delivery-service/models"

	"gorm.io/gorm"
	"go.uber.org/zap"
)

type DeliveryService struct {
	db     *gorm.DB
	logger *zap.Logger
}

func NewDeliveryService(db *gorm.DB, logger *zap.Logger) *DeliveryService {
	return &DeliveryService{
		db:     db,
		logger: logger,
	}
}

func (s *DeliveryService) GetDeliveryPartnerByID(partnerID string) (*models.DeliveryPartner, error) {
	var partner models.DeliveryPartner
	err := s.db.Preload("DeliveryOrders").Preload("Earnings").
		First(&partner, "id = ? OR user_id = ?", partnerID, partnerID).Error
	if err != nil {
		return nil, err
	}
	return &partner, nil
}

func (s *DeliveryService) UpdateDeliveryPartner(partnerID string, update *models.DeliveryPartnerUpdate) (*models.DeliveryPartner, error) {
	var partner models.DeliveryPartner
	err := s.db.First(&partner, "id = ? OR user_id = ?", partnerID, partnerID).Error
	if err != nil {
		return nil, err
	}

	// Update fields if provided
	if update.Name != nil {
		partner.Name = *update.Name
	}
	if update.Phone != nil {
		partner.Phone = *update.Phone
	}
	if update.Avatar != nil {
		partner.Avatar = *update.Avatar
	}
	if update.EmergencyContact != nil {
		partner.EmergencyContact = *update.EmergencyContact
	}

	err = s.db.Save(&partner).Error
	if err != nil {
		return nil, err
	}

	return &partner, nil
}

func (s *DeliveryService) UpdateAvailabilityStatus(partnerID string, statusUpdate *models.StatusUpdate) error {
	var partner models.DeliveryPartner
	err := s.db.First(&partner, "id = ? OR user_id = ?", partnerID, partnerID).Error
	if err != nil {
		return err
	}

	partner.IsAvailable = statusUpdate.IsAvailable
	if statusUpdate.Location != nil {
		partner.CurrentLatitude = statusUpdate.Location.Latitude
		partner.CurrentLongitude = statusUpdate.Location.Longitude
	}

	return s.db.Save(&partner).Error
}