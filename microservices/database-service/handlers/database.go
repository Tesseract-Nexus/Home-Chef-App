package handlers

import (
	"database-service/database"
	"database-service/models"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

type DatabaseHandler struct {
	postgres *database.PostgresDB
	redis    *database.RedisClient
	logger   *zap.Logger
}

func NewDatabaseHandler(postgres *database.PostgresDB, redis *database.RedisClient, logger *zap.Logger) *DatabaseHandler {
	return &DatabaseHandler{
		postgres: postgres,
		redis:    redis,
		logger:   logger,
	}
}

// @Summary Get all users
// @Description Retrieve all users with pagination
// @Tags Database
// @Accept json
// @Produce json
// @Param page query int false "Page number" default(1)
// @Param limit query int false "Items per page" default(20)
// @Success 200 {object} models.APIResponse{data=models.PaginationResponse}
// @Router /database/users [get]
func (h *DatabaseHandler) GetUsers(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "20"))
	offset := (page - 1) * limit

	var users []models.User
	var total int64

	// Get total count
	h.postgres.DB.Model(&models.User{}).Count(&total)

	// Get users with pagination
	result := h.postgres.DB.Preload("ChefProfile").Preload("DeliveryProfile").
		Offset(offset).Limit(limit).Find(&users)

	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Error:   "database_error",
			Message: "Failed to retrieve users",
		})
		return
	}

	totalPages := int(total) / limit
	if int(total)%limit != 0 {
		totalPages++
	}

	response := models.PaginationResponse{
		Data:       users,
		Page:       page,
		Limit:      limit,
		Total:      total,
		TotalPages: totalPages,
		HasNext:    page < totalPages,
		HasPrev:    page > 1,
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Data:    response,
	})
}

// @Summary Get user by ID
// @Description Retrieve a specific user by ID
// @Tags Database
// @Accept json
// @Produce json
// @Param id path string true "User ID"
// @Success 200 {object} models.APIResponse{data=models.User}
// @Router /database/users/{id} [get]
func (h *DatabaseHandler) GetUserByID(c *gin.Context) {
	userID := c.Param("id")

	var user models.User
	result := h.postgres.DB.Preload("ChefProfile").Preload("DeliveryProfile").
		Preload("Addresses").First(&user, "id = ?", userID)

	if result.Error != nil {
		c.JSON(http.StatusNotFound, models.ErrorResponse{
			Error:   "user_not_found",
			Message: "User not found",
		})
		return
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Data:    user,
	})
}

// @Summary Get all chefs
// @Description Retrieve all chef profiles
// @Tags Database
// @Accept json
// @Produce json
// @Success 200 {object} models.APIResponse{data=[]models.ChefProfile}
// @Router /database/chefs [get]
func (h *DatabaseHandler) GetChefs(c *gin.Context) {
	var chefs []models.ChefProfile
	result := h.postgres.DB.Preload("User").Preload("MenuItems").Find(&chefs)

	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Error:   "database_error",
			Message: "Failed to retrieve chefs",
		})
		return
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Data:    chefs,
	})
}

// @Summary Get menu items
// @Description Retrieve menu items with optional chef filter
// @Tags Database
// @Accept json
// @Produce json
// @Param chef_id query string false "Chef ID filter"
// @Success 200 {object} models.APIResponse{data=[]models.MenuItem}
// @Router /database/menu-items [get]
func (h *DatabaseHandler) GetMenuItems(c *gin.Context) {
	chefID := c.Query("chef_id")

	var menuItems []models.MenuItem
	query := h.postgres.DB.Preload("Chef")

	if chefID != "" {
		query = query.Where("chef_id = ?", chefID)
	}

	result := query.Find(&menuItems)

	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Error:   "database_error",
			Message: "Failed to retrieve menu items",
		})
		return
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Data:    menuItems,
	})
}

// @Summary Get orders
// @Description Retrieve orders with optional filters
// @Tags Database
// @Accept json
// @Produce json
// @Param customer_id query string false "Customer ID filter"
// @Param chef_id query string false "Chef ID filter"
// @Param status query string false "Status filter"
// @Success 200 {object} models.APIResponse{data=[]models.Order}
// @Router /database/orders [get]
func (h *DatabaseHandler) GetOrders(c *gin.Context) {
	customerID := c.Query("customer_id")
	chefID := c.Query("chef_id")
	status := c.Query("status")

	var orders []models.Order
	query := h.postgres.DB.Preload("Customer").Preload("Chef").
		Preload("DeliveryPartner").Preload("OrderItems.MenuItem")

	if customerID != "" {
		query = query.Where("customer_id = ?", customerID)
	}
	if chefID != "" {
		query = query.Where("chef_id = ?", chefID)
	}
	if status != "" {
		query = query.Where("status = ?", status)
	}

	result := query.Find(&orders)

	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Error:   "database_error",
			Message: "Failed to retrieve orders",
		})
		return
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Data:    orders,
	})
}

// @Summary Create test order
// @Description Create a test order for development
// @Tags Database
// @Accept json
// @Produce json
// @Success 201 {object} models.APIResponse{data=models.Order}
// @Router /database/test-order [post]
func (h *DatabaseHandler) CreateTestOrder(c *gin.Context) {
	order := models.Order{
		BaseModel:           models.BaseModel{ID: "test-order-" + strconv.FormatInt(c.Request.Context().Value("timestamp").(int64), 10)},
		CustomerID:          "user-2",
		ChefID:              "chef-1",
		Status:              "pending",
		TotalAmount:         530.00,
		DeliveryFee:         50.00,
		TaxAmount:          48.00,
		DeliveryAddress:     `{"street":"123 Main Street","city":"Mumbai","state":"Maharashtra","pincode":"400058"}`,
		SpecialInstructions: "Please make it less spicy",
		PaymentMethod:       "online",
		PaymentStatus:       "pending",
	}

	result := h.postgres.DB.Create(&order)
	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Error:   "database_error",
			Message: "Failed to create test order",
		})
		return
	}

	// Create order items
	orderItems := []models.OrderItem{
		{
			BaseModel:  models.BaseModel{ID: "item-1"},
			OrderID:    order.ID,
			MenuItemID: "menu-1",
			Quantity:   1,
			Price:      280.00,
			Notes:      "Medium spice",
		},
		{
			BaseModel:  models.BaseModel{ID: "item-2"},
			OrderID:    order.ID,
			MenuItemID: "menu-2",
			Quantity:   1,
			Price:      250.00,
		},
	}

	for _, item := range orderItems {
		h.postgres.DB.Create(&item)
	}

	// Load the complete order
	h.postgres.DB.Preload("Customer").Preload("Chef").
		Preload("OrderItems.MenuItem").First(&order, "id = ?", order.ID)

	c.JSON(http.StatusCreated, models.APIResponse{
		Success: true,
		Message: "Test order created successfully",
		Data:    order,
	})
}