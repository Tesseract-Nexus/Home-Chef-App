package handlers

import (
	"net/http"
	"strconv"
	"inventory-service/models"
	"inventory-service/services"
	"inventory-service/utils"

	"github.com/gin-gonic/gin"
)

type IngredientHandler struct {
	inventoryService *services.InventoryService
}

func NewIngredientHandler(inventoryService *services.InventoryService) *IngredientHandler {
	return &IngredientHandler{
		inventoryService: inventoryService,
	}
}

// @Summary Get chef's ingredient inventory
// @Description Retrieve ingredient inventory with filtering options
// @Tags Ingredients
// @Accept json
// @Produce json
// @Param category query string false "Filter by category"
// @Param status query string false "Filter by status"
// @Param expiry_within_days query integer false "Filter by expiry"
// @Success 200 {object} models.APIResponse{data=[]models.Ingredient}
// @Security BearerAuth
// @Router /inventory/ingredients [get]
func (h *IngredientHandler) GetIngredients(c *gin.Context) {
	chefID := c.GetString("chef_id")
	if chefID == "" {
		chefID = c.GetString("user_id")
	}

	category := c.Query("category")
	status := c.Query("status")
	expiryWithinDays, _ := strconv.Atoi(c.Query("expiry_within_days"))

	ingredients, err := h.inventoryService.GetIngredients(chefID, category, status, expiryWithinDays)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Error:   "database_error",
			Message: "Failed to retrieve ingredients",
		})
		return
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Data:    ingredients,
	})
}

// @Summary Add ingredient to inventory
// @Description Add a new ingredient to the chef's inventory
// @Tags Ingredients
// @Accept json
// @Produce json
// @Param ingredient body models.IngredientCreate true "Ingredient data"
// @Success 201 {object} models.APIResponse
// @Security BearerAuth
// @Router /inventory/ingredients [post]
func (h *IngredientHandler) CreateIngredient(c *gin.Context) {
	chefID := c.GetString("chef_id")
	if chefID == "" {
		chefID = c.GetString("user_id")
	}

	var ingredientCreate models.IngredientCreate
	if err := c.ShouldBindJSON(&ingredientCreate); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Error:   "invalid_request",
			Message: "Invalid request body",
			Details: utils.GetValidationErrors(err),
		})
		return
	}

	ingredient, err := h.inventoryService.CreateIngredient(chefID, &ingredientCreate)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Error:   "creation_error",
			Message: "Failed to create ingredient",
		})
		return
	}

	c.JSON(http.StatusCreated, models.APIResponse{
		Success: true,
		Message: "Ingredient added successfully",
		Data:    ingredient,
	})
}

// @Summary Get ingredient details
// @Description Get detailed information about a specific ingredient
// @Tags Ingredients
// @Accept json
// @Produce json
// @Param ingredient_id path string true "Ingredient ID"
// @Success 200 {object} models.APIResponse{data=models.Ingredient}
// @Security BearerAuth
// @Router /inventory/ingredients/{ingredient_id} [get]
func (h *IngredientHandler) GetIngredient(c *gin.Context) {
	ingredientID := c.Param("ingredient_id")
	chefID := c.GetString("chef_id")
	if chefID == "" {
		chefID = c.GetString("user_id")
	}

	var ingredient models.Ingredient
	err := h.inventoryService.db.Where("id = ? AND chef_id = ?", ingredientID, chefID).
		Preload("StockMovements").First(&ingredient).Error
	if err != nil {
		c.JSON(http.StatusNotFound, models.ErrorResponse{
			Error:   "ingredient_not_found",
			Message: "Ingredient not found",
		})
		return
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Data:    ingredient,
	})
}

// @Summary Update ingredient
// @Description Update ingredient information
// @Tags Ingredients
// @Accept json
// @Produce json
// @Param ingredient_id path string true "Ingredient ID"
// @Param ingredient body models.IngredientUpdate true "Ingredient update data"
// @Success 200 {object} models.APIResponse
// @Security BearerAuth
// @Router /inventory/ingredients/{ingredient_id} [put]
func (h *IngredientHandler) UpdateIngredient(c *gin.Context) {
	ingredientID := c.Param("ingredient_id")
	chefID := c.GetString("chef_id")
	if chefID == "" {
		chefID = c.GetString("user_id")
	}

	var ingredientUpdate models.IngredientUpdate
	if err := c.ShouldBindJSON(&ingredientUpdate); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Error:   "invalid_request",
			Message: "Invalid request body",
			Details: utils.GetValidationErrors(err),
		})
		return
	}

	updatedIngredient, err := h.inventoryService.UpdateIngredient(ingredientID, chefID, &ingredientUpdate)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Error:   "update_error",
			Message: "Failed to update ingredient",
		})
		return
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Message: "Ingredient updated successfully",
		Data:    updatedIngredient,
	})
}

// @Summary Remove ingredient from inventory
// @Description Delete an ingredient from the chef's inventory
// @Tags Ingredients
// @Accept json
// @Produce json
// @Param ingredient_id path string true "Ingredient ID"
// @Success 200 {object} models.APIResponse
// @Security BearerAuth
// @Router /inventory/ingredients/{ingredient_id} [delete]
func (h *IngredientHandler) DeleteIngredient(c *gin.Context) {
	ingredientID := c.Param("ingredient_id")
	chefID := c.GetString("chef_id")
	if chefID == "" {
		chefID = c.GetString("user_id")
	}

	err := h.inventoryService.db.Where("id = ? AND chef_id = ?", ingredientID, chefID).
		Delete(&models.Ingredient{}).Error
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Error:   "deletion_error",
			Message: "Failed to delete ingredient",
		})
		return
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Message: "Ingredient removed successfully",
	})
}

// @Summary Update ingredient stock
// @Description Update stock levels for an ingredient
// @Tags Stock Management
// @Accept json
// @Produce json
// @Param ingredient_id path string true "Ingredient ID"
// @Param stock body models.StockUpdate true "Stock update data"
// @Success 200 {object} models.APIResponse
// @Security BearerAuth
// @Router /inventory/ingredients/{ingredient_id}/stock [put]
func (h *IngredientHandler) UpdateStock(c *gin.Context) {
	ingredientID := c.Param("ingredient_id")
	chefID := c.GetString("chef_id")
	if chefID == "" {
		chefID = c.GetString("user_id")
	}

	var stockUpdate models.StockUpdate
	if err := c.ShouldBindJSON(&stockUpdate); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Error:   "invalid_request",
			Message: "Invalid request body",
			Details: utils.GetValidationErrors(err),
		})
		return
	}

	err := h.inventoryService.UpdateStock(ingredientID, chefID, &stockUpdate)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Error:   "update_error",
			Message: "Failed to update stock",
		})
		return
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Message: "Stock updated successfully",
	})
}