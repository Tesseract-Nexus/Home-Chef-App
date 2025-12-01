package controllers

import (
	"net/http"
	"time"

	"github.com/Agent-Sphere/home-chef-app/apps/api/database"
	"github.com/Agent-Sphere/home-chef-app/apps/api/models"
	"github.com/gin-gonic/gin"
)

func AddItemToCart(c *gin.Context) {
	user, _ := c.Get("user")
	authedUser := user.(models.User)

	var body struct {
		MenuItemID uint `json:"menu_item_id"`
		Quantity   uint `json:"quantity"`
	}

	if c.Bind(&body) != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to read body"})
		return
	}

	// Find the menu item
	var menuItem models.MenuItem
	database.DB.First(&menuItem, body.MenuItemID)
	if menuItem.ID == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Menu item not found"})
		return
	}

	// Find or create the user's cart
	var cart models.Cart
	database.DB.Preload("CartItems.MenuItem").FirstOrCreate(&cart, models.Cart{UserID: authedUser.ID})

	// Enforce single-chef cart
	if len(cart.CartItems) > 0 && cart.CartItems[0].MenuItem.ChefProfileID != menuItem.ChefProfileID {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Your cart contains items from a different chef. Please clear your cart before adding items from a new chef."})
		return
	}
	
	// Check if item already in cart
	var cartItem models.CartItem
	result := database.DB.Where("cart_id = ? AND menu_item_id = ?", cart.ID, body.MenuItemID).First(&cartItem)

	if result.Error == nil { // Item already in cart, update quantity
		cartItem.Quantity += body.Quantity
		database.DB.Save(&cartItem)
	} else { // Item not in cart, create new cart item
		cartItem = models.CartItem{
			CartID:     cart.ID,
			MenuItemID: body.MenuItemID,
			Quantity:   body.Quantity,
		}
		database.DB.Create(&cartItem)
	}

	// Load cart with preloaded items for response
	database.DB.Preload("CartItems.MenuItem").First(&cart, cart.ID)

	c.JSON(http.StatusOK, gin.H{"cart": cart})
}

func RemoveItemFromCart(c *gin.Context) {
	user, _ := c.Get("user")
	authedUser := user.(models.User)
	cartItemID := c.Param("cart_item_id")

	var cart models.Cart
	database.DB.First(&cart, "user_id = ?", authedUser.ID)
	if cart.ID == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Cart not found"})
		return
	}

	var cartItem models.CartItem
	result := database.DB.Where("cart_id = ? AND id = ?", cart.ID, cartItemID).First(&cartItem)
	if result.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Cart item not found"})
		return
	}

	database.DB.Delete(&cartItem)
	c.JSON(http.StatusOK, gin.H{"message": "Item removed from cart"})
}

func UpdateCartItemQuantity(c *gin.Context) {
	user, _ := c.Get("user")
	authedUser := user.(models.User)
	cartItemID := c.Param("cart_item_id")

	var body struct {
		Quantity uint `json:"quantity"`
	}
	if c.Bind(&body) != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to read body"})
		return
	}

	if body.Quantity == 0 {
		RemoveItemFromCart(c) // If quantity is 0, remove the item
		return
	}

	var cart models.Cart
	database.DB.First(&cart, "user_id = ?", authedUser.ID)
	if cart.ID == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Cart not found"})
		return
	}

	var cartItem models.CartItem
	result := database.DB.Where("cart_id = ? AND id = ?", cart.ID, cartItemID).First(&cartItem)
	if result.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Cart item not found"})
		return
	}

	cartItem.Quantity = body.Quantity
	database.DB.Save(&cartItem)
	c.JSON(http.StatusOK, gin.H{"cartItem": cartItem})
}

func GetCart(c *gin.Context) {
	user, _ := c.Get("user")
	authedUser := user.(models.User)

	var cart models.Cart
	database.DB.Preload("CartItems.MenuItem.ChefProfile.User").First(&cart, "user_id = ?", authedUser.ID)

	if cart.ID == 0 {
		c.JSON(http.StatusOK, gin.H{"cart": models.Cart{UserID: authedUser.ID, CartItems: []models.CartItem{}}})
		return
	}
	c.JSON(http.StatusOK, gin.H{"cart": cart})
}

func Checkout(c *gin.Context) {
	user, _ := c.Get("user")
	authedUser := user.(models.User)

	var cart models.Cart
	database.DB.Preload("CartItems.MenuItem").First(&cart, "user_id = ?", authedUser.ID)
	if cart.ID == 0 || len(cart.CartItems) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Cart is empty"})
		return
	}

	// Since we enforce a single-chef cart, we can create one order
	var totalAmount float64
	var orderItems []models.OrderItem
	var chefProfileID uint

	for _, item := range cart.CartItems {
		totalAmount += item.MenuItem.Price * float64(item.Quantity)
		orderItems = append(orderItems, models.OrderItem{
			MenuItemID:   item.MenuItemID,
			Quantity:     item.Quantity,
			PriceAtOrder: item.MenuItem.Price,
		})
		chefProfileID = item.MenuItem.ChefProfileID
	}

	// Placeholder for delivery address
	deliveryAddress := "User's default address" // This would come from frontend or user profile

	order := models.Order{
		UserID:          authedUser.ID,
		ChefProfileID:   chefProfileID,
		OrderItems:      orderItems,
		Status:          models.OrderStatusPending,
		TotalAmount:     totalAmount,
		OrderDate:       time.Now(),
		DeliveryAddress: deliveryAddress,
	}

	result := database.DB.Create(&order)
	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create order"})
		return
	}

	// Award points
	pointsToAdd := int(totalAmount) // 1 point per dollar
	authedUser.Points += pointsToAdd
	database.DB.Save(&authedUser)

	// Clear the cart
	database.DB.Where("cart_id = ?", cart.ID).Delete(&models.CartItem{})

	c.JSON(http.StatusOK, gin.H{"order": order, "message": "Checkout successful, proceeding to payment"})
}
