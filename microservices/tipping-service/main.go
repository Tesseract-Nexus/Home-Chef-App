package main

import (
	"fmt"
	"log"
	"time"

	"github.com/gin-gonic/gin"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"

	"homechef/tipping-service/config"
	"homechef/tipping-service/handlers"
	"homechef/tipping-service/models"
	"homechef/tipping-service/routes"
	"homechef/tipping-service/services"
	"homechef/tipping-service/utils"
	"homechef/tipping-service/websocket"
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
	tipService := services.NewTipService(db)

	// Initialize handlers
	tipHandler := handlers.NewTipHandler(tipService)

	// Initialize WebSocket hub
	hub := websocket.NewHub()
	go hub.Run()

	// Set Gin mode
	if cfg.Server.Environment == "production" {
		gin.SetMode(gin.ReleaseMode)
	}

	// Setup routes
	router := routes.SetupRoutes(tipHandler)

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
	utils.LogInfo("Starting tipping service", map[string]interface{}{
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
		&models.TipTransaction{},
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
		"CREATE INDEX IF NOT EXISTS idx_tip_transactions_user_status ON tip_transactions(from_user_id, to_user_id, status)",
		"CREATE INDEX IF NOT EXISTS idx_tip_transactions_order_id ON tip_transactions(order_id)",
		"CREATE INDEX IF NOT EXISTS idx_tip_transactions_created_at ON tip_transactions(created_at DESC)",
		"CREATE INDEX IF NOT EXISTS idx_tip_transactions_recipient_type ON tip_transactions(to_user_type)",
		"CREATE INDEX IF NOT EXISTS idx_tip_transactions_status ON tip_transactions(status)",
	}

	for _, index := range indexes {
		if err := db.Exec(index).Error; err != nil {
			return fmt.Errorf("failed to create index: %w", err)
		}
	}

	return nil
}