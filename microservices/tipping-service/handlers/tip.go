package handlers

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"homechef/tipping-service/models"
	"homechef/tipping-service/services"
	"homechef/tipping-service/utils"
)

type TipHandler struct {
	tipService *services.TipService
}

// NewTipHandler creates a new tip handler
func NewTipHandler(tipService *services.TipService) *TipHandler {
	return &TipHandler{
		tipService: tipService,
	}
}

// SendTip handles POST /tips/send
// @Summary Send tip to chef or delivery partner
// @Tags Tipping
// @Accept json
// @Produce json
// @Param tip body models.TipRequest true "Tip request"
// @Success 200 {object} models.APIResponse{data=models.TipTransaction}
// @Failure 400 {object} models.ErrorResponse
// @Failure 401 {object} models.ErrorResponse
// @Failure 500 {object} models.ErrorResponse
// @Router /tips/send [post]
func (h *TipHandler) SendTip(c *gin.Context) {
	var request models.TipRequest

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

	// Send tip
	tip, err := h.tipService.SendTip(userIDStr, request)
	if err != nil {
		utils.LogError(err, map[string]interface{}{
			"user_id": userIDStr,
			"action":  "send_tip",
			"request": request,
		})
		c.JSON(http.StatusInternalServerError, models.ErrorResponseWithMessage("Failed to send tip"))
		return
	}

	c.JSON(http.StatusOK, models.SuccessWithMessageResponse("Tip sent successfully", tip))
}

// GetTipHistory handles GET /tips/history
// @Summary Get tip history
// @Tags Tipping
// @Accept json
// @Produce json
// @Param type query string false "Type of tips" Enums(sent, received)
// @Param recipient_type query string false "Recipient type" Enums(chef, delivery)
// @Param page query int false "Page number" minimum(1)
// @Param limit query int false "Items per page" minimum(1) maximum(100)
// @Success 200 {object} models.PaginationResponse{data=[]models.TipTransaction}
// @Failure 400 {object} models.ErrorResponse
// @Failure 401 {object} models.ErrorResponse
// @Failure 500 {object} models.ErrorResponse
// @Router /tips/history [get]
func (h *TipHandler) GetTipHistory(c *gin.Context) {
	var query models.TipHistoryQuery

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

	// Get tip history
	tips, total, err := h.tipService.GetTipHistory(userIDStr, query)
	if err != nil {
		utils.LogError(err, map[string]interface{}{
			"user_id": userIDStr,
			"action":  "get_tip_history",
			"query":   query,
		})
		c.JSON(http.StatusInternalServerError, models.ErrorResponseWithMessage("Failed to get tip history"))
		return
	}

	response := models.PaginatedResponse(tips, query.Page, query.Limit, total)
	c.JSON(http.StatusOK, response)
}

// GetTipsReceived handles GET /tips/received
// @Summary Get tips received (Chef/Delivery only)
// @Tags Tipping
// @Accept json
// @Produce json
// @Param period query string false "Time period" Enums(today, week, month, all)
// @Param page query int false "Page number" minimum(1)
// @Param limit query int false "Items per page" minimum(1) maximum(100)
// @Success 200 {object} models.PaginationResponse{data=[]models.TipTransaction}
// @Failure 400 {object} models.ErrorResponse
// @Failure 401 {object} models.ErrorResponse
// @Failure 403 {object} models.ErrorResponse
// @Failure 500 {object} models.ErrorResponse
// @Router /tips/received [get]
func (h *TipHandler) GetTipsReceived(c *gin.Context) {
	var query models.TipReceivedQuery

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

	// Get tips received
	tips, total, err := h.tipService.GetTipsReceived(userIDStr, query)
	if err != nil {
		utils.LogError(err, map[string]interface{}{
			"user_id": userIDStr,
			"action":  "get_tips_received",
			"query":   query,
		})
		c.JSON(http.StatusInternalServerError, models.ErrorResponseWithMessage("Failed to get tips received"))
		return
	}

	response := models.PaginatedResponse(tips, query.Page, query.Limit, total)
	c.JSON(http.StatusOK, response)
}

// GetTipAnalytics handles GET /tips/analytics
// @Summary Get tipping analytics (Chef/Delivery only)
// @Tags Tipping
// @Accept json
// @Produce json
// @Param period query string false "Time period" Enums(today, week, month, year)
// @Success 200 {object} models.APIResponse{data=models.TipAnalytics}
// @Failure 400 {object} models.ErrorResponse
// @Failure 401 {object} models.ErrorResponse
// @Failure 403 {object} models.ErrorResponse
// @Failure 500 {object} models.ErrorResponse
// @Router /tips/analytics [get]
func (h *TipHandler) GetTipAnalytics(c *gin.Context) {
	var query models.TipAnalyticsQuery

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

	// Get tip analytics
	analytics, err := h.tipService.GetTipAnalytics(userIDStr, query.Period)
	if err != nil {
		utils.LogError(err, map[string]interface{}{
			"user_id": userIDStr,
			"action":  "get_tip_analytics",
			"query":   query,
		})
		c.JSON(http.StatusInternalServerError, models.ErrorResponseWithMessage("Failed to get tip analytics"))
		return
	}

	c.JSON(http.StatusOK, models.SuccessResponse(analytics))
}

// GetTipByID handles GET /tips/:id
// @Summary Get tip by ID
// @Tags Tipping
// @Accept json
// @Produce json
// @Param id path string true "Tip ID"
// @Success 200 {object} models.APIResponse{data=models.TipTransaction}
// @Failure 400 {object} models.ErrorResponse
// @Failure 401 {object} models.ErrorResponse
// @Failure 404 {object} models.ErrorResponse
// @Failure 500 {object} models.ErrorResponse
// @Router /tips/{id} [get]
func (h *TipHandler) GetTipByID(c *gin.Context) {
	tipID := c.Param("id")
	if tipID == "" {
		c.JSON(http.StatusBadRequest, models.ErrorResponseWithMessage("Tip ID is required"))
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

	// Get tip by ID
	tip, err := h.tipService.GetTipByID(tipID, userIDStr)
	if err != nil {
		if err.Error() == "tip not found" {
			c.JSON(http.StatusNotFound, models.ErrorResponseWithMessage("Tip not found"))
			return
		}

		utils.LogError(err, map[string]interface{}{
			"user_id": userIDStr,
			"tip_id":  tipID,
			"action":  "get_tip_by_id",
		})
		c.JSON(http.StatusInternalServerError, models.ErrorResponseWithMessage("Failed to get tip"))
		return
	}

	c.JSON(http.StatusOK, models.SuccessResponse(tip))
}

// HealthCheck handles GET /health
// @Summary Health check endpoint
// @Tags Health
// @Produce json
// @Success 200 {object} models.APIResponse
// @Router /health [get]
func (h *TipHandler) HealthCheck(c *gin.Context) {
	c.JSON(http.StatusOK, models.SuccessWithMessageResponse("Tipping service is healthy", map[string]interface{}{
		"timestamp": strconv.FormatInt(c.Request.Context().Value("timestamp").(int64), 10),
		"service":   "tipping-service",
		"version":   "1.0.0",
	}))
}