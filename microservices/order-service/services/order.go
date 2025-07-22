package services

import (
	"fmt"
	"order-service/models"
	"time"

	"gorm.io/gorm"
	"go.uber.org/zap"
)

type OrderService struct {
	db     *gorm.DB
	logger *zap.Logger
}

func NewOrderService(db *gorm.DB, logger *zap.Logger) *OrderService {
	return &OrderService{
		db:     db,
		logger: logger,
	}
}

func (s *OrderService) CreateOrder(customerID string, orderCreate *models.OrderCreate) (*models.Order, error) {
	// Calculate total amount (simplified)
	totalAmount := 0.0
	for _, item := range orderCreate.Items {
		// TODO: Get actual dish price from menu service
		totalAmount += 250.0 * float64(item.Quantity) // Mock price
	}

	// Get current cancellation policy
	policy, err := s.GetActiveCancellationPolicy()
	if err != nil {
		return nil, err
	}

	// Create order with countdown timer
	countdownExpiry := time.Now().Add(time.Duration(policy.FreeCancellationWindowSeconds) * time.Second)
	
	order := &models.Order{
		CustomerID:          customerID,
		ChefID:              orderCreate.ChefID,
		Status:              "payment_confirmed",
		TotalAmount:         totalAmount,
		DeliveryFee:         50.0, // Mock delivery fee
		TaxAmount:          totalAmount * 0.05, // 5% tax
		SpecialInstructions: orderCreate.DeliveryInstructions,
		PaymentMethod:       "online",
		PaymentStatus:       "completed",
		CountdownExpiry:     &countdownExpiry,
		CanCancelFree:       true,
	}

	err = s.db.Create(order).Error
	if err != nil {
		return nil, err
	}

	// Create order items
	for _, itemCreate := range orderCreate.Items {
		orderItem := &models.OrderItem{
			OrderID:             order.ID,
			DishID:              itemCreate.DishID,
			DishName:            "Mock Dish", // TODO: Get from menu service
			Quantity:            itemCreate.Quantity,
			Price:               250.0, // Mock price
			SpecialInstructions: itemCreate.SpecialInstructions,
		}
		s.db.Create(orderItem)
	}

	return order, nil
}

func (s *OrderService) CancelOrder(orderID, userID, reason, notes string) (*models.CancellationResult, error) {
	var order models.Order
	err := s.db.First(&order, "id = ?", orderID).Error
	if err != nil {
		return nil, err
	}

	// Check if order can be cancelled
	if order.Status == "cancelled" || order.Status == "delivered" {
		return nil, fmt.Errorf("order cannot be cancelled in current status: %s", order.Status)
	}

	// Get current policy
	policy, err := s.GetActiveCancellationPolicy()
	if err != nil {
		return nil, err
	}

	// Calculate penalty
	timeSincePlaced := time.Since(order.CreatedAt).Seconds()
	isFreeCancellation := timeSincePlaced <= float64(policy.FreeCancellationWindowSeconds)
	
	var penaltyAmount, refundAmount float64
	var cancellationType string

	if isFreeCancellation {
		cancellationType = "free"
		penaltyAmount = 0
		refundAmount = order.TotalAmount
	} else {
		cancellationType = "penalty"
		penaltyAmount = order.TotalAmount * policy.PenaltyRate
		
		// Apply min/max penalty limits
		if penaltyAmount < policy.MinPenaltyAmount {
			penaltyAmount = policy.MinPenaltyAmount
		}
		if penaltyAmount > policy.MaxPenaltyAmount {
			penaltyAmount = policy.MaxPenaltyAmount
		}
		
		refundAmount = order.TotalAmount - penaltyAmount
	}

	// Update order
	now := time.Now()
	order.Status = "cancelled"
	order.CancellationReason = reason
	order.CancellationNotes = notes
	order.CancelledAt = &now
	order.CancelledBy = userID
	order.PenaltyAmount = penaltyAmount
	order.RefundAmount = refundAmount
	order.RefundStatus = "processing"

	err = s.db.Save(&order).Error
	if err != nil {
		return nil, err
	}

	// Update analytics
	go s.UpdateCancellationAnalytics(cancellationType, penaltyAmount, timeSincePlaced)

	return &models.CancellationResult{
		OrderID:          orderID,
		CancellationType: cancellationType,
		PenaltyAmount:    penaltyAmount,
		RefundAmount:     refundAmount,
		RefundTimeline:   "3-5 business days",
		CancelledAt:      now,
	}, nil
}

func (s *OrderService) GetCancellationInfo(orderID string) (*models.CancellationInfo, error) {
	var order models.Order
	err := s.db.First(&order, "id = ?", orderID).Error
	if err != nil {
		return nil, err
	}

	policy, err := s.GetActiveCancellationPolicy()
	if err != nil {
		return nil, err
	}

	timeSincePlaced := int(time.Since(order.CreatedAt).Seconds())
	isFreeCancellation := timeSincePlaced <= policy.FreeCancellationWindowSeconds
	canCancel := order.Status != "cancelled" && order.Status != "delivered"

	penaltyAmount := order.TotalAmount * policy.PenaltyRate
	if penaltyAmount < policy.MinPenaltyAmount {
		penaltyAmount = policy.MinPenaltyAmount
	}
	if penaltyAmount > policy.MaxPenaltyAmount {
		penaltyAmount = policy.MaxPenaltyAmount
	}

	return &models.CancellationInfo{
		OrderID:                orderID,
		CanCancel:              canCancel,
		IsFreeCancellation:     isFreeCancellation,
		TimeSincePlaced:        timeSincePlaced,
		FreeCancellationWindow: policy.FreeCancellationWindowSeconds,
		PenaltyInfo: models.CancellationPenaltyInfo{
			PenaltyRate:   policy.PenaltyRate,
			PenaltyAmount: penaltyAmount,
			RefundAmount:  order.TotalAmount - penaltyAmount,
			MinPenalty:    policy.MinPenaltyAmount,
			MaxPenalty:    policy.MaxPenaltyAmount,
		},
	}, nil
}

func (s *OrderService) GetCountdownStatus(orderID string) (*models.CountdownStatus, error) {
	var order models.Order
	err := s.db.First(&order, "id = ?", orderID).Error
	if err != nil {
		return nil, err
	}

	policy, err := s.GetActiveCancellationPolicy()
	if err != nil {
		return nil, err
	}

	timeSincePlaced := int(time.Since(order.CreatedAt).Seconds())
	timeRemaining := policy.FreeCancellationWindowSeconds - timeSincePlaced
	if timeRemaining < 0 {
		timeRemaining = 0
	}

	progressPercentage := float64(timeSincePlaced) / float64(policy.FreeCancellationWindowSeconds) * 100
	if progressPercentage > 100 {
		progressPercentage = 100
	}

	penaltyAmount := order.TotalAmount * policy.PenaltyRate
	if penaltyAmount < policy.MinPenaltyAmount {
		penaltyAmount = policy.MinPenaltyAmount
	}
	if penaltyAmount > policy.MaxPenaltyAmount {
		penaltyAmount = policy.MaxPenaltyAmount
	}

	return &models.CountdownStatus{
		OrderID:            orderID,
		IsActive:           timeRemaining > 0,
		TimeRemaining:      timeRemaining,
		TotalWindow:        policy.FreeCancellationWindowSeconds,
		ProgressPercentage: progressPercentage,
		CanCancelFree:      timeRemaining > 0,
		PenaltyAfterExpiry: penaltyAmount,
	}, nil
}

func (s *OrderService) GetOrderJourney(orderID string) (*models.OrderJourney, error) {
	var order models.Order
	err := s.db.Preload("StatusHistory").Preload("Tips").First(&order, "id = ?", orderID).Error
	if err != nil {
		return nil, err
	}

	// Build timeline from status history
	var timeline []models.OrderTimelineEvent
	for _, history := range order.StatusHistory {
		event := models.OrderTimelineEvent{
			Status:    history.Status,
			Timestamp: history.CreatedAt,
			Message:   history.Message,
		}
		
		// Parse location if available
		if history.Location != "" {
			var location models.Location
			if json.Unmarshal([]byte(history.Location), &location) == nil {
				event.Location = &location
			}
		}
		
		timeline = append(timeline, event)
	}

	// Get participants (mock data - in production, fetch from user service)
	participants := models.OrderParticipants{
		Customer: &models.OrderParticipant{
			ID:     order.CustomerID,
			Name:   "Customer Name",
			Phone:  "+919876543210",
			Rating: 4.5,
		},
		Chef: &models.OrderParticipant{
			ID:     order.ChefID,
			Name:   "Chef Name",
			Phone:  "+919876543211",
			Rating: 4.8,
		},
	}

	if order.DeliveryPartnerID != nil {
		participants.DeliveryPartner = &models.OrderParticipant{
			ID:     *order.DeliveryPartnerID,
			Name:   "Delivery Partner",
			Phone:  "+919876543212",
			Rating: 4.6,
		}
	}

	// Get cancellation info
	cancellationInfo, _ := s.GetCancellationInfo(orderID)

	// Calculate tipping info
	var chefTip, deliveryTip float64
	for _, tip := range order.Tips {
		if tip.RecipientType == "chef" {
			chefTip += tip.Amount
		} else if tip.RecipientType == "delivery" {
			deliveryTip += tip.Amount
		}
	}

	tippingInfo := models.OrderTippingInfo{
		ChefTip:        chefTip,
		DeliveryTip:    deliveryTip,
		CanTipChef:     order.Status == "delivered" && chefTip == 0,
		CanTipDelivery: order.Status == "delivered" && deliveryTip == 0 && order.DeliveryPartnerID != nil,
	}

	return &models.OrderJourney{
		OrderID:          orderID,
		CurrentStatus:    order.Status,
		Timeline:         timeline,
		Participants:     participants,
		CancellationInfo: cancellationInfo,
		TippingInfo:      tippingInfo,
	}, nil
}

func (s *OrderService) ChefAcceptOrder(orderID, chefID string, request *models.ChefAcceptRequest) error {
	var order models.Order
	err := s.db.First(&order, "id = ? AND chef_id = ?", orderID, chefID).Error
	if err != nil {
		return err
	}

	if order.Status != "sent_to_chef" {
		return fmt.Errorf("order cannot be accepted in current status: %s", order.Status)
	}

	// Update order
	now := time.Now()
	estimatedDelivery := now.Add(time.Duration(request.EstimatedPrepTime+30) * time.Minute) // prep + delivery time
	
	order.Status = "chef_accepted"
	order.ChefAcceptedAt = &now
	order.EstimatedPrepTime = request.EstimatedPrepTime
	order.EstimatedDeliveryTime = &estimatedDelivery

	err = s.db.Save(&order).Error
	if err != nil {
		return err
	}

	// Add to status history
	s.addStatusHistory(orderID, "chef_accepted", request.Notes, chefID)

	return nil
}

func (s *OrderService) ChefDeclineOrder(orderID, chefID string, request *models.ChefDeclineRequest) error {
	var order models.Order
	err := s.db.First(&order, "id = ? AND chef_id = ?", orderID, chefID).Error
	if err != nil {
		return err
	}

	if order.Status != "sent_to_chef" {
		return fmt.Errorf("order cannot be declined in current status: %s", order.Status)
	}

	// Update order
	now := time.Now()
	order.Status = "chef_declined"
	order.ChefDeclinedAt = &now
	order.ChefDeclineReason = request.Reason

	err = s.db.Save(&order).Error
	if err != nil {
		return err
	}

	// Add to status history
	s.addStatusHistory(orderID, "chef_declined", request.Notes, chefID)

	return nil
}

func (s *OrderService) UpdateOrderStatus(orderID, userID string, request *models.OrderStatusUpdate) error {
	var order models.Order
	err := s.db.First(&order, "id = ?", orderID).Error
	if err != nil {
		return err
	}

	// Update order status
	order.Status = request.Status

	// Handle specific status updates
	now := time.Now()
	switch request.Status {
	case "picked_up":
		order.PickupTime = &now
	case "out_for_delivery":
		order.DeliveryStartedAt = &now
	case "delivered":
		order.ActualDelivery = &now
	}

	err = s.db.Save(&order).Error
	if err != nil {
		return err
	}

	// Add to status history with location if provided
	var locationJSON string
	if request.Location != nil {
		locationData, _ := json.Marshal(request.Location)
		locationJSON = string(locationData)
	}

	statusHistory := &models.OrderStatusHistory{
		OrderID:   orderID,
		Status:    request.Status,
		Message:   request.Message,
		Location:  locationJSON,
		UpdatedBy: userID,
	}
	s.db.Create(statusHistory)

	return nil
}

func (s *OrderService) GetAvailableDeliveryOrders(lat, lng, radius float64, limit int) ([]models.AvailableDeliveryOrder, error) {
	// Mock available orders - in production, this would query actual orders
	orders := []models.AvailableDeliveryOrder{
		{
			OrderID:      "order-1",
			CustomerName: "John Doe",
			ChefName:     "Priya Sharma",
			PickupLocation: models.OrderLocation{
				Address: "123 Chef Street, Mumbai",
				Coordinates: models.Location{
					Latitude:  19.0760,
					Longitude: 72.8777,
				},
			},
			DeliveryLocation: models.OrderLocation{
				Address: "456 Customer Avenue, Mumbai",
				Coordinates: models.Location{
					Latitude:  19.1136,
					Longitude: 72.8697,
				},
			},
			Distance:              2.3,
			EstimatedEarnings:     85.00,
			OrderValue:            450.00,
			EstimatedDeliveryTime: 25,
			Priority:              "medium",
		},
	}

	// Apply limit
	if len(orders) > limit {
		orders = orders[:limit]
	}

	return orders, nil
}

func (s *OrderService) AcceptDeliveryOrder(orderID, deliveryPartnerID string, request *models.DeliveryAcceptRequest) error {
	var order models.Order
	err := s.db.First(&order, "id = ?", orderID).Error
	if err != nil {
		return err
	}

	if order.Status != "ready_for_pickup" {
		return fmt.Errorf("order not ready for pickup")
	}

	// Update order
	now := time.Now()
	order.DeliveryPartnerID = &deliveryPartnerID
	order.DeliveryAcceptedAt = &now
	order.Status = "delivery_assigned"

	err = s.db.Save(&order).Error
	if err != nil {
		return err
	}

	// Add to status history
	s.addStatusHistory(orderID, "delivery_assigned", "Delivery partner assigned", deliveryPartnerID)

	return nil
}

func (s *OrderService) SendOrderNotification(orderID string, request *models.OrderNotificationRequest) error {
	// Create notification records
	for _, recipient := range request.Recipients {
		dataJSON, _ := json.Marshal(request.Data)
		
		notification := &models.OrderNotification{
			OrderID:          orderID,
			NotificationType: request.NotificationType,
			RecipientID:      recipient.UserID,
			RecipientType:    recipient.UserType,
			Message:          request.Message,
			Data:             string(dataJSON),
			Status:           "sent",
			SentAt:           time.Now(),
		}
		
		s.db.Create(notification)
	}

	return nil
}

func (s *OrderService) addStatusHistory(orderID, status, message, updatedBy string) {
	statusHistory := &models.OrderStatusHistory{
		OrderID:   orderID,
		Status:    status,
		Message:   message,
		UpdatedBy: updatedBy,
	}
	s.db.Create(statusHistory)
}

func (s *OrderService) ConfirmOrderAfterTimer(orderID string) error {
	var order models.Order
	err := s.db.First(&order, "id = ?", orderID).Error
	if err != nil {
		return err
	}

	// Update order status
	order.Status = "sent_to_chef"
	order.CanCancelFree = false

	return s.db.Save(&order).Error
}

func (s *OrderService) GetActiveCancellationPolicy() (*models.CancellationPolicy, error) {
	var policy models.CancellationPolicy
	err := s.db.Where("is_active = ?", true).First(&policy).Error
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			// Create default policy
			policy = models.CancellationPolicy{
				FreeCancellationWindowSeconds: 30,
				PenaltyRate:                   0.40,
				MinPenaltyAmount:              20.00,
				MaxPenaltyAmount:              500.00,
				PolicyDescription:             "Orders can be cancelled for free within 30 seconds",
				IsActive:                      true,
			}
			s.db.Create(&policy)
		} else {
			return nil, err
		}
	}
	return &policy, nil
}

func (s *OrderService) UpdateCancellationPolicy(update *models.CancellationPolicyUpdate, updatedBy string) (*models.CancellationPolicy, error) {
	policy, err := s.GetActiveCancellationPolicy()
	if err != nil {
		return nil, err
	}

	// Update fields if provided
	if update.FreeCancellationWindowSeconds != nil {
		policy.FreeCancellationWindowSeconds = *update.FreeCancellationWindowSeconds
	}
	if update.PenaltyRate != nil {
		policy.PenaltyRate = *update.PenaltyRate
	}
	if update.MinPenaltyAmount != nil {
		policy.MinPenaltyAmount = *update.MinPenaltyAmount
	}
	if update.MaxPenaltyAmount != nil {
		policy.MaxPenaltyAmount = *update.MaxPenaltyAmount
	}
	if update.PolicyDescription != nil {
		policy.PolicyDescription = *update.PolicyDescription
	}

	policy.UpdatedBy = updatedBy
	policy.UpdatedAt = time.Now()

	err = s.db.Save(policy).Error
	if err != nil {
		return nil, err
	}

	return policy, nil
}

func (s *OrderService) UpdateCancellationAnalytics(cancellationType string, penaltyAmount, cancellationTime float64) {
	today := time.Now().Truncate(24 * time.Hour)
	
	var analytics models.CancellationAnalytics
	err := s.db.Where("date = ?", today).First(&analytics).Error
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			analytics = models.CancellationAnalytics{
				Date: today,
			}
		} else {
			s.logger.Error("Failed to get analytics", zap.Error(err))
			return
		}
	}

	analytics.TotalCancellations++
	if cancellationType == "free" {
		analytics.FreeCancellations++
	} else {
		analytics.PenaltyCancellations++
		analytics.TotalPenaltyCollected += penaltyAmount
	}

	// Update average cancellation time
	analytics.AvgCancellationTime = (analytics.AvgCancellationTime*float64(analytics.TotalCancellations-1) + cancellationTime) / float64(analytics.TotalCancellations)

	s.db.Save(&analytics)
}

func (s *OrderService) AddTip(orderID, customerID string, tipCreate *models.TipCreate) (*models.Tip, error) {
	var order models.Order
	err := s.db.First(&order, "id = ?", orderID).Error
	if err != nil {
		return nil, err
	}

	// Determine recipient ID based on type
	var recipientID string
	switch tipCreate.RecipientType {
	case "chef":
		recipientID = order.ChefID
	case "delivery":
		if order.DeliveryPartnerID != nil {
			recipientID = *order.DeliveryPartnerID
		} else {
			return nil, fmt.Errorf("no delivery partner assigned to this order")
		}
	default:
		return nil, fmt.Errorf("invalid recipient type")
	}

	tip := &models.Tip{
		OrderID:       orderID,
		CustomerID:    customerID,
		RecipientID:   recipientID,
		RecipientType: tipCreate.RecipientType,
		Amount:        tipCreate.Amount,
		Message:       tipCreate.Message,
		Status:        "processing",
		TransferID:    "transfer_" + time.Now().Format("20060102150405"),
	}

	err = s.db.Create(tip).Error
	if err != nil {
		return nil, err
	}

	// TODO: Initiate direct bank transfer
	// For now, mark as processed
	now := time.Now()
	tip.Status = "completed"
	tip.ProcessedAt = &now
	s.db.Save(tip)

	return tip, nil
}

// ProcessExpiredCountdowns processes orders with expired countdown timers
func (s *OrderService) ProcessExpiredCountdowns() error {
	s.logger.Info("Processing expired countdown timers")

	var orders []models.Order
	err := s.db.Where("status = ? AND countdown_expiry <= ? AND can_cancel_free = ?", 
		"payment_confirmed", time.Now(), true).Find(&orders).Error
	if err != nil {
		return err
	}

	for _, order := range orders {
		// Confirm order and send to chef
		order.Status = "sent_to_chef"
		order.CanCancelFree = false
		s.db.Save(&order)

		s.logger.Info("Order confirmed after countdown expiry", 
			zap.String("order_id", order.ID),
			zap.String("chef_id", order.ChefID))
	}

	return nil
}