package services

import (
	"customer-service/models"

	"gorm.io/gorm"
	"go.uber.org/zap"
)

type AddressService struct {
	db     *gorm.DB
	logger *zap.Logger
}

func NewAddressService(db *gorm.DB, logger *zap.Logger) *AddressService {
	return &AddressService{
		db:     db,
		logger: logger,
	}
}

func (s *AddressService) GetCustomerAddresses(customerID string) ([]models.CustomerAddress, error) {
	var addresses []models.CustomerAddress
	err := s.db.Where("customer_id = ?", customerID).Order("is_default DESC, created_at DESC").Find(&addresses).Error
	return addresses, err
}

func (s *AddressService) CreateAddress(customerID string, addressCreate *models.AddressCreate) (*models.CustomerAddress, error) {
	address := &models.CustomerAddress{
		CustomerID:           customerID,
		Type:                 addressCreate.Type,
		Label:                addressCreate.Label,
		FullAddress:          addressCreate.FullAddress,
		Landmark:             addressCreate.Landmark,
		City:                 addressCreate.City,
		State:                addressCreate.State,
		Pincode:              addressCreate.Pincode,
		IsDefault:            addressCreate.IsDefault,
		DeliveryInstructions: addressCreate.DeliveryInstructions,
	}

	if addressCreate.Coordinates != nil {
		address.Coordinates = *addressCreate.Coordinates
	}

	// If this is set as default, unset other default addresses
	if address.IsDefault {
		s.db.Model(&models.CustomerAddress{}).Where("customer_id = ? AND is_default = ?", customerID, true).Update("is_default", false)
	}

	err := s.db.Create(address).Error
	if err != nil {
		return nil, err
	}

	return address, nil
}

func (s *AddressService) UpdateAddress(addressID, customerID string, update *models.AddressUpdate) (*models.CustomerAddress, error) {
	var address models.CustomerAddress
	err := s.db.Where("id = ? AND customer_id = ?", addressID, customerID).First(&address).Error
	if err != nil {
		return nil, err
	}

	// Update fields if provided
	if update.Label != nil {
		address.Label = *update.Label
	}
	if update.FullAddress != nil {
		address.FullAddress = *update.FullAddress
	}
	if update.Landmark != nil {
		address.Landmark = *update.Landmark
	}
	if update.DeliveryInstructions != nil {
		address.DeliveryInstructions = *update.DeliveryInstructions
	}

	err = s.db.Save(&address).Error
	if err != nil {
		return nil, err
	}

	return &address, nil
}

func (s *AddressService) DeleteAddress(addressID, customerID string) error {
	return s.db.Where("id = ? AND customer_id = ?", addressID, customerID).Delete(&models.CustomerAddress{}).Error
}

func (s *AddressService) SetDefaultAddress(addressID, customerID string) error {
	// Start transaction
	tx := s.db.Begin()

	// Unset all default addresses for customer
	if err := tx.Model(&models.CustomerAddress{}).Where("customer_id = ?", customerID).Update("is_default", false).Error; err != nil {
		tx.Rollback()
		return err
	}

	// Set the specified address as default
	if err := tx.Model(&models.CustomerAddress{}).Where("id = ? AND customer_id = ?", addressID, customerID).Update("is_default", true).Error; err != nil {
		tx.Rollback()
		return err
	}

	return tx.Commit().Error
}