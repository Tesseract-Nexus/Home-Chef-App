package services

import (
	"customer-service/models"

	"gorm.io/gorm"
	"go.uber.org/zap"
)

type NotificationService struct {
	db     *gorm.DB
	logger *zap.Logger
}

func NewNotificationService(db *gorm.DB, logger *zap.Logger) *NotificationService {
	return &NotificationService{
		db:     db,
		logger: logger,
	}
}

func (s *NotificationService) GetNotificationSettings(customerID string) (*models.NotificationSettings, error) {
	var customer models.Customer
	err := s.db.First(&customer, "id = ? OR user_id = ?", customerID, customerID).Error
	if err != nil {
		return nil, err
	}

	return &customer.NotificationSettings, nil
}

func (s *NotificationService) UpdateNotificationSettings(customerID string, update *models.NotificationSettingsUpdate) (*models.NotificationSettings, error) {
	var customer models.Customer
	err := s.db.First(&customer, "id = ? OR user_id = ?", customerID, customerID).Error
	if err != nil {
		return nil, err
	}

	// Update email notification settings
	if update.EmailNotifications != nil {
		if update.EmailNotifications.OrderUpdates != nil {
			customer.NotificationSettings.EmailOrderUpdates = *update.EmailNotifications.OrderUpdates
		}
		if update.EmailNotifications.Promotions != nil {
			customer.NotificationSettings.EmailPromotions = *update.EmailNotifications.Promotions
		}
		if update.EmailNotifications.Newsletter != nil {
			customer.NotificationSettings.EmailNewsletter = *update.EmailNotifications.Newsletter
		}
	}

	// Update push notification settings
	if update.PushNotifications != nil {
		if update.PushNotifications.OrderUpdates != nil {
			customer.NotificationSettings.PushOrderUpdates = *update.PushNotifications.OrderUpdates
		}
		if update.PushNotifications.Promotions != nil {
			customer.NotificationSettings.PushPromotions = *update.PushNotifications.Promotions
		}
		if update.PushNotifications.ChatMessages != nil {
			customer.NotificationSettings.PushChatMessages = *update.PushNotifications.ChatMessages
		}
	}

	// Update SMS notification settings
	if update.SMSNotifications != nil {
		if update.SMSNotifications.OrderUpdates != nil {
			customer.NotificationSettings.SMSOrderUpdates = *update.SMSNotifications.OrderUpdates
		}
		if update.SMSNotifications.OTP != nil {
			customer.NotificationSettings.SMSOTP = *update.SMSNotifications.OTP
		}
		if update.SMSNotifications.Promotions != nil {
			customer.NotificationSettings.SMSPromotions = *update.SMSNotifications.Promotions
		}
	}

	err = s.db.Save(&customer).Error
	if err != nil {
		return nil, err
	}

	return &customer.NotificationSettings, nil
}