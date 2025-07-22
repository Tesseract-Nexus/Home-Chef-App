package config

import (
	"os"
	"strconv"

	"github.com/joho/godotenv"
	"github.com/sirupsen/logrus"
)

type Config struct {
	Server   ServerConfig
	Database DatabaseConfig
	Redis    RedisConfig
	JWT      JWTConfig
	Webhook  WebhookConfig
	Services ServicesConfig
}

type ServerConfig struct {
	Port        string
	Environment string
	Host        string
}

type DatabaseConfig struct {
	Host     string
	Port     string
	User     string
	Password string
	DBName   string
	SSLMode  string
}

type RedisConfig struct {
	Host     string
	Port     string
	Password string
	DB       int
}

type JWTConfig struct {
	Secret     string
	Expiration int
}

type WebhookConfig struct {
	MaxRetries      int
	RetryDelay      int
	TimeoutSeconds  int
	MaxPayloadSize  int64
	SignatureHeader string
}

type ServicesConfig struct {
	UserServiceURL     string
	OrderServiceURL    string
	PaymentServiceURL  string
	NotificationURL    string
}

var AppConfig *Config

func LoadConfig() *Config {
	// Load .env file if exists
	if err := godotenv.Load(); err != nil {
		logrus.Warn("No .env file found")
	}

	config := &Config{
		Server: ServerConfig{
			Port:        getEnv("SERVER_PORT", "8080"),
			Environment: getEnv("ENVIRONMENT", "development"),
			Host:        getEnv("SERVER_HOST", "0.0.0.0"),
		},
		Database: DatabaseConfig{
			Host:     getEnv("DB_HOST", "localhost"),
			Port:     getEnv("DB_PORT", "5432"),
			User:     getEnv("DB_USER", "postgres"),
			Password: getEnv("DB_PASSWORD", ""),
			DBName:   getEnv("DB_NAME", "webhook_service"),
			SSLMode:  getEnv("DB_SSLMODE", "disable"),
		},
		Redis: RedisConfig{
			Host:     getEnv("REDIS_HOST", "localhost"),
			Port:     getEnv("REDIS_PORT", "6379"),
			Password: getEnv("REDIS_PASSWORD", ""),
			DB:       getEnvAsInt("REDIS_DB", 0),
		},
		JWT: JWTConfig{
			Secret:     getEnv("JWT_SECRET", "your-secret-key"),
			Expiration: getEnvAsInt("JWT_EXPIRATION", 3600),
		},
		Webhook: WebhookConfig{
			MaxRetries:      getEnvAsInt("WEBHOOK_MAX_RETRIES", 3),
			RetryDelay:      getEnvAsInt("WEBHOOK_RETRY_DELAY", 60),
			TimeoutSeconds:  getEnvAsInt("WEBHOOK_TIMEOUT", 30),
			MaxPayloadSize:  getEnvAsInt64("WEBHOOK_MAX_PAYLOAD_SIZE", 1048576), // 1MB
			SignatureHeader: getEnv("WEBHOOK_SIGNATURE_HEADER", "X-HomeChef-Signature"),
		},
		Services: ServicesConfig{
			UserServiceURL:    getEnv("USER_SERVICE_URL", "http://user-service:8080"),
			OrderServiceURL:   getEnv("ORDER_SERVICE_URL", "http://order-service:8080"),
			PaymentServiceURL: getEnv("PAYMENT_SERVICE_URL", "http://payment-service:8080"),
			NotificationURL:   getEnv("NOTIFICATION_SERVICE_URL", "http://notification-service:8080"),
		},
	}

	AppConfig = config
	return config
}

func getEnv(key, fallback string) string {
	if value, exists := os.LookupEnv(key); exists {
		return value
	}
	return fallback
}

func getEnvAsInt(name string, fallback int) int {
	if value, exists := os.LookupEnv(name); exists {
		if intValue, err := strconv.Atoi(value); err == nil {
			return intValue
		}
	}
	return fallback
}

func getEnvAsInt64(name string, fallback int64) int64 {
	if value, exists := os.LookupEnv(name); exists {
		if intValue, err := strconv.ParseInt(value, 10, 64); err == nil {
			return intValue
		}
	}
	return fallback
}