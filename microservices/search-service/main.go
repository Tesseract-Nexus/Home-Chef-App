package main

import (
	"context"
	"fmt"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"
	"search-service/config"
	"search-service/cron"
	"search-service/models"
	"search-service/routes"
	"search-service/services"
	"search-service/utils"
	"search-service/websocket"

	"go.uber.org/zap"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

// @title HomeChef Search API
// @version 1.0
// @description Search and discovery endpoints
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

	logger.Info("Starting Search Service",
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
		searchService := services.NewSearchService(db, logger)
		scheduler = cron.NewScheduler(searchService, logger)
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
		&models.SearchQuery{},
		&models.SavedSearch{},
		&models.TrendingSearch{},
		&models.PopularItem{},
		&models.SearchAnalytics{},
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
	db.Model(&models.TrendingSearch{}).Count(&count)
	if count > 0 {
		logger.Info("Mock data already exists, skipping seed")
		return nil
	}

	logger.Info("Seeding mock search data...")

	// Create trending searches
	trending := []models.TrendingSearch{
		{
			ID:          "trending-1",
			Query:       "butter chicken",
			SearchCount: 156,
			Location:    "mumbai",
			Period:      "week",
			Date:        time.Now().Truncate(24 * time.Hour),
		},
		{
			ID:          "trending-2",
			Query:       "biryani",
			SearchCount: 134,
			Location:    "mumbai",
			Period:      "week",
			Date:        time.Now().Truncate(24 * time.Hour),
		},
		{
			ID:          "trending-3",
			Query:       "north indian",
			SearchCount: 98,
			Location:    "mumbai",
			Period:      "week",
			Date:        time.Now().Truncate(24 * time.Hour),
		},
	}

	for _, item := range trending {
		if err := db.Create(&item).Error; err != nil {
			return fmt.Errorf("failed to create trending search: %w", err)
		}
	}

	// Create popular items
	popular := []models.PopularItem{
		{
			ID:          "popular-1",
			ItemID:      "chef-1",
			ItemType:    "chef",
			Name:        "Priya's Kitchen",
			SearchCount: 89,
			OrderCount:  234,
			ViewCount:   567,
			Score:       95.5,
			Location:    "mumbai",
			Period:      "week",
			Date:        time.Now().Truncate(24 * time.Hour),
		},
		{
			ID:          "popular-2",
			ItemID:      "dish-1",
			ItemType:    "dish",
			Name:        "Butter Chicken",
			SearchCount: 156,
			OrderCount:  89,
			ViewCount:   345,
			Score:       92.3,
			Location:    "mumbai",
			Period:      "week",
			Date:        time.Now().Truncate(24 * time.Hour),
		},
	}

	for _, item := range popular {
		if err := db.Create(&item).Error; err != nil {
			return fmt.Errorf("failed to create popular item: %w", err)
		}
	}

	// Create sample search analytics
	analytics := models.SearchAnalytics{
		ID:              "analytics-1",
		Date:            time.Now().Truncate(24 * time.Hour).AddDate(0, 0, -1),
		TotalSearches:   1250,
		UniqueUsers:     567,
		AvgResultCount:  8.5,
		ZeroResultCount: 45,
		TopQueries:      `[{"query": "butter chicken", "count": 156}, {"query": "biryani", "count": 134}]`,
	}

	if err := db.Create(&analytics).Error; err != nil {
		return fmt.Errorf("failed to create analytics: %w", err)
	}

	logger.Info("Mock search data seeded successfully")
	return nil
}

func fileExists(filename string) bool {
	_, err := os.Stat(filename)
	return !os.IsNotExist(err)
}