package main

import (
	"context"
	"fmt"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"
	"reviews-service/config"
	"reviews-service/models"
	"reviews-service/routes"
	"reviews-service/utils"
	"reviews-service/websocket"

	"go.uber.org/zap"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

// @title HomeChef Reviews API
// @version 1.0
// @description Review and rating system endpoints
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

	logger.Info("Starting Reviews Service",
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
		&models.Review{},
		&models.ReviewHelpful{},
		&models.ReviewReport{},
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
	db.Model(&models.Review{}).Count(&count)
	if count > 0 {
		logger.Info("Mock data already exists, skipping seed")
		return nil
	}

	logger.Info("Seeding mock reviews data...")

	// Create mock reviews
	reviews := []models.Review{
		{
			ID:         "review-1",
			CustomerID: "user-2",
			ChefID:     "chef-1",
			OrderID:    "order-1",
			Rating:     5,
			ReviewText: "Amazing food! The butter chicken was perfectly spiced and the naan was fresh. Will definitely order again!",
			Images:     `["https://example.com/review1.jpg"]`,
			IsVerified: true,
			HelpfulCount: 12,
			Status:     "active",
		},
		{
			ID:         "review-2",
			CustomerID: "user-3",
			ChefID:     "chef-1",
			OrderID:    "order-2",
			Rating:     4,
			ReviewText: "Good taste and delivered on time. The portion size was generous.",
			Images:     `[]`,
			IsVerified: true,
			HelpfulCount: 8,
			Status:     "active",
		},
		{
			ID:         "review-3",
			CustomerID: "user-4",
			ChefID:     "chef-1",
			OrderID:    "order-3",
			DishID:     stringPtr("menu-1"),
			Rating:     5,
			ReviewText: "Best butter chicken I've had in Mumbai! Authentic taste and perfect spice level.",
			Images:     `["https://example.com/review3a.jpg", "https://example.com/review3b.jpg"]`,
			IsVerified: true,
			HelpfulCount: 15,
			Status:     "active",
		},
	}

	for _, review := range reviews {
		if err := db.Create(&review).Error; err != nil {
			return fmt.Errorf("failed to create review %s: %w", review.ID, err)
		}
	}

	// Create some helpful votes
	helpfulVotes := []models.ReviewHelpful{
		{
			ID:       "helpful-1",
			ReviewID: "review-1",
			UserID:   "user-5",
		},
		{
			ID:       "helpful-2",
			ReviewID: "review-1",
			UserID:   "user-6",
		},
	}

	for _, vote := range helpfulVotes {
		if err := db.Create(&vote).Error; err != nil {
			return fmt.Errorf("failed to create helpful vote: %w", err)
		}
	}

	logger.Info("Mock reviews data seeded successfully")
	return nil
}

func stringPtr(s string) *string {
	return &s
}

func fileExists(filename string) bool {
	_, err := os.Stat(filename)
	return !os.IsNotExist(err)
}