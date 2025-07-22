# Countdown Timer Implementation

## Overview

The 30-second countdown timer provides customers with a free cancellation window immediately after order placement. This document covers the complete implementation including frontend components, backend APIs, and notification system.

## Frontend Implementation

### 1. Timer Component Features

#### Visual Elements:
- **Circular progress indicator** showing time remaining
- **Large countdown number** (30, 29, 28...)
- **Color-coded urgency** (Green → Orange → Red)
- **Prominent cancel button** for easy access
- **Penalty warning** showing cost after expiry

#### User Experience:
- **Modal overlay** that demands attention
- **Cannot be dismissed** accidentally
- **Clear messaging** about free vs penalty cancellation
- **Confirmation dialog** before cancelling
- **Automatic dismissal** after 30 seconds

### 2. Timer States

#### Active Timer (0-30 seconds):
```typescript
interface TimerState {
  isActive: true;
  timeRemaining: number; // 30 to 0
  canCancelFree: true;
  penaltyAmount: 0;
  progressPercentage: number; // 0 to 100
}
```

#### Expired Timer (>30 seconds):
```typescript
interface TimerState {
  isActive: false;
  timeRemaining: 0;
  canCancelFree: false;
  penaltyAmount: number; // 40% of order value
  progressPercentage: 100;
}
```

### 3. Component Integration

#### Cart Screen Integration:
```typescript
// After successful order placement
const handleOrderPlacement = async () => {
  const orderId = await placeOrder(orderData);
  setPlacedOrderId(orderId);
  setShowCountdownTimer(true); // Show timer immediately
};
```

#### Orders Screen Integration:
```typescript
// Check for recent orders needing timer
useEffect(() => {
  const recentOrder = orders.find(order => 
    order.status === 'payment_confirmed' && 
    order.canCancelFree &&
    (Date.now() - order.placedAt.getTime()) < 30000
  );
  
  if (recentOrder) {
    setShowCountdownTimer(recentOrder.id);
  }
}, [orders]);
```

## Backend Implementation

### 1. Order Creation with Timer

#### Create Order API:
```http
POST /orders
{
  "chef_id": "chef_123",
  "items": [...],
  "delivery_address_id": "addr_123"
}
```

#### Response with Timer Info:
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
    }
  }
}
```

### 2. Timer Status Tracking

#### Database Schema:
```sql
CREATE TABLE orders (
  id VARCHAR(255) PRIMARY KEY,
  status VARCHAR(50) NOT NULL,
  placed_at TIMESTAMP NOT NULL,
  free_cancellation_window_seconds INT DEFAULT 30,
  penalty_rate DECIMAL(3,2) DEFAULT 0.40,
  can_cancel_free BOOLEAN GENERATED ALWAYS AS (
    EXTRACT(EPOCH FROM (NOW() - placed_at)) <= free_cancellation_window_seconds
  ) STORED,
  penalty_amount DECIMAL(10,2) GENERATED ALWAYS AS (
    CASE 
      WHEN EXTRACT(EPOCH FROM (NOW() - placed_at)) <= free_cancellation_window_seconds 
      THEN 0 
      ELSE LEAST(GREATEST(total_amount * penalty_rate, 20), 500)
    END
  ) STORED
);
```

### 3. Automatic Order Confirmation

#### Background Job:
```go
func AutoConfirmOrders() {
  // Run every 5 seconds
  orders := getOrdersReadyForConfirmation()
  
  for _, order := range orders {
    if time.Since(order.PlacedAt) >= 30*time.Second {
      confirmOrderAndSendToChef(order.ID)
      notifyCustomerOrderConfirmed(order.CustomerID, order.ID)
      notifyChefNewOrder(order.ChefID, order.ID)
    }
  }
}
```

## Notification System

### 1. Timer Start Notifications

#### Customer Notification:
```json
{
  "title": "Order Placed Successfully! 🎉",
  "body": "You have 30 seconds for free cancellation",
  "data": {
    "order_id": "order_123",
    "countdown_active": true,
    "free_window": 30
  }
}
```

### 2. Timer Expiry Notifications

#### Customer Notification:
```json
{
  "title": "Order Confirmed! 👨‍🍳",
  "body": "Your order has been sent to Chef Priya for preparation",
  "data": {
    "order_id": "order_123",
    "chef_name": "Priya Sharma",
    "status": "sent_to_chef"
  }
}
```

#### Chef Notification:
```json
{
  "title": "New Order Received! 🍽️",
  "body": "Order #order_123 worth ₹300. Please accept or decline.",
  "data": {
    "order_id": "order_123",
    "order_value": 300.00,
    "items_count": 3,
    "customer_distance": "2.3 km"
  }
}
```

### 3. Cancellation Notifications

#### Free Cancellation:
```json
{
  "title": "Order Cancelled Successfully! ✅",
  "body": "Full refund of ₹300 processed immediately",
  "data": {
    "order_id": "order_123",
    "refund_amount": 300.00,
    "refund_type": "immediate"
  }
}
```

#### Penalty Cancellation:
```json
{
  "title": "Order Cancelled",
  "body": "Penalty: ₹120. Refund: ₹180 in 3-5 business days",
  "data": {
    "order_id": "order_123",
    "penalty_amount": 120.00,
    "refund_amount": 180.00,
    "refund_timeline": "3-5 business days"
  }
}
```

## Configuration Management

### 1. Admin Panel Settings

#### Policy Configuration:
```typescript
interface CancellationPolicy {
  freeWindowSeconds: number;     // Default: 30
  penaltyRate: number;          // Default: 0.40 (40%)
  minPenalty: number;           // Default: 20
  maxPenalty: number;           // Default: 500
  description: string;
}
```

#### Update Policy API:
```http
PUT /admin/cancellation-policy
{
  "free_cancellation_window_seconds": 45,
  "penalty_rate": 0.35,
  "min_penalty_amount": 25.00,
  "max_penalty_amount": 600.00
}
```

### 2. Real-time Policy Updates

#### WebSocket Updates:
```json
{
  "event": "policy_updated",
  "data": {
    "free_window": 45,
    "penalty_rate": 0.35,
    "effective_immediately": true
  }
}
```

## Analytics & Monitoring

### 1. Timer Analytics

#### Metrics Tracked:
- **Timer completion rate** (orders not cancelled)
- **Average cancellation time** (when customers cancel)
- **Free vs penalty cancellation ratio**
- **Revenue impact** of cancellation policy

#### Analytics API:
```http
GET /admin/cancellation-analytics?period=month
```

#### Response:
```json
{
  "timer_metrics": {
    "total_orders_with_timer": 1250,
    "timer_completed": 1125,
    "timer_completion_rate": 90.0,
    "avg_cancellation_time": 15.5,
    "free_cancellations": 45,
    "penalty_cancellations": 80
  }
}
```

### 2. Performance Monitoring

#### Key Metrics:
- **Timer accuracy** (±1 second tolerance)
- **Notification delivery time** (<2 seconds)
- **Auto-confirmation latency** (<5 seconds after expiry)
- **UI responsiveness** during countdown

## Error Handling

### 1. Timer Failures

#### Network Issues:
```typescript
// Fallback to local timer if server sync fails
const handleTimerSync = async () => {
  try {
    const serverTime = await getServerCountdown(orderId);
    setTimeRemaining(serverTime.remaining);
  } catch (error) {
    // Continue with local timer
    console.warn('Timer sync failed, using local timer');
  }
};
```

#### Server Errors:
```json
{
  "error": {
    "code": "TIMER_SYNC_FAILED",
    "message": "Unable to sync timer with server",
    "fallback": "local_timer_active"
  }
}
```

### 2. Cancellation Failures

#### Payment Issues:
```json
{
  "error": {
    "code": "REFUND_FAILED",
    "message": "Refund processing failed",
    "retry_available": true,
    "support_contact": "support@homechef.com"
  }
}
```

## Testing Scenarios

### 1. Timer Functionality
- ✅ Timer starts immediately after order placement
- ✅ Countdown displays correctly (30, 29, 28...)
- ✅ Progress bar updates smoothly
- ✅ Color changes at appropriate thresholds
- ✅ Auto-dismissal after 30 seconds

### 2. Cancellation Scenarios
- ✅ Free cancellation within 30 seconds
- ✅ Penalty calculation after 30 seconds
- ✅ Confirmation dialogs work correctly
- ✅ Refund processing notifications

### 3. Edge Cases
- ✅ App backgrounding during timer
- ✅ Network disconnection during countdown
- ✅ Multiple orders placed simultaneously
- ✅ Timer synchronization across devices

## Security Considerations

### 1. Timer Manipulation Prevention
- **Server-side validation** of cancellation timing
- **Encrypted timestamps** in client-server communication
- **Rate limiting** on cancellation attempts
- **Audit logging** of all timer events

### 2. Fraud Prevention
- **IP tracking** for suspicious cancellation patterns
- **Device fingerprinting** for repeat offenders
- **Machine learning** detection of abuse patterns
- **Manual review** for high-value cancellations

This implementation ensures a robust, user-friendly countdown timer system that provides clear cancellation options while protecting business interests through appropriate penalty structures.