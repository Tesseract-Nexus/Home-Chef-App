package handlers

import (
	"net/http"
	"inventory-service/models"

	"github.com/gin-gonic/gin"
)

type SupplierHandler struct {
	// Dependencies would be injected here
}

func NewSupplierHandler() *SupplierHandler {
	return &SupplierHandler{}
}

// @Summary Get supplier information
// @Description Get list of suppliers with filtering
// @Tags Suppliers
// @Accept json
// @Produce json
// @Param location query string false "Filter by location"
// @Param category query string false "Filter by category"
// @Success 200 {object} models.APIResponse{data=[]models.Supplier}
// @Security BearerAuth
// @Router /inventory/suppliers [get]
func (h *SupplierHandler) GetSuppliers(c *gin.Context) {
	location := c.Query("location")
	category := c.Query("category")

	// TODO: Fetch suppliers from database with filters
	suppliers := []models.Supplier{
		{
			ID:          "supplier-1",
			Name:        "Fresh Vegetables Co.",
			ContactInfo: `{"phone": "+919876543210", "email": "contact@freshveggies.com"}`,
			Location:    "Mumbai",
			Categories:  `["vegetables", "fruits"]`,
			Rating:      4.5,
			IsActive:    true,
		},
		{
			ID:          "supplier-2",
			Name:        "Spice World",
			ContactInfo: `{"phone": "+919876543211", "email": "orders@spiceworld.com"}`,
			Location:    "Delhi",
			Categories:  `["spices", "condiments"]`,
			Rating:      4.8,
			IsActive:    true,
		},
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Data:    suppliers,
	})
}