package main

import (
	"context"
	"fmt"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"
	"order-service/config"
	"order-service/cron"
	"order-service/models"
	"order-service/routes"
	"order-service/services"
	"order-service/utils"
	"order-service/websocket"

	"go.uber.org/zap"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

// @title HomeChef Order API
// @version 1.0
// @description Order management with cancellation policy and countdown timer
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

	logger.Info("Starting Order Service",
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
		orderService := services.NewOrderService(db, logger)
		scheduler = cron.NewScheduler(orderService, logger)
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
		&models.Order{},
		&models.OrderItem{},
		&models.Tip{},
		&models.OrderStatusHistory{},
		&models.OrderNotification{},
		&models.CancellationPolicy{},
		&models.CancellationAnalytics{},
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
	db.Model(&models.CancellationPolicy{}).Count(&count)
	if count > 0 {
		logger.Info("Mock data already exists, skipping seed")
		return nil
	}

	logger.Info("Seeding mock order data...")

	// Create default cancellation policy
	policy := models.CancellationPolicy{
		ID:                              "policy-1",
		FreeCancellationWindowSeconds:   30,
		PenaltyRate:                     0.40,
		MinPenaltyAmount:                20.00,
		MaxPenaltyAmount:                500.00,
		PolicyDescription:               "Orders can be cancelled for free within 30 seconds of placement",
		IsActive:                        true,
		UpdatedBy:                       "system",
	}

	if err := db.Create(&policy).Error; err != nil {
		return fmt.Errorf("failed to create cancellation policy: %w", err)
	}

	// Create sample order
	countdownExpiry := time.Now().Add(30 * time.Second)
	order := models.Order{
		ID:                "order-sample-1",
		CustomerID:        "user-2",
		ChefID:            "chef-1",
		Status:            "payment_confirmed",
		TotalAmount:       450.00,
		DeliveryFee:       50.00,
		TaxAmount:         22.50,
		PaymentMethod:     "online",
		PaymentStatus:     "completed",
		CountdownExpiry:   &countdownExpiry,
		CanCancelFree:     true,
	}

	if err := db.Create(&order).Error; err != nil {
		return fmt.Errorf("failed to create sample order: %w", err)
	}

	// Create order items
	orderItems := []models.OrderItem{
		{
			ID:       "item-1",
			OrderID:  "order-sample-1",
			DishID:   "menu-1",
			DishName: "Butter Chicken",
			Quantity: 1,
			Price:    280.00,
		},
		{
			ID:       "item-2",
			OrderID:  "order-sample-1",
			DishID:   "menu-2",
			DishName: "Naan",
			Quantity: 2,
			Price:    85.00,
		},
	}

	for _, item := range orderItems {
		if err := db.Create(&item).Error; err != nil {
			return fmt.Errorf("failed to create order item: %w", err)
		}
	}

	// Create sample status history
	statusHistory := []models.OrderStatusHistory{
		{
			ID:        "status-1",
			OrderID:   "order-sample-1",
			Status:    "payment_confirmed",
			Message:   "Order payment confirmed",
			UpdatedBy: "system",
		},
		{
			ID:        "status-2",
			OrderID:   "order-sample-1",
			Status:    "sent_to_chef",
			Message:   "Order sent to chef for confirmation",
			UpdatedBy: "system",
		},
	}

	for _, status := range statusHistory {
		if err := db.Create(&status).Error; err != nil {
			return fmt.Errorf("failed to create status history: %w", err)
		}
	}

	// Create analytics record
	analytics := models.CancellationAnalytics{
		ID:                    "analytics-1",
		Date:                  time.Now().Truncate(24 * time.Hour),
		TotalOrders:           50,
		TotalCancellations:    5,
		FreeCancellations:     2,
		PenaltyCancellations:  3,
		TotalPenaltyCollected: 450.00,
		AvgCancellationTime:   125.5,
	}

	if err := db.Create(&analytics).Error; err != nil {
		return fmt.Errorf("failed to create analytics: %w", err)
	}

	logger.Info("Mock order data seeded successfully")
	return nil
}

func fileExists(filename string) bool {
	_, err := os.Stat(filename)
	return !os.IsNotExist(err)
}