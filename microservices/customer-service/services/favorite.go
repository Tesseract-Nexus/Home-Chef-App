package services

import (
	"customer-service/models"

	"gorm.io/gorm"
	"go.uber.org/zap"
)

type FavoriteService struct {
	db     *gorm.DB
	logger *zap.Logger
}

func NewFavoriteService(db *gorm.DB, logger *zap.Logger) *FavoriteService {
	return &FavoriteService{
		db:     db,
		logger: logger,
	}
}

func (s *FavoriteService) GetFavoriteChefs(customerID string) ([]models.FavoriteChef, error) {
	var favoriteChefs []models.FavoriteChef
	err := s.db.Where("customer_id = ?", customerID).Order("created_at DESC").Find(&favoriteChefs).Error
	return favoriteChefs, err
}

func (s *FavoriteService) AddFavoriteChef(customerID, chefID string) error {
	// Check if already exists
	var existing models.FavoriteChef
	err := s.db.Where("customer_id = ? AND chef_id = ?", customerID, chefID).First(&existing).Error
	if err == nil {
		return nil // Already exists
	}

	favoriteChef := &models.FavoriteChef{
		CustomerID: customerID,
		ChefID:     chefID,
	}

	return s.db.Create(favoriteChef).Error
}

func (s *FavoriteService) RemoveFavoriteChef(customerID, chefID string) error {
	return s.db.Where("customer_id = ? AND chef_id = ?", customerID, chefID).Delete(&models.FavoriteChef{}).Error
}

func (s *FavoriteService) GetFavoriteDishes(customerID string) ([]models.FavoriteDish, error) {
	var favoriteDishes []models.FavoriteDish
	err := s.db.Where("customer_id = ?", customerID).Order("created_at DESC").Find(&favoriteDishes).Error
	return favoriteDishes, err
}

func (s *FavoriteService) AddFavoriteDish(customerID, dishID string) error {
	// Check if already exists
	var existing models.FavoriteDish
	err := s.db.Where("customer_id = ? AND dish_id = ?", customerID, dishID).First(&existing).Error
	if err == nil {
		return nil // Already exists
	}

	favoriteDish := &models.FavoriteDish{
		CustomerID: customerID,
		DishID:     dishID,
	}

	return s.db.Create(favoriteDish).Error
}