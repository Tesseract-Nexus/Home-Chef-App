package database

import (
	"fmt"
	"log"
	"time"

	"github.com/homechef/api/config"
	"github.com/homechef/api/models"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

var DB *gorm.DB

func Connect() error {
	var dsn string
	cfg := config.AppConfig

	if cfg.DatabaseURL != "" {
		dsn = cfg.DatabaseURL
	} else {
		dsn = fmt.Sprintf(
			"host=%s port=%s user=%s password=%s dbname=%s sslmode=%s",
			cfg.DBHost, cfg.DBPort, cfg.DBUser, cfg.DBPassword, cfg.DBName, cfg.DBSSLMode,
		)
	}

	// Configure logger based on environment
	logLevel := logger.Silent
	if config.IsDevelopment() {
		logLevel = logger.Info
	}

	gormConfig := &gorm.Config{
		Logger: logger.Default.LogMode(logLevel),
		NowFunc: func() time.Time {
			return time.Now().UTC()
		},
	}

	var err error
	DB, err = gorm.Open(postgres.Open(dsn), gormConfig)
	if err != nil {
		return fmt.Errorf("failed to connect to database: %w", err)
	}

	// Get underlying SQL DB
	sqlDB, err := DB.DB()
	if err != nil {
		return fmt.Errorf("failed to get database instance: %w", err)
	}

	// Set connection pool settings
	sqlDB.SetMaxIdleConns(10)
	sqlDB.SetMaxOpenConns(100)
	sqlDB.SetConnMaxLifetime(time.Hour)

	log.Println("Database connection established")
	return nil
}

func Migrate() error {
	log.Println("Running database migrations...")

	// Phase 1: Core tables without circular dependencies
	if err := DB.AutoMigrate(
		// Users & Auth
		&models.User{},
		&models.RefreshToken{},

		// Chef
		&models.ChefProfile{},
		&models.ChefSchedule{},

		// Menu
		&models.MenuItem{},
		&models.MenuItemImage{},

		// Orders
		&models.Order{},
		&models.OrderItem{},

		// Cart
		&models.Cart{},
		&models.CartItem{},

		// Delivery
		&models.DeliveryPartner{},
		&models.Delivery{},

		// Reviews
		&models.Review{},

		// Social
		&models.Post{},
		&models.PostLike{},
		&models.PostComment{},

		// Addresses
		&models.Address{},

		// Payments
		&models.PaymentMethod{},
		&models.Transaction{},

		// Notifications
		&models.Notification{},

		// Admin
		&models.PlatformSettings{},
		&models.AuditLog{},
	); err != nil {
		return fmt.Errorf("migration phase 1 failed: %w", err)
	}

	// Phase 2: Catering tables (have circular reference)
	// First create CateringRequest without the AcceptedQuoteID FK
	if err := DB.AutoMigrate(&models.CateringRequest{}); err != nil {
		return fmt.Errorf("migration phase 2a failed: %w", err)
	}

	// Then create CateringQuote which references CateringRequest
	if err := DB.AutoMigrate(&models.CateringQuote{}); err != nil {
		return fmt.Errorf("migration phase 2b failed: %w", err)
	}

	log.Println("Database migrations completed")
	return nil
}

func Close() error {
	sqlDB, err := DB.DB()
	if err != nil {
		return err
	}
	return sqlDB.Close()
}
