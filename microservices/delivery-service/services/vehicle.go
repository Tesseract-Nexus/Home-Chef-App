package services

import (
	"delivery-service/models"

	"gorm.io/gorm"
	"go.uber.org/zap"
)

type VehicleService struct {
	db     *gorm.DB
	logger *zap.Logger
}

func NewVehicleService(db *gorm.DB, logger *zap.Logger) *VehicleService {
	return &VehicleService{
		db:     db,
		logger: logger,
	}
}

func (s *VehicleService) UpdateVehicle(partnerID string, vehicleUpdate *models.VehicleUpdate) error {
	var partner models.DeliveryPartner
	err := s.db.First(&partner, "id = ? OR user_id = ?", partnerID, partnerID).Error
	if err != nil {
		return err
	}

	// Update vehicle information
	if vehicleUpdate.Type != "" {
		partner.Vehicle.Type = vehicleUpdate.Type
	}
	if vehicleUpdate.Brand != "" {
		partner.Vehicle.Brand = vehicleUpdate.Brand
	}
	if vehicleUpdate.Model != "" {
		partner.Vehicle.Model = vehicleUpdate.Model
	}
	if vehicleUpdate.RegistrationNumber != "" {
		partner.Vehicle.RegistrationNumber = vehicleUpdate.RegistrationNumber
	}
	if vehicleUpdate.Color != "" {
		partner.Vehicle.Color = vehicleUpdate.Color
	}
	if !vehicleUpdate.InsuranceExpiry.IsZero() {
		partner.Vehicle.InsuranceExpiry = vehicleUpdate.InsuranceExpiry
	}

	return s.db.Save(&partner).Error
}