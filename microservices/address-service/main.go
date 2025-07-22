package main

import (
	"context"
	"fmt"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"
	"address-service/config"
	"address-service/models"
	"address-service/routes"
	"address-service/utils"
	"address-service/websocket"

	"go.uber.org/zap"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

// @title HomeChef Address API
// @version 1.0
// @description Address management service with geolocation and validation
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

	logger.Info("Starting Address Service",
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
	if err := db.AutoMigrate(&models.Address{}); err != nil {
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
	db.Model(&models.Address{}).Count(&count)
	if count > 0 {
		logger.Info("Mock data already exists, skipping seed")
		return nil
	}

	logger.Info("Seeding mock address data...")

	addresses := []models.Address{
		{
			ID:          "addr-1",
			UserID:      "user-1",
			Type:        "home",
			Label:       "Home",
			FullAddress: "123 Main Street, Apartment 4B, Andheri West",
			Landmark:    "Near Metro Station",
			Pincode:     "400058",
			City:        "Mumbai",
			State:       "Maharashtra",
			IsDefault:   true,
			Coordinates: models.Coordinates{
				Latitude:  19.1136,
				Longitude: 72.8697,
			},
			Instructions: "Ring the bell twice",
		},
		{
			ID:          "addr-2",
			UserID:      "user-1",
			Type:        "work",
			Label:       "Office",
			FullAddress: "456 Business Park, Bandra Kurla Complex",
			Landmark:    "Near HDFC Bank",
			Pincode:     "400051",
			City:        "Mumbai",
			State:       "Maharashtra",
			IsDefault:   false,
			Coordinates: models.Coordinates{
				Latitude:  19.0596,
				Longitude: 72.8656,
			},
			Instructions: "Security will call up",
		},
		{
			ID:          "addr-3",
			UserID:      "user-2",
			Type:        "home",
			Label:       "Home",
			FullAddress: "789 Garden View, Koramangala",
			Landmark:    "Opposite Forum Mall",
			Pincode:     "560034",
			City:        "Bangalore",
			State:       "Karnataka",
			IsDefault:   true,
			Coordinates: models.Coordinates{
				Latitude:  12.9352,
				Longitude: 77.6245,
			},
			Instructions: "Gate code is 1234",
		},
	}

	for _, address := range addresses {
		if err := db.Create(&address).Error; err != nil {
			return fmt.Errorf("failed to create address %s: %w", address.ID, err)
		}
	}

	logger.Info("Mock address data seeded successfully")
	return nil
}

func fileExists(filename string) bool {
	_, err := os.Stat(filename)
	return !os.IsNotExist(err)
}