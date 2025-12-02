# HomeChef API Reference

Complete documentation for all API endpoints.

## Base URL

```
Development: http://localhost:8080
Production: https://api.homechef.app
```

## Authentication

The API uses JWT (JSON Web Tokens) for authentication.

### Obtaining a Token

```bash
POST /login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "your-password"
}
```

### Using the Token

Include the JWT in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### Token Details

- **Expiration**: 30 days
- **Claims**: `sub` (user ID), `exp` (expiration timestamp)

---

## Endpoints

### Health Check

#### GET /health

Check if the API is running.

**Response:**
```json
{
  "status": "ok"
}
```

---

## Authentication Endpoints

### POST /signup

Register a new user.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword123",
  "role": "customer"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | string | Yes | User's full name |
| email | string | Yes | Unique email address |
| password | string | Yes | Password (will be hashed) |
| role | string | Yes | One of: `admin`, `chef`, `driver`, `customer` |

**Response (201):**
```json
{
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "customer",
    "avatar_url": "",
    "phone": "",
    "points": 0
  }
}
```

---

### POST /login

Authenticate and receive a JWT token.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error (401):**
```json
{
  "error": "Invalid email or password"
}
```

---

### GET /profile

Get the authenticated user's profile.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "customer",
    "avatar_url": "",
    "phone": "",
    "points": 150
  }
}
```

---

## Chef Profile Endpoints

### GET /profiles/chefs

List all verified chefs. Supports search and filtering.

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| query | string | Search kitchen name or bio |
| city | string | Filter by city |

**Example:**
```
GET /profiles/chefs?query=italian&city=San Francisco
```

**Response (200):**
```json
{
  "profiles": [
    {
      "user_id": 5,
      "kitchen_name": "Mario's Italian Kitchen",
      "bio": "Authentic Italian cuisine made with love",
      "city": "San Francisco",
      "state": "CA",
      "user": {
        "id": 5,
        "name": "Mario Rossi"
      }
    }
  ]
}
```

---

### GET /profiles/chef/:id

Get a specific chef's profile.

**URL Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| id | uint | User ID of the chef |

**Response (200):**
```json
{
  "profile": {
    "user_id": 5,
    "kitchen_name": "Mario's Italian Kitchen",
    "bio": "Authentic Italian cuisine made with love",
    "city": "San Francisco",
    "state": "CA",
    "user": {
      "id": 5,
      "name": "Mario Rossi"
    }
  }
}
```

**Error (404):**
```json
{
  "error": "Chef profile not found"
}
```

---

### PUT /profiles/chef

Create or update the authenticated chef's profile.

**Headers:** `Authorization: Bearer <token>`

**Required Role:** `chef`

**Request Body:**
```json
{
  "kitchen_name": "Mario's Italian Kitchen",
  "bio": "Authentic Italian cuisine made with love",
  "address": "123 Main St",
  "city": "San Francisco",
  "state": "CA",
  "zip_code": "94102",
  "certificate_url": "https://example.com/cert.pdf"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| kitchen_name | string | Yes | Name of the kitchen |
| bio | string | No | Chef's biography |
| address | string | No | Street address |
| city | string | Yes | City |
| state | string | Yes | State |
| zip_code | string | No | ZIP code |
| certificate_url | string | No | URL to food handler certificate |

**Response (200):**
```json
{
  "profile": {
    "user_id": 5,
    "kitchen_name": "Mario's Italian Kitchen",
    "bio": "Authentic Italian cuisine made with love",
    "city": "San Francisco",
    "state": "CA",
    "user": {
      "id": 5,
      "name": "Mario Rossi"
    }
  }
}
```

---

## Menu Endpoints

### GET /menu/chef/:chef_id

Get all menu items for a specific chef.

**URL Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| chef_id | uint | Chef profile ID |

**Response (200):**
```json
{
  "menuItems": [
    {
      "id": 1,
      "chef_profile_id": 5,
      "name": "Spaghetti Carbonara",
      "description": "Classic Roman pasta with eggs, cheese, and pancetta",
      "price": 18.99,
      "image_url": "https://example.com/carbonara.jpg",
      "is_available": true,
      "created_at": "2024-01-15T10:00:00Z",
      "updated_at": "2024-01-15T10:00:00Z"
    }
  ]
}
```

---

### POST /menu/

Create a new menu item.

**Headers:** `Authorization: Bearer <token>`

**Required Role:** `chef`

**Request Body:**
```json
{
  "name": "Spaghetti Carbonara",
  "description": "Classic Roman pasta with eggs, cheese, and pancetta",
  "price": 18.99,
  "image_url": "https://example.com/carbonara.jpg",
  "is_available": true
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | string | Yes | Item name |
| description | string | No | Item description |
| price | float64 | Yes | Price in dollars |
| image_url | string | No | URL to item image |
| is_available | boolean | No | Availability (default: true) |

**Response (201):**
```json
{
  "menuItem": {
    "id": 1,
    "chef_profile_id": 5,
    "name": "Spaghetti Carbonara",
    "description": "Classic Roman pasta with eggs, cheese, and pancetta",
    "price": 18.99,
    "image_url": "https://example.com/carbonara.jpg",
    "is_available": true
  }
}
```

---

### PUT /menu/:item_id

Update a menu item.

**Headers:** `Authorization: Bearer <token>`

**Required Role:** `chef` (owner only)

**URL Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| item_id | uint | Menu item ID |

**Request Body:** Same as POST /menu/

**Response (200):**
```json
{
  "menuItem": { ... }
}
```

**Error (403):**
```json
{
  "error": "You don't have permission to update this item"
}
```

---

### DELETE /menu/:item_id

Delete a menu item.

**Headers:** `Authorization: Bearer <token>`

**Required Role:** `chef` (owner only)

**Response (200):**
```json
{
  "menuItem": { ... }
}
```

---

### GET /menu/my-menu

Get the authenticated chef's menu items.

**Headers:** `Authorization: Bearer <token>`

**Required Role:** `chef`

**Response (200):**
```json
{
  "menuItems": [ ... ]
}
```

---

## Cart Endpoints

### GET /cart/

Get the authenticated user's cart.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "cart": {
    "id": 1,
    "user_id": 2,
    "cart_items": [
      {
        "id": 1,
        "cart_id": 1,
        "menu_item_id": 5,
        "menu_item": {
          "id": 5,
          "name": "Spaghetti Carbonara",
          "price": 18.99,
          "chef_profile": {
            "id": 3,
            "kitchen_name": "Mario's Kitchen"
          }
        },
        "quantity": 2
      }
    ]
  }
}
```

---

### POST /cart/

Add an item to the cart.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "menu_item_id": 5,
  "quantity": 2
}
```

**Note:** Cart items must be from the same chef. Adding an item from a different chef will fail.

**Response (200):**
```json
{
  "cart": { ... }
}
```

**Error (400):**
```json
{
  "error": "Cannot add items from a different chef. Please clear your cart first."
}
```

---

### PUT /cart/item/:cart_item_id

Update cart item quantity.

**Headers:** `Authorization: Bearer <token>`

**URL Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| cart_item_id | uint | Cart item ID |

**Request Body:**
```json
{
  "quantity": 3
}
```

**Note:** Setting quantity to 0 removes the item.

**Response (200):**
```json
{
  "cartItem": { ... }
}
```

---

### DELETE /cart/item/:cart_item_id

Remove an item from the cart.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "message": "Item removed from cart"
}
```

---

### POST /cart/checkout

Create an order from the cart.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "order": {
    "id": 10,
    "user_id": 2,
    "chef_profile_id": 3,
    "status": "pending",
    "total_amount": 37.98,
    "order_date": "2024-01-15T12:00:00Z",
    "order_items": [ ... ]
  },
  "message": "Checkout successful, proceeding to payment"
}
```

**Note:**
- Awards 1 loyalty point per dollar spent
- Clears the cart after checkout
- Order status is set to "pending"

**Error (400):**
```json
{
  "error": "Cart is empty"
}
```

---

## Order Endpoints

### GET /orders/

Get the authenticated user's orders.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "orders": [
    {
      "id": 10,
      "user_id": 2,
      "chef_profile_id": 3,
      "chef_profile": { ... },
      "driver_id": null,
      "status": "pending",
      "total_amount": 37.98,
      "order_date": "2024-01-15T12:00:00Z",
      "delivery_address": "456 Oak St",
      "order_items": [ ... ]
    }
  ]
}
```

---

### GET /orders/:id

Get a specific order.

**Headers:** `Authorization: Bearer <token>`

**URL Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| id | uint | Order ID |

**Response (200):**
```json
{
  "order": { ... }
}
```

---

### GET /orders/chef/

Get orders for the authenticated chef.

**Headers:** `Authorization: Bearer <token>`

**Required Role:** `chef`

**Response (200):**
```json
{
  "orders": [ ... ]
}
```

---

### PUT /orders/chef/:id/status

Update an order's status (chef action).

**Headers:** `Authorization: Bearer <token>`

**Required Role:** `chef` (owner only)

**URL Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| id | uint | Order ID |

**Request Body:**
```json
{
  "status": "processing"
}
```

**Valid Status Values:**
| Status | Description |
|--------|-------------|
| `processing` | Chef is preparing the order |
| `out_for_delivery` | Order is with delivery driver |
| `delivered` | Order has been delivered |
| `cancelled` | Order was cancelled |

**Response (200):**
```json
{
  "order": { ... }
}
```

---

## Payment Endpoints

### POST /payments/create-payment-intent

Create a Stripe payment intent for an order.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "order_id": 10
}
```

**Response (200):**
```json
{
  "clientSecret": "pi_3Abc123..."
}
```

**Note:** Use this client secret with Stripe.js on the frontend to complete payment.

---

## Review Endpoints

### POST /reviews/

Submit a review for a delivered order.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "order_id": 10,
  "rating": 5,
  "comment": "Amazing food! The carbonara was authentic and delicious."
}
```

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| order_id | uint | Yes | Must be a delivered order you own |
| rating | int | Yes | 1-5 |
| comment | string | No | Review text |

**Response (201):**
```json
{
  "review": {
    "id": 5,
    "order_id": 10,
    "user_id": 2,
    "chef_profile_id": 3,
    "rating": 5,
    "comment": "Amazing food!",
    "status": "pending"
  }
}
```

**Errors:**
- `400`: Rating must be between 1 and 5
- `400`: Order is not delivered yet
- `400`: You have already reviewed this order
- `403`: This order does not belong to you

---

### GET /reviews/chef/:chef_id

Get approved reviews for a chef.

**URL Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| chef_id | uint | Chef profile ID |

**Response (200):**
```json
{
  "reviews": [
    {
      "id": 5,
      "rating": 5,
      "comment": "Amazing food!",
      "user": {
        "id": 2,
        "name": "John Doe"
      }
    }
  ]
}
```

---

### GET /reviews/admin/pending

Get all pending reviews (admin only).

**Headers:** `Authorization: Bearer <token>`

**Required Role:** `admin`

**Response (200):**
```json
{
  "reviews": [ ... ]
}
```

---

### PUT /reviews/admin/:id/status

Approve or reject a review.

**Headers:** `Authorization: Bearer <token>`

**Required Role:** `admin`

**URL Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| id | uint | Review ID |

**Request Body:**
```json
{
  "status": "approved"
}
```

**Valid Status Values:** `approved`, `rejected`

**Response (200):**
```json
{
  "review": { ... }
}
```

---

## Admin Endpoints

All admin endpoints require authentication and the `admin` role.

### GET /admin/users

List all users.

**Response (200):**
```json
{
  "users": [
    {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "role": "customer",
      "points": 150
    }
  ]
}
```

---

### GET /admin/chefs

List all chef profiles.

**Response (200):**
```json
{
  "profiles": [
    {
      "id": 3,
      "user_id": 5,
      "kitchen_name": "Mario's Kitchen",
      "is_verified": false,
      "user": { ... }
    }
  ]
}
```

---

### PUT /admin/chefs/:id/verify

Verify a chef profile.

**URL Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| id | uint | Chef profile ID |

**Response (200):**
```json
{
  "profile": {
    "id": 3,
    "is_verified": true,
    ...
  }
}
```

---

### DELETE /admin/users/:id/suspend

Suspend (delete) a user.

**URL Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| id | uint | User ID |

**Response (200):**
```json
{
  "message": "User has been suspended (deleted)"
}
```

---

### POST /admin/orders/assign-driver

Assign a driver to an order.

**Request Body:**
```json
{
  "order_id": 10,
  "driver_id": 7
}
```

**Response (200):**
```json
{
  "order": {
    "id": 10,
    "driver_id": 7,
    "driver": { ... },
    ...
  }
}
```

**Error (400):**
```json
{
  "error": "The specified driver does not have the driver role"
}
```

---

## Analytics Endpoints

All analytics endpoints require authentication and the `admin` role.

### GET /analytics/summary

Get platform statistics.

**Response (200):**
```json
{
  "summary": {
    "totalUsers": 150,
    "totalChefs": 25,
    "totalOrders": 500,
    "totalRevenue": 15750.50
  }
}
```

**Note:** `totalRevenue` only includes delivered orders.

---

### GET /analytics/sales

Get sales data for the last 7 days.

**Response (200):**
```json
{
  "sales": [
    {
      "date": "2024-01-15",
      "sales": 1250.75
    },
    {
      "date": "2024-01-14",
      "sales": 980.25
    }
  ]
}
```

---

## Ad Management Endpoints

### GET /ads/serve

Serve a random active ad (public endpoint).

**Response (200):**
```json
{
  "ad": {
    "id": 5,
    "title": "Try Our New Menu!",
    "content": "Fresh ingredients, amazing taste",
    "image_url": "https://example.com/ad.jpg",
    "target_url": "https://example.com/promo"
  }
}
```

**Empty Response (no active ads):**
```json
{}
```

---

### GET /ads/account

Get the authenticated user's ad account.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "adAccount": {
    "id": 1,
    "user_id": 5,
    "business_name": "Mario's Kitchen"
  }
}
```

---

### POST /ads/account

Create or update ad account.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "business_name": "Mario's Kitchen"
}
```

**Response (200):**
```json
{
  "adAccount": { ... }
}
```

---

### GET /ads/campaigns

Get the authenticated user's ad campaigns.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "campaigns": [
    {
      "id": 1,
      "name": "Summer Promotion",
      "budget": 500.00,
      "start_date": "2024-06-01T00:00:00Z",
      "end_date": "2024-08-31T23:59:59Z",
      "is_active": true
    }
  ]
}
```

---

### POST /ads/campaigns

Create a new ad campaign.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "name": "Summer Promotion",
  "budget": 500.00,
  "start_date": "2024-06-01T00:00:00Z",
  "end_date": "2024-08-31T23:59:59Z"
}
```

**Response (201):**
```json
{
  "campaign": { ... }
}
```

---

### PUT /ads/campaigns/:id

Update an ad campaign.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "name": "Updated Summer Promotion",
  "budget": 750.00,
  "is_active": false
}
```

**Response (200):**
```json
{
  "campaign": { ... }
}
```

---

### GET /ads/campaign/:campaign_id

Get ads for a specific campaign.

**Response (200):**
```json
{
  "ads": [
    {
      "id": 5,
      "title": "Try Our New Menu!",
      "content": "Fresh ingredients, amazing taste",
      "image_url": "https://example.com/ad.jpg",
      "target_url": "https://example.com/promo"
    }
  ]
}
```

---

### POST /ads/

Create a new ad.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "campaign_id": 1,
  "title": "Try Our New Menu!",
  "content": "Fresh ingredients, amazing taste",
  "image_url": "https://example.com/ad.jpg",
  "target_url": "https://example.com/promo"
}
```

**Response (201):**
```json
{
  "ad": { ... }
}
```

---

## Delivery Endpoints

All delivery endpoints require authentication and the `driver` role.

### GET /delivery/orders

Get orders assigned to the authenticated driver.

**Headers:** `Authorization: Bearer <token>`

**Required Role:** `driver`

**Response (200):**
```json
{
  "orders": [
    {
      "id": 10,
      "status": "processing",
      "delivery_address": "456 Oak St",
      "user": { ... },
      "chef_profile": { ... },
      "order_items": [ ... ]
    }
  ]
}
```

**Note:** Only shows orders with status `processing` or `out_for_delivery`.

---

### PUT /delivery/orders/:id/status

Update delivery status.

**Headers:** `Authorization: Bearer <token>`

**Required Role:** `driver`

**Request Body:**
```json
{
  "status": "out_for_delivery"
}
```

**Valid Status Values:**
| Status | Description |
|--------|-------------|
| `out_for_delivery` | Driver has picked up the order |
| `delivered` | Order has been delivered |

**Response (200):**
```json
{
  "order": { ... }
}
```

**Error (404):**
```json
{
  "error": "Order not found or not assigned to you"
}
```

---

## Error Responses

All endpoints may return these common errors:

### 400 Bad Request
```json
{
  "error": "Description of what went wrong"
}
```

### 401 Unauthorized
```json
{
  "error": "Missing or invalid authentication token"
}
```

### 403 Forbidden
```json
{
  "error": "You don't have permission to perform this action"
}
```

### 404 Not Found
```json
{
  "error": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error"
}
```

---

## Rate Limiting

Currently, no rate limiting is implemented. For production, consider adding rate limiting middleware.

---

## Versioning

The API currently does not use versioning. Future versions may use URL prefix versioning (e.g., `/v1/`, `/v2/`).
