# API Implementation Guide

## Overview

This guide provides comprehensive implementation details for all HomeChef API endpoints, including the 30-second countdown timer, order cancellation policy, and complete order management system.

## Core Features Implementation

### 1. Order Management with Countdown Timer

#### Order Placement Flow
```http
POST /orders
{
  "chef_id": "chef_123",
  "items": [
    {
      "dish_id": "dish_123",
      "quantity": 2,
      "special_instructions": "Less spicy"
    }
  ],
  "delivery_address_id": "addr_123",
  "delivery_instructions": "Ring the bell twice"
}
```

**Response with Countdown Timer:**
```json
{
  "success": true,
  "data": {
    "order_id": "order_123",
    "status": "payment_confirmed",
    "countdown_timer": {
      "free_cancellation_window": 30,
      "time_remaining": 30,
      "can_cancel_free": true,
      "penalty_after_expiry": 120.00
    },
    "total_amount": 300.00,
    "estimated_delivery": "2024-01-15T13:30:00Z"
  }
}
```

#### Backend Implementation (Go)
```go
type Order struct {
    ID                    string    `json:"id" db:"id"`
    CustomerID           string    `json:"customer_id" db:"customer_id"`
    ChefID               string    `json:"chef_id" db:"chef_id"`
    Status               string    `json:"status" db:"status"`
    Total                float64   `json:"total" db:"total"`
    PlacedAt             time.Time `json:"placed_at" db:"placed_at"`
    FreeCancellationWindow int     `json:"free_cancellation_window" db:"free_cancellation_window"`
    PenaltyRate          float64   `json:"penalty_rate" db:"penalty_rate"`
}

func (o *Order) CanCancelFree() bool {
    elapsed := time.Since(o.PlacedAt).Seconds()
    return elapsed <= float64(o.FreeCancellationWindow)
}

func (o *Order) GetPenaltyAmount() float64 {
    if o.CanCancelFree() {
        return 0
    }
    penalty := o.Total * o.PenaltyRate
    return math.Min(math.Max(penalty, 20), 500) // Min ₹20, Max ₹500
}
```

### 2. Chef Search and Filtering

#### Advanced Search Implementation
```http
GET /chefs/search?cuisine_type=north_indian,punjabi&rating_min=4.5&has_offers=true&distance_max=5
```

**Backend Implementation:**
```go
type ChefSearchParams struct {
    Query         string   `query:"q"`
    CuisineTypes  []string `query:"cuisine_type"`
    RatingMin     float64  `query:"rating_min"`
    DeliveryTimeMax int    `query:"delivery_time_max"`
    HasOffers     bool     `query:"has_offers"`
    DistanceMax   float64  `query:"distance_max"`
    Sort          string   `query:"sort"`
    Page          int      `query:"page"`
    Limit         int      `query:"limit"`
}

func SearchChefs(params ChefSearchParams) ([]Chef, error) {
    query := `
        SELECT * FROM chefs 
        WHERE is_active = true
        AND ($1 = '' OR name ILIKE '%' || $1 || '%' OR specialty ILIKE '%' || $1 || '%')
        AND ($2::text[] IS NULL OR cuisine_types && $2)
        AND rating >= $3
        AND ($4 = 0 OR avg_delivery_time <= $4)
        AND ($5 = false OR has_active_offers = true)
        ORDER BY ` + getSortClause(params.Sort) + `
        LIMIT $6 OFFSET $7
    `
    
    offset := (params.Page - 1) * params.Limit
    rows, err := db.Query(query, params.Query, pq.Array(params.CuisineTypes), 
                         params.RatingMin, params.DeliveryTimeMax, params.HasOffers, 
                         params.Limit, offset)
    // ... handle results
}
```

### 3. Tipping System with Direct Bank Transfer

#### Tip Processing
```http
POST /orders/{order_id}/tip
{
  "recipient_type": "chef",
  "amount": 50.00,
  "message": "Amazing food!"
}
```

**Backend Implementation:**
```go
type TipRequest struct {
    RecipientType string  `json:"recipient_type" validate:"required,oneof=chef delivery"`
    Amount        float64 `json:"amount" validate:"required,min=10,max=500"`
    Message       string  `json:"message" validate:"max=200"`
}

func ProcessTip(orderID string, req TipRequest, customerID string) error {
    // Validate order and recipient
    order, err := getOrder(orderID)
    if err != nil || order.Status != "delivered" {
        return errors.New("can only tip after order delivery")
    }
    
    // Get recipient bank details
    var recipientID string
    if req.RecipientType == "chef" {
        recipientID = order.ChefID
    } else {
        recipientID = order.DeliveryPartnerID
    }
    
    bankDetails, err := getRecipientBankDetails(recipientID)
    if err != nil {
        return err
    }
    
    // Process direct bank transfer
    transferID, err := bankingService.DirectTransfer(
        req.Amount,
        bankDetails.AccountNumber,
        bankDetails.IFSCCode,
        fmt.Sprintf("Tip from HomeChef customer - Order %s", orderID),
    )
    
    if err != nil {
        return err
    }
    
    // Save tip record
    tip := Tip{
        ID:            generateTipID(),
        OrderID:       orderID,
        CustomerID:    customerID,
        RecipientID:   recipientID,
        RecipientType: req.RecipientType,
        Amount:        req.Amount,
        Message:       req.Message,
        TransferID:    transferID,
        Status:        "completed",
        CreatedAt:     time.Now(),
    }
    
    err = saveTip(tip)
    if err != nil {
        return err
    }
    
    // Send notifications
    notifyTipReceived(recipientID, req.Amount, req.Message)
    notifyTipSent(customerID, req.Amount, getRecipientName(recipientID))
    
    return nil
}
```

### 4. Real-time Order Status Updates

#### WebSocket Implementation
```go
type OrderStatusUpdate struct {
    OrderID   string    `json:"order_id"`
    Status    string    `json:"status"`
    Message   string    `json:"message"`
    Timestamp time.Time `json:"timestamp"`
    ETA       *string   `json:"eta,omitempty"`
}

func UpdateOrderStatus(orderID string, status string, message string) error {
    // Update database
    err := updateOrderInDB(orderID, status, message)
    if err != nil {
        return err
    }
    
    // Send real-time updates via WebSocket
    update := OrderStatusUpdate{
        OrderID:   orderID,
        Status:    status,
        Message:   message,
        Timestamp: time.Now(),
    }
    
    // Notify customer
    websocketManager.SendToUser(order.CustomerID, "order_status_update", update)
    
    // Send push notifications
    sendOrderStatusNotification(order.CustomerID, status, message)
    
    return nil
}
```

### 5. Rewards System Implementation

#### Token Earning and Redemption
```go
type RewardsService struct {
    db *sql.DB
}

func (r *RewardsService) EarnTokens(userID string, orderID string, orderAmount float64) error {
    // Calculate tokens (1 token per ₹10 spent)
    baseTokens := int(orderAmount / 10)
    
    // Apply multiplier for subscribers
    user, _ := getUserByID(userID)
    multiplier := 1.0
    if user.HasActiveSubscription {
        multiplier = 3.0 // 3x tokens for premium users
    }
    
    tokensEarned := int(float64(baseTokens) * multiplier)
    
    // Update user rewards
    _, err := r.db.Exec(`
        UPDATE user_rewards 
        SET total_tokens = total_tokens + $1,
            lifetime_earned = lifetime_earned + $1
        WHERE user_id = $2
    `, tokensEarned, userID)
    
    if err != nil {
        return err
    }
    
    // Record transaction
    transaction := RewardTransaction{
        ID:          generateTransactionID(),
        UserID:      userID,
        Type:        "earned",
        Amount:      tokensEarned,
        Description: fmt.Sprintf("Order #%s - ₹%.2f", orderID, orderAmount),
        OrderID:     &orderID,
        CreatedAt:   time.Now(),
    }
    
    return r.saveTransaction(transaction)
}
```

### 6. Admin Analytics Implementation

#### Platform Analytics
```go
type PlatformAnalytics struct {
    Revenue struct {
        Total      float64 `json:"total"`
        Growth     float64 `json:"growth"`
        Breakdown  map[string]float64 `json:"breakdown"`
    } `json:"revenue"`
    Orders struct {
        Total          int     `json:"total"`
        CompletionRate float64 `json:"completion_rate"`
        AvgOrderValue  float64 `json:"avg_order_value"`
    } `json:"orders"`
    Users struct {
        TotalActive    int     `json:"total_active"`
        NewUsers       int     `json:"new_users"`
        RetentionRate  float64 `json:"retention_rate"`
    } `json:"users"`
}

func GetPlatformAnalytics(period string) (*PlatformAnalytics, error) {
    analytics := &PlatformAnalytics{}
    
    // Revenue analytics
    revenueQuery := `
        SELECT 
            SUM(total) as total_revenue,
            COUNT(*) as total_orders,
            AVG(total) as avg_order_value
        FROM orders 
        WHERE created_at >= $1 AND status = 'delivered'
    `
    
    startDate := getPeriodStartDate(period)
    row := db.QueryRow(revenueQuery, startDate)
    
    var totalRevenue, avgOrderValue float64
    var totalOrders int
    err := row.Scan(&totalRevenue, &totalOrders, &avgOrderValue)
    if err != nil {
        return nil, err
    }
    
    analytics.Revenue.Total = totalRevenue
    analytics.Orders.Total = totalOrders
    analytics.Orders.AvgOrderValue = avgOrderValue
    
    // Calculate growth rate
    prevPeriodRevenue := getPreviousPeriodRevenue(period)
    if prevPeriodRevenue > 0 {
        analytics.Revenue.Growth = ((totalRevenue - prevPeriodRevenue) / prevPeriodRevenue) * 100
    }
    
    return analytics, nil
}
```

## Database Schema

### Core Tables
```sql
-- Orders table with countdown timer support
CREATE TABLE orders (
    id VARCHAR(255) PRIMARY KEY,
    customer_id VARCHAR(255) NOT NULL,
    chef_id VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL,
    total DECIMAL(10,2) NOT NULL,
    placed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    free_cancellation_window_seconds INT DEFAULT 30,
    penalty_rate DECIMAL(3,2) DEFAULT 0.40,
    can_cancel_free BOOLEAN GENERATED ALWAYS AS (
        EXTRACT(EPOCH FROM (NOW() - placed_at)) <= free_cancellation_window_seconds
    ) STORED,
    penalty_amount DECIMAL(10,2) GENERATED ALWAYS AS (
        CASE 
            WHEN EXTRACT(EPOCH FROM (NOW() - placed_at)) <= free_cancellation_window_seconds 
            THEN 0 
            ELSE LEAST(GREATEST(total * penalty_rate, 20), 500)
        END
    ) STORED,
    FOREIGN KEY (customer_id) REFERENCES users(id),
    FOREIGN KEY (chef_id) REFERENCES chefs(id)
);

-- Tips table for direct bank transfers
CREATE TABLE tips (
    id VARCHAR(255) PRIMARY KEY,
    order_id VARCHAR(255) NOT NULL,
    customer_id VARCHAR(255) NOT NULL,
    recipient_id VARCHAR(255) NOT NULL,
    recipient_type ENUM('chef', 'delivery') NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    message TEXT,
    transfer_id VARCHAR(255),
    status ENUM('pending', 'completed', 'failed') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id),
    UNIQUE KEY unique_tip_per_recipient (order_id, recipient_type)
);

-- Rewards table
CREATE TABLE user_rewards (
    user_id VARCHAR(255) PRIMARY KEY,
    total_tokens INT DEFAULT 0,
    lifetime_earned INT DEFAULT 0,
    lifetime_redeemed INT DEFAULT 0,
    current_streak INT DEFAULT 0,
    tier ENUM('bronze', 'silver', 'gold', 'platinum') DEFAULT 'bronze',
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Chef search optimization
CREATE INDEX idx_chefs_search ON chefs(rating DESC, avg_delivery_time ASC);
CREATE INDEX idx_chefs_cuisine ON chefs USING GIN(cuisine_types);
CREATE INDEX idx_chefs_location ON chefs USING GIST(location);
```

## Error Handling

### Standard Error Response
```json
{
  "success": false,
  "error": {
    "code": "ORDER_CANCEL_001",
    "message": "Cannot cancel order at this stage",
    "details": {
      "current_status": "preparing",
      "cancellation_window_expired": true,
      "penalty_amount": 120.00
    }
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### Error Codes Reference
- **ORDER_CANCEL_001**: Cannot cancel order
- **ORDER_TIMER_001**: Timer not active
- **TIP_001**: Invalid tip amount
- **REWARDS_001**: Insufficient tokens
- **CHEF_001**: Chef not found
- **AUTH_001**: Invalid credentials

## Rate Limiting

- **Authenticated users**: 1000 requests/hour
- **Order placement**: 10 orders/hour per user
- **Tip processing**: 20 tips/hour per user
- **Search requests**: 100 requests/minute

## Security Measures

### Authentication
- JWT tokens with 1-hour expiry
- Refresh tokens with 30-day expiry
- Role-based access control
- Rate limiting per user and IP

### Data Protection
- PCI DSS compliance for payments
- Encrypted bank details storage
- GDPR compliance for EU users
- Audit trails for all transactions

This comprehensive API documentation covers all implemented features with proper contracts, error handling, and security measures.