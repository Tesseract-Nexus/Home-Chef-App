package services

import (
	"encoding/json"
	"inventory-service/models"
	"time"

	"gorm.io/gorm"
	"go.uber.org/zap"
)

type InventoryService struct {
	db     *gorm.DB
	logger *zap.Logger
}

func NewInventoryService(db *gorm.DB, logger *zap.Logger) *InventoryService {
	return &InventoryService{
		db:     db,
		logger: logger,
	}
}

func (s *InventoryService) GetIngredients(chefID, category, status string, expiryWithinDays int) ([]models.Ingredient, error) {
	var ingredients []models.Ingredient
	query := s.db.Where("chef_id = ?", chefID)

	if category != "" {
		query = query.Where("category = ?", category)
	}
	if status != "" {
		query = query.Where("status = ?", status)
	}
	if expiryWithinDays > 0 {
		expiryDate := time.Now().AddDate(0, 0, expiryWithinDays)
		query = query.Where("expiry_date <= ? AND expiry_date IS NOT NULL", expiryDate)
	}

	err := query.Preload("StockMovements").Find(&ingredients).Error
	return ingredients, err
}

func (s *InventoryService) CreateIngredient(chefID string, ingredientCreate *models.IngredientCreate) (*models.Ingredient, error) {
	ingredient := &models.Ingredient{
		ChefID:          chefID,
		Name:            ingredientCreate.Name,
		Category:        ingredientCreate.Category,
		CurrentStock:    ingredientCreate.CurrentStock,
		MinimumStock:    ingredientCreate.MinimumStock,
		CostPerUnit:     ingredientCreate.CostPerUnit,
		Supplier:        ingredientCreate.Supplier,
		ExpiryDate:      ingredientCreate.ExpiryDate,
		StorageLocation: ingredientCreate.StorageLocation,
		Status:          s.calculateStatus(ingredientCreate.CurrentStock.Quantity, ingredientCreate.MinimumStock),
	}

	err := s.db.Create(ingredient).Error
	if err != nil {
		return nil, err
	}

	// Create initial stock movement
	stockMovement := &models.StockMovement{
		IngredientID: ingredient.ID,
		ChefID:       chefID,
		Type:         "set",
		Quantity:     ingredient.CurrentStock.Quantity,
		Unit:         ingredient.CurrentStock.Unit,
		PreviousQty:  0,
		NewQty:       ingredient.CurrentStock.Quantity,
		Reason:       "Initial stock",
		Cost:         ingredient.CurrentStock.Quantity * ingredient.CostPerUnit,
	}

	s.db.Create(stockMovement)

	return ingredient, nil
}

func (s *InventoryService) UpdateIngredient(ingredientID, chefID string, update *models.IngredientUpdate) (*models.Ingredient, error) {
	var ingredient models.Ingredient
	err := s.db.Where("id = ? AND chef_id = ?", ingredientID, chefID).First(&ingredient).Error
	if err != nil {
		return nil, err
	}

	// Update fields if provided
	if update.Name != nil {
		ingredient.Name = *update.Name
	}
	if update.MinimumStock != nil {
		ingredient.MinimumStock = *update.MinimumStock
		// Recalculate status
		ingredient.Status = s.calculateStatus(ingredient.CurrentStock.Quantity, ingredient.MinimumStock)
	}
	if update.CostPerUnit != nil {
		ingredient.CostPerUnit = *update.CostPerUnit
	}
	if update.Supplier != nil {
		ingredient.Supplier = *update.Supplier
	}
	if update.ExpiryDate != nil {
		ingredient.ExpiryDate = update.ExpiryDate
	}
	if update.StorageLocation != nil {
		ingredient.StorageLocation = *update.StorageLocation
	}

	err = s.db.Save(&ingredient).Error
	if err != nil {
		return nil, err
	}

	return &ingredient, nil
}

func (s *InventoryService) UpdateStock(ingredientID, chefID string, stockUpdate *models.StockUpdate) error {
	var ingredient models.Ingredient
	err := s.db.Where("id = ? AND chef_id = ?", ingredientID, chefID).First(&ingredient).Error
	if err != nil {
		return err
	}

	previousQty := ingredient.CurrentStock.Quantity
	var newQty float64

	switch stockUpdate.Operation {
	case "add":
		newQty = previousQty + stockUpdate.Quantity
	case "subtract":
		newQty = previousQty - stockUpdate.Quantity
		if newQty < 0 {
			newQty = 0
		}
	case "set":
		newQty = stockUpdate.Quantity
	default:
		newQty = stockUpdate.Quantity
	}

	// Update ingredient stock
	ingredient.CurrentStock.Quantity = newQty
	ingredient.CurrentStock.Unit = stockUpdate.Unit
	ingredient.Status = s.calculateStatus(newQty, ingredient.MinimumStock)
	ingredient.LastUpdated = time.Now()

	err = s.db.Save(&ingredient).Error
	if err != nil {
		return err
	}

	// Create stock movement record
	stockMovement := &models.StockMovement{
		IngredientID: ingredientID,
		ChefID:       chefID,
		Type:         stockUpdate.Operation,
		Quantity:     stockUpdate.Quantity,
		Unit:         stockUpdate.Unit,
		PreviousQty:  previousQty,
		NewQty:       newQty,
		Reason:       stockUpdate.Reason,
		Cost:         stockUpdate.Quantity * ingredient.CostPerUnit,
	}

	s.db.Create(stockMovement)

	// Check for alerts
	go s.checkAndCreateAlerts(chefID, &ingredient)

	return nil
}

func (s *InventoryService) GetRecipeIngredients(dishID string, servings int) ([]models.RecipeIngredient, error) {
	var recipeIngredients []models.RecipeIngredient
	err := s.db.Where("dish_id = ?", dishID).Preload("Ingredient").Find(&recipeIngredients).Error
	if err != nil {
		return nil, err
	}

	// Adjust quantities based on servings
	if servings > 1 {
		for i := range recipeIngredients {
			recipeIngredients[i].Quantity *= float64(servings)
		}
	}

	return recipeIngredients, nil
}

func (s *InventoryService) UpdateRecipeIngredients(dishID string, ingredients []models.RecipeIngredientCreate) error {
	// Delete existing recipe ingredients
	err := s.db.Where("dish_id = ?", dishID).Delete(&models.RecipeIngredient{}).Error
	if err != nil {
		return err
	}

	// Create new recipe ingredients
	for _, ing := range ingredients {
		substitutesJSON, _ := json.Marshal(ing.Substitutes)
		
		recipeIngredient := &models.RecipeIngredient{
			DishID:       dishID,
			IngredientID: ing.IngredientID,
			Quantity:     ing.Quantity,
			Unit:         ing.Unit,
			IsOptional:   ing.IsOptional,
			Substitutes:  string(substitutesJSON),
		}

		err = s.db.Create(recipeIngredient).Error
		if err != nil {
			return err
		}
	}

	return nil
}

func (s *InventoryService) CheckAvailability(chefID string, availabilityCheck *models.AvailabilityCheck) (*models.AvailabilityResult, error) {
	result := &models.AvailabilityResult{
		CanFulfill:         true,
		MissingIngredients: []models.MissingIngredient{},
	}

	for _, order := range availabilityCheck.Orders {
		// Get recipe ingredients for the dish
		recipeIngredients, err := s.GetRecipeIngredients(order.DishID, order.Quantity)
		if err != nil {
			continue
		}

		// Check availability for each ingredient
		for _, recipeIng := range recipeIngredients {
			if recipeIng.IsOptional {
				continue
			}

			var ingredient models.Ingredient
			err := s.db.Where("id = ? AND chef_id = ?", recipeIng.IngredientID, chefID).First(&ingredient).Error
			if err != nil {
				continue
			}

			requiredQty := recipeIng.Quantity
			availableQty := ingredient.CurrentStock.Quantity

			if availableQty < requiredQty {
				result.CanFulfill = false
				result.MissingIngredients = append(result.MissingIngredients, models.MissingIngredient{
					IngredientName:    ingredient.Name,
					RequiredQuantity:  requiredQty,
					AvailableQuantity: availableQty,
					Shortage:          requiredQty - availableQty,
					Unit:              recipeIng.Unit,
				})
			}
		}
	}

	return result, nil
}

func (s *InventoryService) GetAlerts(chefID, alertType, priority string) ([]models.InventoryAlert, error) {
	var alerts []models.InventoryAlert
	query := s.db.Where("chef_id = ? AND is_resolved = ?", chefID, false)

	if alertType != "" {
		query = query.Where("type = ?", alertType)
	}
	if priority != "" {
		query = query.Where("priority = ?", priority)
	}

	err := query.Preload("Ingredient").Order("created_at DESC").Find(&alerts).Error
	return alerts, err
}

func (s *InventoryService) GetAlertSettings(chefID string) (*models.AlertSettings, error) {
	var settings models.AlertSettings
	err := s.db.Where("chef_id = ?", chefID).First(&settings).Error
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			// Create default settings
			settings = models.AlertSettings{
				ChefID:              chefID,
				LowStockThreshold:   10.0,
				ExpiryWarningDays:   3,
				EmailNotifications:  true,
				PushNotifications:   true,
				SMSNotifications:    false,
			}
			s.db.Create(&settings)
		} else {
			return nil, err
		}
	}
	return &settings, nil
}

func (s *InventoryService) UpdateAlertSettings(chefID string, update *models.AlertSettingsUpdate) (*models.AlertSettings, error) {
	settings, err := s.GetAlertSettings(chefID)
	if err != nil {
		return nil, err
	}

	// Update fields if provided
	if update.LowStockThreshold != nil {
		settings.LowStockThreshold = *update.LowStockThreshold
	}
	if update.ExpiryWarningDays != nil {
		settings.ExpiryWarningDays = *update.ExpiryWarningDays
	}
	if update.EmailNotifications != nil {
		settings.EmailNotifications = *update.EmailNotifications
	}
	if update.PushNotifications != nil {
		settings.PushNotifications = *update.PushNotifications
	}
	if update.SMSNotifications != nil {
		settings.SMSNotifications = *update.SMSNotifications
	}

	err = s.db.Save(settings).Error
	if err != nil {
		return nil, err
	}

	return settings, nil
}

func (s *InventoryService) calculateStatus(currentStock, minimumStock float64) string {
	if currentStock <= 0 {
		return "out_of_stock"
	} else if currentStock <= minimumStock {
		return "low_stock"
	}
	return "in_stock"
}

func (s *InventoryService) checkAndCreateAlerts(chefID string, ingredient *models.Ingredient) {
	settings, err := s.GetAlertSettings(chefID)
	if err != nil {
		return
	}

	// Check for low stock alert
	if ingredient.CurrentStock.Quantity <= settings.LowStockThreshold {
		alert := &models.InventoryAlert{
			ChefID:       chefID,
			IngredientID: ingredient.ID,
			Type:         "low_stock",
			Priority:     "medium",
			Message:      "Low stock alert for " + ingredient.Name,
		}
		s.db.Create(alert)
	}

	// Check for expiry alert
	if ingredient.ExpiryDate != nil {
		daysUntilExpiry := int(time.Until(*ingredient.ExpiryDate).Hours() / 24)
		if daysUntilExpiry <= settings.ExpiryWarningDays && daysUntilExpiry >= 0 {
			alert := &models.InventoryAlert{
				ChefID:       chefID,
				IngredientID: ingredient.ID,
				Type:         "expiry",
				Priority:     "high",
				Message:      ingredient.Name + " expires soon",
			}
			s.db.Create(alert)
		}
	}
}

// ProcessExpiredIngredients processes expired ingredients daily
func (s *InventoryService) ProcessExpiredIngredients() error {
	s.logger.Info("Processing expired ingredients")

	var ingredients []models.Ingredient
	err := s.db.Where("expiry_date <= ? AND expiry_date IS NOT NULL AND status != ?", 
		time.Now(), "expired").Find(&ingredients).Error
	if err != nil {
		return err
	}

	for _, ingredient := range ingredients {
		// Mark as expired
		ingredient.Status = "expired"
		s.db.Save(&ingredient)

		// Create waste movement
		wasteMovement := &models.StockMovement{
			IngredientID: ingredient.ID,
			ChefID:       ingredient.ChefID,
			Type:         "waste",
			Quantity:     ingredient.CurrentStock.Quantity,
			Unit:         ingredient.CurrentStock.Unit,
			PreviousQty:  ingredient.CurrentStock.Quantity,
			NewQty:       0,
			Reason:       "Expired",
			Cost:         ingredient.CurrentStock.Quantity * ingredient.CostPerUnit,
		}
		s.db.Create(wasteMovement)

		// Update stock to zero
		ingredient.CurrentStock.Quantity = 0
		s.db.Save(&ingredient)

		// Create alert
		alert := &models.InventoryAlert{
			ChefID:       ingredient.ChefID,
			IngredientID: ingredient.ID,
			Type:         "out_of_stock",
			Priority:     "critical",
			Message:      ingredient.Name + " has expired and been removed from inventory",
		}
		s.db.Create(alert)
	}

	return nil
}