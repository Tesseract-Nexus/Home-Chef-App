package handlers

import (
	"log"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/homechef/api/database"
	"github.com/homechef/api/middleware"
	"github.com/homechef/api/models"
	"github.com/homechef/api/services"
)

type ChefHandler struct{}

func NewChefHandler() *ChefHandler {
	return &ChefHandler{}
}

// ListChefs returns a paginated list of chefs
func (h *ChefHandler) ListChefs(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "20"))
	search := c.Query("search")
	cuisine := c.Query("cuisine")
	sortBy := c.DefaultQuery("sortBy", "rating")

	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 100 {
		limit = 20
	}
	offset := (page - 1) * limit

	query := database.DB.Model(&models.ChefProfile{}).
		Where("is_verified = ? AND is_active = ?", true, true)

	// Search filter
	if search != "" {
		query = query.Where("business_name ILIKE ? OR description ILIKE ?",
			"%"+search+"%", "%"+search+"%")
	}

	// Cuisine filter
	if cuisine != "" {
		query = query.Where("? = ANY(cuisines)", cuisine)
	}

	// Get total count
	var total int64
	query.Count(&total)

	// Apply sorting
	switch sortBy {
	case "rating":
		query = query.Order("rating DESC")
	case "orders":
		query = query.Order("total_orders DESC")
	case "newest":
		query = query.Order("created_at DESC")
	default:
		query = query.Order("rating DESC")
	}

	// Get chefs
	var chefs []models.ChefProfile
	if err := query.Offset(offset).Limit(limit).Find(&chefs).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch chefs"})
		return
	}

	// Convert to response
	responses := make([]models.ChefProfileResponse, len(chefs))
	for i, chef := range chefs {
		responses[i] = chef.ToResponse()
	}

	c.JSON(http.StatusOK, gin.H{
		"data": responses,
		"pagination": gin.H{
			"page":       page,
			"limit":      limit,
			"total":      total,
			"totalPages": (total + int64(limit) - 1) / int64(limit),
			"hasNext":    int64(offset+limit) < total,
			"hasPrev":    page > 1,
		},
	})
}

// GetChef returns a single chef by ID
func (h *ChefHandler) GetChef(c *gin.Context) {
	id := c.Param("id")
	chefID, err := uuid.Parse(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid chef ID"})
		return
	}

	var chef models.ChefProfile
	if err := database.DB.Preload("User").First(&chef, "id = ?", chefID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Chef not found"})
		return
	}

	c.JSON(http.StatusOK, chef.ToResponse())
}

// GetChefMenu returns the menu items for a chef
func (h *ChefHandler) GetChefMenu(c *gin.Context) {
	id := c.Param("id")
	chefID, err := uuid.Parse(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid chef ID"})
		return
	}

	category := c.Query("category")

	query := database.DB.Where("chef_id = ? AND is_available = ?", chefID, true)

	if category != "" {
		query = query.Where("category = ?", category)
	}

	var items []models.MenuItem
	if err := query.Order("sort_order, name").Find(&items).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch menu"})
		return
	}

	responses := make([]models.MenuItemResponse, len(items))
	for i, item := range items {
		responses[i] = item.ToResponse()
	}

	c.JSON(http.StatusOK, responses)
}

// GetChefReviews returns reviews for a chef
func (h *ChefHandler) GetChefReviews(c *gin.Context) {
	id := c.Param("id")
	chefID, err := uuid.Parse(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid chef ID"})
		return
	}

	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))
	offset := (page - 1) * limit

	var reviews []models.Review
	var total int64

	database.DB.Model(&models.Review{}).Where("chef_id = ? AND is_approved = ?", chefID, true).Count(&total)

	if err := database.DB.Preload("Customer").
		Where("chef_id = ? AND is_approved = ?", chefID, true).
		Order("created_at DESC").
		Offset(offset).Limit(limit).
		Find(&reviews).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch reviews"})
		return
	}

	responses := make([]models.ReviewResponse, len(reviews))
	for i, review := range reviews {
		responses[i] = review.ToResponse()
	}

	c.JSON(http.StatusOK, gin.H{
		"data": responses,
		"pagination": gin.H{
			"page":       page,
			"limit":      limit,
			"total":      total,
			"totalPages": (total + int64(limit) - 1) / int64(limit),
		},
	})
}

// ---- Chef Dashboard Endpoints ----

// GetChefDashboard returns the chef's dashboard data
func (h *ChefHandler) GetChefDashboard(c *gin.Context) {
	userID, _ := middleware.GetUserID(c)

	var chef models.ChefProfile
	if err := database.DB.Where("user_id = ?", userID).First(&chef).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Chef profile not found"})
		return
	}

	// Get today's stats
	var todayOrders int64
	var todayRevenue float64
	database.DB.Model(&models.Order{}).
		Where("chef_id = ? AND DATE(created_at) = CURRENT_DATE", chef.ID).
		Count(&todayOrders)
	database.DB.Model(&models.Order{}).
		Where("chef_id = ? AND DATE(created_at) = CURRENT_DATE AND payment_status = ?", chef.ID, models.PaymentCompleted).
		Select("COALESCE(SUM(total), 0)").Scan(&todayRevenue)

	// Get pending orders
	var pendingOrders int64
	database.DB.Model(&models.Order{}).
		Where("chef_id = ? AND status = ?", chef.ID, models.OrderStatusPending).
		Count(&pendingOrders)

	// Get this week's stats
	var weekOrders int64
	var weekRevenue float64
	database.DB.Model(&models.Order{}).
		Where("chef_id = ? AND created_at >= CURRENT_DATE - INTERVAL '7 days'", chef.ID).
		Count(&weekOrders)
	database.DB.Model(&models.Order{}).
		Where("chef_id = ? AND created_at >= CURRENT_DATE - INTERVAL '7 days' AND payment_status = ?", chef.ID, models.PaymentCompleted).
		Select("COALESCE(SUM(total), 0)").Scan(&weekRevenue)

	c.JSON(http.StatusOK, gin.H{
		"todayOrders":    todayOrders,
		"todayRevenue":   todayRevenue,
		"pendingOrders":  pendingOrders,
		"weekOrders":     weekOrders,
		"weekRevenue":    weekRevenue,
		"rating":         chef.Rating,
		"totalReviews":   chef.TotalReviews,
		"totalOrders":    chef.TotalOrders,
		"acceptingOrders": chef.AcceptingOrders,
	})
}

// UpdateChefProfileRequest represents chef profile update
type UpdateChefProfileRequest struct {
	BusinessName    string   `json:"businessName"`
	Description     string   `json:"description"`
	ProfileImage    string   `json:"profileImage"`
	BannerImage     string   `json:"bannerImage"`
	Cuisines        []string `json:"cuisines"`
	Specialties     []string `json:"specialties"`
	PrepTime        string   `json:"prepTime"`
	MinimumOrder    float64  `json:"minimumOrder"`
	ServiceRadius   float64  `json:"serviceRadius"`
	AcceptingOrders *bool    `json:"acceptingOrders"`
}

// UpdateChefProfile updates the chef's profile
func (h *ChefHandler) UpdateChefProfile(c *gin.Context) {
	userID, _ := middleware.GetUserID(c)

	var chef models.ChefProfile
	if err := database.DB.Where("user_id = ?", userID).First(&chef).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Chef profile not found"})
		return
	}

	var req UpdateChefProfileRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Update fields
	if req.BusinessName != "" {
		chef.BusinessName = req.BusinessName
	}
	if req.Description != "" {
		chef.Description = req.Description
	}
	if req.ProfileImage != "" {
		chef.ProfileImage = req.ProfileImage
	}
	if req.BannerImage != "" {
		chef.BannerImage = req.BannerImage
	}
	if req.Cuisines != nil {
		chef.Cuisines = req.Cuisines
	}
	if req.Specialties != nil {
		chef.Specialties = req.Specialties
	}
	if req.PrepTime != "" {
		chef.PrepTime = req.PrepTime
	}
	if req.MinimumOrder > 0 {
		chef.MinimumOrder = req.MinimumOrder
	}
	if req.ServiceRadius > 0 {
		chef.ServiceRadius = req.ServiceRadius
	}
	if req.AcceptingOrders != nil {
		chef.AcceptingOrders = *req.AcceptingOrders
	}

	if err := database.DB.Save(&chef).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update profile"})
		return
	}

	c.JSON(http.StatusOK, chef.ToResponse())
}

// GetChefOrders returns orders for the chef
func (h *ChefHandler) GetChefOrders(c *gin.Context) {
	userID, _ := middleware.GetUserID(c)

	var chef models.ChefProfile
	if err := database.DB.Where("user_id = ?", userID).First(&chef).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Chef profile not found"})
		return
	}

	status := c.Query("status")
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "20"))
	offset := (page - 1) * limit

	query := database.DB.Where("chef_id = ?", chef.ID)
	if status != "" {
		query = query.Where("status = ?", status)
	}

	var total int64
	query.Model(&models.Order{}).Count(&total)

	var orders []models.Order
	if err := query.Preload("Items").
		Order("created_at DESC").
		Offset(offset).Limit(limit).
		Find(&orders).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch orders"})
		return
	}

	responses := make([]models.OrderResponse, len(orders))
	for i, order := range orders {
		responses[i] = order.ToResponse()
	}

	c.JSON(http.StatusOK, gin.H{
		"data": responses,
		"pagination": gin.H{
			"page":       page,
			"limit":      limit,
			"total":      total,
			"totalPages": (total + int64(limit) - 1) / int64(limit),
		},
	})
}

// UpdateOrderStatus updates an order's status
func (h *ChefHandler) UpdateOrderStatus(c *gin.Context) {
	userID, _ := middleware.GetUserID(c)
	orderID := c.Param("orderId")

	var chef models.ChefProfile
	if err := database.DB.Where("user_id = ?", userID).First(&chef).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Chef profile not found"})
		return
	}

	var order models.Order
	if err := database.DB.Where("id = ? AND chef_id = ?", orderID, chef.ID).First(&order).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Order not found"})
		return
	}

	var req struct {
		Status string `json:"status" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	order.Status = models.OrderStatus(req.Status)
	if err := database.DB.Save(&order).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update order"})
		return
	}

	// Publish order status update event
	go func() {
		orderEvent := services.OrderEvent{
			OrderID:     order.ID,
			OrderNumber: order.OrderNumber,
			CustomerID:  order.CustomerID,
			ChefID:      order.ChefID,
			Status:      string(order.Status),
			Total:       order.Total,
		}

		// Determine which subject to publish to based on status
		subject := services.SubjectOrderUpdated
		if order.Status == models.OrderStatusDelivered {
			subject = services.SubjectOrderDelivered
		}

		if err := services.PublishOrderEvent(subject, orderEvent); err != nil {
			log.Printf("Failed to publish order status update event: %v", err)
		}
	}()

	c.JSON(http.StatusOK, order.ToResponse())
}
