package handlers

import (
	"net/http"
	"customer-service/models"
	"customer-service/services"
	"customer-service/utils"

	"github.com/gin-gonic/gin"
)

type PaymentHandler struct {
	paymentService *services.PaymentService
}

func NewPaymentHandler(paymentService *services.PaymentService) *PaymentHandler {
	return &PaymentHandler{
		paymentService: paymentService,
	}
}

// @Summary Get payment methods
// @Description Retrieve all payment methods for the authenticated customer
// @Tags Payment Methods
// @Accept json
// @Produce json
// @Success 200 {object} models.APIResponse{data=[]models.PaymentMethod}
// @Security BearerAuth
// @Router /customers/payment-methods [get]
func (h *PaymentHandler) GetPaymentMethods(c *gin.Context) {
	customerID := c.GetString("customer_id")
	if customerID == "" {
		customerID = c.GetString("user_id")
	}

	paymentMethods, err := h.paymentService.GetCustomerPaymentMethods(customerID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Error:   "database_error",
			Message: "Failed to retrieve payment methods",
		})
		return
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Data:    paymentMethods,
	})
}

// @Summary Add payment method
// @Description Add a new payment method for the authenticated customer
// @Tags Payment Methods
// @Accept json
// @Produce json
// @Param payment_method body models.PaymentMethodCreate true "Payment method data"
// @Success 201 {object} models.APIResponse
// @Failure 400 {object} models.ErrorResponse
// @Security BearerAuth
// @Router /customers/payment-methods [post]
func (h *PaymentHandler) CreatePaymentMethod(c *gin.Context) {
	customerID := c.GetString("customer_id")
	if customerID == "" {
		customerID = c.GetString("user_id")
	}

	var paymentMethodCreate models.PaymentMethodCreate
	if err := c.ShouldBindJSON(&paymentMethodCreate); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Error:   "invalid_request",
			Message: "Invalid request body",
			Details: utils.GetValidationErrors(err),
		})
		return
	}

	paymentMethod, err := h.paymentService.CreatePaymentMethod(customerID, &paymentMethodCreate)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Error:   "creation_error",
			Message: "Failed to create payment method",
		})
		return
	}

	c.JSON(http.StatusCreated, models.APIResponse{
		Success: true,
		Message: "Payment method added successfully",
		Data:    paymentMethod,
	})
}

// @Summary Delete payment method
// @Description Delete a payment method
// @Tags Payment Methods
// @Accept json
// @Produce json
// @Param payment_method_id path string true "Payment Method ID"
// @Success 200 {object} models.APIResponse
// @Security BearerAuth
// @Router /customers/payment-methods/{payment_method_id} [delete]
func (h *PaymentHandler) DeletePaymentMethod(c *gin.Context) {
	paymentMethodID := c.Param("payment_method_id")
	customerID := c.GetString("customer_id")
	if customerID == "" {
		customerID = c.GetString("user_id")
	}

	err := h.paymentService.DeletePaymentMethod(paymentMethodID, customerID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Error:   "deletion_error",
			Message: "Failed to delete payment method",
		})
		return
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Message: "Payment method deleted successfully",
	})
}