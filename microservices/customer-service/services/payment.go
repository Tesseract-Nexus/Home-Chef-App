package services

import (
	"encoding/json"
	"customer-service/models"

	"gorm.io/gorm"
	"go.uber.org/zap"
)

type PaymentService struct {
	db     *gorm.DB
	logger *zap.Logger
}

func NewPaymentService(db *gorm.DB, logger *zap.Logger) *PaymentService {
	return &PaymentService{
		db:     db,
		logger: logger,
	}
}

func (s *PaymentService) GetCustomerPaymentMethods(customerID string) ([]models.PaymentMethod, error) {
	var paymentMethods []models.PaymentMethod
	err := s.db.Where("customer_id = ?", customerID).Order("is_default DESC, created_at DESC").Find(&paymentMethods).Error
	return paymentMethods, err
}

func (s *PaymentService) CreatePaymentMethod(customerID string, paymentMethodCreate *models.PaymentMethodCreate) (*models.PaymentMethod, error) {
	paymentMethod := &models.PaymentMethod{
		CustomerID: customerID,
		Type:       paymentMethodCreate.Type,
	}

	// Handle different payment method types
	switch paymentMethodCreate.Type {
	case "card":
		if paymentMethodCreate.Card != nil {
			// In production, you would tokenize the card with a payment processor
			cardInfo := map[string]interface{}{
				"last4":     paymentMethodCreate.Card.Number[len(paymentMethodCreate.Card.Number)-4:],
				"brand":     "visa", // Would be determined by card number
				"exp_month": paymentMethodCreate.Card.ExpMonth,
				"exp_year":  paymentMethodCreate.Card.ExpYear,
				"name":      paymentMethodCreate.Card.Name,
			}
			cardInfoJSON, _ := json.Marshal(cardInfo)
			paymentMethod.CardInfo = string(cardInfoJSON)
		}
	case "upi":
		if paymentMethodCreate.UPI != nil {
			upiInfo := map[string]interface{}{
				"vpa": paymentMethodCreate.UPI.VPA,
			}
			upiInfoJSON, _ := json.Marshal(upiInfo)
			paymentMethod.UPIInfo = string(upiInfoJSON)
		}
	}

	err := s.db.Create(paymentMethod).Error
	if err != nil {
		return nil, err
	}

	return paymentMethod, nil
}

func (s *PaymentService) DeletePaymentMethod(paymentMethodID, customerID string) error {
	return s.db.Where("id = ? AND customer_id = ?", paymentMethodID, customerID).Delete(&models.PaymentMethod{}).Error
}