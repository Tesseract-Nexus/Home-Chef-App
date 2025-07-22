package main

import (
	"context"
	"fmt"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"
	"financial-service/config"
	"financial-service/cron"
	"financial-service/models"
	"financial-service/routes"
	"financial-service/services"
	"financial-service/utils"
	"financial-service/websocket"

	"go.uber.org/zap"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

// @title HomeChef Financial API
// @version 1.0
// @description Financial management and P&L calculation endpoints
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

	logger.Info("Starting Financial Service",
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
		financialService := services.NewFinancialService(db, logger)
		scheduler = cron.NewScheduler(financialService, logger)
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
		&models.ChefFinancials{},
		&models.ChefExpense{},
		&models.ChefPayout{},
		&models.ProfitLossReport{},
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
	db.Model(&models.ChefFinancials{}).Count(&count)
	if count > 0 {
		logger.Info("Mock data already exists, skipping seed")
		return nil
	}

	logger.Info("Seeding mock financial data...")

	// Create mock financial records
	financials := []models.ChefFinancials{
		{
			ID:          "fin-1",
			ChefID:      "chef-1",
			Date:        time.Now().AddDate(0, 0, -1),
			Revenue:     2500.00,
			Expenses:    800.00,
			PlatformFee: 375.00,
			NetEarnings: 1325.00,
			OrderCount:  12,
			TipsReceived: 150.00,
		},
		{
			ID:          "fin-2",
			ChefID:      "chef-1",
			Date:        time.Now().AddDate(0, 0, -2),
			Revenue:     3200.00,
			Expenses:    950.00,
			PlatformFee: 480.00,
			NetEarnings: 1770.00,
			OrderCount:  15,
			TipsReceived: 200.00,
		},
	}

	for _, financial := range financials {
		if err := db.Create(&financial).Error; err != nil {
			return fmt.Errorf("failed to create financial record: %w", err)
		}
	}

	// Create mock expenses
	expenses := []models.ChefExpense{
		{
			ID:          "exp-1",
			ChefID:      "chef-1",
			Category:    "ingredients",
			Description: "Fresh vegetables and spices",
			Amount:      500.00,
			Date:        time.Now().AddDate(0, 0, -1),
			Status:      "approved",
		},
		{
			ID:          "exp-2",
			ChefID:      "chef-1",
			Category:    "packaging",
			Description: "Food containers and bags",
			Amount:      300.00,
			Date:        time.Now().AddDate(0, 0, -1),
			Status:      "approved",
		},
	}

	for _, expense := range expenses {
		if err := db.Create(&expense).Error; err != nil {
			return fmt.Errorf("failed to create expense: %w", err)
		}
	}

	logger.Info("Mock financial data seeded successfully")
	return nil
}

func fileExists(filename string) bool {
	_, err := os.Stat(filename)
	return !os.IsNotExist(err)
}