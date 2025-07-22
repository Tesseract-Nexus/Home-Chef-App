package database

import (
	"database-service/config"
	"database-service/models"
	"fmt"
	"time"

	"go.uber.org/zap"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

type PostgresDB struct {
	DB     *gorm.DB
	logger *zap.Logger
}

func NewPostgresDB(cfg *config.Config, zapLogger *zap.Logger) (*PostgresDB, error) {
	// Configure GORM logger
	var gormLogger logger.Interface
	if cfg.Environment == "production" {
		gormLogger = logger.Default.LogMode(logger.Silent)
	} else {
		gormLogger = logger.Default.LogMode(logger.Info)
	}

	// Connect to database
	db, err := gorm.Open(postgres.Open(cfg.DatabaseURL), &gorm.Config{
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

	postgresDB := &PostgresDB{
		DB:     db,
		logger: zapLogger,
	}

	// Auto-migrate tables
	if err := postgresDB.AutoMigrate(); err != nil {
		return nil, fmt.Errorf("failed to auto-migrate: %w", err)
	}

	// Seed mock data
	if err := postgresDB.SeedMockData(); err != nil {
		zapLogger.Warn("Failed to seed mock data", zap.Error(err))
	}

	zapLogger.Info("PostgreSQL database connected successfully")
	return postgresDB, nil
}

func (p *PostgresDB) AutoMigrate() error {
	return p.DB.AutoMigrate(
		&models.User{},
		&models.ChefProfile{},
		&models.DeliveryProfile{},
		&models.Address{},
		&models.MenuItem{},
		&models.Order{},
		&models.OrderItem{},
		&models.Tip{},
		&models.RewardToken{},
		&models.RewardRedemption{},
		&models.Review{},
		&models.Notification{},
	)
}

func (p *PostgresDB) SeedMockData() error {
	// Check if data already exists
	var userCount int64
	p.DB.Model(&models.User{}).Count(&userCount)
	if userCount > 0 {
		p.logger.Info("Mock data already exists, skipping seed")
		return nil
	}

	p.logger.Info("Seeding mock data...")

	// Create mock users
	users := []models.User{
		{
			BaseModel: models.BaseModel{ID: "user-1"},
			Email:     "chef1@homechef.com",
			Password:  "$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi", // password
			FirstName: "Priya",
			LastName:  "Sharma",
			Phone:     "+919876543210",
			Role:      "chef",
			Status:    "active",
		},
		{
			BaseModel: models.BaseModel{ID: "user-2"},
			Email:     "customer1@homechef.com",
			Password:  "$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi", // password
			FirstName: "Rahul",
			LastName:  "Kumar",
			Phone:     "+919876543211",
			Role:      "customer",
			Status:    "active",
		},
		{
			BaseModel: models.BaseModel{ID: "user-3"},
			Email:     "delivery1@homechef.com",
			Password:  "$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi", // password
			FirstName: "Amit",
			LastName:  "Singh",
			Phone:     "+919876543212",
			Role:      "delivery",
			Status:    "active",
		},
	}

	for _, user := range users {
		if err := p.DB.Create(&user).Error; err != nil {
			return fmt.Errorf("failed to create user %s: %w", user.Email, err)
		}
	}

	// Create chef profile
	chefProfile := models.ChefProfile{
		BaseModel:          models.BaseModel{ID: "chef-1"},
		UserID:             "user-1",
		Name:               "Priya's Kitchen",
		Specialty:          "North Indian Cuisine",
		Description:        "Authentic North Indian dishes made with love and traditional recipes",
		Rating:             4.8,
		TotalReviews:       156,
		TotalOrders:        445,
		City:               "Mumbai",
		State:              "Maharashtra",
		Latitude:           19.0760,
		Longitude:          72.8777,
		CuisineTypes:       `["north_indian", "punjabi", "mughlai"]`,
		DietaryPreferences: `["vegetarian", "non_vegetarian"]`,
		WorkingHoursStart:  "09:00",
		WorkingHoursEnd:    "21:00",
		WorkingDays:        `["monday", "tuesday", "wednesday", "thursday", "friday", "saturday"]`,
		MinOrderAmount:     200.00,
		DeliveryRadius:     10.0,
		AvgPrepTime:        30,
		Status:             "active",
		VerificationStatus: "verified",
		IsAvailable:        true,
		Badges:             `["top_rated", "fast_delivery"]`,
	}

	if err := p.DB.Create(&chefProfile).Error; err != nil {
		return fmt.Errorf("failed to create chef profile: %w", err)
	}

	// Create delivery profile
	deliveryProfile := models.DeliveryProfile{
		BaseModel:        models.BaseModel{ID: "delivery-1"},
		UserID:           "user-3",
		VehicleType:      "motorcycle",
		VehicleNumber:    "MH01AB1234",
		LicenseNumber:    "DL123456789",
		Rating:           4.5,
		TotalDeliveries:  234,
		Status:           "active",
		IsAvailable:      true,
		CurrentLatitude:  19.0760,
		CurrentLongitude: 72.8777,
	}

	if err := p.DB.Create(&deliveryProfile).Error; err != nil {
		return fmt.Errorf("failed to create delivery profile: %w", err)
	}

	// Create menu items
	menuItems := []models.MenuItem{
		{
			BaseModel:       models.BaseModel{ID: "menu-1"},
			ChefID:          "chef-1",
			Name:            "Butter Chicken",
			Description:     "Rich and creamy tomato-based curry with tender chicken pieces",
			Price:           280.00,
			Category:        "main_course",
			CuisineType:     "north_indian",
			IsVegetarian:    false,
			SpiceLevel:      "medium",
			PreparationTime: 25,
			Serves:          2,
			Ingredients:     `["chicken", "tomatoes", "cream", "butter", "spices"]`,
			Images:          `["https://example.com/butter-chicken.jpg"]`,
			Calories:        450,
			Protein:         35.0,
			Carbs:           15.0,
			Fat:             28.0,
			IsAvailable:     true,
		},
		{
			BaseModel:       models.BaseModel{ID: "menu-2"},
			ChefID:          "chef-1",
			Name:            "Paneer Tikka Masala",
			Description:     "Grilled cottage cheese in rich tomato gravy",
			Price:           250.00,
			Category:        "main_course",
			CuisineType:     "north_indian",
			IsVegetarian:    true,
			IsVegan:         false,
			SpiceLevel:      "medium",
			PreparationTime: 20,
			Serves:          2,
			Ingredients:     `["paneer", "tomatoes", "onions", "cream", "spices"]`,
			Images:          `["https://example.com/paneer-tikka.jpg"]`,
			Calories:        380,
			Protein:         18.0,
			Carbs:           12.0,
			Fat:             25.0,
			IsAvailable:     true,
		},
	}

	for _, item := range menuItems {
		if err := p.DB.Create(&item).Error; err != nil {
			return fmt.Errorf("failed to create menu item %s: %w", item.Name, err)
		}
	}

	// Create sample address
	address := models.Address{
		BaseModel: models.BaseModel{ID: "addr-1"},
		UserID:    "user-2",
		Type:      "home",
		Street:    "123 Main Street, Andheri West",
		City:      "Mumbai",
		State:     "Maharashtra",
		Pincode:   "400058",
		Latitude:  19.1136,
		Longitude: 72.8697,
		IsDefault: true,
	}

	if err := p.DB.Create(&address).Error; err != nil {
		return fmt.Errorf("failed to create address: %w", err)
	}

	p.logger.Info("Mock data seeded successfully")
	return nil
}

func (p *PostgresDB) Close() error {
	sqlDB, err := p.DB.DB()
	if err != nil {
		return err
	}
	return sqlDB.Close()
}

func (p *PostgresDB) GetDB() *gorm.DB {
	return p.DB
}