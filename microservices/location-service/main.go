package main

import (
	"context"
	"fmt"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"
	"location-service/config"
	"location-service/models"
	"location-service/routes"
	"location-service/utils"
	"location-service/websocket"

	"go.uber.org/zap"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

// @title HomeChef Location API
// @version 1.0
// @description Location and geospatial service endpoints
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

	logger.Info("Starting Location Service",
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
		&models.City{},
		&models.ServiceableArea{},
		&models.DeliveryZone{},
		&models.LocationCache{},
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
	db.Model(&models.City{}).Count(&count)
	if count > 0 {
		logger.Info("Mock data already exists, skipping seed")
		return nil
	}

	logger.Info("Seeding mock location data...")

	// Create mock cities
	cities := []models.City{
		{
			ID:      "city-mumbai",
			Name:    "Mumbai",
			State:   "Maharashtra",
			Country: "India",
			Coordinates: models.Coordinates{
				Latitude:  19.0760,
				Longitude: 72.8777,
			},
			IsServiceable: true,
			ChefCount:     245,
			PopularAreas:  `["Andheri", "Bandra", "Juhu", "Powai", "Thane"]`,
		},
		{
			ID:      "city-delhi",
			Name:    "Delhi",
			State:   "Delhi",
			Country: "India",
			Coordinates: models.Coordinates{
				Latitude:  28.7041,
				Longitude: 77.1025,
			},
			IsServiceable: true,
			ChefCount:     189,
			PopularAreas:  `["Connaught Place", "Karol Bagh", "Lajpat Nagar", "Dwarka"]`,
		},
		{
			ID:      "city-bangalore",
			Name:    "Bangalore",
			State:   "Karnataka",
			Country: "India",
			Coordinates: models.Coordinates{
				Latitude:  12.9716,
				Longitude: 77.5946,
			},
			IsServiceable: true,
			ChefCount:     156,
			PopularAreas:  `["Koramangala", "Indiranagar", "Whitefield", "Electronic City"]`,
		},
	}

	for _, city := range cities {
		if err := db.Create(&city).Error; err != nil {
			return fmt.Errorf("failed to create city %s: %w", city.Name, err)
		}
	}

	// Create mock serviceable areas
	areas := []models.ServiceableArea{
		{
			ID:     "area-andheri",
			CityID: "city-mumbai",
			Name:   "Andheri West",
			Pincode: "400058",
			Coordinates: models.Coordinates{
				Latitude:  19.1136,
				Longitude: 72.8697,
			},
			DeliveryFee:  25.00,
			DeliveryTime: 30,
			IsActive:     true,
		},
		{
			ID:     "area-bandra",
			CityID: "city-mumbai",
			Name:   "Bandra East",
			Pincode: "400051",
			Coordinates: models.Coordinates{
				Latitude:  19.0596,
				Longitude: 72.8656,
			},
			DeliveryFee:  30.00,
			DeliveryTime: 35,
			IsActive:     true,
		},
	}

	for _, area := range areas {
		if err := db.Create(&area).Error; err != nil {
			return fmt.Errorf("failed to create area %s: %w", area.Name, err)
		}
	}

	// Create mock delivery zones
	zones := []models.DeliveryZone{
		{
			ID:     "zone-chef1",
			ChefID: "chef-1",
			CityID: "city-mumbai",
			Name:   "Priya's Delivery Zone",
			Center: models.Coordinates{
				Latitude:  19.0760,
				Longitude: 72.8777,
			},
			Radius:      5.0,
			DeliveryFee: 25.00,
			MinOrder:    200.00,
			IsActive:    true,
		},
	}

	for _, zone := range zones {
		if err := db.Create(&zone).Error; err != nil {
			return fmt.Errorf("failed to create delivery zone %s: %w", zone.Name, err)
		}
	}

	logger.Info("Mock location data seeded successfully")
	return nil
}

func fileExists(filename string) bool {
	_, err := os.Stat(filename)
	return !os.IsNotExist(err)
}