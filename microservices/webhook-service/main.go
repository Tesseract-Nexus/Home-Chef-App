package main

import (
	"fmt"
	"log"
	"time"

	"github.com/gin-gonic/gin"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"

	"homechef/webhook-service/config"
	"homechef/webhook-service/cron"
	"homechef/webhook-service/handlers"
	"homechef/webhook-service/models"
	"homechef/webhook-service/routes"
	"homechef/webhook-service/services"
	"homechef/webhook-service/utils"
	"homechef/webhook-service/websocket"
)

func main() {
	// Initialize logger
	utils.InitLogger()

	// Load configuration
	cfg := config.LoadConfig()

	// Initialize database
	db, err := initDatabase(cfg)
	if err != nil {
		log.Fatal("Failed to initialize database:", err)
	}

	// Run migrations
	if err := runMigrations(db); err != nil {
		log.Fatal("Failed to run migrations:", err)
	}

	// Initialize services
	webhookService := services.NewWebhookService(db)

	// Initialize handlers
	webhookHandler := handlers.NewWebhookHandler(webhookService)

	// Initialize WebSocket hub
	hub := websocket.NewHub()
	go hub.Run()

	// Initialize cron scheduler
	scheduler := cron.NewScheduler(db, webhookService)
	scheduler.Start()
	defer scheduler.Stop()

	// Set Gin mode
	if cfg.Server.Environment == "production" {
		gin.SetMode(gin.ReleaseMode)
	}

	// Setup routes
	router := routes.SetupRoutes(webhookHandler)

	// Add WebSocket route
	router.GET("/ws", hub.HandleWebSocket())

	// Add WebSocket status endpoint
	router.GET("/ws/status", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"connected_clients": hub.GetConnectedClients(),
			"status":           "running",
		})
	})

	// Start server
	serverAddr := fmt.Sprintf("%s:%s", cfg.Server.Host, cfg.Server.Port)
	utils.LogInfo("Starting webhook service", map[string]interface{}{
		"address":     serverAddr,
		"environment": cfg.Server.Environment,
	})

	if err := router.Run(serverAddr); err != nil {
		log.Fatal("Failed to start server:", err)
	}
}

// initDatabase initializes the database connection
func initDatabase(cfg *config.Config) (*gorm.DB, error) {
	dsn := fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s sslmode=%s",
		cfg.Database.Host,
		cfg.Database.Port,
		cfg.Database.User,
		cfg.Database.Password,
		cfg.Database.DBName,
		cfg.Database.SSLMode,
	)

	// Configure GORM logger
	gormLogger := logger.Default
	if cfg.Server.Environment == "development" {
		gormLogger = logger.Default.LogMode(logger.Info)
	}

	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{
		Logger: gormLogger,
		NowFunc: func() time.Time {
			return time.Now().UTC()
		},
	})

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

	utils.LogInfo("Database connected successfully", map[string]interface{}{
		"host": cfg.Database.Host,
		"port": cfg.Database.Port,
		"db":   cfg.Database.DBName,
	})

	return db, nil
}

// runMigrations runs database migrations
func runMigrations(db *gorm.DB) error {
	utils.LogInfo("Running database migrations", nil)

	// Auto-migrate models
	if err := db.AutoMigrate(
		&models.WebhookEndpoint{},
		&models.WebhookDelivery{},
	); err != nil {
		return fmt.Errorf("failed to run migrations: %w", err)
	}

	// Create indexes
	if err := createIndexes(db); err != nil {
		return fmt.Errorf("failed to create indexes: %w", err)
	}

	utils.LogInfo("Database migrations completed successfully", nil)
	return nil
}

// createIndexes creates database indexes for better performance
func createIndexes(db *gorm.DB) error {
	// Create composite indexes for better query performance
	indexes := []string{
		"CREATE INDEX IF NOT EXISTS idx_webhook_endpoints_user_id ON webhook_endpoints(user_id)",
		"CREATE INDEX IF NOT EXISTS idx_webhook_endpoints_active ON webhook_endpoints(is_active)",
		"CREATE INDEX IF NOT EXISTS idx_webhook_deliveries_webhook_id ON webhook_deliveries(webhook_id)",
		"CREATE INDEX IF NOT EXISTS idx_webhook_deliveries_status ON webhook_deliveries(status)",
		"CREATE INDEX IF NOT EXISTS idx_webhook_deliveries_event_type ON webhook_deliveries(event_type)",
		"CREATE INDEX IF NOT EXISTS idx_webhook_deliveries_created_at ON webhook_deliveries(created_at DESC)",
		"CREATE INDEX IF NOT EXISTS idx_webhook_deliveries_retry ON webhook_deliveries(status, next_retry_at) WHERE next_retry_at IS NOT NULL",
	}

	for _, index := range indexes {
		if err := db.Exec(index).Error; err != nil {
			return fmt.Errorf("failed to create index: %w", err)
		}
	}

	return nil
}