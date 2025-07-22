package cron

import (
	"time"

	"github.com/robfig/cron/v3"
	"gorm.io/gorm"
	"homechef/webhook-service/models"
	"homechef/webhook-service/services"
	"homechef/webhook-service/utils"
)

type Scheduler struct {
	cron           *cron.Cron
	db             *gorm.DB
	webhookService *services.WebhookService
}

// NewScheduler creates a new cron scheduler
func NewScheduler(db *gorm.DB, webhookService *services.WebhookService) *Scheduler {
	return &Scheduler{
		cron:           cron.New(),
		db:             db,
		webhookService: webhookService,
	}
}

// Start starts the cron scheduler
func (s *Scheduler) Start() {
	// Retry failed webhook deliveries every 5 minutes
	s.cron.AddFunc("*/5 * * * *", s.retryFailedDeliveries)

	// Clean up old delivery logs every day at midnight
	s.cron.AddFunc("0 0 * * *", s.cleanupOldDeliveries)

	s.cron.Start()
	utils.LogInfo("Cron scheduler started", nil)
}

// Stop stops the cron scheduler
func (s *Scheduler) Stop() {
	s.cron.Stop()
	utils.LogInfo("Cron scheduler stopped", nil)
}

// retryFailedDeliveries retries failed webhook deliveries that are due for retry
func (s *Scheduler) retryFailedDeliveries() {
	var deliveries []models.WebhookDelivery

	// Find deliveries that need retry
	if err := s.db.Where("status = ? AND next_retry_at IS NOT NULL AND next_retry_at <= ?",
		models.DeliveryStatusPending, time.Now()).
		Find(&deliveries).Error; err != nil {
		utils.LogError(err, map[string]interface{}{
			"action": "retry_failed_deliveries_query",
		})
		return
	}

	utils.LogInfo("Processing webhook delivery retries", map[string]interface{}{
		"count": len(deliveries),
	})

	for _, delivery := range deliveries {
		// Get webhook endpoint
		var webhook models.WebhookEndpoint
		if err := s.db.Where("id = ?", delivery.WebhookID).First(&webhook).Error; err != nil {
			utils.LogError(err, map[string]interface{}{
				"delivery_id": delivery.ID,
				"webhook_id":  delivery.WebhookID,
				"action":      "get_webhook_for_retry",
			})
			continue
		}

		// Check if webhook is still active
		if !webhook.IsActive {
			// Mark delivery as failed since webhook is inactive
			delivery.Status = models.DeliveryStatusFailed
			delivery.ErrorMessage = "Webhook endpoint is inactive"
			now := time.Now()
			delivery.FailedAt = &now
			s.db.Save(&delivery)
			continue
		}

		// Retry delivery
		go s.retryDelivery(&webhook, &delivery)
	}
}

// retryDelivery retries a specific delivery
func (s *Scheduler) retryDelivery(webhook *models.WebhookEndpoint, delivery *models.WebhookDelivery) {
	// Reset retry timestamp
	delivery.NextRetryAt = nil
	s.db.Save(delivery)

	// Use the webhook service to deliver
	// This is a simplified approach - in a real implementation, you might want to
	// extract the delivery logic to a separate method that can be reused
	utils.LogInfo("Retrying webhook delivery", map[string]interface{}{
		"delivery_id": delivery.ID,
		"webhook_id":  delivery.WebhookID,
		"attempt":     delivery.AttemptCount + 1,
	})

	// Send webhook using the service
	err := s.webhookService.SendWebhook(webhook, delivery.EventType, delivery.Payload)
	if err != nil {
		utils.LogError(err, map[string]interface{}{
			"delivery_id": delivery.ID,
			"webhook_id":  delivery.WebhookID,
			"action":      "retry_webhook_delivery",
		})
	}
}

// cleanupOldDeliveries removes old delivery logs to prevent database bloat
func (s *Scheduler) cleanupOldDeliveries() {
	// Delete delivery logs older than 30 days
	cutoffDate := time.Now().AddDate(0, 0, -30)

	result := s.db.Where("created_at < ?", cutoffDate).Delete(&models.WebhookDelivery{})
	if result.Error != nil {
		utils.LogError(result.Error, map[string]interface{}{
			"action": "cleanup_old_deliveries",
		})
		return
	}

	utils.LogInfo("Cleaned up old webhook deliveries", map[string]interface{}{
		"deleted_count": result.RowsAffected,
		"cutoff_date":   cutoffDate,
	})
}