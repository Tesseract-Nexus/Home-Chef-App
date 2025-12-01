package controllers

import (
	"net/http"
	"os"

	"github.com/Agent-Sphere/home-chef-app/apps/api/database"
	"github.com/Agent-Sphere/home-chef-app/apps/api/models"
	"github.com/gin-gonic/gin"
	"github.com/stripe/stripe-go/v72"
	"github.com/stripe/stripe-go/v72/paymentintent"
)

func CreatePaymentIntent(c *gin.Context) {
	// This is a simplified version. In a real app, you would:
	// 1. Get the authenticated user.
	// 2. Get the order from your database.
	// 3. Ensure the user owns the order and it hasn't been paid for.
	
	var body struct {
		OrderID uint `json:"order_id"`
	}

	if c.Bind(&body) != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to read body"})
		return
	}

	// Find the order
	var order models.Order
	database.DB.First(&order, body.OrderID)
	if order.ID == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Order not found"})
		return
	}

	// Initialize Stripe
	stripe.Key = os.Getenv("STRIPE_SECRET_KEY")

	// Create a PaymentIntent with the order amount and currency
	params := &stripe.PaymentIntentParams{
		Amount:   stripe.Int64(int64(order.TotalAmount * 100)), // Amount in cents
		Currency: stripe.String(string(stripe.CurrencyUSD)), // Or your desired currency
		AutomaticPaymentMethods: &stripe.PaymentIntentAutomaticPaymentMethodsParams{
			Enabled: stripe.Bool(true),
		},
	}

	pi, err := paymentintent.New(params)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create payment intent"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"clientSecret": pi.ClientSecret,
	})
}
