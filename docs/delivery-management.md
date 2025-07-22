# Delivery Management

## Overview

Delivery management handles delivery partner onboarding, order assignment, tracking, and logistics optimization.

## Delivery Partner Onboarding

### Submit Application
```http
POST /delivery/apply
{
  "personal_info": {
    "name": "Rajesh Kumar",
    "email": "rajesh@example.com",
    "phone": "+919876543210",
    "date_of_birth": "1990-05-15",
    "address": {
      "street": "456 Delivery Street",
      "city": "Mumbai",
      "state": "Maharashtra",
      "pincode": "400001"
    },
    "emergency_contact": {
      "name": "Sunita Kumar",
      "phone": "+919876543211",
      "relation": "Wife"
    }
  },
  "vehicle_info": {
    "type": "motorcycle",
    "brand": "Honda",
    "model": "Activa",
    "year": 2020,
    "registration_number": "MH12AB1234",
    "color": "Black",
    "fuel_type": "petrol"
  },
  "documents": {
    "driving_license": "base64_encoded_image",
    "pan_card": "base64_encoded_image",
    "aadhaar_card": "base64_encoded_image",
    "vehicle_registration": "base64_encoded_image",
    "vehicle_insurance": "base64_encoded_image",
    "bank_passbook": "base64_encoded_image"
  },
  "bank_details": {
    "account_number": "9876543210",
    "ifsc_code": "HDFC0001234",
    "account_holder_name": "Rajesh Kumar",
    "bank_name": "HDFC Bank"
  }
}
```

### Background Verification
```http
POST /delivery/{partner_id}/background-check
Authorization: Bearer <admin_token>
{
  "check_type": "police_clearance",
  "agency": "verified_agency_name"
}
```

### Get Application Status
```http
GET /delivery/application/{application_id}
Authorization: Bearer <token>
```

## Delivery Partner Management

### Get Partner Profile
```http
GET /delivery/profile
Authorization: Bearer <delivery_token>
```

### Update Availability
```http
PUT /delivery/status
Authorization: Bearer <delivery_token>
{
  "is_available": true,
  "location": {
    "latitude": 19.0760,
    "longitude": 72.8777
  },
  "working_hours": {
    "start": "09:00",
    "end": "21:00"
  }
}
```

### Update Location
```http
PUT /delivery/location
Authorization: Bearer <delivery_token>
{
  "latitude": 19.0760,
  "longitude": 72.8777,
  "accuracy": 10,
  "timestamp": "2024-01-15T12:30:00Z"
}
```

## Order Assignment

### Get Available Orders
```http
GET /delivery/orders/available
Authorization: Bearer <delivery_token>
?radius=5&priority=high&min_earnings=50&page=1&limit=20
```

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "order_123",
      "order_number": "HC240115001",
      "customer": {
        "name": "John Doe",
        "phone": "+919876543211"
      },
      "chef": {
        "name": "Priya Sharma",
        "address": "123 Chef Street, Mumbai",
        "phone": "+919876543210"
      },
      "pickup_location": {
        "address": "123 Chef Street, Bandra West, Mumbai",
        "coordinates": {
          "latitude": 19.0596,
          "longitude": 72.8295
        }
      },
      "delivery_location": {
        "address": "456 Customer Road, Bandra West, Mumbai",
        "coordinates": {
          "latitude": 19.0544,
          "longitude": 72.8347
        }
      },
      "distance": 2.3,
      "estimated_time": 25,
      "earnings": 85.00,
      "priority": "high",
      "order_value": 748.05,
      "payment_method": "online",
      "special_instructions": "Handle with care",
      "created_at": "2024-01-15T12:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 15,
    "has_next": false
  }
}
```

### Accept Order
```http
POST /delivery/orders/{order_id}/accept
Authorization: Bearer <delivery_token>
{
  "estimated_pickup_time": "2024-01-15T12:45:00Z"
}
```

### Auto-Assignment (Admin)
```http
POST /admin/delivery/auto-assign
Authorization: Bearer <admin_token>
{
  "order_id": "order_123",
  "criteria": {
    "max_distance": 5,
    "min_rating": 4.0,
    "prefer_experienced": true
  }
}
```

## Order Tracking

### Update Order Status
```http
PUT /delivery/orders/{order_id}/status
Authorization: Bearer <delivery_token>
{
  "status": "picked_up",
  "location": {
    "latitude": 19.0760,
    "longitude": 72.8777
  },
  "timestamp": "2024-01-15T12:50:00Z",
  "notes": "Order picked up from chef"
}
```

### Mark Order Delivered
```http
PUT /delivery/orders/{order_id}/delivered
Authorization: Bearer <delivery_token>
{
  "delivery_time": "2024-01-15T13:15:00Z",
  "location": {
    "latitude": 19.0544,
    "longitude": 72.8347
  },
  "delivery_proof": "base64_encoded_image",
  "customer_signature": "base64_encoded_signature",
  "notes": "Order delivered successfully"
}
```

### Report Delivery Issue
```http
POST /delivery/orders/{order_id}/issue
Authorization: Bearer <delivery_token>
{
  "issue_type": "customer_unavailable|address_incorrect|order_damaged|other",
  "description": "Customer not available at delivery address",
  "location": {
    "latitude": 19.0544,
    "longitude": 72.8347
  },
  "images": ["base64_image1", "base64_image2"]
}
```

## Real-time Tracking

### Start Live Tracking
```http
POST /delivery/orders/{order_id}/start-tracking
Authorization: Bearer <delivery_token>
```

### Update Live Location
```http
PUT /delivery/orders/{order_id}/location
Authorization: Bearer <delivery_token>
{
  "latitude": 19.0760,
  "longitude": 72.8777,
  "accuracy": 10,
  "speed": 25,
  "bearing": 45,
  "timestamp": "2024-01-15T13:00:00Z"
}
```

### Stop Live Tracking
```http
POST /delivery/orders/{order_id}/stop-tracking
Authorization: Bearer <delivery_token>
```

### Get Delivery Route
```http
GET /delivery/orders/{order_id}/route
Authorization: Bearer <delivery_token>
```

**Response**:
```json
{
  "success": true,
  "data": {
    "pickup_location": {
      "latitude": 19.0596,
      "longitude": 72.8295
    },
    "delivery_location": {
      "latitude": 19.0544,
      "longitude": 72.8347
    },
    "route": {
      "distance": 2.3,
      "duration": 15,
      "polyline": "encoded_polyline_string",
      "steps": [
        {
          "instruction": "Head north on Main Street",
          "distance": 0.5,
          "duration": 3
        }
      ]
    },
    "traffic_conditions": {
      "current_traffic": "moderate",
      "estimated_delay": "5-8 minutes"
    }
  }
}
```

## Delivery Analytics

### Get Delivery Performance
```http
GET /delivery/analytics/performance
Authorization: Bearer <delivery_token>
?period=this_month
```

**Response**:
```json
{
  "success": true,
  "data": {
    "total_deliveries": 47,
    "completed_deliveries": 45,
    "cancelled_deliveries": 2,
    "completion_rate": 95.7,
    "avg_delivery_time": 28.5,
    "on_time_percentage": 92.0,
    "avg_rating": 4.7,
    "total_distance": 156.8,
    "avg_distance_per_delivery": 3.3,
    "earnings": {
      "total": 8650.00,
      "avg_per_delivery": 184.04,
      "tips": 650.00,
      "bonuses": 200.00
    }
  }
}
```

### Get Earnings Breakdown
```http
GET /delivery/earnings/breakdown
Authorization: Bearer <delivery_token>
?date_from=2024-01-01&date_to=2024-01-31
```

### Get Delivery Heatmap
```http
GET /delivery/analytics/heatmap
Authorization: Bearer <delivery_token>
?period=last_30_days
```

## Fleet Management (Admin)

### Get All Delivery Partners
```http
GET /admin/delivery/partners
Authorization: Bearer <admin_token>
?status=active&location=mumbai&rating_min=4.0&page=1&limit=50
```

### Get Partner Performance
```http
GET /admin/delivery/partners/{partner_id}/performance
Authorization: Bearer <admin_token>
?period=this_month
```

### Assign Order to Partner
```http
POST /admin/delivery/assign
Authorization: Bearer <admin_token>
{
  "order_id": "order_123",
  "partner_id": "dp_123",
  "priority": "high"
}
```

### Get Fleet Analytics
```http
GET /admin/delivery/analytics
Authorization: Bearer <admin_token>
?period=this_month&group_by=day
```

**Response**:
```json
{
  "success": true,
  "data": {
    "overview": {
      "total_partners": 156,
      "active_partners": 89,
      "total_deliveries": 2450,
      "avg_delivery_time": 32.5,
      "completion_rate": 94.2
    },
    "performance_metrics": {
      "on_time_delivery": 91.5,
      "customer_satisfaction": 4.6,
      "partner_satisfaction": 4.3,
      "avg_earnings_per_partner": 15600.00
    },
    "daily_breakdown": [
      {
        "date": "2024-01-01",
        "deliveries": 89,
        "active_partners": 34,
        "avg_delivery_time": 31.2
      }
    ]
  }
}
```

## Route Optimization

### Get Optimized Route
```http
POST /delivery/route/optimize
Authorization: Bearer <delivery_token>
{
  "orders": [
    {
      "order_id": "order_123",
      "pickup_location": {
        "latitude": 19.0596,
        "longitude": 72.8295
      },
      "delivery_location": {
        "latitude": 19.0544,
        "longitude": 72.8347
      },
      "priority": "high"
    }
  ],
  "current_location": {
    "latitude": 19.0760,
    "longitude": 72.8777
  }
}
```

### Get Traffic Updates
```http
GET /delivery/traffic/updates
Authorization: Bearer <delivery_token>
?location=mumbai
```

### Report Traffic Issue
```http
POST /delivery/traffic/report
Authorization: Bearer <delivery_token>
{
  "location": {
    "latitude": 19.0760,
    "longitude": 72.8777
  },
  "issue_type": "heavy_traffic|road_closure|accident",
  "description": "Heavy traffic due to construction",
  "severity": "high"
}
```

## Emergency Services

### Report Emergency
```http
POST /delivery/emergency
Authorization: Bearer <delivery_token>
{
  "type": "accident|vehicle_breakdown|safety_concern|medical",
  "description": "Vehicle breakdown on highway",
  "location": {
    "latitude": 19.0760,
    "longitude": 72.8777
  },
  "order_id": "order_123",
  "requires_immediate_assistance": true
}
```

### Get Emergency Contacts
```http
GET /delivery/emergency/contacts
Authorization: Bearer <delivery_token>
```

### Update Emergency Status
```http
PUT /delivery/emergency/{emergency_id}/status
Authorization: Bearer <delivery_token>
{
  "status": "resolved|ongoing|escalated",
  "notes": "Issue resolved, back to normal operations"
}
```

## Delivery Zones

### Get Delivery Zones
```http
GET /delivery/zones
Authorization: Bearer <delivery_token>
```

### Check Zone Availability
```http
GET /delivery/zones/check
Authorization: Bearer <delivery_token>
?latitude=19.0760&longitude=72.8777
```

### Update Zone Preferences
```http
PUT /delivery/zones/preferences
Authorization: Bearer <delivery_token>
{
  "preferred_zones": ["zone_1", "zone_3"],
  "avoid_zones": ["zone_5"],
  "max_distance_from_home": 10
}
```

## Incentives and Bonuses

### Get Available Incentives
```http
GET /delivery/incentives
Authorization: Bearer <delivery_token>
```

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "incentive_123",
      "type": "peak_hour_bonus",
      "title": "Peak Hour Bonus",
      "description": "Extra ₹20 per delivery during 7-9 PM",
      "amount": 20.00,
      "conditions": {
        "time_slots": ["19:00-21:00"],
        "min_deliveries": 3,
        "zone": "high_demand"
      },
      "valid_until": "2024-01-31T23:59:59Z",
      "progress": {
        "current": 2,
        "target": 3
      }
    }
  ]
}
```

### Claim Incentive
```http
POST /delivery/incentives/{incentive_id}/claim
Authorization: Bearer <delivery_token>
```

## Error Codes

| Code | Message | Description |
|------|---------|-------------|
| DEL_001 | Partner not found | Delivery partner doesn't exist |
| DEL_002 | Order not available | Order already assigned or completed |
| DEL_003 | Outside delivery zone | Location outside serviceable area |
| DEL_004 | Partner unavailable | Delivery partner is offline |
| DEL_005 | Invalid vehicle | Vehicle not verified or invalid |
| DEL_006 | Document expired | Required document has expired |
| DEL_007 | Background check pending | Background verification incomplete |
| DEL_008 | Order already accepted | Order already accepted by another partner |
| DEL_009 | Invalid location | GPS coordinates are invalid |
| DEL_010 | Emergency reported | Partner has active emergency status |