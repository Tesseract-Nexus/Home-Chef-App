package handlers

import (
	"net/http"
	"customer-service/models"
	"customer-service/services"
	"customer-service/utils"

	"github.com/gin-gonic/gin"
)

type AddressHandler struct {
	addressService *services.AddressService
}

func NewAddressHandler(addressService *services.AddressService) *AddressHandler {
	return &AddressHandler{
		addressService: addressService,
	}
}

// @Summary Get customer addresses
// @Description Retrieve all addresses for the authenticated customer
// @Tags Address Management
// @Accept json
// @Produce json
// @Success 200 {object} models.APIResponse{data=[]models.CustomerAddress}
// @Security BearerAuth
// @Router /customers/addresses [get]
func (h *AddressHandler) GetAddresses(c *gin.Context) {
	customerID := c.GetString("customer_id")
	if customerID == "" {
		customerID = c.GetString("user_id")
	}

	addresses, err := h.addressService.GetCustomerAddresses(customerID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Error:   "database_error",
			Message: "Failed to retrieve addresses",
		})
		return
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Data:    addresses,
	})
}

// @Summary Add new address
// @Description Add a new address for the authenticated customer
// @Tags Address Management
// @Accept json
// @Produce json
// @Param address body models.AddressCreate true "Address data"
// @Success 201 {object} models.APIResponse
// @Failure 400 {object} models.ErrorResponse
// @Security BearerAuth
// @Router /customers/addresses [post]
func (h *AddressHandler) CreateAddress(c *gin.Context) {
	customerID := c.GetString("customer_id")
	if customerID == "" {
		customerID = c.GetString("user_id")
	}

	var addressCreate models.AddressCreate
	if err := c.ShouldBindJSON(&addressCreate); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Error:   "invalid_request",
			Message: "Invalid request body",
			Details: utils.GetValidationErrors(err),
		})
		return
	}

	address, err := h.addressService.CreateAddress(customerID, &addressCreate)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Error:   "creation_error",
			Message: "Failed to create address",
		})
		return
	}

	c.JSON(http.StatusCreated, models.APIResponse{
		Success: true,
		Message: "Address created successfully",
		Data:    address,
	})
}

// @Summary Update address
// @Description Update an existing address
// @Tags Address Management
// @Accept json
// @Produce json
// @Param address_id path string true "Address ID"
// @Param address body models.AddressUpdate true "Address update data"
// @Success 200 {object} models.APIResponse
// @Security BearerAuth
// @Router /customers/addresses/{address_id} [put]
func (h *AddressHandler) UpdateAddress(c *gin.Context) {
	addressID := c.Param("address_id")
	customerID := c.GetString("customer_id")
	if customerID == "" {
		customerID = c.GetString("user_id")
	}

	var addressUpdate models.AddressUpdate
	if err := c.ShouldBindJSON(&addressUpdate); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Error:   "invalid_request",
			Message: "Invalid request body",
			Details: utils.GetValidationErrors(err),
		})
		return
	}

	updatedAddress, err := h.addressService.UpdateAddress(addressID, customerID, &addressUpdate)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Error:   "update_error",
			Message: "Failed to update address",
		})
		return
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Message: "Address updated successfully",
		Data:    updatedAddress,
	})
}

// @Summary Delete address
// @Description Delete an address
// @Tags Address Management
// @Accept json
// @Produce json
// @Param address_id path string true "Address ID"
// @Success 200 {object} models.APIResponse
// @Security BearerAuth
// @Router /customers/addresses/{address_id} [delete]
func (h *AddressHandler) DeleteAddress(c *gin.Context) {
	addressID := c.Param("address_id")
	customerID := c.GetString("customer_id")
	if customerID == "" {
		customerID = c.GetString("user_id")
	}

	err := h.addressService.DeleteAddress(addressID, customerID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Error:   "deletion_error",
			Message: "Failed to delete address",
		})
		return
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Message: "Address deleted successfully",
	})
}

// @Summary Set default address
// @Description Set an address as the default address
// @Tags Address Management
// @Accept json
// @Produce json
// @Param address_id path string true "Address ID"
// @Success 200 {object} models.APIResponse
// @Security BearerAuth
// @Router /customers/addresses/{address_id}/default [put]
func (h *AddressHandler) SetDefaultAddress(c *gin.Context) {
	addressID := c.Param("address_id")
	customerID := c.GetString("customer_id")
	if customerID == "" {
		customerID = c.GetString("user_id")
	}

	err := h.addressService.SetDefaultAddress(addressID, customerID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Error:   "update_error",
			Message: "Failed to set default address",
		})
		return
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Message: "Default address set successfully",
	})
}