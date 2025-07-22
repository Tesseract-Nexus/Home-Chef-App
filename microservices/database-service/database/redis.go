package database

import (
	"context"
	"database-service/config"
	"encoding/json"
	"fmt"
	"time"

	"github.com/go-redis/redis/v8"
	"go.uber.org/zap"
)

type RedisClient struct {
	Client *redis.Client
	logger *zap.Logger
	ctx    context.Context
}

func NewRedisClient(cfg *config.Config, logger *zap.Logger) (*RedisClient, error) {
	rdb := redis.NewClient(&redis.Options{
		Addr:     cfg.RedisURL[8:], // Remove redis:// prefix
		Password: cfg.RedisPassword,
		DB:       cfg.RedisDB,
		PoolSize: 10,
	})

	ctx := context.Background()

	// Test connection
	_, err := rdb.Ping(ctx).Result()
	if err != nil {
		return nil, fmt.Errorf("failed to connect to Redis: %w", err)
	}

	redisClient := &RedisClient{
		Client: rdb,
		logger: logger,
		ctx:    ctx,
	}

	// Seed mock cache data
	if err := redisClient.SeedMockData(); err != nil {
		logger.Warn("Failed to seed Redis mock data", zap.Error(err))
	}

	logger.Info("Redis client connected successfully")
	return redisClient, nil
}

func (r *RedisClient) SeedMockData() error {
	r.logger.Info("Seeding Redis mock data...")

	// Cache chef availability
	chefAvailability := map[string]interface{}{
		"chef-1": map[string]interface{}{
			"is_available":    true,
			"last_seen":       time.Now().Unix(),
			"current_orders":  3,
			"avg_prep_time":   25,
		},
	}

	for chefID, data := range chefAvailability {
		key := fmt.Sprintf("chef:availability:%s", chefID)
		if err := r.SetJSON(key, data, time.Hour); err != nil {
			return fmt.Errorf("failed to cache chef availability: %w", err)
		}
	}

	// Cache popular dishes
	popularDishes := []map[string]interface{}{
		{
			"dish_id":     "menu-1",
			"name":        "Butter Chicken",
			"chef_id":     "chef-1",
			"orders":      45,
			"rating":      4.8,
			"prep_time":   25,
		},
		{
			"dish_id":     "menu-2",
			"name":        "Paneer Tikka Masala",
			"chef_id":     "chef-1",
			"orders":      32,
			"rating":      4.6,
			"prep_time":   20,
		},
	}

	if err := r.SetJSON("popular:dishes", popularDishes, time.Hour*24); err != nil {
		return fmt.Errorf("failed to cache popular dishes: %w", err)
	}

	// Cache delivery partner locations
	deliveryLocations := map[string]interface{}{
		"delivery-1": map[string]interface{}{
			"latitude":    19.0760,
			"longitude":   72.8777,
			"is_available": true,
			"last_update": time.Now().Unix(),
		},
	}

	for deliveryID, location := range deliveryLocations {
		key := fmt.Sprintf("delivery:location:%s", deliveryID)
		if err := r.SetJSON(key, location, time.Minute*5); err != nil {
			return fmt.Errorf("failed to cache delivery location: %w", err)
		}
	}

	// Cache session data
	sessionData := map[string]interface{}{
		"user_id": "user-1",
		"role":    "chef",
		"email":   "chef1@homechef.com",
		"chef_id": "chef-1",
	}

	if err := r.SetJSON("session:sample-token", sessionData, time.Hour*24); err != nil {
		return fmt.Errorf("failed to cache session: %w", err)
	}

	r.logger.Info("Redis mock data seeded successfully")
	return nil
}

// Set stores a key-value pair with expiration
func (r *RedisClient) Set(key string, value interface{}, expiration time.Duration) error {
	return r.Client.Set(r.ctx, key, value, expiration).Err()
}

// Get retrieves a value by key
func (r *RedisClient) Get(key string) (string, error) {
	return r.Client.Get(r.ctx, key).Result()
}

// SetJSON stores a JSON object with expiration
func (r *RedisClient) SetJSON(key string, value interface{}, expiration time.Duration) error {
	jsonData, err := json.Marshal(value)
	if err != nil {
		return err
	}
	return r.Client.Set(r.ctx, key, jsonData, expiration).Err()
}

// GetJSON retrieves and unmarshals a JSON object
func (r *RedisClient) GetJSON(key string, dest interface{}) error {
	jsonData, err := r.Client.Get(r.ctx, key).Result()
	if err != nil {
		return err
	}
	return json.Unmarshal([]byte(jsonData), dest)
}

// Delete removes a key
func (r *RedisClient) Delete(key string) error {
	return r.Client.Del(r.ctx, key).Err()
}

// Exists checks if a key exists
func (r *RedisClient) Exists(key string) (bool, error) {
	count, err := r.Client.Exists(r.ctx, key).Result()
	return count > 0, err
}

// SetExpiration sets expiration for a key
func (r *RedisClient) SetExpiration(key string, expiration time.Duration) error {
	return r.Client.Expire(r.ctx, key, expiration).Err()
}

// GetTTL gets time to live for a key
func (r *RedisClient) GetTTL(key string) (time.Duration, error) {
	return r.Client.TTL(r.ctx, key).Result()
}

// Increment increments a numeric value
func (r *RedisClient) Increment(key string) (int64, error) {
	return r.Client.Incr(r.ctx, key).Result()
}

// Decrement decrements a numeric value
func (r *RedisClient) Decrement(key string) (int64, error) {
	return r.Client.Decr(r.ctx, key).Result()
}

// SetHash stores a hash field
func (r *RedisClient) SetHash(key, field string, value interface{}) error {
	return r.Client.HSet(r.ctx, key, field, value).Err()
}

// GetHash retrieves a hash field
func (r *RedisClient) GetHash(key, field string) (string, error) {
	return r.Client.HGet(r.ctx, key, field).Result()
}

// GetAllHash retrieves all hash fields
func (r *RedisClient) GetAllHash(key string) (map[string]string, error) {
	return r.Client.HGetAll(r.ctx, key).Result()
}

// PublishMessage publishes a message to a channel
func (r *RedisClient) PublishMessage(channel string, message interface{}) error {
	jsonData, err := json.Marshal(message)
	if err != nil {
		return err
	}
	return r.Client.Publish(r.ctx, channel, jsonData).Err()
}

// Subscribe subscribes to channels
func (r *RedisClient) Subscribe(channels ...string) *redis.PubSub {
	return r.Client.Subscribe(r.ctx, channels...)
}

// Close closes the Redis connection
func (r *RedisClient) Close() error {
	return r.Client.Close()
}