package services

import (
	"delivery-service/models"
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

func (s *OrderService) GetAvailableOrders(partnerID string, radius float64, priority string, minEarnings float64, page, limit int) ([]models.DeliveryOrder, int64, error) {
	// Mock available orders - in production, this would query actual orders
	orders := []models.DeliveryOrder{
		{
			ID:              "delivery-order-1",
			OrderID:         "order-1",
			CustomerID:      "customer-1",
			ChefID:          "chef-1",
			Status:          "ready_for_pickup",
			Priority:        "medium",
			OrderValue:      450.00,
			DeliveryFee:     50.00,
			TotalEarnings:   50.00,
			Distance:        2.3,
			EstimatedTime:   25,
			PaymentMethod:   "online",
			PickupLocation: models.Location{
				Address:   "123 Chef Street, Mumbai",
				Latitude:  19.0760,
				Longitude: 72.8777,
			},
			DeliveryLocation: models.Location{
				Address:   "456 Customer Avenue, Mumbai",
				Latitude:  19.1136,
				Longitude: 72.8697,
			},
			SpecialInstructions: "Handle with care",
		},
	}

	// Apply filters
	filteredOrders := []models.DeliveryOrder{}
	for _, order := range orders {
		if priority != "" && order.Priority != priority {
			continue
		}
		if minEarnings > 0 && order.TotalEarnings < minEarnings {
			continue
		}
		filteredOrders = append(filteredOrders, order)
	}

	// Apply pagination
	offset := (page - 1) * limit
	end := offset + limit
	if end > len(filteredOrders) {
		end = len(filteredOrders)
	}
	if offset > len(filteredOrders) {
		offset = len(filteredOrders)
	}

	paginatedOrders := filteredOrders[offset:end]
	total := int64(len(filteredOrders))

	return paginatedOrders, total, nil
}

func (s *OrderService) AcceptOrder(orderID, partnerID string) error {
	// TODO: Update order status to accepted and assign delivery partner
	s.logger.Info("Order accepted", zap.String("order_id", orderID), zap.String("partner_id", partnerID))
	return nil
}

func (s *OrderService) MarkPickup(orderID, partnerID string, pickupUpdate *models.PickupUpdate) error {
	// TODO: Update order status to picked up
	s.logger.Info("Order picked up", zap.String("order_id", orderID), zap.String("partner_id", partnerID))
	return nil
}

func (s *OrderService) MarkDelivered(orderID, partnerID string, deliveryUpdate *models.DeliveryUpdate) error {
	// TODO: Update order status to delivered and record delivery proof
	s.logger.Info("Order delivered", zap.String("order_id", orderID), zap.String("partner_id", partnerID))
	return nil
}

func (s *OrderService) UpdateLocation(orderID, partnerID string, locationUpdate *models.LocationUpdate) error {
	// Create tracking record
	tracking := &models.DeliveryTracking{
		OrderID:           orderID,
		DeliveryPartnerID: partnerID,
		Latitude:          locationUpdate.Location.Latitude,
		Longitude:         locationUpdate.Location.Longitude,
		EstimatedArrival:  locationUpdate.EstimatedArrival,
		Timestamp:         time.Now(),
	}

	return s.db.Create(tracking).Error
}

func (s *OrderService) GetActiveOrders(partnerID string) ([]models.DeliveryOrder, error) {
	var orders []models.DeliveryOrder
	err := s.db.Where("delivery_partner_id = ? AND status IN ?", partnerID, []string{"accepted", "picked_up", "delivering"}).Find(&orders).Error
	return orders, err
}

func (s *OrderService) GetDeliveryHistory(partnerID, status, dateFrom, dateTo string, page, limit int) ([]models.DeliveryOrder, int64, error) {
	var orders []models.DeliveryOrder
	var total int64

	query := s.db.Model(&models.DeliveryOrder{}).Where("delivery_partner_id = ?", partnerID)

	if status != "" {
		query = query.Where("status = ?", status)
	}
	if dateFrom != "" {
		query = query.Where("created_at >= ?", dateFrom)
	}
	if dateTo != "" {
		query = query.Where("created_at <= ?", dateTo)
	}

	// Get total count
	query.Count(&total)

	// Get paginated results
	offset := (page - 1) * limit
	err := query.Order("created_at DESC").Offset(offset).Limit(limit).Find(&orders).Error

	return orders, total, err
}