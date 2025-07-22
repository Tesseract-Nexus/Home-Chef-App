# Chef Management

## Overview

Chef management handles chef onboarding, profile management, menu operations, and business analytics.

## Chef Onboarding

### Submit Chef Application
```http
POST /chefs/apply
{
  "personal_info": {
    "name": "Priya Sharma",
    "email": "priya@example.com",
    "phone": "+919876543210",
    "date_of_birth": "1985-05-15",
    "address": {
      "street": "123 Chef Street",
      "city": "Mumbai",
      "state": "Maharashtra",
      "pincode": "400001",
      "coordinates": {
        "latitude": 19.0760,
        "longitude": 72.8777
      }
    }
  },
  "professional_info": {
    "specialty": "North Indian Cuisine",
    "experience": "8 years",
    "description": "Passionate home chef specializing in authentic North Indian dishes",
    "cuisine_types": ["north_indian", "punjabi"],
    "dietary_preferences": ["vegetarian", "non_vegetarian"],
    "cooking_style": "traditional"
  },
  "business_info": {
    "kitchen_type": "home",
    "capacity": "20 orders per day",
    "working_hours": {
      "start": "09:00",
      "end": "21:00"
    },
    "working_days": ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday"],
    "min_order_amount": 200,
    "delivery_radius": 5
  },
  "documents": {
    "identity_proof": "base64_encoded_image",
    "address_proof": "base64_encoded_image",
    "fssai_license": "base64_encoded_image",
    "bank_details": {
      "account_number": "1234567890",
      "ifsc_code": "SBIN0001234",
      "account_holder_name": "Priya Sharma",
      "bank_name": "State Bank of India"
    }
  }
}
```

### Get Application Status
```http
GET /chefs/application/{application_id}
Authorization: Bearer <token>
```

### Upload Additional Documents
```http
POST /chefs/application/{application_id}/documents
Authorization: Bearer <token>
Content-Type: multipart/form-data

document_type: fssai_license
document: <file>
```

## Chef Profile Management

### Get Chef Profile
```http
GET /chefs/profile
Authorization: Bearer <chef_token>
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "chef_123",
    "user_id": "user_123",
    "name": "Priya Sharma",
    "specialty": "North Indian Cuisine",
    "description": "Passionate home chef...",
    "avatar": "https://cdn.homechef.com/chefs/chef_123.jpg",
    "cover_image": "https://cdn.homechef.com/covers/chef_123.jpg",
    "rating": 4.8,
    "total_reviews": 234,
    "total_orders": 1250,
    "location": {
      "city": "Mumbai",
      "state": "Maharashtra",
      "coordinates": {
        "latitude": 19.0760,
        "longitude": 72.8777
      }
    },
    "cuisine_types": ["north_indian", "punjabi"],
    "dietary_preferences": ["vegetarian", "non_vegetarian"],
    "business_info": {
      "working_hours": {
        "start": "09:00",
        "end": "21:00"
      },
      "working_days": ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday"],
      "min_order_amount": 200,
      "delivery_radius": 5,
      "avg_preparation_time": 30
    },
    "status": "active",
    "verification_status": "verified",
    "badges": ["top_rated", "fast_delivery", "hygiene_certified"],
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

### Update Chef Profile
```http
PUT /chefs/profile
Authorization: Bearer <chef_token>
{
  "description": "Updated description",
  "cuisine_types": ["north_indian", "punjabi", "mughlai"],
  "business_info": {
    "working_hours": {
      "start": "08:00",
      "end": "22:00"
    },
    "min_order_amount": 250
  }
}
```

### Update Chef Availability
```http
PUT /chefs/availability
Authorization: Bearer <chef_token>
{
  "is_available": true,
  "unavailable_reason": null,
  "estimated_return": null
}
```

### Set Chef Vacation Mode
```http
POST /chefs/vacation
Authorization: Bearer <chef_token>
{
  "start_date": "2024-02-01",
  "end_date": "2024-02-07",
  "reason": "Family vacation"
}
```

## Chef Discovery

### Search Chefs
```http
GET /chefs/search
?q=north+indian
&location=mumbai
&cuisine=north_indian
&rating_min=4.0
&delivery_radius=5
&available_now=true
&sort=rating
&order=desc
&page=1
&limit=20
```

### Get Chef Details
```http
GET /chefs/{chef_id}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "chef_123",
    "name": "Priya Sharma",
    "specialty": "North Indian Cuisine",
    "description": "Passionate home chef...",
    "avatar": "https://cdn.homechef.com/chefs/chef_123.jpg",
    "cover_image": "https://cdn.homechef.com/covers/chef_123.jpg",
    "rating": 4.8,
    "total_reviews": 234,
    "total_orders": 1250,
    "location": {
      "city": "Mumbai",
      "state": "Maharashtra",
      "distance": "2.3 km"
    },
    "cuisine_types": ["north_indian", "punjabi"],
    "business_info": {
      "working_hours": {
        "start": "09:00",
        "end": "21:00"
      },
      "is_open": true,
      "min_order_amount": 200,
      "delivery_fee": 25,
      "avg_preparation_time": 30,
      "estimated_delivery": "45-60 min"
    },
    "badges": ["top_rated", "fast_delivery"],
    "popular_dishes": [
      {
        "id": "dish_123",
        "name": "Butter Chicken",
        "price": 280,
        "image": "https://cdn.homechef.com/dishes/dish_123.jpg"
      }
    ]
  }
}
```

### Get Featured Chefs
```http
GET /chefs/featured
?location=mumbai&limit=10
```

### Get Nearby Chefs
```http
GET /chefs/nearby
?latitude=19.0760&longitude=72.8777&radius=5&limit=20
```

## Chef Analytics

### Get Chef Dashboard
```http
GET /chefs/dashboard
Authorization: Bearer <chef_token>
```

**Response**:
```json
{
  "success": true,
  "data": {
    "today": {
      "orders": 12,
      "revenue": 2450.00,
      "avg_order_value": 204.17
    },
    "this_week": {
      "orders": 67,
      "revenue": 13450.00,
      "avg_order_value": 200.75
    },
    "this_month": {
      "orders": 289,
      "revenue": 58900.00,
      "avg_order_value": 203.81
    },
    "rating": {
      "current": 4.8,
      "trend": "+0.1",
      "total_reviews": 234
    },
    "popular_dishes": [
      {
        "dish_id": "dish_123",
        "name": "Butter Chicken",
        "orders": 45,
        "revenue": 12600.00
      }
    ],
    "recent_reviews": [
      {
        "id": "review_123",
        "customer_name": "John D.",
        "rating": 5,
        "comment": "Amazing food!",
        "created_at": "2024-01-15T10:30:00Z"
      }
    ]
  }
}
```

### Get Chef Analytics
```http
GET /chefs/analytics
Authorization: Bearer <chef_token>
?period=last_30_days&metrics=revenue,orders,rating
```

### Get Chef Performance
```http
GET /chefs/performance
Authorization: Bearer <chef_token>
```

## Chef Verification

### Submit Verification Documents
```http
POST /chefs/verification/documents
Authorization: Bearer <chef_token>
Content-Type: multipart/form-data

fssai_license: <file>
kitchen_photos: <file>
identity_proof: <file>
```

### Get Verification Status
```http
GET /chefs/verification/status
Authorization: Bearer <chef_token>
```

### Request Re-verification
```http
POST /chefs/verification/request
Authorization: Bearer <chef_token>
{
  "reason": "Updated kitchen setup"
}
```

## Chef Earnings

### Get Earnings Summary
```http
GET /chefs/earnings
Authorization: Bearer <chef_token>
?period=this_month
```

**Response**:
```json
{
  "success": true,
  "data": {
    "total_earnings": 58900.00,
    "platform_fee": 8835.00,
    "net_earnings": 50065.00,
    "pending_amount": 2450.00,
    "paid_amount": 47615.00,
    "breakdown": {
      "order_revenue": 58900.00,
      "tips": 1250.00,
      "bonuses": 500.00,
      "deductions": 8835.00
    },
    "payout_schedule": "weekly",
    "next_payout_date": "2024-01-19T00:00:00Z"
  }
}
```

### Get Payout History
```http
GET /chefs/payouts
Authorization: Bearer <chef_token>
?page=1&limit=20
```

### Request Payout
```http
POST /chefs/payouts/request
Authorization: Bearer <chef_token>
{
  "amount": 5000.00,
  "reason": "Emergency withdrawal"
}
```

## Admin Chef Management

### Get All Chefs (Admin)
```http
GET /admin/chefs
Authorization: Bearer <admin_token>
?status=pending&page=1&limit=20
```

### Approve Chef Application (Admin)
```http
POST /admin/chefs/{chef_id}/approve
Authorization: Bearer <admin_token>
{
  "notes": "All documents verified"
}
```

### Reject Chef Application (Admin)
```http
POST /admin/chefs/{chef_id}/reject
Authorization: Bearer <admin_token>
{
  "reason": "Incomplete documentation",
  "notes": "FSSAI license not provided"
}
```

### Suspend Chef (Admin)
```http
POST /admin/chefs/{chef_id}/suspend
Authorization: Bearer <admin_token>
{
  "reason": "Quality issues",
  "duration": "7 days"
}
```

## Error Codes

| Code | Message | Description |
|------|---------|-------------|
| CHEF_001 | Application not found | Chef application doesn't exist |
| CHEF_002 | Already applied | Chef has already submitted application |
| CHEF_003 | Invalid documents | Document validation failed |
| CHEF_004 | Not verified | Chef verification pending |
| CHEF_005 | Chef not found | Chef profile doesn't exist |
| CHEF_006 | Inactive chef | Chef account is inactive |
| CHEF_007 | Outside delivery area | Location outside delivery radius |
| CHEF_008 | Kitchen closed | Chef is currently unavailable |
| CHEF_009 | Minimum order not met | Order below minimum amount |
| CHEF_010 | Invalid working hours | Working hours format invalid |