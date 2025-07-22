package handlers

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"homechef/webhook-service/models"
	"homechef/webhook-service/services"
	"homechef/webhook-service/utils"
)

type WebhookHandler struct {
	webhookService *services.WebhookService
}

// NewWebhookHandler creates a new webhook handler
func NewWebhookHandler(webhookService *services.WebhookService) *WebhookHandler {
	return &WebhookHandler{
		webhookService: webhookService,
	}
}

// CreateWebhook handles POST /webhooks
// @Summary Create webhook endpoint
// @Tags Webhook Management
// @Accept json
// @Produce json
// @Param webhook body models.WebhookCreate true "Webhook creation request"
// @Success 201 {object} models.APIResponse{data=models.WebhookEndpoint}
// @Failure 400 {object} models.ErrorResponse
// @Failure 401 {object} models.ErrorResponse
// @Failure 500 {object} models.ErrorResponse
// @Router /webhooks [post]
func (h *WebhookHandler) CreateWebhook(c *gin.Context) {
	var request models.WebhookCreate

	// Bind and validate request
	if validationErrors := utils.BindAndValidate(c, &request); len(validationErrors) > 0 {
		c.JSON(http.StatusBadRequest, models.ErrorResponseWithDetails("Validation failed", validationErrors))
		return
	}

	// Get user ID from context
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, models.ErrorResponseWithMessage("User not authenticated"))
		return
	}

	userIDStr, ok := userID.(string)
	if !ok {
		c.JSON(http.StatusInternalServerError, models.ErrorResponseWithMessage("Invalid user ID"))
		return
	}

	// Create webhook
	webhook, err := h.webhookService.CreateWebhook(userIDStr, request)
	if err != nil {
		utils.LogError(err, map[string]interface{}{
			"user_id": userIDStr,
			"action":  "create_webhook",
			"request": request,
		})
		c.JSON(http.StatusInternalServerError, models.ErrorResponseWithMessage("Failed to create webhook"))
		return
	}

	c.JSON(http.StatusCreated, models.SuccessWithMessageResponse("Webhook endpoint created successfully", webhook))
}

// GetWebhooks handles GET /webhooks
// @Summary Get webhook endpoints
// @Tags Webhook Management
// @Accept json
// @Produce json
// @Success 200 {object} models.APIResponse{data=[]models.WebhookEndpoint}
// @Failure 401 {object} models.ErrorResponse
// @Failure 500 {object} models.ErrorResponse
// @Router /webhooks [get]
func (h *WebhookHandler) GetWebhooks(c *gin.Context) {
	// Get user ID from context
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, models.ErrorResponseWithMessage("User not authenticated"))
		return
	}

	userIDStr, ok := userID.(string)
	if !ok {
		c.JSON(http.StatusInternalServerError, models.ErrorResponseWithMessage("Invalid user ID"))
		return
	}

	// Get webhooks
	webhooks, err := h.webhookService.GetWebhooks(userIDStr)
	if err != nil {
		utils.LogError(err, map[string]interface{}{
			"user_id": userIDStr,
			"action":  "get_webhooks",
		})
		c.JSON(http.StatusInternalServerError, models.ErrorResponseWithMessage("Failed to get webhooks"))
		return
	}

	c.JSON(http.StatusOK, models.SuccessResponse(webhooks))
}

// GetWebhookByID handles GET /webhooks/:webhook_id
// @Summary Get webhook details
// @Tags Webhook Management
// @Accept json
// @Produce json
// @Param webhook_id path string true "Webhook ID"
// @Success 200 {object} models.APIResponse{data=models.WebhookEndpoint}
// @Failure 400 {object} models.ErrorResponse
// @Failure 401 {object} models.ErrorResponse
// @Failure 404 {object} models.ErrorResponse
// @Failure 500 {object} models.ErrorResponse
// @Router /webhooks/{webhook_id} [get]
func (h *WebhookHandler) GetWebhookByID(c *gin.Context) {
	webhookID := c.Param("webhook_id")
	if webhookID == "" {
		c.JSON(http.StatusBadRequest, models.ErrorResponseWithMessage("Webhook ID is required"))
		return
	}

	// Get user ID from context
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, models.ErrorResponseWithMessage("User not authenticated"))
		return
	}

	userIDStr, ok := userID.(string)
	if !ok {
		c.JSON(http.StatusInternalServerError, models.ErrorResponseWithMessage("Invalid user ID"))
		return
	}

	// Get webhook by ID
	webhook, err := h.webhookService.GetWebhookByID(webhookID, userIDStr)
	if err != nil {
		if err.Error() == "webhook not found" {
			c.JSON(http.StatusNotFound, models.ErrorResponseWithMessage("Webhook not found"))
			return
		}

		utils.LogError(err, map[string]interface{}{
			"user_id":    userIDStr,
			"webhook_id": webhookID,
			"action":     "get_webhook_by_id",
		})
		c.JSON(http.StatusInternalServerError, models.ErrorResponseWithMessage("Failed to get webhook"))
		return
	}

	c.JSON(http.StatusOK, models.SuccessResponse(webhook))
}

// UpdateWebhook handles PUT /webhooks/:webhook_id
// @Summary Update webhook endpoint
// @Tags Webhook Management
// @Accept json
// @Produce json
// @Param webhook_id path string true "Webhook ID"
// @Param webhook body models.WebhookUpdate true "Webhook update request"
// @Success 200 {object} models.APIResponse{data=models.WebhookEndpoint}
// @Failure 400 {object} models.ErrorResponse
// @Failure 401 {object} models.ErrorResponse
// @Failure 404 {object} models.ErrorResponse
// @Failure 500 {object} models.ErrorResponse
// @Router /webhooks/{webhook_id} [put]
func (h *WebhookHandler) UpdateWebhook(c *gin.Context) {
	webhookID := c.Param("webhook_id")
	if webhookID == "" {
		c.JSON(http.StatusBadRequest, models.ErrorResponseWithMessage("Webhook ID is required"))
		return
	}

	var request models.WebhookUpdate

	// Bind and validate request
	if validationErrors := utils.BindAndValidate(c, &request); len(validationErrors) > 0 {
		c.JSON(http.StatusBadRequest, models.ErrorResponseWithDetails("Validation failed", validationErrors))
		return
	}

	// Get user ID from context
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, models.ErrorResponseWithMessage("User not authenticated"))
		return
	}

	userIDStr, ok := userID.(string)
	if !ok {
		c.JSON(http.StatusInternalServerError, models.ErrorResponseWithMessage("Invalid user ID"))
		return
	}

	// Update webhook
	webhook, err := h.webhookService.UpdateWebhook(webhookID, userIDStr, request)
	if err != nil {
		if err.Error() == "webhook not found" {
			c.JSON(http.StatusNotFound, models.ErrorResponseWithMessage("Webhook not found"))
			return
		}

		utils.LogError(err, map[string]interface{}{
			"user_id":    userIDStr,
			"webhook_id": webhookID,
			"action":     "update_webhook",
			"request":    request,
		})
		c.JSON(http.StatusInternalServerError, models.ErrorResponseWithMessage("Failed to update webhook"))
		return
	}

	c.JSON(http.StatusOK, models.SuccessWithMessageResponse("Webhook updated successfully", webhook))
}

// DeleteWebhook handles DELETE /webhooks/:webhook_id
// @Summary Delete webhook endpoint
// @Tags Webhook Management
// @Accept json
// @Produce json
// @Param webhook_id path string true "Webhook ID"
// @Success 200 {object} models.APIResponse
// @Failure 400 {object} models.ErrorResponse
// @Failure 401 {object} models.ErrorResponse
// @Failure 404 {object} models.ErrorResponse
// @Failure 500 {object} models.ErrorResponse
// @Router /webhooks/{webhook_id} [delete]
func (h *WebhookHandler) DeleteWebhook(c *gin.Context) {
	webhookID := c.Param("webhook_id")
	if webhookID == "" {
		c.JSON(http.StatusBadRequest, models.ErrorResponseWithMessage("Webhook ID is required"))
		return
	}

	// Get user ID from context
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, models.ErrorResponseWithMessage("User not authenticated"))
		return
	}

	userIDStr, ok := userID.(string)
	if !ok {
		c.JSON(http.StatusInternalServerError, models.ErrorResponseWithMessage("Invalid user ID"))
		return
	}

	// Delete webhook
	err := h.webhookService.DeleteWebhook(webhookID, userIDStr)
	if err != nil {
		if err.Error() == "webhook not found" {
			c.JSON(http.StatusNotFound, models.ErrorResponseWithMessage("Webhook not found"))
			return
		}

		utils.LogError(err, map[string]interface{}{
			"user_id":    userIDStr,
			"webhook_id": webhookID,
			"action":     "delete_webhook",
		})
		c.JSON(http.StatusInternalServerError, models.ErrorResponseWithMessage("Failed to delete webhook"))
		return
	}

	c.JSON(http.StatusOK, models.SuccessWithMessageResponse("Webhook deleted successfully", nil))
}

// TestWebhook handles POST /webhooks/:webhook_id/test
// @Summary Test webhook endpoint
// @Tags Webhook Management
// @Accept json
// @Produce json
// @Param webhook_id path string true "Webhook ID"
// @Param test body models.WebhookTest true "Webhook test request"
// @Success 200 {object} models.APIResponse
// @Failure 400 {object} models.ErrorResponse
// @Failure 401 {object} models.ErrorResponse
// @Failure 404 {object} models.ErrorResponse
// @Failure 500 {object} models.ErrorResponse
// @Router /webhooks/{webhook_id}/test [post]
func (h *WebhookHandler) TestWebhook(c *gin.Context) {
	webhookID := c.Param("webhook_id")
	if webhookID == "" {
		c.JSON(http.StatusBadRequest, models.ErrorResponseWithMessage("Webhook ID is required"))
		return
	}

	var request models.WebhookTest

	// Bind and validate request
	if validationErrors := utils.BindAndValidate(c, &request); len(validationErrors) > 0 {
		c.JSON(http.StatusBadRequest, models.ErrorResponseWithDetails("Validation failed", validationErrors))
		return
	}

	// Get user ID from context
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, models.ErrorResponseWithMessage("User not authenticated"))
		return
	}

	userIDStr, ok := userID.(string)
	if !ok {
		c.JSON(http.StatusInternalServerError, models.ErrorResponseWithMessage("Invalid user ID"))
		return
	}

	// Test webhook
	err := h.webhookService.TestWebhook(webhookID, userIDStr, request.EventType)
	if err != nil {
		if err.Error() == "webhook not found" {
			c.JSON(http.StatusNotFound, models.ErrorResponseWithMessage("Webhook not found"))
			return
		}

		utils.LogError(err, map[string]interface{}{
			"user_id":    userIDStr,
			"webhook_id": webhookID,
			"action":     "test_webhook",
			"event_type": request.EventType,
		})
		c.JSON(http.StatusInternalServerError, models.ErrorResponseWithMessage("Failed to test webhook"))
		return
	}

	c.JSON(http.StatusOK, models.SuccessWithMessageResponse("Test webhook sent successfully", nil))
}

// GetAvailableEvents handles GET /webhooks/events
// @Summary Get available webhook events
// @Tags Webhook Events
// @Accept json
// @Produce json
// @Success 200 {object} models.APIResponse{data=[]models.WebhookEvent}
// @Router /webhooks/events [get]
func (h *WebhookHandler) GetAvailableEvents(c *gin.Context) {
	events := h.webhookService.GetAvailableEvents()
	c.JSON(http.StatusOK, models.SuccessResponse(events))
}

// GetDeliveries handles GET /webhooks/deliveries
// @Summary Get webhook delivery logs
// @Tags Webhook Deliveries
// @Accept json
// @Produce json
// @Param webhook_id query string false "Webhook ID"
// @Param event_type query string false "Event type"
// @Param status query string false "Delivery status" Enums(success, failed, pending)
// @Param page query int false "Page number" minimum(1)
// @Param limit query int false "Items per page" minimum(1) maximum(100)
// @Success 200 {object} models.PaginationResponse{data=[]models.WebhookDelivery}
// @Failure 400 {object} models.ErrorResponse
// @Failure 401 {object} models.ErrorResponse
// @Failure 500 {object} models.ErrorResponse
// @Router /webhooks/deliveries [get]
func (h *WebhookHandler) GetDeliveries(c *gin.Context) {
	var query models.DeliveryQuery

	// Set defaults
	query.Page = 1
	query.Limit = 20

	// Bind query parameters
	if validationErrors := utils.BindQueryAndValidate(c, &query); len(validationErrors) > 0 {
		c.JSON(http.StatusBadRequest, models.ErrorResponseWithDetails("Invalid query parameters", validationErrors))
		return
	}

	// Get user ID from context
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, models.ErrorResponseWithMessage("User not authenticated"))
		return
	}

	userIDStr, ok := userID.(string)
	if !ok {
		c.JSON(http.StatusInternalServerError, models.ErrorResponseWithMessage("Invalid user ID"))
		return
	}

	// Get deliveries
	deliveries, total, err := h.webhookService.GetDeliveries(userIDStr, query)
	if err != nil {
		utils.LogError(err, map[string]interface{}{
			"user_id": userIDStr,
			"action":  "get_deliveries",
			"query":   query,
		})
		c.JSON(http.StatusInternalServerError, models.ErrorResponseWithMessage("Failed to get deliveries"))
		return
	}

	response := models.PaginatedResponse(deliveries, query.Page, query.Limit, total)
	c.JSON(http.StatusOK, response)
}

// RetryDelivery handles POST /webhooks/deliveries/:delivery_id/retry
// @Summary Retry failed webhook delivery
// @Tags Webhook Deliveries
// @Accept json
// @Produce json
// @Param delivery_id path string true "Delivery ID"
// @Success 200 {object} models.APIResponse
// @Failure 400 {object} models.ErrorResponse
// @Failure 401 {object} models.ErrorResponse
// @Failure 404 {object} models.ErrorResponse
// @Failure 500 {object} models.ErrorResponse
// @Router /webhooks/deliveries/{delivery_id}/retry [post]
func (h *WebhookHandler) RetryDelivery(c *gin.Context) {
	deliveryID := c.Param("delivery_id")
	if deliveryID == "" {
		c.JSON(http.StatusBadRequest, models.ErrorResponseWithMessage("Delivery ID is required"))
		return
	}

	// Get user ID from context
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, models.ErrorResponseWithMessage("User not authenticated"))
		return
	}

	userIDStr, ok := userID.(string)
	if !ok {
		c.JSON(http.StatusInternalServerError, models.ErrorResponseWithMessage("Invalid user ID"))
		return
	}

	// Retry delivery
	err := h.webhookService.RetryDelivery(deliveryID, userIDStr)
	if err != nil {
		if err.Error() == "delivery not found" {
			c.JSON(http.StatusNotFound, models.ErrorResponseWithMessage("Delivery not found"))
			return
		}

		utils.LogError(err, map[string]interface{}{
			"user_id":     userIDStr,
			"delivery_id": deliveryID,
			"action":      "retry_delivery",
		})
		c.JSON(http.StatusInternalServerError, models.ErrorResponseWithMessage("Failed to retry delivery"))
		return
	}

	c.JSON(http.StatusOK, models.SuccessWithMessageResponse("Delivery retry initiated", nil))
}

// HealthCheck handles GET /health
// @Summary Health check endpoint
// @Tags Health
// @Produce json
// @Success 200 {object} models.APIResponse
// @Router /health [get]
func (h *WebhookHandler) HealthCheck(c *gin.Context) {
	c.JSON(http.StatusOK, models.SuccessWithMessageResponse("Webhook service is healthy", map[string]interface{}{
		"timestamp": strconv.FormatInt(c.Request.Context().Value("timestamp").(int64), 10),
		"service":   "webhook-service",
		"version":   "1.0.0",
	}))
}