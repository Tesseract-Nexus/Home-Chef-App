package handlers

import (
	"net/http"
	"strconv"
	"chef-service/models"
	"chef-service/utils"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type MenuHandler struct {
	// Dependencies would be injected here
}

func NewMenuHandler() *MenuHandler {
	return &MenuHandler{}
}

// @Summary Get chef menu with filtering
// @Description Get menu items for a chef with filtering options
// @Tags Menu Management
// @Accept json
// @Produce json
// @Param chef_id path string true "Chef ID"
// @Param category query string false "Filter by category"
// @Param is_vegetarian query boolean false "Filter vegetarian items"
// @Param available_only query boolean false "Show only available items" default(true)
// @Success 200 {object} models.APIResponse{data=[]models.MenuItem}
// @Router /chefs/{chef_id}/menu [get]
func (h *MenuHandler) GetChefMenu(c *gin.Context) {
	chefID := c.Param("chef_id")
	category := c.Query("category")
	isVegetarian, _ := strconv.ParseBool(c.Query("is_vegetarian"))
	availableOnly, _ := strconv.ParseBool(c.DefaultQuery("available_only", "true"))

	// TODO: Fetch menu items from database with filters
	menuItems := []models.MenuItem{
		{
			ID:          uuid.New().String(),
			ChefID:      chefID,
			Name:        "Butter Chicken",
			Description: "Rich and creamy tomato-based curry",
			Price:       280.00,
			Category:    "main_course",
			IsVegetarian: false,
			IsAvailable: true,
		},
		{
			ID:          uuid.New().String(),
			ChefID:      chefID,
			Name:        "Paneer Tikka Masala",
			Description: "Grilled cottage cheese in rich tomato gravy",
			Price:       250.00,
			Category:    "main_course",
			IsVegetarian: true,
			IsAvailable: true,
		},
	}

	// Apply filters
	filteredItems := []models.MenuItem{}
	for _, item := range menuItems {
		if category != "" && item.Category != category {
			continue
		}
		if isVegetarian && !item.IsVegetarian {
			continue
		}
		if availableOnly && !item.IsAvailable {
			continue
		}
		filteredItems = append(filteredItems, item)
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Data:    filteredItems,
	})
}

// @Summary Get chef's menu
// @Description Get menu items for the authenticated chef
// @Tags Menu Management
// @Accept json
// @Produce json
// @Param category query string false "Filter by category"
// @Param available query boolean false "Filter by availability"
// @Success 200 {object} models.APIResponse{data=[]models.MenuItem}
// @Security BearerAuth
// @Router /chefs/menu [get]
func (h *MenuHandler) GetMenu(c *gin.Context) {
	chefID := c.GetString("chef_id")
	category := c.Query("category")
	available := c.Query("available")

	// TODO: Fetch menu items from database with filters
	menuItems := []models.MenuItem{
		{
			ID:          uuid.New().String(),
			ChefID:      chefID,
			Name:        "Butter Chicken",
			Description: "Rich and creamy tomato-based curry",
			Price:       280.00,
			Category:    "main_course",
			IsAvailable: true,
		},
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Data:    menuItems,
	})
}

// @Summary Add menu item
// @Description Add a new menu item
// @Tags Menu Management
// @Accept json
// @Produce json
// @Param item body models.MenuItemCreate true "Menu item data"
// @Success 201 {object} models.APIResponse
// @Failure 400 {object} models.ErrorResponse
// @Security BearerAuth
// @Router /chefs/menu [post]
func (h *MenuHandler) CreateMenuItem(c *gin.Context) {
	var item models.MenuItemCreate
	
	if err := c.ShouldBindJSON(&item); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Error:   "invalid_request",
			Message: "Invalid request body",
			Details: utils.GetValidationErrors(err),
		})
		return
	}

	chefID := c.GetString("chef_id")
	itemID := uuid.New().String()
	
	// TODO: Save menu item to database

	c.JSON(http.StatusCreated, models.APIResponse{
		Success: true,
		Message: "Menu item created successfully",
		Data: gin.H{
			"dish_id": itemID,
			"chef_id": chefID,
		},
	})
}

// @Summary Update menu item
// @Description Update an existing menu item
// @Tags Menu Management
// @Accept json
// @Produce json
// @Param dish_id path string true "Dish ID"
// @Param item body models.MenuItemUpdate true "Menu item update data"
// @Success 200 {object} models.APIResponse
// @Failure 400 {object} models.ErrorResponse
// @Security BearerAuth
// @Router /chefs/menu/{dish_id} [put]
func (h *MenuHandler) UpdateMenuItem(c *gin.Context) {
	dishID := c.Param("dish_id")
	chefID := c.GetString("chef_id")
	
	var update models.MenuItemUpdate
	if err := c.ShouldBindJSON(&update); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Error:   "invalid_request",
			Message: "Invalid request body",
			Details: utils.GetValidationErrors(err),
		})
		return
	}

	// TODO: Update menu item in database

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Message: "Menu item updated successfully",
		Data: gin.H{
			"dish_id": dishID,
			"chef_id": chefID,
		},
	})
}

// @Summary Delete menu item
// @Description Delete a menu item
// @Tags Menu Management
// @Accept json
// @Produce json
// @Param dish_id path string true "Dish ID"
// @Success 200 {object} models.APIResponse
// @Security BearerAuth
// @Router /chefs/menu/{dish_id} [delete]
func (h *MenuHandler) DeleteMenuItem(c *gin.Context) {
	dishID := c.Param("dish_id")
	chefID := c.GetString("chef_id")

	// TODO: Delete menu item from database

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Message: "Menu item deleted successfully",
		Data: gin.H{
			"dish_id": dishID,
			"chef_id": chefID,
		},
	})
}

// @Summary Upload dish images
// @Description Upload images for a dish
// @Tags Menu Management
// @Accept multipart/form-data
// @Produce json
// @Param dish_id path string true "Dish ID"
// @Param images formData file true "Image files"
// @Success 200 {object} models.APIResponse
// @Security BearerAuth
// @Router /chefs/menu/{dish_id}/images [post]
func (h *MenuHandler) UploadDishImages(c *gin.Context) {
	dishID := c.Param("dish_id")
	
	form, err := c.MultipartForm()
	if err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Error:   "invalid_request",
			Message: "Failed to parse multipart form",
		})
		return
	}

	files := form.File["images"]
	if len(files) == 0 {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Error:   "invalid_request",
			Message: "No images provided",
		})
		return
	}

	var imageURLs []string
	for _, file := range files {
		// TODO: Upload file to storage service
		imageURL := "https://cdn.homechef.com/dishes/" + uuid.New().String() + ".jpg"
		imageURLs = append(imageURLs, imageURL)
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Message: "Images uploaded successfully",
		Data: gin.H{
			"dish_id":    dishID,
			"image_urls": imageURLs,
		},
	})
}

// @Summary Toggle item availability
// @Description Update menu item availability
// @Tags Menu Management
// @Accept json
// @Produce json
// @Param dish_id path string true "Dish ID"
// @Param availability body models.MenuAvailabilityUpdate true "Availability data"
// @Success 200 {object} models.APIResponse
// @Security BearerAuth
// @Router /chefs/menu/{dish_id}/availability [put]
func (h *MenuHandler) UpdateMenuAvailability(c *gin.Context) {
	dishID := c.Param("dish_id")
	
	var availability models.MenuAvailabilityUpdate
	if err := c.ShouldBindJSON(&availability); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Error:   "invalid_request",
			Message: "Invalid request body",
			Details: utils.GetValidationErrors(err),
		})
		return
	}

	// TODO: Update availability in database

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Message: "Menu availability updated successfully",
		Data: gin.H{
			"dish_id":      dishID,
			"is_available": availability.IsAvailable,
		},
	})
}