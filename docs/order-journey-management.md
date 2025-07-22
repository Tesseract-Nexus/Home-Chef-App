# Order Journey Management

## Overview

Complete order lifecycle management from placement to delivery with 30-second free cancellation window, chef acceptance, delivery partner assignment, and tipping system.

## Order Journey Flow

### 1. Order Placement & Countdown Timer

#### Place Order
```http
POST /orders
Authorization: Bearer <customer_token>
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
  "payment_method_id": "pm_123",
  "delivery_instructions": "Ring the bell twice"
}
```

**Response**:
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

#### Get Countdown Status
```http
GET /orders/{order_id}/countdown-status
Authorization: Bearer <customer_token>
```

**Response**:
```json
{
  "success": true,
  "data": {
    "order_id": "order_123",
    "is_active": true,
    "time_remaining": 15,
    "total_window": 30,
    "progress_percentage": 50.0,
    "can_cancel_free": true,
    "penalty_after_expiry": 120.00
  }
}
```

### 2. Order Cancellation

#### Cancel Within 30 Seconds (Free)
```http
POST /orders/{order_id}/cancel
Authorization: Bearer <customer_token>
{
  "reason": "customer_request",
  "notes": "Changed mind"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "order_id": "order_123",
    "cancellation_type": "free",
    "penalty_amount": 0.00,
    "refund_amount": 300.00,
    "refund_timeline": "Immediate",
    "cancelled_at": "2024-01-15T12:00:25Z"
  }
}
```

#### Cancel After 30 Seconds (Penalty)
```http
POST /orders/{order_id}/cancel
Authorization: Bearer <customer_token>
{
  "reason": "customer_request",
  "notes": "Emergency came up"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "order_id": "order_123",
    "cancellation_type": "penalty",
    "penalty_amount": 120.00,
    "refund_amount": 180.00,
    "refund_timeline": "3-5 business days",
    "cancelled_at": "2024-01-15T12:02:15Z"
  }
}
```

### 3. Order Confirmation & Chef Assignment

#### Confirm Order After Timer
```http
POST /orders/{order_id}/confirm-after-timer
Authorization: Bearer <system_token>
```

**Response**:
```json
{
  "success": true,
  "data": {
    "order_id": "order_123",
    "status": "sent_to_chef",
    "chef_notified": true,
    "customer_notified": true,
    "sent_at": "2024-01-15T12:00:30Z"
  }
}
```

### 4. Chef Operations

#### Chef Accepts Order
```http
POST /orders/{order_id}/chef-accept
Authorization: Bearer <chef_token>
{
  "estimated_preparation_time": 25,
  "notes": "Will start preparing immediately"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "order_id": "order_123",
    "status": "chef_accepted",
    "estimated_delivery_time": "2024-01-15T13:25:00Z",
    "delivery_partners_notified": 5
  }
}
```

#### Chef Declines Order
```http
POST /orders/{order_id}/chef-decline
Authorization: Bearer <chef_token>
{
  "reason": "out_of_ingredients",
  "notes": "Main ingredient not available"
}
```

### 5. Delivery Partner Assignment

#### Get Available Orders (Delivery Partner)
```http
GET /delivery/orders/available
Authorization: Bearer <delivery_token>
?latitude=19.0596&longitude=72.8295&radius=5&limit=10
```

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "order_id": "order_123",
      "customer_name": "John Doe",
      "chef_name": "Priya Sharma",
      "pickup_location": {
        "address": "123 Chef Street, Mumbai",
        "coordinates": {
          "latitude": 19.0596,
          "longitude": 72.8295
        }
      },
      "delivery_location": {
        "address": "456 Customer Road, Mumbai",
        "coordinates": {
          "latitude": 19.0544,
          "longitude": 72.8347
        }
      },
      "distance": 2.3,
      "estimated_earnings": 85.00,
      "order_value": 300.00,
      "estimated_delivery_time": 25,
      "priority": "medium"
    }
  ]
}
```

#### Accept Delivery Order
```http
POST /delivery/orders/{order_id}/accept
Authorization: Bearer <delivery_token>
{
  "estimated_pickup_time": "2024-01-15T13:30:00Z",
  "current_location": {
    "latitude": 19.0580,
    "longitude": 72.8310
  }
}
```

### 6. Order Status Updates

#### Update Order Status
```http
PUT /orders/{order_id}/update-status
Authorization: Bearer <token>
{
  "status": "preparing",
  "message": "Chef started preparing your order",
  "estimated_time": "20 minutes"
}
```

**Status Flow**:
1. `payment_confirmed` → Customer has 30 seconds to cancel
2. `sent_to_chef` → Order sent to chef for acceptance
3. `chef_accepted` → Chef accepted with ETA
4. `preparing` → Chef is preparing the order
5. `ready_for_pickup` → Order ready for delivery partner
6. `delivery_assigned` → Delivery partner assigned
7. `picked_up` → Order collected from chef
8. `out_for_delivery` → On the way to customer
9. `delivered` → Order completed

### 7. Tipping System

#### Add Tip for Chef
```http
POST /orders/{order_id}/tip
Authorization: Bearer <customer_token>
{
  "recipient_type": "chef",
  "amount": 50.00,
  "message": "Amazing food, thank you!"
}
```

#### Add Tip for Delivery Partner
```http
POST /orders/{order_id}/tip
Authorization: Bearer <customer_token>
{
  "recipient_type": "delivery",
  "amount": 30.00,
  "message": "Super fast delivery!"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "tip_id": "tip_123",
    "amount": 50.00,
    "recipient_notified": true,
    "direct_transfer_initiated": true,
    "transfer_timeline": "Immediate to bank account"
  }
}
```

## Notification System

### Order Placement Notifications
```http
POST /orders/{order_id}/notifications
{
  "notification_type": "status_update",
  "recipients": [
    {
      "user_id": "customer_123",
      "user_type": "customer"
    }
  ],
  "message": "Order placed successfully! 30 seconds for free cancellation.",
  "data": {
    "countdown_active": true,
    "free_cancellation_window": 30
  }
}
```

### Chef Assignment Notifications
```http
POST /orders/{order_id}/notifications
{
  "notification_type": "chef_assigned",
  "recipients": [
    {
      "user_id": "chef_123",
      "user_type": "chef"
    }
  ],
  "message": "New order received! Please accept or decline.",
  "data": {
    "order_value": 300.00,
    "items_count": 3,
    "customer_location": "2.3 km away"
  }
}
```

### Delivery Partner Notifications
```http
POST /orders/{order_id}/notifications
{
  "notification_type": "delivery_assigned",
  "recipients": [
    {
      "user_id": "delivery_123",
      "user_type": "delivery"
    }
  ],
  "message": "New delivery available! Earnings: ₹85",
  "data": {
    "pickup_location": "Priya's Kitchen",
    "delivery_distance": "2.3 km",
    "estimated_earnings": 85.00
  }
}
```

## Admin Policy Management

### Get Current Policy
```http
GET /admin/cancellation-policy
Authorization: Bearer <admin_token>
```

**Response**:
```json
{
  "success": true,
  "data": {
    "free_cancellation_window_seconds": 30,
    "penalty_rate": 0.40,
    "min_penalty_amount": 20.00,
    "max_penalty_amount": 500.00,
    "policy_description": "Orders can be cancelled for free within 30 seconds",
    "last_updated": "2024-01-15T10:00:00Z",
    "updated_by": "admin_123"
  }
}
```

### Update Policy
```http
PUT /admin/cancellation-policy
Authorization: Bearer <admin_token>
{
  "free_cancellation_window_seconds": 45,
  "penalty_rate": 0.35,
  "min_penalty_amount": 25.00,
  "max_penalty_amount": 600.00,
  "policy_description": "Updated cancellation policy"
}
```

## Analytics & Reporting

### Get Cancellation Analytics
```http
GET /admin/cancellation-analytics
Authorization: Bearer <admin_token>
?period=month&group_by=day
```

**Response**:
```json
{
  "success": true,
  "data": {
    "period": "month",
    "total_orders": 1250,
    "total_cancellations": 125,
    "cancellation_rate": 10.0,
    "free_cancellations": {
      "count": 45,
      "percentage": 36.0
    },
    "penalty_cancellations": {
      "count": 80,
      "percentage": 64.0,
      "total_penalty_collected": 12500.00,
      "avg_penalty_amount": 156.25
    },
    "cancellation_reasons": [
      {
        "reason": "customer_request",
        "count": 89,
        "percentage": 71.2
      },
      {
        "reason": "chef_unavailable",
        "count": 25,
        "percentage": 20.0
      }
    ],
    "time_distribution": {
      "within_30_seconds": 45,
      "after_30_seconds": 80,
      "avg_cancellation_time": 125.5
    }
  }
}
```

## Error Codes

| Code | Message | Description |
|------|---------|-------------|
| ORDER_CANCEL_001 | Cannot cancel order | Order status doesn't allow cancellation |
| ORDER_CANCEL_002 | Cancellation window expired | Free cancellation window has expired |
| ORDER_CANCEL_003 | Invalid cancellation reason | Provided reason is not valid |
| ORDER_CANCEL_004 | Penalty calculation failed | Error calculating penalty amount |
| ORDER_CANCEL_005 | Refund processing failed | Error processing refund |
| ORDER_TIMER_001 | Timer not active | Countdown timer is not active for order |
| ORDER_TIMER_002 | Timer expired | Countdown timer has already expired |
| ORDER_CHEF_001 | Chef not found | Chef ID doesn't exist |
| ORDER_CHEF_002 | Chef unavailable | Chef is not accepting orders |
| ORDER_DELIVERY_001 | No delivery partners | No delivery partners available |
| ORDER_DELIVERY_002 | Delivery assignment failed | Failed to assign delivery partner |

## Webhook Events

### Order Cancellation Webhook
```json
{
  "event": "order.cancelled",
  "data": {
    "order_id": "order_123",
    "cancellation_type": "free",
    "penalty_amount": 0.00,
    "refund_amount": 300.00,
    "cancelled_by": "customer_123",
    "reason": "customer_request",
    "timestamp": "2024-01-15T12:00:25Z"
  }
}
```

### Order Confirmation Webhook
```json
{
  "event": "order.confirmed",
  "data": {
    "order_id": "order_123",
    "status": "sent_to_chef",
    "chef_id": "chef_123",
    "countdown_completed": true,
    "timestamp": "2024-01-15T12:00:30Z"
  }
}
```

### Tip Added Webhook
```json
{
  "event": "tip.added",
  "data": {
    "order_id": "order_123",
    "tip_id": "tip_123",
    "recipient_type": "chef",
    "recipient_id": "chef_123",
    "amount": 50.00,
    "message": "Great food!",
    "timestamp": "2024-01-15T14:00:00Z"
  }
}
```