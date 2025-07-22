package services

import (
	"errors"
	"fmt"
	"math"
	"strconv"
	"time"

	"gorm.io/gorm"
	"homechef/tipping-service/models"
	"homechef/tipping-service/utils"
)

type TipService struct {
	db *gorm.DB
}

// NewTipService creates a new tip service
func NewTipService(db *gorm.DB) *TipService {
	return &TipService{db: db}
}

// SendTip creates a new tip transaction
func (s *TipService) SendTip(fromUserID string, request models.TipRequest) (*models.TipTransaction, error) {
	// Generate tip ID
	tipID := generateTipID()

	// Create tip transaction
	tip := &models.TipTransaction{
		ID:              tipID,
		FromUserID:      fromUserID,
		ToUserID:        request.RecipientID,
		ToUserType:      request.RecipientType,
		Amount:          request.Amount,
		Message:         request.Message,
		OrderID:         request.OrderID,
		Status:          models.TipStatusPending,
		PaymentMethodID: request.PaymentMethodID,
	}

	// Start transaction
	tx := s.db.Begin()
	if tx.Error != nil {
		return nil, tx.Error
	}

	// Create tip record
	if err := tx.Create(tip).Error; err != nil {
		tx.Rollback()
		return nil, err
	}

	// TODO: Process payment through payment service
	// For now, we'll mark as completed
	tip.Status = models.TipStatusCompleted
	tip.TransactionID = "txn_" + tipID
	now := time.Now()
	tip.ProcessedAt = &now

	if err := tx.Save(tip).Error; err != nil {
		tx.Rollback()
		return nil, err
	}

	// Commit transaction
	if err := tx.Commit().Error; err != nil {
		return nil, err
	}

	utils.LogInfo("Tip sent successfully", map[string]interface{}{
		"tip_id":        tip.ID,
		"from_user_id":  fromUserID,
		"to_user_id":    request.RecipientID,
		"amount":        request.Amount,
	})

	return tip, nil
}

// GetTipHistory retrieves tip history for a user
func (s *TipService) GetTipHistory(userID string, query models.TipHistoryQuery) ([]models.TipTransaction, int64, error) {
	var tips []models.TipTransaction
	var total int64

	db := s.db.Model(&models.TipTransaction{})

	// Apply filters based on query type
	switch query.Type {
	case "sent":
		db = db.Where("from_user_id = ?", userID)
	case "received":
		db = db.Where("to_user_id = ?", userID)
	default:
		// Both sent and received
		db = db.Where("from_user_id = ? OR to_user_id = ?", userID, userID)
	}

	// Apply recipient type filter
	if query.RecipientType != "" {
		db = db.Where("to_user_type = ?", query.RecipientType)
	}

	// Get total count
	if err := db.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	// Apply pagination
	offset := (query.Page - 1) * query.Limit
	if err := db.Order("created_at DESC").
		Offset(offset).
		Limit(query.Limit).
		Find(&tips).Error; err != nil {
		return nil, 0, err
	}

	return tips, total, nil
}

// GetTipsReceived retrieves tips received by a user
func (s *TipService) GetTipsReceived(userID string, query models.TipReceivedQuery) ([]models.TipTransaction, int64, error) {
	var tips []models.TipTransaction
	var total int64

	db := s.db.Model(&models.TipTransaction{}).
		Where("to_user_id = ? AND status = ?", userID, models.TipStatusCompleted)

	// Apply period filter
	if query.Period != "" && query.Period != "all" {
		startTime := getPeriodStartTime(query.Period)
		db = db.Where("created_at >= ?", startTime)
	}

	// Get total count
	if err := db.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	// Apply pagination
	offset := (query.Page - 1) * query.Limit
	if err := db.Order("created_at DESC").
		Offset(offset).
		Limit(query.Limit).
		Find(&tips).Error; err != nil {
		return nil, 0, err
	}

	return tips, total, nil
}

// GetTipAnalytics retrieves tip analytics for a user
func (s *TipService) GetTipAnalytics(userID string, period string) (*models.TipAnalytics, error) {
	analytics := &models.TipAnalytics{}

	db := s.db.Model(&models.TipTransaction{}).
		Where("to_user_id = ? AND status = ?", userID, models.TipStatusCompleted)

	// Apply period filter
	if period != "" {
		startTime := getPeriodStartTime(period)
		db = db.Where("created_at >= ?", startTime)
	}

	// Get total tips and count
	var result struct {
		TotalTips float64 `json:"total_tips"`
		TipCount  int64   `json:"tip_count"`
	}

	if err := db.Select("COALESCE(SUM(amount), 0) as total_tips, COUNT(*) as tip_count").
		Scan(&result).Error; err != nil {
		return nil, err
	}

	analytics.TotalTips = result.TotalTips
	analytics.TipCount = result.TipCount

	// Calculate average tip
	if analytics.TipCount > 0 {
		analytics.AvgTip = math.Round((analytics.TotalTips/float64(analytics.TipCount))*100) / 100
	}

	// Get top tippers
	topTippers, err := s.getTopTippers(userID, period)
	if err != nil {
		utils.LogError(err, map[string]interface{}{
			"user_id": userID,
			"action":  "get_top_tippers",
		})
		// Don't fail the whole request for this
	} else {
		analytics.TopTippers = topTippers
	}

	return analytics, nil
}

// getTopTippers retrieves top tippers for a user
func (s *TipService) getTopTippers(userID string, period string) ([]models.TopTipper, error) {
	var topTippers []models.TopTipper

	db := s.db.Model(&models.TipTransaction{}).
		Where("to_user_id = ? AND status = ?", userID, models.TipStatusCompleted)

	// Apply period filter
	if period != "" {
		startTime := getPeriodStartTime(period)
		db = db.Where("created_at >= ?", startTime)
	}

	if err := db.Select("from_user_name as customer_name, SUM(amount) as total_tips, COUNT(*) as tip_count").
		Group("from_user_id, from_user_name").
		Order("total_tips DESC").
		Limit(5).
		Scan(&topTippers).Error; err != nil {
		return nil, err
	}

	return topTippers, nil
}

// GetTipByID retrieves a tip by ID
func (s *TipService) GetTipByID(tipID string, userID string) (*models.TipTransaction, error) {
	var tip models.TipTransaction

	if err := s.db.Where("id = ? AND (from_user_id = ? OR to_user_id = ?)", 
		tipID, userID, userID).First(&tip).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("tip not found")
		}
		return nil, err
	}

	return &tip, nil
}

// UpdateTipStatus updates the status of a tip
func (s *TipService) UpdateTipStatus(tipID string, status models.TipStatus, transactionID string) error {
	updates := map[string]interface{}{
		"status": status,
	}

	if transactionID != "" {
		updates["transaction_id"] = transactionID
	}

	if status == models.TipStatusCompleted {
		now := time.Now()
		updates["processed_at"] = &now
	}

	if err := s.db.Model(&models.TipTransaction{}).
		Where("id = ?", tipID).
		Updates(updates).Error; err != nil {
		return err
	}

	utils.LogInfo("Tip status updated", map[string]interface{}{
		"tip_id":         tipID,
		"status":         status,
		"transaction_id": transactionID,
	})

	return nil
}

// Helper functions

// generateTipID generates a unique tip ID
func generateTipID() string {
	timestamp := time.Now().Unix()
	return "tip_" + strconv.FormatInt(timestamp, 10) + "_" + generateRandomString(6)
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

// getPeriodStartTime returns the start time for a period
func getPeriodStartTime(period string) time.Time {
	now := time.Now()
	switch period {
	case "today":
		return time.Date(now.Year(), now.Month(), now.Day(), 0, 0, 0, 0, now.Location())
	case "week":
		// Start of current week (Monday)
		days := int(now.Weekday())
		if days == 0 {
			days = 7 // Sunday
		}
		days-- // Make Monday = 0
		return now.AddDate(0, 0, -days).Truncate(24 * time.Hour)
	case "month":
		return time.Date(now.Year(), now.Month(), 1, 0, 0, 0, 0, now.Location())
	case "year":
		return time.Date(now.Year(), 1, 1, 0, 0, 0, 0, now.Location())
	default:
		return time.Time{} // No filter
	}
}