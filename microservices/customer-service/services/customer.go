package services

import (
	"encoding/json"
	"customer-service/models"
	"time"

	"gorm.io/gorm"
	"go.uber.org/zap"
)

type CustomerService struct {
	db     *gorm.DB
	logger *zap.Logger
}

func NewCustomerService(db *gorm.DB, logger *zap.Logger) *CustomerService {
	return &CustomerService{
		db:     db,
		logger: logger,
	}
}

func (s *CustomerService) GetCustomerByID(customerID string) (*models.Customer, error) {
	var customer models.Customer
	err := s.db.Preload("Addresses").Preload("PaymentMethods").
		Preload("FavoriteChefs").Preload("FavoriteDishes").
		First(&customer, "id = ? OR user_id = ?", customerID, customerID).Error
	if err != nil {
		return nil, err
	}
	return &customer, nil
}

func (s *CustomerService) UpdateCustomer(customerID string, update *models.CustomerProfileUpdate) (*models.Customer, error) {
	var customer models.Customer
	err := s.db.First(&customer, "id = ? OR user_id = ?", customerID, customerID).Error
	if err != nil {
		return nil, err
	}

	// Update fields if provided
	if update.Name != nil {
		customer.Name = *update.Name
	}
	if update.Phone != nil {
		customer.Phone = *update.Phone
	}
	if update.Avatar != nil {
		customer.Avatar = *update.Avatar
	}
	if update.Preferences != nil {
		dietaryJSON, _ := json.Marshal(update.Preferences.Dietary)
		cuisineJSON, _ := json.Marshal(update.Preferences.CuisinePreferences)
		
		customer.Preferences.Dietary = string(dietaryJSON)
		customer.Preferences.CuisinePreferences = string(cuisineJSON)
		if update.Preferences.SpicePreference != "" {
			customer.Preferences.SpicePreference = update.Preferences.SpicePreference
		}
	}

	err = s.db.Save(&customer).Error
	if err != nil {
		return nil, err
	}

	return &customer, nil
}

func (s *CustomerService) GetCustomerActivity(customerID string) (*models.CustomerActivity, error) {
	var customer models.Customer
	err := s.db.First(&customer, "id = ? OR user_id = ?", customerID, customerID).Error
	if err != nil {
		return nil, err
	}

	// Get review statistics
	var reviewCount int64
	var avgRating float64
	s.db.Model(&models.CustomerReview{}).Where("customer_id = ?", customer.ID).Count(&reviewCount)
	s.db.Model(&models.CustomerReview{}).Where("customer_id = ?", customer.ID).Select("AVG(rating)").Scan(&avgRating)

	// Parse favorite cuisines
	var favoriteCuisines []string
	if customer.Preferences.CuisinePreferences != "" {
		json.Unmarshal([]byte(customer.Preferences.CuisinePreferences), &favoriteCuisines)
	}

	activity := &models.CustomerActivity{
		TotalOrders:      customer.TotalOrders,
		TotalSpent:       customer.TotalSpent,
		FavoriteCuisines: favoriteCuisines,
		AvgOrderValue:    customer.AvgOrderValue,
		LoyaltyPoints:    customer.LoyaltyPoints,
		ReviewsGiven:     int(reviewCount),
		AvgRatingGiven:   avgRating,
	}

	if customer.LastOrderDate != nil {
		activity.LastOrderDate = *customer.LastOrderDate
	}

	return activity, nil
}