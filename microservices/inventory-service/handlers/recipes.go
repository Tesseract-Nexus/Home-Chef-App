package handlers

import (
	"net/http"
	"strconv"
	"inventory-service/models"
	"inventory-service/services"
	"inventory-service/utils"

	"github.com/gin-gonic/gin"
)

type RecipeHandler struct {
	inventoryService *services.InventoryService
}

func NewRecipeHandler(inventoryService *services.InventoryService) *RecipeHandler {
	return &RecipeHandler{
		inventoryService: inventoryService,
	}
}

// @Summary Get ingredients required for dish
// @Description Get recipe ingredients with optional serving adjustment
// @Tags Recipe Management
// @Accept json
// @Produce json
// @Param dish_id path string true "Dish ID"
// @Param servings query integer false "Number of servings" default(1)
// @Success 200 {object} models.APIResponse{data=[]models.RecipeIngredient}
// @Security BearerAuth
// @Router /inventory/recipes/{dish_id}/ingredients [get]
func (h *RecipeHandler) GetRecipeIngredients(c *gin.Context) {
	dishID := c.Param("dish_id")
	servings, _ := strconv.Atoi(c.DefaultQuery("servings", "1"))

	recipeIngredients, err := h.inventoryService.GetRecipeIngredients(dishID, servings)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Error:   "database_error",
			Message: "Failed to retrieve recipe ingredients",
		})
		return
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Data:    recipeIngredients,
	})
}

// @Summary Update recipe ingredients
// @Description Update the ingredients required for a dish recipe
// @Tags Recipe Management
// @Accept json
// @Produce json
// @Param dish_id path string true "Dish ID"
// @Param ingredients body object true "Recipe ingredients"
// @Success 200 {object} models.APIResponse
// @Security BearerAuth
// @Router /inventory/recipes/{dish_id}/ingredients [put]
func (h *RecipeHandler) UpdateRecipeIngredients(c *gin.Context) {
	dishID := c.Param("dish_id")

	var request struct {
		Ingredients []models.RecipeIngredientCreate `json:"ingredients" validate:"required,min=1"`
	}

	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Error:   "invalid_request",
			Message: "Invalid request body",
			Details: utils.GetValidationErrors(err),
		})
		return
	}

	err := h.inventoryService.UpdateRecipeIngredients(dishID, request.Ingredients)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Error:   "update_error",
			Message: "Failed to update recipe ingredients",
		})
		return
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Message: "Recipe ingredients updated successfully",
	})
}