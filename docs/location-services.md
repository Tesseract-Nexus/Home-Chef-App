# Location Services

## Overview

Location services provide geospatial functionality including address validation, geocoding, distance calculation, and delivery zone management.

## Address Validation

### Validate Address
```http
POST /locations/validate
{
  "address": "123 Main Street, Bandra West, Mumbai",
  "pincode": "400050",
  "coordinates": {
    "latitude": 19.0596,
    "longitude": 72.8295
  }
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "is_valid": true,
    "is_serviceable": true,
    "coordinates": {
      "latitude": 19.0596,
      "longitude": 72.8295
    },
    "formatted_address": "123 Main Street, Bandra West, Mumbai, Maharashtra 400050",
    "components": {
      "street": "123 Main Street",
      "area": "Bandra West",
      "city": "Mumbai",
      "state": "Maharashtra",
      "pincode": "400050"
    },
    "suggestions": []
  }
}
```

## Geocoding Services

### Geocode Address
```http
POST /locations/geocode
{
  "address": "Bandra West, Mumbai, Maharashtra"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "coordinates": {
      "latitude": 19.0596,
      "longitude": 72.8295
    },
    "formatted_address": "Bandra West, Mumbai, Maharashtra, India",
    "components": {
      "area": "Bandra West",
      "city": "Mumbai",
      "state": "Maharashtra",
      "country": "India"
    },
    "accuracy": "exact"
  }
}
```

### Reverse Geocode
```http
POST /locations/reverse-geocode
{
  "latitude": 19.0596,
  "longitude": 72.8295
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "formatted_address": "Bandra West, Mumbai, Maharashtra 400050, India",
    "components": {
      "street": "Linking Road",
      "area": "Bandra West",
      "city": "Mumbai",
      "state": "Maharashtra",
      "pincode": "400050",
      "country": "India"
    },
    "landmarks": [
      {
        "name": "Bandra Railway Station",
        "distance": 0.5,
        "type": "transport"
      }
    ]
  }
}
```

## Distance & Route Calculation

### Calculate Distance
```http
POST /locations/distance
{
  "origin": {
    "latitude": 19.0596,
    "longitude": 72.8295
  },
  "destination": {
    "latitude": 19.0544,
    "longitude": 72.8347
  },
  "mode": "driving"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "distance": {
      "value": 2.3,
      "text": "2.3 km"
    },
    "duration": {
      "value": 900,
      "text": "15 mins"
    },
    "mode": "driving"
  }
}
```

### Get Route
```http
POST /locations/route
{
  "origin": {
    "latitude": 19.0596,
    "longitude": 72.8295
  },
  "destination": {
    "latitude": 19.0544,
    "longitude": 72.8347
  },
  "waypoints": [
    {
      "latitude": 19.0570,
      "longitude": 72.8320
    }
  ],
  "mode": "driving",
  "optimize": true
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "route": {
      "distance": 2.8,
      "duration": 18,
      "polyline": "encoded_polyline_string",
      "steps": [
        {
          "instruction": "Head north on Linking Road",
          "distance": 0.5,
          "duration": 3,
          "start_location": {
            "latitude": 19.0596,
            "longitude": 72.8295
          },
          "end_location": {
            "latitude": 19.0620,
            "longitude": 72.8295
          }
        }
      ]
    },
    "traffic_conditions": {
      "current_traffic": "moderate",
      "estimated_delay": "5-8 minutes",
      "alternative_routes": 2
    }
  }
}
```

## Proximity Search

### Find Nearby Locations
```http
GET /locations/nearby
?latitude=19.0596&longitude=72.8295&type=chefs&radius=5&limit=20
```

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "chef_123",
      "name": "Priya Sharma",
      "type": "chef",
      "coordinates": {
        "latitude": 19.0580,
        "longitude": 72.8310
      },
      "distance": 0.8,
      "address": "Bandra West, Mumbai",
      "rating": 4.8,
      "is_open": true
    }
  ]
}
```

## Delivery Zone Management

### Get Delivery Zones
```http
GET /locations/delivery-zones
?city=mumbai&chef_id=chef_123
```

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "zone_123",
      "name": "Bandra Zone",
      "chef_id": "chef_123",
      "boundaries": {
        "type": "Polygon",
        "coordinates": [
          [
            [72.8200, 19.0500],
            [72.8400, 19.0500],
            [72.8400, 19.0700],
            [72.8200, 19.0700],
            [72.8200, 19.0500]
          ]
        ]
      },
      "delivery_fee": 25.00,
      "min_order_amount": 200.00,
      "max_delivery_time": 60,
      "is_active": true
    }
  ]
}
```

### Check Delivery Zone
```http
POST /locations/delivery-zones/check
{
  "latitude": 19.0596,
  "longitude": 72.8295,
  "chef_id": "chef_123"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "is_serviceable": true,
    "zone_id": "zone_123",
    "zone_name": "Bandra Zone",
    "delivery_fee": 25.00,
    "estimated_delivery_time": 45,
    "distance_from_chef": 2.3
  }
}
```

## City & Area Management

### Get Supported Cities
```http
GET /locations/cities
?country=IN&state=Maharashtra
```

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "mumbai",
      "name": "Mumbai",
      "state": "Maharashtra",
      "country": "India",
      "coordinates": {
        "latitude": 19.0760,
        "longitude": 72.8777
      },
      "is_serviceable": true,
      "chef_count": 456,
      "popular_areas": [
        "Bandra West",
        "Andheri East",
        "Powai",
        "Worli"
      ]
    }
  ]
}
```

### Get Serviceable Areas
```http
GET /locations/areas
?city=mumbai&pincode=400050
```

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "area_id": "bandra_west",
      "name": "Bandra West",
      "pincode": "400050",
      "is_serviceable": true,
      "chef_count": 23,
      "avg_delivery_time": 45,
      "popular_cuisines": ["North Indian", "South Indian", "Chinese"]
    }
  ]
}
```

## Location Analytics

### Get Location Performance (Admin)
```http
GET /admin/locations/analytics
Authorization: Bearer <admin_token>
?city=mumbai&period=month
```

**Response**:
```json
{
  "success": true,
  "data": {
    "city": "Mumbai",
    "period": "month",
    "metrics": {
      "total_orders": 12456,
      "total_revenue": 2456780.00,
      "avg_delivery_time": 42.5,
      "customer_satisfaction": 4.6
    },
    "top_areas": [
      {
        "area": "Bandra West",
        "orders": 2345,
        "revenue": 456780.00,
        "growth": "+15%"
      }
    ],
    "delivery_heatmap": {
      "high_demand_areas": ["Bandra", "Andheri", "Powai"],
      "peak_hours": ["12:00-14:00", "19:00-21:00"],
      "avg_distance": 3.2
    }
  }
}
```

## Location-based Recommendations

### Get Location Recommendations
```http
GET /locations/recommendations
Authorization: Bearer <customer_token>
?latitude=19.0596&longitude=72.8295
```

**Response**:
```json
{
  "success": true,
  "data": {
    "nearby_chefs": [
      {
        "chef_id": "chef_123",
        "distance": 0.8,
        "estimated_delivery": 25,
        "reason": "Closest highly-rated chef"
      }
    ],
    "popular_in_area": [
      {
        "dish_id": "dish_123",
        "name": "Vada Pav",
        "popularity_score": 0.95,
        "reason": "Most ordered in Bandra"
      }
    ],
    "trending_cuisines": [
      {
        "cuisine": "Street Food",
        "growth": "+25%",
        "chef_count": 12
      }
    ]
  }
}
```

## Error Codes

| Code | Message | Description |
|------|---------|-------------|
| LOC_001 | Invalid coordinates | GPS coordinates are invalid |
| LOC_002 | Address not found | Address could not be geocoded |
| LOC_003 | Outside service area | Location is not serviceable |
| LOC_004 | Invalid pincode | Pincode format is invalid |
| LOC_005 | Geocoding failed | Geocoding service unavailable |
| LOC_006 | Route not found | No route available between points |
| LOC_007 | Distance calculation failed | Unable to calculate distance |
| LOC_008 | Zone not found | Delivery zone doesn't exist |
| LOC_009 | Invalid boundary | Zone boundary is invalid |
| LOC_010 | Location service unavailable | Location service is down |