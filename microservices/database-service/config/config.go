package config

import (
	"os"
	"strconv"

	"github.com/joho/godotenv"
)

type Config struct {
	Port            string
	Host            string
	SSLCertPath     string
	SSLKeyPath      string
	JWTSecret       string
	DatabaseURL     string
	RedisURL        string
	RedisPassword   string
	RedisDB         int
	WebSocketOrigin string
	Environment     string
	LogLevel        string
}

func LoadConfig() *Config {
	// Load .env file if exists
	godotenv.Load()

	return &Config{
		Port:            getEnv("PORT", "8081"),
		Host:            getEnv("HOST", "localhost"),
		SSLCertPath:     getEnv("SSL_CERT_PATH", "./certs/cert.pem"),
		SSLKeyPath:      getEnv("SSL_KEY_PATH", "./certs/key.pem"),
		JWTSecret:       getEnv("JWT_SECRET", "your-secret-key"),
		DatabaseURL:     getEnv("DATABASE_URL", "postgres://localhost/homechef_db?sslmode=disable"),
		RedisURL:        getEnv("REDIS_URL", "redis://localhost:6379"),
		RedisPassword:   getEnv("REDIS_PASSWORD", ""),
		RedisDB:         getEnvAsInt("REDIS_DB", 0),
		WebSocketOrigin: getEnv("WEBSOCKET_ORIGIN", "*"),
		Environment:     getEnv("ENVIRONMENT", "development"),
		LogLevel:        getEnv("LOG_LEVEL", "debug"),
	}
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

func getEnvAsInt(key string, defaultValue int) int {
	if value := os.Getenv(key); value != "" {
		if intVal, err := strconv.Atoi(value); err == nil {
			return intVal
		}
	}
	return defaultValue
}