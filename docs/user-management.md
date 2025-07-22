# User Management

## Overview

User management handles profiles, preferences, and account settings for all user types.

## User Profile Management

### Get User Profile
```http
GET /users/profile
Authorization: Bearer <token>
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "user_123",
    "email": "user@example.com",
    "name": "John Doe",
    "phone": "+919876543210",
    "role": "customer",
    "avatar": "https://cdn.homechef.com/avatars/user_123.jpg",
    "email_verified": true,
    "phone_verified": true,
    "status": "active",
    "preferences": {
      "notifications": {
        "email": true,
        "push": true,
        "sms": false
      },
      "dietary": ["vegetarian"],
      "cuisine_preferences": ["north_indian", "south_indian"]
    },
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-15T10:30:00Z"
  }
}
```

### Update User Profile
```http
PUT /users/profile
Authorization: Bearer <token>
{
  "name": "John Smith",
  "phone": "+919876543211",
  "avatar": "base64_image_data",
  "preferences": {
    "notifications": {
      "email": true,
      "push": true,
      "sms": true
    },
    "dietary": ["vegetarian", "vegan"],
    "cuisine_preferences": ["north_indian", "gujarati"]
  }
}
```

### Upload Profile Picture
```http
POST /users/profile/avatar
Authorization: Bearer <token>
Content-Type: multipart/form-data

avatar: <file>
```

## Address Management

### Get User Addresses
```http
GET /users/addresses
Authorization: Bearer <token>
```

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "addr_123",
      "type": "home",
      "label": "Home",
      "full_address": "123 Main Street, Apartment 4B",
      "landmark": "Near Metro Station",
      "city": "Mumbai",
      "state": "Maharashtra",
      "pincode": "400001",
      "coordinates": {
        "latitude": 19.0760,
        "longitude": 72.8777
      },
      "is_default": true,
      "delivery_instructions": "Ring the bell twice",
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### Add New Address
```http
POST /users/addresses
Authorization: Bearer <token>
{
  "type": "work",
  "label": "Office",
  "full_address": "456 Business Park, Tower A",
  "landmark": "Opposite Mall",
  "city": "Mumbai",
  "state": "Maharashtra",
  "pincode": "400001",
  "coordinates": {
    "latitude": 19.0760,
    "longitude": 72.8777
  },
  "is_default": false,
  "delivery_instructions": "Call when you reach"
}
```

### Update Address
```http
PUT /users/addresses/{address_id}
Authorization: Bearer <token>
{
  "label": "New Office",
  "delivery_instructions": "Security will collect"
}
```

### Delete Address
```http
DELETE /users/addresses/{address_id}
Authorization: Bearer <token>
```

### Set Default Address
```http
PUT /users/addresses/{address_id}/default
Authorization: Bearer <token>
```

## Payment Methods

### Get Payment Methods
```http
GET /users/payment-methods
Authorization: Bearer <token>
```

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "pm_123",
      "type": "card",
      "card": {
        "last4": "4242",
        "brand": "visa",
        "exp_month": 12,
        "exp_year": 2025
      },
      "is_default": true,
      "created_at": "2024-01-01T00:00:00Z"
    },
    {
      "id": "pm_124",
      "type": "upi",
      "upi": {
        "vpa": "user@paytm"
      },
      "is_default": false,
      "created_at": "2024-01-02T00:00:00Z"
    }
  ]
}
```

### Add Payment Method
```http
POST /users/payment-methods
Authorization: Bearer <token>
{
  "type": "card",
  "card": {
    "number": "4242424242424242",
    "exp_month": 12,
    "exp_year": 2025,
    "cvc": "123",
    "name": "John Doe"
  }
}
```

### Delete Payment Method
```http
DELETE /users/payment-methods/{payment_method_id}
Authorization: Bearer <token>
```

## Favorites

### Get Favorite Chefs
```http
GET /users/favorites/chefs
Authorization: Bearer <token>
```

### Add Chef to Favorites
```http
POST /users/favorites/chefs
Authorization: Bearer <token>
{
  "chef_id": "chef_123"
}
```

### Remove Chef from Favorites
```http
DELETE /users/favorites/chefs/{chef_id}
Authorization: Bearer <token>
```

### Get Favorite Dishes
```http
GET /users/favorites/dishes
Authorization: Bearer <token>
```

### Add Dish to Favorites
```http
POST /users/favorites/dishes
Authorization: Bearer <token>
{
  "dish_id": "dish_123"
}
```

## Notification Preferences

### Get Notification Settings
```http
GET /users/notifications/settings
Authorization: Bearer <token>
```

### Update Notification Settings
```http
PUT /users/notifications/settings
Authorization: Bearer <token>
{
  "email_notifications": {
    "order_updates": true,
    "promotions": false,
    "newsletter": true
  },
  "push_notifications": {
    "order_updates": true,
    "promotions": true,
    "chat_messages": true
  },
  "sms_notifications": {
    "order_updates": true,
    "otp": true,
    "promotions": false
  }
}
```

### Get Notification History
```http
GET /users/notifications/history
Authorization: Bearer <token>
```

## Privacy Settings

### Get Privacy Settings
```http
GET /users/privacy
Authorization: Bearer <token>
```

### Update Privacy Settings
```http
PUT /users/privacy
Authorization: Bearer <token>
{
  "profile_visibility": "public|private",
  "show_online_status": true,
  "allow_contact": true,
  "data_sharing": {
    "analytics": true,
    "marketing": false,
    "third_party": false
  }
}
```

## Account Management

### Deactivate Account
```http
POST /users/deactivate
Authorization: Bearer <token>
{
  "reason": "Taking a break",
  "feedback": "Optional feedback"
}
```

### Reactivate Account
```http
POST /users/reactivate
Authorization: Bearer <token>
```

### Delete Account
```http
DELETE /users/account
Authorization: Bearer <token>
{
  "password": "current_password",
  "confirmation": "DELETE_MY_ACCOUNT"
}
```

### Export User Data
```http
GET /users/export
Authorization: Bearer <token>
```

## User Search and Discovery

### Search Users (Admin only)
```http
GET /admin/users/search
Authorization: Bearer <admin_token>
?q=john&role=customer&status=active&page=1&limit=20
```

### Get User Details (Admin only)
```http
GET /admin/users/{user_id}
Authorization: Bearer <admin_token>
```

### Update User Status (Admin only)
```http
PUT /admin/users/{user_id}/status
Authorization: Bearer <admin_token>
{
  "status": "active|inactive|suspended",
  "reason": "Violation of terms"
}
```

## User Analytics

### Get User Activity
```http
GET /users/activity
Authorization: Bearer <token>
```

**Response**:
```json
{
  "success": true,
  "data": {
    "total_orders": 25,
    "total_spent": 5670.50,
    "favorite_cuisines": ["north_indian", "south_indian"],
    "avg_order_value": 226.82,
    "last_order_date": "2024-01-15T10:30:00Z",
    "loyalty_points": 567,
    "reviews_given": 18,
    "avg_rating_given": 4.3
  }
}
```

### Get User Insights (Admin only)
```http
GET /admin/users/{user_id}/insights
Authorization: Bearer <admin_token>
```

## Error Codes

| Code | Message | Description |
|------|---------|-------------|
| USER_001 | User not found | User ID doesn't exist |
| USER_002 | Invalid address | Address validation failed |
| USER_003 | Payment method invalid | Payment method setup failed |
| USER_004 | Address limit exceeded | Maximum addresses reached |
| USER_005 | Cannot delete default | Cannot delete default address/payment |
| USER_006 | Profile incomplete | Required profile fields missing |
| USER_007 | Invalid coordinates | GPS coordinates are invalid |
| USER_008 | Duplicate address | Address already exists |
| USER_009 | Permission denied | User lacks required permissions |
| USER_010 | Account deactivated | User account is deactivated |