package main

import (
	"context"
	"fmt"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"
	"inventory-service/config"
	"inventory-service/cron"
	"inventory-service/models"
	"inventory-service/routes"
	"inventory-service/services"
	"inventory-service/utils"
	"inventory-service/websocket"

	"go.uber.org/zap"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

// @title HomeChef Inventory API
// @version 1.0
// @description Inventory management for chefs and ingredients
// @termsOfService http://swagger.io/terms/

// @contact.name API Support
// @contact.url http://www.homechef.com/support
// @contact.email support@homechef.com

// @license.name MIT
// @license.url https://opensource.org/licenses/MIT

// @host api.homechef.com
// @BasePath /v1

// @securityDefinitions.apikey BearerAuth
// @in header
// @name Authorization
// @description Type "Bearer" followed by a space and JWT token.

func main() {
	// Load configuration
	cfg := config.LoadConfig()

	// Initialize logger
	logger, err := utils.NewLogger(cfg.Environment)
	if err != nil {
		panic(fmt.Sprintf("Failed to initialize logger: %v", err))
	}
	defer logger.Sync()

	logger.Info("Starting Inventory Service",
		zap.String("environment", cfg.Environment),
		zap.String("port", cfg.Port),
	)

	// Initialize database
	db, err := initDatabase(cfg, logger)
	if err != nil {
		logger.Fatal("Failed to initialize database", zap.Error(err))
	}

	// Initialize WebSocket hub
	hub := websocket.NewHub(logger)
	go hub.Run()

	// Initialize and start cron scheduler
	var scheduler *cron.Scheduler
	if cfg.CronEnabled {
		inventoryService := services.NewInventoryService(db, logger)
		scheduler = cron.NewScheduler(inventoryService, logger)
		scheduler.Start()
		defer scheduler.Stop()
	}

	// Setup routes
	router := routes.SetupRoutes(cfg, db, hub, logger)

	// Create HTTP server
	server := &http.Server{
		Addr:         fmt.Sprintf("%s:%s", cfg.Host, cfg.Port),
		Handler:      router,
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 15 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	// Start server in a goroutine
	go func() {
		logger.Info("Server starting", zap.String("address", server.Addr))
		
		// Check if HTTPS certificates exist
		if fileExists(cfg.SSLCertPath) && fileExists(cfg.SSLKeyPath) {
			logger.Info("Starting HTTPS server")
			if err := server.ListenAndServeTLS(cfg.SSLCertPath, cfg.SSLKeyPath); err != nil && err != http.ErrServerClosed {
				logger.Fatal("Failed to start HTTPS server", zap.Error(err))
			}
		} else {
			logger.Info("Starting HTTP server (no SSL certificates found)")
			if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
				logger.Fatal("Failed to start HTTP server", zap.Error(err))
			}
		}
	}()

	// Wait for interrupt signal to gracefully shutdown the server
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	logger.Info("Shutting down server...")

	// Create a context with timeout for graceful shutdown
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	// Shutdown server
	if err := server.Shutdown(ctx); err != nil {
		logger.Fatal("Server forced to shutdown", zap.Error(err))
	}

	logger.Info("Server exited")
}

func initDatabase(cfg *config.Config, logger *zap.Logger) (*gorm.DB, error) {
	db, err := gorm.Open(postgres.Open(cfg.DatabaseURL), &gorm.Config{})
	if err != nil {
		return nil, fmt.Errorf("failed to connect to database: %w", err)
	}

	// Configure connection pool
	sqlDB, err := db.DB()
	if err != nil {
		return nil, fmt.Errorf("failed to get database instance: %w", err)
	}

	sqlDB.SetMaxIdleConns(10)
	sqlDB.SetMaxOpenConns(100)
	sqlDB.SetConnMaxLifetime(time.Hour)

	// Auto-migrate tables
	if err := db.AutoMigrate(
		&models.Ingredient{},
		&models.StockMovement{},
		&models.RecipeIngredient{},
		&models.InventoryAlert{},
		&models.AlertSettings{},
		&models.Supplier{},
	); err != nil {
		return nil, fmt.Errorf("failed to auto-migrate: %w", err)
	}

	// Seed mock data
	if err := seedMockData(db, logger); err != nil {
		logger.Warn("Failed to seed mock data", zap.Error(err))
	}

	logger.Info("Database connected and migrated successfully")
	return db, nil
}

func seedMockData(db *gorm.DB, logger *zap.Logger) error {
	// Check if data already exists
	var count int64
	db.Model(&models.Ingredient{}).Count(&count)
	if count > 0 {
		logger.Info("Mock data already exists, skipping seed")
		return nil
	}

	logger.Info("Seeding mock inventory data...")

	// Create mock ingredients
	ingredients := []models.Ingredient{
		{
			ID:       "ingredient-1",
			ChefID:   "chef-1",
			Name:     "Basmati Rice",
			Category: "grains",
			CurrentStock: models.IngredientStock{
				Quantity: 25.0,
				Unit:     "kg",
			},
			MinimumStock:    5.0,
			CostPerUnit:     120.00,
			Supplier:        "Rice Traders Co.",
			StorageLocation: "Pantry Shelf 1",
			Status:          "in_stock",
		},
		{
			ID:       "ingredient-2",
			ChefID:   "chef-1",
			Name:     "Tomatoes",
			Category: "vegetables",
			CurrentStock: models.IngredientStock{
				Quantity: 3.0,
				Unit:     "kg",
			},
			MinimumStock:    2.0,
			CostPerUnit:     50.00,
			Supplier:        "Fresh Vegetables Co.",
			ExpiryDate:      timePtr(time.Now().AddDate(0, 0, 5)),
			StorageLocation: "Refrigerator",
			Status:          "low_stock",
		},
		{
			ID:       "ingredient-3",
			ChefID:   "chef-1",
			Name:     "Garam Masala",
			Category: "spices",
			CurrentStock: models.IngredientStock{
				Quantity: 500.0,
				Unit:     "grams",
			},
			MinimumStock:    100.0,
			CostPerUnit:     2.00,
			Supplier:        "Spice World",
			StorageLocation: "Spice Rack",
			Status:          "in_stock",
		},
	}

	for _, ingredient := range ingredients {
		if err := db.Create(&ingredient).Error; err != nil {
			return fmt.Errorf("failed to create ingredient %s: %w", ingredient.Name, err)
		}
	}

	// Create mock recipe ingredients
	recipeIngredients := []models.RecipeIngredient{
		{
			ID:           "recipe-ing-1",
			DishID:       "menu-1", // Butter Chicken
			IngredientID: "ingredient-1",
			Quantity:     0.2,
			Unit:         "kg",
			IsOptional:   false,
		},
		{
			ID:           "recipe-ing-2",
			DishID:       "menu-1",
			IngredientID: "ingredient-2",
			Quantity:     0.5,
			Unit:         "kg",
			IsOptional:   false,
		},
		{
			ID:           "recipe-ing-3",
			DishID:       "menu-1",
			IngredientID: "ingredient-3",
			Quantity:     10.0,
			Unit:         "grams",
			IsOptional:   false,
		},
	}

	for _, recipeIng := range recipeIngredients {
		if err := db.Create(&recipeIng).Error; err != nil {
			return fmt.Errorf("failed to create recipe ingredient: %w", err)
		}
	}

	// Create alert settings
	alertSettings := models.AlertSettings{
		ID:                  "alert-settings-1",
		ChefID:              "chef-1",
		LowStockThreshold:   5.0,
		ExpiryWarningDays:   3,
		EmailNotifications:  true,
		PushNotifications:   true,
		SMSNotifications:    false,
	}

	if err := db.Create(&alertSettings).Error; err != nil {
		return fmt.Errorf("failed to create alert settings: %w", err)
	}

	logger.Info("Mock inventory data seeded successfully")
	return nil
}

func timePtr(t time.Time) *time.Time {
	return &t
}

func fileExists(filename string) bool {
	_, err := os.Stat(filename)
	return !os.IsNotExist(err)
}