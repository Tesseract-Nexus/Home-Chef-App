# Order Management

## Overview

Order management handles the complete order lifecycle from placement to delivery completion.

## Order Placement

### Create Order
```http
POST /orders
Authorization: Bearer <customer_token>
{
  "chef_id": "chef_123",
  "items": [
    {
      "dish_id": "dish_123",
      "quantity": 2,
      "modifiers": [
        {
          "modifier_id": "mod_123",
          "option_id": "medium"
        }
      ],
      "special_instructions": "Less spicy please"
    },
    {
      "dish_id": "dish_124",
      "quantity": 1,
      "modifiers": []
    }
  ],
  "delivery_address_id": "addr_123",
  "payment_method_id": "pm_123",
  "delivery_instructions": "Ring the bell twice",
  "scheduled_delivery": null,
  "promo_code": "FIRST10"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "order_123",
    "order_number": "HC240115001",
    "status": "pending",
    "chef": {
      "id": "chef_123",
      "name": "Priya Sharma",
      "phone": "+919876543210"
    },
    "customer": {
      "id": "customer_123",
      "name": "John Doe",
      "phone": "+919876543211"
    },
    "items": [
      {
        "dish_id": "dish_123",
        "name": "Butter Chicken",
        "quantity": 2,
        "unit_price": 280.00,
        "total_price": 560.00,
        "modifiers": [
          {
            "name": "Spice Level",
            "option": "Medium",
            "price": 0
          }
        ],
        "special_instructions": "Less spicy please"
      }
    ],
    "pricing": {
      "subtotal": 720.00,
      "delivery_fee": 25.00,
      "platform_fee": 36.00,
      "taxes": 39.05,
      "discount": 72.00,
      "total": 748.05
    },
    "delivery_address": {
      "full_address": "123 Main Street, Apartment 4B",
      "city": "Mumbai",
      "pincode": "400001"
    },
    "estimated_delivery_time": "2024-01-15T13:30:00Z",
    "created_at": "2024-01-15T12:00:00Z"
  }
}
```

### Get Order Estimate
```http
POST /orders/estimate
Authorization: Bearer <customer_token>
{
  "chef_id": "chef_123",
  "items": [
    {
      "dish_id": "dish_123",
      "quantity": 2
    }
  ],
  "delivery_address_id": "addr_123",
  "promo_code": "FIRST10"
}
```

## Order Tracking

### Get Order Details
```http
GET /orders/{order_id}
Authorization: Bearer <token>
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "order_123",
    "order_number": "HC240115001",
    "status": "preparing",
    "chef": {
      "id": "chef_123",
      "name": "Priya Sharma",
      "avatar": "https://cdn.homechef.com/chefs/chef_123.jpg",
      "phone": "+919876543210",
      "rating": 4.8
    },
    "customer": {
      "id": "customer_123",
      "name": "John Doe",
      "phone": "+919876543211"
    },
    "items": [...],
    "pricing": {...},
    "delivery_address": {...},
    "tracking": {
      "current_status": "preparing",
      "estimated_delivery": "2024-01-15T13:30:00Z",
      "preparation_time": 25,
      "delivery_time": 20,
      "timeline": [
        {
          "status": "placed",
          "timestamp": "2024-01-15T12:00:00Z",
          "message": "Order placed successfully"
        },
        {
          "status": "confirmed",
          "timestamp": "2024-01-15T12:02:00Z",
          "message": "Order confirmed by chef"
        },
        {
          "status": "preparing",
          "timestamp": "2024-01-15T12:05:00Z",
          "message": "Chef started preparing your order"
        }
      ]
    },
    "delivery_partner": {
      "id": "dp_123",
      "name": "Rajesh Kumar",
      "phone": "+919876543212",
      "vehicle": "Motorcycle - MH12AB1234",
      "rating": 4.7,
      "current_location": {
        "latitude": 19.0760,
        "longitude": 72.8777
      }
    },
    "payment": {
      "method": "card",
      "status": "paid",
      "transaction_id": "txn_123"
    },
    "created_at": "2024-01-15T12:00:00Z"
  }
}
```

### Get Order Timeline
```http
GET /orders/{order_id}/timeline
Authorization: Bearer <token>
```

### Track Order Location
```http
GET /orders/{order_id}/location
Authorization: Bearer <token>
```

## Order Status Management

### Update Order Status (Chef)
```http
PUT /orders/{order_id}/status
Authorization: Bearer <chef_token>
{
  "status": "confirmed",
  "estimated_preparation_time": 25,
  "notes": "Order confirmed, starting preparation"
}
```

### Mark Order Ready (Chef)
```http
PUT /orders/{order_id}/ready
Authorization: Bearer <chef_token>
{
  "notes": "Order is ready for pickup"
}
```

### Assign Delivery Partner
```http
PUT /orders/{order_id}/assign-delivery
Authorization: Bearer <admin_token>
{
  "delivery_partner_id": "dp_123"
}
```

### Update Delivery Status
```http
PUT /orders/{order_id}/delivery-status
Authorization: Bearer <delivery_token>
{
  "status": "picked_up",
  "location": {
    "latitude": 19.0760,
    "longitude": 72.8777
  },
  "notes": "Order picked up from chef"
}
```

### Mark Order Delivered
```http
PUT /orders/{order_id}/delivered
Authorization: Bearer <delivery_token>
{
  "delivery_proof": "base64_image",
  "customer_signature": "base64_signature",
  "notes": "Order delivered successfully"
}
```

## Order Modifications

### Cancel Order
```http
PUT /orders/{order_id}/cancel
Authorization: Bearer <token>
{
  "reason": "Changed mind",
  "cancellation_type": "customer_request"
}
```

### Modify Order Items (Before Confirmation)
```http
PUT /orders/{order_id}/items
Authorization: Bearer <customer_token>
{
  "items": [
    {
      "dish_id": "dish_123",
      "quantity": 3,
      "modifiers": [...]
    }
  ]
}
```

### Update Delivery Address (Before Preparation)
```http
PUT /orders/{order_id}/delivery-address
Authorization: Bearer <customer_token>
{
  "address_id": "addr_124"
}
```

## Order History

### Get Customer Orders
```http
GET /customers/orders
Authorization: Bearer <customer_token>
?status=delivered&page=1&limit=20&sort=created_at&order=desc
```

### Get Chef Orders
```http
GET /chefs/orders
Authorization: Bearer <chef_token>
?status=active&date_from=2024-01-01&date_to=2024-01-31&page=1&limit=20
```

### Get Delivery Partner Orders
```http
GET /delivery/orders
Authorization: Bearer <delivery_token>
?status=completed&page=1&limit=20
```

## Order Analytics

### Get Order Statistics
```http
GET /orders/statistics
Authorization: Bearer <admin_token>
?period=this_month&group_by=day
```

**Response**:
```json
{
  "success": true,
  "data": {
    "total_orders": 1250,
    "completed_orders": 1180,
    "cancelled_orders": 70,
    "avg_order_value": 285.50,
    "total_revenue": 356875.00,
    "completion_rate": 94.4,
    "avg_delivery_time": 42,
    "daily_breakdown": [
      {
        "date": "2024-01-01",
        "orders": 45,
        "revenue": 12825.00
      }
    ]
  }
}
```

### Get Chef Order Analytics
```http
GET /chefs/orders/analytics
Authorization: Bearer <chef_token>
?period=last_30_days
```

## Order Communication

### Send Message to Chef
```http
POST /orders/{order_id}/messages
Authorization: Bearer <customer_token>
{
  "message": "Please make it less spicy",
  "type": "text"
}
```

### Get Order Messages
```http
GET /orders/{order_id}/messages
Authorization: Bearer <token>
```

### Call Chef/Customer
```http
POST /orders/{order_id}/call
Authorization: Bearer <token>
{
  "recipient": "chef|customer|delivery"
}
```

## Order Scheduling

### Schedule Order
```http
POST /orders/schedule
Authorization: Bearer <customer_token>
{
  "chef_id": "chef_123",
  "items": [...],
  "delivery_address_id": "addr_123",
  "scheduled_time": "2024-01-16T19:00:00Z",
  "payment_method_id": "pm_123"
}
```

### Get Scheduled Orders
```http
GET /orders/scheduled
Authorization: Bearer <token>
```

### Update Scheduled Order
```http
PUT /orders/scheduled/{order_id}
Authorization: Bearer <customer_token>
{
  "scheduled_time": "2024-01-16T20:00:00Z"
}
```

## Order Disputes

### Report Order Issue
```http
POST /orders/{order_id}/issues
Authorization: Bearer <token>
{
  "type": "quality|delivery|missing_items|wrong_order",
  "description": "Food was cold when delivered",
  "images": ["base64_image1", "base64_image2"]
}
```

### Get Order Issues
```http
GET /orders/{order_id}/issues
Authorization: Bearer <token>
```

### Resolve Order Issue (Admin)
```http
PUT /orders/{order_id}/issues/{issue_id}/resolve
Authorization: Bearer <admin_token>
{
  "resolution": "refund",
  "refund_amount": 280.00,
  "notes": "Full refund processed"
}
```

## Bulk Order Operations

### Get Bulk Order Template
```http
GET /orders/bulk/template
Authorization: Bearer <customer_token>
```

### Create Bulk Order
```http
POST /orders/bulk
Authorization: Bearer <customer_token>
{
  "orders": [
    {
      "chef_id": "chef_123",
      "items": [...],
      "delivery_address_id": "addr_123",
      "scheduled_time": "2024-01-16T12:00:00Z"
    }
  ]
}
```

## Error Codes

| Code | Message | Description |
|------|---------|-------------|
| ORDER_001 | Order not found | Order ID doesn't exist |
| ORDER_002 | Invalid order status | Cannot perform action in current status |
| ORDER_003 | Chef unavailable | Chef is not accepting orders |
| ORDER_004 | Dish unavailable | One or more dishes are unavailable |
| ORDER_005 | Minimum order not met | Order total below chef's minimum |
| ORDER_006 | Outside delivery area | Delivery address outside chef's area |
| ORDER_007 | Payment failed | Payment processing failed |
| ORDER_008 | Cannot cancel | Order cannot be cancelled at this stage |
| ORDER_009 | Invalid modification | Order modification not allowed |
| ORDER_010 | Delivery partner unavailable | No delivery partner available |