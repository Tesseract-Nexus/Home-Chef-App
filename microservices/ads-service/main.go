package main

import (
	"context"
	"fmt"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"
	"ads-service/config"
	"ads-service/models"
	"ads-service/routes"
	"ads-service/utils"
	"ads-service/websocket"

	"go.uber.org/zap"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

// @title HomeChef Ads API
// @version 1.0
// @description Advertisement and campaign management endpoints
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

	logger.Info("Starting Ads Service",
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
		&models.AdCampaign{},
		&models.AdContent{},
		&models.AdImpression{},
		&models.AdClick{},
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
	db.Model(&models.AdCampaign{}).Count(&count)
	if count > 0 {
		logger.Info("Mock data already exists, skipping seed")
		return nil
	}

	logger.Info("Seeding mock ads data...")

	// Create mock campaign
	campaign := models.AdCampaign{
		ID:     "campaign-1",
		Name:   "Weekend Special Offer",
		Type:   "banner",
		Status: "active",
		Budget: models.CampaignBudget{
			TotalBudget:       10000.00,
			DailyBudget:       500.00,
			CostPerClick:      2.50,
			CostPerImpression: 0.10,
		},
		Targeting: models.CampaignTargeting{
			UserTypes: `["customer"]`,
			Locations: `["Mumbai", "Delhi", "Bangalore"]`,
			AgeGroups: `["18-25", "26-35"]`,
			Interests: `["food", "cooking"]`,
		},
		Schedule: models.CampaignSchedule{
			StartDate: time.Now().AddDate(0, 0, -7),
			EndDate:   time.Now().AddDate(0, 0, 30),
			TimeSlots: `["09:00-12:00", "18:00-22:00"]`,
		},
		Performance: models.CampaignPerformance{
			Impressions: 1250,
			Clicks:      45,
			Conversions: 8,
			CTR:         3.6,
			Cost:        125.50,
		},
	}

	if err := db.Create(&campaign).Error; err != nil {
		return fmt.Errorf("failed to create campaign: %w", err)
	}

	// Create mock ad content
	adContent := models.AdContent{
		ID:          "ad-content-1",
		CampaignID:  "campaign-1",
		Type:        "banner",
		Title:       "Get 20% Off This Weekend!",
		Description: "Order your favorite dishes and save big",
		ImageURL:    "https://example.com/weekend-offer.jpg",
		ActionText:  "Order Now",
		TargetURL:   "https://homechef.com/weekend-offers",
		Sponsor:     "HomeChef",
	}

	if err := db.Create(&adContent).Error; err != nil {
		return fmt.Errorf("failed to create ad content: %w", err)
	}

	logger.Info("Mock ads data seeded successfully")
	return nil
}

func fileExists(filename string) bool {
	_, err := os.Stat(filename)
	return !os.IsNotExist(err)
}