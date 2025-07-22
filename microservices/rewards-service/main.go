package main

import (
	"context"
	"fmt"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"
	"rewards-service/config"
	"rewards-service/cron"
	"rewards-service/models"
	"rewards-service/routes"
	"rewards-service/services"
	"rewards-service/utils"
	"rewards-service/websocket"

	"go.uber.org/zap"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

// @title HomeChef Rewards API
// @version 1.0
// @description Rewards and subscription system endpoints
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

	logger.Info("Starting Rewards Service",
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
		rewardsService := services.NewRewardsService(db, logger)
		subscriptionService := services.NewSubscriptionService(db, logger)
		scheduler = cron.NewScheduler(rewardsService, subscriptionService, logger)
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
		&models.RewardToken{},
		&models.RewardRedemption{},
		&models.UserRewardsProfile{},
		&models.SubscriptionPlan{},
		&models.UserSubscription{},
		&models.SubscriptionPayment{},
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
	db.Model(&models.SubscriptionPlan{}).Count(&count)
	if count > 0 {
		logger.Info("Mock data already exists, skipping seed")
		return nil
	}

	logger.Info("Seeding mock rewards data...")

	// Create subscription plans
	plans := []models.SubscriptionPlan{
		{
			ID:              "premium-monthly",
			Name:            "HomeChef Premium Monthly",
			Description:     "Premium features with monthly billing",
			Price:           299.00,
			Duration:        "monthly",
			Benefits:        `["Free delivery on all orders", "3x reward tokens", "Priority customer support", "Exclusive chef access"]`,
			TokenMultiplier: 3.0,
			FreeDelivery:    true,
			PrioritySupport: true,
			IsActive:        true,
		},
		{
			ID:              "premium-yearly",
			Name:            "HomeChef Premium Yearly",
			Description:     "Premium features with yearly billing (2 months free)",
			Price:           2990.00,
			Duration:        "yearly",
			Benefits:        `["Free delivery on all orders", "3x reward tokens", "Priority customer support", "Exclusive chef access", "2 months free"]`,
			TokenMultiplier: 3.0,
			FreeDelivery:    true,
			PrioritySupport: true,
			IsActive:        true,
		},
		{
			ID:              "gold-monthly",
			Name:            "HomeChef Gold Monthly",
			Description:     "Enhanced features with monthly billing",
			Price:           199.00,
			Duration:        "monthly",
			Benefits:        `["2x reward tokens", "Free delivery on orders above ₹200", "Priority customer support"]`,
			TokenMultiplier: 2.0,
			FreeDelivery:    false,
			PrioritySupport: true,
			IsActive:        true,
		},
	}

	for _, plan := range plans {
		if err := db.Create(&plan).Error; err != nil {
			return fmt.Errorf("failed to create subscription plan: %w", err)
		}
	}

	// Create sample user rewards profile
	profile := models.UserRewardsProfile{
		ID:               "profile-1",
		UserID:           "user-2",
		TotalTokens:      567,
		LifetimeEarned:   1250,
		LifetimeRedeemed: 683,
		CurrentStreak:    7,
		Tier:             "gold",
		TierProgress:     45,
	}

	if err := db.Create(&profile).Error; err != nil {
		return fmt.Errorf("failed to create rewards profile: %w", err)
	}

	// Create sample reward tokens
	tokens := []models.RewardToken{
		{
			ID:          "token-1",
			UserID:      "user-2",
			Amount:      50,
			Type:        "earned",
			Source:      "order",
			OrderID:     stringPtr("order-1"),
			Description: "Tokens earned from order",
			ExpiresAt:   timePtr(time.Now().AddDate(1, 0, 0)),
		},
		{
			ID:          "token-2",
			UserID:      "user-2",
			Amount:      -30,
			Type:        "redeemed",
			Source:      "redemption",
			Description: "Tokens redeemed for discount",
		},
	}

	for _, token := range tokens {
		if err := db.Create(&token).Error; err != nil {
			return fmt.Errorf("failed to create reward token: %w", err)
		}
	}

	logger.Info("Mock rewards data seeded successfully")
	return nil
}

func stringPtr(s string) *string {
	return &s
}

func timePtr(t time.Time) *time.Time {
	return &t
}

func fileExists(filename string) bool {
	_, err := os.Stat(filename)
	return !os.IsNotExist(err)
}