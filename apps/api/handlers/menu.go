package handlers

import (
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/homechef/api/database"
	"github.com/homechef/api/middleware"
	"github.com/homechef/api/models"
	"github.com/lib/pq"
)

type MenuHandler struct{}

func NewMenuHandler() *MenuHandler {
	return &MenuHandler{}
}

// ---------- Menu Items ----------

// GetChefMenuItems returns all menu items for the authenticated chef.
// GET /chef/menu
func (h *MenuHandler) GetChefMenuItems(c *gin.Context) {
	userID, _ := middleware.GetUserID(c)

	var chef models.ChefProfile
	if err := database.DB.Where("user_id = ?", userID).First(&chef).Error; err != nil {
		// No profile yet = no menu items
		c.JSON(http.StatusOK, []models.MenuItem{})
		return
	}

	var items []models.MenuItem
	database.DB.Where("chef_id = ?", chef.ID).Order("sort_order ASC, created_at DESC").Find(&items)

	// Ensure nil slices are returned as empty arrays in JSON
	for i := range items {
		if items[i].DietaryTags == nil {
			items[i].DietaryTags = pq.StringArray{}
		}
		if items[i].Allergens == nil {
			items[i].Allergens = pq.StringArray{}
		}
		if items[i].Ingredients == nil {
			items[i].Ingredients = pq.StringArray{}
		}
	}

	c.JSON(http.StatusOK, items)
}

// GetMenuItem returns a single menu item by ID (must belong to authenticated chef).
// GET /chef/menu/items/:itemId
func (h *MenuHandler) GetMenuItem(c *gin.Context) {
	userID, _ := middleware.GetUserID(c)
	itemID := c.Param("itemId")

	var chef models.ChefProfile
	if err := database.DB.Where("user_id = ?", userID).First(&chef).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Chef profile not found"})
		return
	}

	var item models.MenuItem
	if err := database.DB.Where("id = ? AND chef_id = ?", itemID, chef.ID).First(&item).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Menu item not found"})
		return
	}

	if item.DietaryTags == nil {
		item.DietaryTags = pq.StringArray{}
	}
	if item.Allergens == nil {
		item.Allergens = pq.StringArray{}
	}
	if item.Ingredients == nil {
		item.Ingredients = pq.StringArray{}
	}

	c.JSON(http.StatusOK, item)
}

// CreateMenuItem creates a new menu item for the authenticated chef.
// POST /chef/menu/items
func (h *MenuHandler) CreateMenuItem(c *gin.Context) {
	userID, _ := middleware.GetUserID(c)

	chef, err := getOrCreateChefProfile(userID)
	if err != nil {
		log.Printf("Failed to get/create chef profile: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to initialize chef profile"})
		return
	}

	var req CreateMenuItemRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	item := models.MenuItem{
		ChefID:       chef.ID,
		Name:         req.Name,
		Description:  req.Description,
		Price:        req.Price,
		ComparePrice: req.ComparePrice,
		ImageURL:     req.ImageURL,
		DietaryTags:  ensureStringArray(req.DietaryTags),
		Allergens:    ensureStringArray(req.Allergens),
		Ingredients:  ensureStringArray(req.Ingredients),
		PrepTime:     req.PrepTime,
		PortionSize:  req.PortionSize,
		Serves:       max(req.Serves, 1),
		SpiceLevel:   req.SpiceLevel,
		IsAvailable:  true,
		IsFeatured:   req.IsFeatured,
	}

	if req.CategoryID != "" {
		catID, err := uuid.Parse(req.CategoryID)
		if err == nil {
			item.CategoryID = &catID
		}
	}

	if err := database.DB.Create(&item).Error; err != nil {
		log.Printf("Failed to create menu item: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create menu item"})
		return
	}

	c.JSON(http.StatusCreated, item)
}

// UpdateMenuItem updates an existing menu item.
// PUT /chef/menu/items/:itemId
func (h *MenuHandler) UpdateMenuItem(c *gin.Context) {
	userID, _ := middleware.GetUserID(c)
	itemID := c.Param("itemId")

	var chef models.ChefProfile
	if err := database.DB.Where("user_id = ?", userID).First(&chef).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Chef profile not found"})
		return
	}

	var item models.MenuItem
	if err := database.DB.Where("id = ? AND chef_id = ?", itemID, chef.ID).First(&item).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Menu item not found"})
		return
	}

	var req UpdateMenuItemRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Build updates map — only update fields that are present
	updates := map[string]interface{}{}

	if req.Name != nil {
		updates["name"] = *req.Name
	}
	if req.Description != nil {
		updates["description"] = *req.Description
	}
	if req.Price != nil {
		updates["price"] = *req.Price
	}
	if req.ComparePrice != nil {
		updates["compare_price"] = *req.ComparePrice
	}
	if req.ImageURL != nil {
		updates["image_url"] = *req.ImageURL
	}
	if req.DietaryTags != nil {
		updates["dietary_tags"] = pq.StringArray(*req.DietaryTags)
	}
	if req.Allergens != nil {
		updates["allergens"] = pq.StringArray(*req.Allergens)
	}
	if req.Ingredients != nil {
		updates["ingredients"] = pq.StringArray(*req.Ingredients)
	}
	if req.PrepTime != nil {
		updates["prep_time"] = *req.PrepTime
	}
	if req.PortionSize != nil {
		updates["portion_size"] = *req.PortionSize
	}
	if req.Serves != nil {
		updates["serves"] = *req.Serves
	}
	if req.SpiceLevel != nil {
		updates["spice_level"] = *req.SpiceLevel
	}
	if req.IsAvailable != nil {
		updates["is_available"] = *req.IsAvailable
	}
	if req.IsFeatured != nil {
		updates["is_featured"] = *req.IsFeatured
	}
	if req.CategoryID != nil {
		if *req.CategoryID == "" {
			updates["category_id"] = nil
		} else {
			catID, err := uuid.Parse(*req.CategoryID)
			if err == nil {
				updates["category_id"] = catID
			}
		}
	}

	if len(updates) > 0 {
		if err := database.DB.Model(&item).Updates(updates).Error; err != nil {
			log.Printf("Failed to update menu item: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update menu item"})
			return
		}
	}

	// Reload to return the updated item
	database.DB.First(&item, "id = ?", itemID)

	if item.DietaryTags == nil {
		item.DietaryTags = pq.StringArray{}
	}
	if item.Allergens == nil {
		item.Allergens = pq.StringArray{}
	}
	if item.Ingredients == nil {
		item.Ingredients = pq.StringArray{}
	}

	c.JSON(http.StatusOK, item)
}

// DeleteMenuItem soft-deletes a menu item.
// DELETE /chef/menu/items/:itemId
func (h *MenuHandler) DeleteMenuItem(c *gin.Context) {
	userID, _ := middleware.GetUserID(c)
	itemID := c.Param("itemId")

	var chef models.ChefProfile
	if err := database.DB.Where("user_id = ?", userID).First(&chef).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Chef profile not found"})
		return
	}

	result := database.DB.Where("id = ? AND chef_id = ?", itemID, chef.ID).Delete(&models.MenuItem{})
	if result.RowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Menu item not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Menu item deleted"})
}

// ---------- Categories ----------

// GetCategories returns all categories for the authenticated chef.
// GET /chef/menu/categories
func (h *MenuHandler) GetCategories(c *gin.Context) {
	userID, _ := middleware.GetUserID(c)

	var chef models.ChefProfile
	if err := database.DB.Where("user_id = ?", userID).First(&chef).Error; err != nil {
		// No profile yet = no categories
		c.JSON(http.StatusOK, []models.MenuCategory{})
		return
	}

	var categories []models.MenuCategory
	database.DB.Where("chef_id = ?", chef.ID).Order("sort_order ASC, name ASC").Find(&categories)

	c.JSON(http.StatusOK, categories)
}

// CreateCategory creates a new menu category.
// POST /chef/menu/categories
func (h *MenuHandler) CreateCategory(c *gin.Context) {
	userID, _ := middleware.GetUserID(c)

	chef, err := getOrCreateChefProfile(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to initialize chef profile"})
		return
	}

	var req CreateCategoryRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	category := models.MenuCategory{
		ChefID:      chef.ID,
		Name:        req.Name,
		Description: req.Description,
		SortOrder:   req.SortOrder,
		IsActive:    true,
	}

	if err := database.DB.Create(&category).Error; err != nil {
		log.Printf("Failed to create category: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create category"})
		return
	}

	c.JSON(http.StatusCreated, category)
}

// UpdateCategory updates an existing category.
// PUT /chef/menu/categories/:categoryId
func (h *MenuHandler) UpdateCategory(c *gin.Context) {
	userID, _ := middleware.GetUserID(c)
	categoryID := c.Param("categoryId")

	var chef models.ChefProfile
	if err := database.DB.Where("user_id = ?", userID).First(&chef).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Chef profile not found"})
		return
	}

	var category models.MenuCategory
	if err := database.DB.Where("id = ? AND chef_id = ?", categoryID, chef.ID).First(&category).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Category not found"})
		return
	}

	var req UpdateCategoryRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	updates := map[string]interface{}{}
	if req.Name != nil {
		updates["name"] = *req.Name
	}
	if req.Description != nil {
		updates["description"] = *req.Description
	}
	if req.SortOrder != nil {
		updates["sort_order"] = *req.SortOrder
	}
	if req.IsActive != nil {
		updates["is_active"] = *req.IsActive
	}

	if len(updates) > 0 {
		database.DB.Model(&category).Updates(updates)
	}

	database.DB.First(&category, "id = ?", categoryID)
	c.JSON(http.StatusOK, category)
}

// DeleteCategory soft-deletes a category and nullifies categoryId on its items.
// DELETE /chef/menu/categories/:categoryId
func (h *MenuHandler) DeleteCategory(c *gin.Context) {
	userID, _ := middleware.GetUserID(c)
	categoryID := c.Param("categoryId")

	var chef models.ChefProfile
	if err := database.DB.Where("user_id = ?", userID).First(&chef).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Chef profile not found"})
		return
	}

	result := database.DB.Where("id = ? AND chef_id = ?", categoryID, chef.ID).Delete(&models.MenuCategory{})
	if result.RowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Category not found"})
		return
	}

	// Nullify category_id on items that used this category
	database.DB.Model(&models.MenuItem{}).Where("category_id = ? AND chef_id = ?", categoryID, chef.ID).Update("category_id", nil)

	c.JSON(http.StatusOK, gin.H{"message": "Category deleted"})
}

// ---------- Request types ----------

type CreateMenuItemRequest struct {
	Name         string   `json:"name" binding:"required"`
	Description  string   `json:"description"`
	Price        float64  `json:"price" binding:"required,gt=0"`
	ComparePrice float64  `json:"comparePrice"`
	CategoryID   string   `json:"categoryId"`
	ImageURL     string   `json:"imageUrl"`
	DietaryTags  []string `json:"dietaryTags"`
	Allergens    []string `json:"allergens"`
	Ingredients  []string `json:"ingredients"`
	PrepTime     int      `json:"prepTime"`
	PortionSize  string   `json:"portionSize"`
	Serves       int      `json:"serves"`
	SpiceLevel   int      `json:"spiceLevel"`
	IsFeatured   bool     `json:"isFeatured"`
}

type UpdateMenuItemRequest struct {
	Name         *string   `json:"name"`
	Description  *string   `json:"description"`
	Price        *float64  `json:"price"`
	ComparePrice *float64  `json:"comparePrice"`
	CategoryID   *string   `json:"categoryId"`
	ImageURL     *string   `json:"imageUrl"`
	DietaryTags  *[]string `json:"dietaryTags"`
	Allergens    *[]string `json:"allergens"`
	Ingredients  *[]string `json:"ingredients"`
	PrepTime     *int      `json:"prepTime"`
	PortionSize  *string   `json:"portionSize"`
	Serves       *int      `json:"serves"`
	SpiceLevel   *int      `json:"spiceLevel"`
	IsAvailable  *bool     `json:"isAvailable"`
	IsFeatured   *bool     `json:"isFeatured"`
}

type CreateCategoryRequest struct {
	Name        string `json:"name" binding:"required"`
	Description string `json:"description"`
	SortOrder   int    `json:"sortOrder"`
}

type UpdateCategoryRequest struct {
	Name        *string `json:"name"`
	Description *string `json:"description"`
	SortOrder   *int    `json:"sortOrder"`
	IsActive    *bool   `json:"isActive"`
}

// ---------- Helpers ----------

func ensureStringArray(arr []string) pq.StringArray {
	if arr == nil {
		return pq.StringArray{}
	}
	return pq.StringArray(arr)
}
