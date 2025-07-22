package services

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"strconv"
	"time"

	"gorm.io/gorm"
	"homechef/webhook-service/config"
	"homechef/webhook-service/models"
	"homechef/webhook-service/utils"
)

type WebhookService struct {
	db *gorm.DB
}

// NewWebhookService creates a new webhook service
func NewWebhookService(db *gorm.DB) *WebhookService {
	return &WebhookService{db: db}
}

// CreateWebhook creates a new webhook endpoint
func (s *WebhookService) CreateWebhook(userID string, request models.WebhookCreate) (*models.WebhookEndpoint, error) {
	// Generate webhook ID and secret
	webhookID := generateWebhookID()
	secret, err := utils.GenerateSecret()
	if err != nil {
		return nil, fmt.Errorf("failed to generate secret: %w", err)
	}

	// Set default retry policy if not provided
	if request.RetryPolicy.MaxRetries == 0 {
		request.RetryPolicy.MaxRetries = config.AppConfig.Webhook.MaxRetries
	}
	if request.RetryPolicy.RetryDelay == 0 {
		request.RetryPolicy.RetryDelay = config.AppConfig.Webhook.RetryDelay
	}

	// Create webhook endpoint
	webhook := &models.WebhookEndpoint{
		ID:          webhookID,
		UserID:      userID,
		URL:         request.URL,
		Events:      models.StringArray(request.Events),
		Secret:      secret,
		Description: request.Description,
		IsActive:    true,
		RetryPolicy: request.RetryPolicy,
	}

	if err := s.db.Create(webhook).Error; err != nil {
		return nil, err
	}

	utils.LogInfo("Webhook endpoint created", map[string]interface{}{
		"webhook_id": webhook.ID,
		"user_id":    userID,
		"url":        webhook.URL,
		"events":     webhook.Events,
	})

	return webhook, nil
}

// GetWebhooks retrieves webhook endpoints for a user
func (s *WebhookService) GetWebhooks(userID string) ([]models.WebhookEndpoint, error) {
	var webhooks []models.WebhookEndpoint

	if err := s.db.Where("user_id = ?", userID).
		Order("created_at DESC").
		Find(&webhooks).Error; err != nil {
		return nil, err
	}

	return webhooks, nil
}

// GetWebhookByID retrieves a webhook by ID
func (s *WebhookService) GetWebhookByID(webhookID, userID string) (*models.WebhookEndpoint, error) {
	var webhook models.WebhookEndpoint

	if err := s.db.Where("id = ? AND user_id = ?", webhookID, userID).
		First(&webhook).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("webhook not found")
		}
		return nil, err
	}

	return &webhook, nil
}

// UpdateWebhook updates a webhook endpoint
func (s *WebhookService) UpdateWebhook(webhookID, userID string, request models.WebhookUpdate) (*models.WebhookEndpoint, error) {
	webhook, err := s.GetWebhookByID(webhookID, userID)
	if err != nil {
		return nil, err
	}

	// Update fields
	updates := make(map[string]interface{})
	
	if request.URL != "" {
		updates["url"] = request.URL
	}
	if len(request.Events) > 0 {
		updates["events"] = models.StringArray(request.Events)
	}
	if request.IsActive != nil {
		updates["is_active"] = *request.IsActive
	}
	if request.RetryPolicy.MaxRetries > 0 || request.RetryPolicy.RetryDelay > 0 {
		updates["retry_policy"] = request.RetryPolicy
	}

	if err := s.db.Model(webhook).Updates(updates).Error; err != nil {
		return nil, err
	}

	// Reload webhook
	if err := s.db.Where("id = ?", webhookID).First(webhook).Error; err != nil {
		return nil, err
	}

	utils.LogInfo("Webhook endpoint updated", map[string]interface{}{
		"webhook_id": webhook.ID,
		"user_id":    userID,
		"updates":    updates,
	})

	return webhook, nil
}

// DeleteWebhook deletes a webhook endpoint
func (s *WebhookService) DeleteWebhook(webhookID, userID string) error {
	result := s.db.Where("id = ? AND user_id = ?", webhookID, userID).
		Delete(&models.WebhookEndpoint{})

	if result.Error != nil {
		return result.Error
	}

	if result.RowsAffected == 0 {
		return errors.New("webhook not found")
	}

	utils.LogInfo("Webhook endpoint deleted", map[string]interface{}{
		"webhook_id": webhookID,
		"user_id":    userID,
	})

	return nil
}

// TestWebhook sends a test webhook
func (s *WebhookService) TestWebhook(webhookID, userID string, eventType string) error {
	webhook, err := s.GetWebhookByID(webhookID, userID)
	if err != nil {
		return err
	}

	// Create test payload
	testPayload := map[string]interface{}{
		"test":       true,
		"event_type": eventType,
		"timestamp":  time.Now(),
		"message":    "This is a test webhook from HomeChef",
	}

	// Send webhook
	return s.SendWebhook(webhook, eventType, testPayload)
}

// SendWebhook sends a webhook to an endpoint
func (s *WebhookService) SendWebhook(webhook *models.WebhookEndpoint, eventType string, data map[string]interface{}) error {
	// Check if webhook is active
	if !webhook.IsActive {
		return nil
	}

	// Check if webhook subscribes to this event
	subscribed := false
	for _, event := range webhook.Events {
		if event == eventType {
			subscribed = true
			break
		}
	}
	if !subscribed {
		return nil
	}

	// Create delivery record
	deliveryID := generateDeliveryID()
	delivery := &models.WebhookDelivery{
		ID:        deliveryID,
		WebhookID: webhook.ID,
		EventType: eventType,
		Payload:   data,
		Status:    models.DeliveryStatusPending,
	}

	if err := s.db.Create(delivery).Error; err != nil {
		return err
	}

	// Send webhook asynchronously
	go s.deliverWebhook(webhook, delivery)

	return nil
}

// deliverWebhook delivers a webhook
func (s *WebhookService) deliverWebhook(webhook *models.WebhookEndpoint, delivery *models.WebhookDelivery) {
	// Create payload
	payload := models.WebhookPayload{
		Event:      delivery.EventType,
		Data:       delivery.Payload,
		Timestamp:  time.Now(),
		WebhookID:  webhook.ID,
		DeliveryID: delivery.ID,
	}

	payloadBytes, err := json.Marshal(payload)
	if err != nil {
		s.markDeliveryFailed(delivery, "Failed to marshal payload: "+err.Error())
		return
	}

	// Generate signature
	signature := utils.GenerateSignature(payloadBytes, webhook.Secret)

	// Create HTTP request
	req, err := http.NewRequestWithContext(
		context.Background(),
		"POST",
		webhook.URL,
		bytes.NewBuffer(payloadBytes),
	)
	if err != nil {
		s.markDeliveryFailed(delivery, "Failed to create request: "+err.Error())
		return
	}

	// Set headers
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("User-Agent", "HomeChef-Webhooks/1.0")
	req.Header.Set(config.AppConfig.Webhook.SignatureHeader, signature)
	req.Header.Set("X-HomeChef-Event", delivery.EventType)
	req.Header.Set("X-HomeChef-Delivery", delivery.ID)

	// Send request
	client := &http.Client{
		Timeout: time.Duration(config.AppConfig.Webhook.TimeoutSeconds) * time.Second,
	}

	resp, err := client.Do(req)
	if err != nil {
		s.handleDeliveryFailure(webhook, delivery, "Request failed: "+err.Error())
		return
	}
	defer resp.Body.Close()

	// Read response
	var responseBody bytes.Buffer
	responseBody.ReadFrom(resp.Body)

	// Update delivery record
	delivery.HTTPStatus = resp.StatusCode
	delivery.Response = responseBody.String()
	delivery.AttemptCount++

	if resp.StatusCode >= 200 && resp.StatusCode < 300 {
		// Success
		delivery.Status = models.DeliveryStatusSuccess
		now := time.Now()
		delivery.DeliveredAt = &now
		
		utils.LogInfo("Webhook delivered successfully", map[string]interface{}{
			"webhook_id":  webhook.ID,
			"delivery_id": delivery.ID,
			"event_type":  delivery.EventType,
			"status_code": resp.StatusCode,
		})
	} else {
		// Failure
		s.handleDeliveryFailure(webhook, delivery, fmt.Sprintf("HTTP %d: %s", resp.StatusCode, responseBody.String()))
	}

	s.db.Save(delivery)
}

// handleDeliveryFailure handles webhook delivery failure
func (s *WebhookService) handleDeliveryFailure(webhook *models.WebhookEndpoint, delivery *models.WebhookDelivery, errorMessage string) {
	delivery.ErrorMessage = errorMessage
	delivery.AttemptCount++

	// Check if we should retry
	if delivery.AttemptCount < webhook.RetryPolicy.MaxRetries {
		// Schedule retry
		nextRetry := time.Now().Add(time.Duration(webhook.RetryPolicy.RetryDelay) * time.Second)
		delivery.NextRetryAt = &nextRetry
		
		utils.LogWarning("Webhook delivery failed, will retry", map[string]interface{}{
			"webhook_id":    webhook.ID,
			"delivery_id":   delivery.ID,
			"attempt_count": delivery.AttemptCount,
			"next_retry":    nextRetry,
			"error":         errorMessage,
		})
	} else {
		// Mark as failed
		delivery.Status = models.DeliveryStatusFailed
		now := time.Now()
		delivery.FailedAt = &now
		
		utils.LogError(errors.New("webhook delivery failed permanently"), map[string]interface{}{
			"webhook_id":    webhook.ID,
			"delivery_id":   delivery.ID,
			"attempt_count": delivery.AttemptCount,
			"error":         errorMessage,
		})
	}
}

// markDeliveryFailed marks a delivery as failed
func (s *WebhookService) markDeliveryFailed(delivery *models.WebhookDelivery, errorMessage string) {
	delivery.Status = models.DeliveryStatusFailed
	delivery.ErrorMessage = errorMessage
	now := time.Now()
	delivery.FailedAt = &now
	s.db.Save(delivery)
}

// GetDeliveries retrieves webhook deliveries
func (s *WebhookService) GetDeliveries(userID string, query models.DeliveryQuery) ([]models.WebhookDelivery, int64, error) {
	var deliveries []models.WebhookDelivery
	var total int64

	db := s.db.Model(&models.WebhookDelivery{}).
		Joins("JOIN webhook_endpoints ON webhook_deliveries.webhook_id = webhook_endpoints.id").
		Where("webhook_endpoints.user_id = ?", userID)

	// Apply filters
	if query.WebhookID != "" {
		db = db.Where("webhook_deliveries.webhook_id = ?", query.WebhookID)
	}
	if query.EventType != "" {
		db = db.Where("webhook_deliveries.event_type = ?", query.EventType)
	}
	if query.Status != "" {
		db = db.Where("webhook_deliveries.status = ?", query.Status)
	}

	// Get total count
	if err := db.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	// Apply pagination
	offset := (query.Page - 1) * query.Limit
	if err := db.Order("webhook_deliveries.created_at DESC").
		Offset(offset).
		Limit(query.Limit).
		Find(&deliveries).Error; err != nil {
		return nil, 0, err
	}

	return deliveries, total, nil
}

// RetryDelivery retries a failed webhook delivery
func (s *WebhookService) RetryDelivery(deliveryID, userID string) error {
	var delivery models.WebhookDelivery
	
	if err := s.db.Joins("JOIN webhook_endpoints ON webhook_deliveries.webhook_id = webhook_endpoints.id").
		Where("webhook_deliveries.id = ? AND webhook_endpoints.user_id = ?", deliveryID, userID).
		First(&delivery).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return errors.New("delivery not found")
		}
		return err
	}

	// Get webhook endpoint
	var webhook models.WebhookEndpoint
	if err := s.db.Where("id = ?", delivery.WebhookID).First(&webhook).Error; err != nil {
		return err
	}

	// Reset delivery status
	delivery.Status = models.DeliveryStatusPending
	delivery.ErrorMessage = ""
	delivery.NextRetryAt = nil
	delivery.FailedAt = nil

	if err := s.db.Save(&delivery).Error; err != nil {
		return err
	}

	// Retry delivery
	go s.deliverWebhook(&webhook, &delivery)

	utils.LogInfo("Webhook delivery retry initiated", map[string]interface{}{
		"delivery_id": deliveryID,
		"webhook_id":  delivery.WebhookID,
		"user_id":     userID,
	})

	return nil
}

// GetAvailableEvents returns available webhook events
func (s *WebhookService) GetAvailableEvents() []models.WebhookEvent {
	return models.AvailableEvents
}

// Helper functions

// generateWebhookID generates a unique webhook ID
func generateWebhookID() string {
	timestamp := time.Now().Unix()
	return "webhook_" + strconv.FormatInt(timestamp, 10) + "_" + generateRandomString(6)
}

// generateDeliveryID generates a unique delivery ID
func generateDeliveryID() string {
	timestamp := time.Now().Unix()
	return "delivery_" + strconv.FormatInt(timestamp, 10) + "_" + generateRandomString(6)
}

// generateRandomString generates a random string
func generateRandomString(length int) string {
	const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
	result := make([]byte, length)
	for i := range result {
		result[i] = charset[time.Now().UnixNano()%int64(len(charset))]
	}
	return string(result)
}