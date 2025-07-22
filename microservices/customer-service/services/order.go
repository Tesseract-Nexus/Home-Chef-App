package services

import (
	"customer-service/models"

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

func (s *OrderService) GetCustomerOrders(customerID, status string, page, limit int, sort, order string) ([]interface{}, int64, error) {
	// Mock order data - in production, this would query the actual orders table
	orders := []interface{}{
		map[string]interface{}{
			"id":           "order-1",
			"chef_id":      "chef-1",
			"chef_name":    "Priya Sharma",
			"status":       "delivered",
			"total_amount": 450.00,
			"items": []map[string]interface{}{
				{
					"name":     "Butter Chicken",
					"quantity": 1,
					"price":    280.00,
				},
				{
					"name":     "Naan",
					"quantity": 2,
					"price":    85.00,
				},
			},
			"created_at": "2024-01-20T12:30:00Z",
		},
		map[string]interface{}{
			"id":           "order-2",
			"chef_id":      "chef-1",
			"chef_name":    "Priya Sharma",
			"status":       "preparing",
			"total_amount": 320.00,
			"items": []map[string]interface{}{
				{
					"name":     "Paneer Tikka",
					"quantity": 1,
					"price":    250.00,
				},
			},
			"created_at": "2024-01-21T19:15:00Z",
		},
	}

	// Filter by status if provided
	if status != "" {
		filteredOrders := []interface{}{}
		for _, order := range orders {
			if orderMap, ok := order.(map[string]interface{}); ok {
				if orderMap["status"] == status {
					filteredOrders = append(filteredOrders, order)
				}
			}
		}
		orders = filteredOrders
	}

	// Apply pagination
	offset := (page - 1) * limit
	end := offset + limit
	if end > len(orders) {
		end = len(orders)
	}
	if offset > len(orders) {
		offset = len(orders)
	}

	paginatedOrders := orders[offset:end]
	total := int64(len(orders))

	return paginatedOrders, total, nil
}