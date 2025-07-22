package handlers

import (
	"net/http"
	"customer-service/models"
	"customer-service/services"

	"github.com/gin-gonic/gin"
)

type FavoriteHandler struct {
	favoriteService *services.FavoriteService
}

func NewFavoriteHandler(favoriteService *services.FavoriteService) *FavoriteHandler {
	return &FavoriteHandler{
		favoriteService: favoriteService,
	}
}

// @Summary Get favorite chefs
// @Description Retrieve all favorite chefs for the authenticated customer
// @Tags Favorites
// @Accept json
// @Produce json
// @Success 200 {object} models.APIResponse{data=[]models.FavoriteChef}
// @Security BearerAuth
// @Router /customers/favorites/chefs [get]
func (h *FavoriteHandler) GetFavoriteChefs(c *gin.Context) {
	customerID := c.GetString("customer_id")
	if customerID == "" {
		customerID = c.GetString("user_id")
	}

	favoriteChefs, err := h.favoriteService.GetFavoriteChefs(customerID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Error:   "database_error",
			Message: "Failed to retrieve favorite chefs",
		})
		return
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Data:    favoriteChefs,
	})
}

// @Summary Add chef to favorites
// @Description Add a chef to customer's favorites
// @Tags Favorites
// @Accept json
// @Produce json
// @Param chef body object{chef_id=string} true "Chef ID"
// @Success 201 {object} models.APIResponse
// @Security BearerAuth
// @Router /customers/favorites/chefs [post]
func (h *FavoriteHandler) AddFavoriteChef(c *gin.Context) {
	customerID := c.GetString("customer_id")
	if customerID == "" {
		customerID = c.GetString("user_id")
	}

	var request struct {
		ChefID string `json:"chef_id" binding:"required"`
	}

	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Error:   "invalid_request",
			Message: "Chef ID is required",
		})
		return
	}

	err := h.favoriteService.AddFavoriteChef(customerID, request.ChefID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Error:   "creation_error",
			Message: "Failed to add chef to favorites",
		})
		return
	}

	c.JSON(http.StatusCreated, models.APIResponse{
		Success: true,
		Message: "Chef added to favorites successfully",
	})
}

// @Summary Remove chef from favorites
// @Description Remove a chef from customer's favorites
// @Tags Favorites
// @Accept json
// @Produce json
// @Param chef_id path string true "Chef ID"
// @Success 200 {object} models.APIResponse
// @Security BearerAuth
// @Router /customers/favorites/chefs/{chef_id} [delete]
func (h *FavoriteHandler) RemoveFavoriteChef(c *gin.Context) {
	chefID := c.Param("chef_id")
	customerID := c.GetString("customer_id")
	if customerID == "" {
		customerID = c.GetString("user_id")
	}

	err := h.favoriteService.RemoveFavoriteChef(customerID, chefID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Error:   "deletion_error",
			Message: "Failed to remove chef from favorites",
		})
		return
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Message: "Chef removed from favorites successfully",
	})
}

// @Summary Get favorite dishes
// @Description Retrieve all favorite dishes for the authenticated customer
// @Tags Favorites
// @Accept json
// @Produce json
// @Success 200 {object} models.APIResponse{data=[]models.FavoriteDish}
// @Security BearerAuth
// @Router /customers/favorites/dishes [get]
func (h *FavoriteHandler) GetFavoriteDishes(c *gin.Context) {
	customerID := c.GetString("customer_id")
	if customerID == "" {
		customerID = c.GetString("user_id")
	}

	favoriteDishes, err := h.favoriteService.GetFavoriteDishes(customerID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Error:   "database_error",
			Message: "Failed to retrieve favorite dishes",
		})
		return
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Data:    favoriteDishes,
	})
}

// @Summary Add dish to favorites
// @Description Add a dish to customer's favorites
// @Tags Favorites
// @Accept json
// @Produce json
// @Param dish body object{dish_id=string} true "Dish ID"
// @Success 201 {object} models.APIResponse
// @Security BearerAuth
// @Router /customers/favorites/dishes [post]
func (h *FavoriteHandler) AddFavoriteDish(c *gin.Context) {
	customerID := c.GetString("customer_id")
	if customerID == "" {
		customerID = c.GetString("user_id")
	}

	var request struct {
		DishID string `json:"dish_id" binding:"required"`
	}

	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Error:   "invalid_request",
			Message: "Dish ID is required",
		})
		return
	}

	err := h.favoriteService.AddFavoriteDish(customerID, request.DishID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Error:   "creation_error",
			Message: "Failed to add dish to favorites",
		})
		return
	}

	c.JSON(http.StatusCreated, models.APIResponse{
		Success: true,
		Message: "Dish added to favorites successfully",
	})
}