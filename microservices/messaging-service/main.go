package main

import (
	"context"
	"fmt"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"
	"messaging-service/config"
	"messaging-service/models"
	"messaging-service/routes"
	"messaging-service/utils"
	"messaging-service/websocket"

	"go.uber.org/zap"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

// @title HomeChef Messaging API
// @version 1.0
// @description Real-time messaging and communication endpoints
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

	logger.Info("Starting Messaging Service",
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
		&models.Conversation{},
		&models.ConversationParticipant{},
		&models.Message{},
		&models.MessageTemplate{},
		&models.MessageRead{},
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
	db.Model(&models.MessageTemplate{}).Count(&count)
	if count > 0 {
		logger.Info("Mock data already exists, skipping seed")
		return nil
	}

	logger.Info("Seeding mock messaging data...")

	// Create message templates
	templates := []models.MessageTemplate{
		{
			ID:        "template-1",
			Category:  "order_update",
			Title:     "Order Confirmed",
			Content:   "Your order has been confirmed and is being prepared.",
			Variables: `["order_id", "estimated_time"]`,
			UserRoles: `["chef"]`,
			IsActive:  true,
		},
		{
			ID:        "template-2",
			Category:  "delivery_update",
			Title:     "On the Way",
			Content:   "Your order is on the way! Expected delivery in {estimated_time} minutes.",
			Variables: `["estimated_time"]`,
			UserRoles: `["delivery"]`,
			IsActive:  true,
		},
		{
			ID:        "template-3",
			Category:  "general",
			Title:     "Thank You",
			Content:   "Thank you for your order! We hope you enjoyed your meal.",
			Variables: `[]`,
			UserRoles: `["chef", "customer"]`,
			IsActive:  true,
		},
	}

	for _, template := range templates {
		if err := db.Create(&template).Error; err != nil {
			return fmt.Errorf("failed to create template %s: %w", template.Title, err)
		}
	}

	// Create sample conversation
	conversation := models.Conversation{
		ID:      "conv-1",
		OrderID: "order-1",
		Status:  "active",
	}

	if err := db.Create(&conversation).Error; err != nil {
		return fmt.Errorf("failed to create conversation: %w", err)
	}

	// Create participants
	participants := []models.ConversationParticipant{
		{
			ID:             "participant-1",
			ConversationID: "conv-1",
			UserID:         "user-2", // Customer
			UserName:       "Rahul Kumar",
			UserRole:       "customer",
			JoinedAt:       time.Now(),
		},
		{
			ID:             "participant-2",
			ConversationID: "conv-1",
			UserID:         "user-1", // Chef
			UserName:       "Priya Sharma",
			UserRole:       "chef",
			JoinedAt:       time.Now(),
		},
	}

	for _, participant := range participants {
		if err := db.Create(&participant).Error; err != nil {
			return fmt.Errorf("failed to create participant: %w", err)
		}
	}

	// Create sample messages
	messages := []models.Message{
		{
			ID:             "msg-1",
			ConversationID: "conv-1",
			SenderID:       "user-2",
			SenderName:     "Rahul Kumar",
			SenderRole:     "customer",
			Content: models.MessageContent{
				Type: "text",
				Text: "Hi, I have a question about my order timing.",
			},
			Metadata: `{}`,
		},
		{
			ID:             "msg-2",
			ConversationID: "conv-1",
			SenderID:       "user-1",
			SenderName:     "Priya Sharma",
			SenderRole:     "chef",
			Content: models.MessageContent{
				Type: "text",
				Text: "Hello! I'll be starting your order in 10 minutes. It should be ready in 30 minutes.",
			},
			Metadata: `{"order_id": "order-1"}`,
		},
	}

	for _, message := range messages {
		if err := db.Create(&message).Error; err != nil {
			return fmt.Errorf("failed to create message: %w", err)
		}
	}

	logger.Info("Mock messaging data seeded successfully")
	return nil
}

func fileExists(filename string) bool {
	_, err := os.Stat(filename)
	return !os.IsNotExist(err)
}