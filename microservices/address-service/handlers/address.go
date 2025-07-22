package handlers

import (
	"net/http"
	"address-service/models"
	"address-service/services"
	"address-service/utils"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type AddressHandler struct {
	addressService *services.AddressService
}

func NewAddressHandler(addressService *services.AddressService) *AddressHandler {
	return &AddressHandler{
		addressService: addressService,
	}
}

// @Summary Get user addresses
// @Description Retrieve all addresses for the authenticated user
// @Tags Addresses
// @Accept json
// @Produce json
// @Success 200 {object} models.APIResponse{data=[]models.Address}
// @Failure 401 {object} models.ErrorResponse
// @Security BearerAuth
// @Router /addresses [get]
func (h *AddressHandler) GetAddresses(c *gin.Context) {
	userID := c.GetString("user_id")

	addresses, err := h.addressService.GetUserAddresses(userID)
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
// @Description Add a new address for the authenticated user
// @Tags Addresses
// @Accept json
// @Produce json
// @Param address body models.AddressCreate true "Address data"
// @Success 201 {object} models.APIResponse
// @Failure 400 {object} models.ErrorResponse
// @Security BearerAuth
// @Router /addresses [post]
func (h *AddressHandler) CreateAddress(c *gin.Context) {
	userID := c.GetString("user_id")
	
	var addressCreate models.AddressCreate
	if err := c.ShouldBindJSON(&addressCreate); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Error:   "invalid_request",
			Message: "Invalid request body",
			Details: utils.GetValidationErrors(err),
		})
		return
	}

	address := &models.Address{
		ID:           uuid.New().String(),
		UserID:       userID,
		Type:         addressCreate.Type,
		Label:        addressCreate.Label,
		FullAddress:  addressCreate.FullAddress,
		Landmark:     addressCreate.Landmark,
		Pincode:      addressCreate.Pincode,
		City:         addressCreate.City,
		State:        addressCreate.State,
		IsDefault:    addressCreate.IsDefault,
		Instructions: addressCreate.Instructions,
	}

	if addressCreate.Coordinates != nil {
		address.Coordinates = *addressCreate.Coordinates
	} else {
		// Geocode the address if coordinates not provided
		coords, err := h.addressService.GeocodeAddress(addressCreate.FullAddress, addressCreate.City, addressCreate.State)
		if err == nil {
			address.Coordinates = coords
		}
	}

	createdAddress, err := h.addressService.CreateAddress(address)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Error:   "database_error",
			Message: "Failed to create address",
		})
		return
	}

	c.JSON(http.StatusCreated, models.APIResponse{
		Success: true,
		Message: "Address created successfully",
		Data:    createdAddress,
	})
}

// @Summary Get address details
// @Description Get details of a specific address
// @Tags Addresses
// @Accept json
// @Produce json
// @Param address_id path string true "Address ID"
// @Success 200 {object} models.APIResponse{data=models.Address}
// @Failure 404 {object} models.ErrorResponse
// @Security BearerAuth
// @Router /addresses/{address_id} [get]
func (h *AddressHandler) GetAddress(c *gin.Context) {
	addressID := c.Param("address_id")
	userID := c.GetString("user_id")

	address, err := h.addressService.GetAddressByID(addressID, userID)
	if err != nil {
		c.JSON(http.StatusNotFound, models.ErrorResponse{
			Error:   "address_not_found",
			Message: "Address not found",
		})
		return
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Data:    address,
	})
}

// @Summary Update address
// @Description Update an existing address
// @Tags Addresses
// @Accept json
// @Produce json
// @Param address_id path string true "Address ID"
// @Param address body models.AddressUpdate true "Address update data"
// @Success 200 {object} models.APIResponse
// @Failure 400 {object} models.ErrorResponse
// @Security BearerAuth
// @Router /addresses/{address_id} [put]
func (h *AddressHandler) UpdateAddress(c *gin.Context) {
	addressID := c.Param("address_id")
	userID := c.GetString("user_id")

	var addressUpdate models.AddressUpdate
	if err := c.ShouldBindJSON(&addressUpdate); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Error:   "invalid_request",
			Message: "Invalid request body",
			Details: utils.GetValidationErrors(err),
		})
		return
	}

	updatedAddress, err := h.addressService.UpdateAddress(addressID, userID, &addressUpdate)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Error:   "database_error",
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
// @Tags Addresses
// @Accept json
// @Produce json
// @Param address_id path string true "Address ID"
// @Success 200 {object} models.APIResponse
// @Security BearerAuth
// @Router /addresses/{address_id} [delete]
func (h *AddressHandler) DeleteAddress(c *gin.Context) {
	addressID := c.Param("address_id")
	userID := c.GetString("user_id")

	err := h.addressService.DeleteAddress(addressID, userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Error:   "database_error",
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
// @Tags Addresses
// @Accept json
// @Produce json
// @Param address_id path string true "Address ID"
// @Success 200 {object} models.APIResponse
// @Security BearerAuth
// @Router /addresses/{address_id}/default [put]
func (h *AddressHandler) SetDefaultAddress(c *gin.Context) {
	addressID := c.Param("address_id")
	userID := c.GetString("user_id")

	err := h.addressService.SetDefaultAddress(addressID, userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Error:   "database_error",
			Message: "Failed to set default address",
		})
		return
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Message: "Default address set successfully",
	})
}

// @Summary Validate address
// @Description Validate an address and check serviceability
// @Tags Addresses
// @Accept json
// @Produce json
// @Param validation body models.AddressValidation true "Address validation data"
// @Success 200 {object} models.APIResponse{data=models.ValidationResult}
// @Failure 400 {object} models.ErrorResponse
// @Router /addresses/validate [post]
func (h *AddressHandler) ValidateAddress(c *gin.Context) {
	var validation models.AddressValidation
	if err := c.ShouldBindJSON(&validation); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Error:   "invalid_request",
			Message: "Invalid request body",
			Details: utils.GetValidationErrors(err),
		})
		return
	}

	result, err := h.addressService.ValidateAddress(&validation)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Error:   "validation_error",
			Message: "Failed to validate address",
		})
		return
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Data:    result,
	})
}