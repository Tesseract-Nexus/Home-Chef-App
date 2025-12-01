package database

import (
	"log"
	"os"
	"github.com/Agent-Sphere/home-chef-app/apps/api/models"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var DB *gorm.DB

func ConnectToDB() {
	var err error
	dsn := os.Getenv("DB_URL")
	DB, err = gorm.Open(postgres.Open(dsn), &gorm.Config{})

	if err != nil {
		log.Fatal("Failed to connect to database")
	}

	// Auto-migrate the models
	err = DB.AutoMigrate(&models.User{}, &models.ChefProfile{}, &models.MenuItem{}, &models.Cart{}, &models.CartItem{}, &models.Order{}, &models.OrderItem{}, &models.Review{}, &models.AdAccount{}, &models.AdCampaign{}, &models.Ad{}, &models.AdImpression{}, &models.AdClick{})
	if err != nil {
		log.Fatal("Failed to migrate database")
	}
}
