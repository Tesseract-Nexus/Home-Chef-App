# Search & Discovery

## Overview

Search and discovery system enables users to find chefs, dishes, and cuisines efficiently with advanced filtering and personalization.

## Global Search

### Platform-wide Search
```http
GET /search
?q=butter+chicken&type=all&location=mumbai&radius=5
```

**Response**:
```json
{
  "success": true,
  "data": {
    "query": "butter chicken",
    "total_results": 156,
    "results": {
      "chefs": [
        {
          "id": "chef_123",
          "name": "Priya Sharma",
          "specialty": "North Indian Cuisine",
          "rating": 4.8,
          "review_count": 234,
          "location": "Bandra West, Mumbai",
          "distance": 2.3,
          "delivery_time": "45-60 min",
          "min_order": 200.00,
          "is_open": true,
          "image": "https://cdn.homechef.com/chefs/chef_123.jpg",
          "popular_dishes": ["Butter Chicken", "Dal Makhani"]
        }
      ],
      "dishes": [
        {
          "id": "dish_123",
          "name": "Butter Chicken",
          "description": "Rich and creamy tomato-based curry",
          "price": 280.00,
          "chef_id": "chef_123",
          "chef_name": "Priya Sharma",
          "cuisine_type": "north_indian",
          "is_vegetarian": false,
          "rating": 4.9,
          "image": "https://cdn.homechef.com/dishes/dish_123.jpg"
        }
      ],
      "cuisines": [
        {
          "name": "North Indian",
          "chef_count": 45,
          "dish_count": 234,
          "avg_price": 250.00,
          "popular_dishes": ["Butter Chicken", "Dal Makhani", "Naan"]
        }
      ]
    },
    "facets": {
      "cuisine_types": [
        {"name": "North Indian", "count": 89},
        {"name": "South Indian", "count": 67}
      ],
      "price_ranges": [
        {"range": "₹100-200", "count": 45},
        {"range": "₹200-300", "count": 78}
      ]
    },
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 156,
      "has_next": true
    }
  }
}
```

### Advanced Search with Filters
```http
GET /search
?q=north+indian
&filters[cuisine_type][]=north_indian
&filters[price_range][min]=100
&filters[price_range][max]=300
&filters[rating_min]=4.0
&filters[is_vegetarian]=true
&filters[delivery_time_max]=60
&sort=rating
&page=1
&limit=20
```

## Search Suggestions

### Auto-complete Suggestions
```http
GET /search/suggestions
?q=butt&type=dishes&limit=10
```

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "text": "Butter Chicken",
      "type": "dish",
      "metadata": {
        "id": "dish_123",
        "image": "https://cdn.homechef.com/dishes/dish_123.jpg",
        "subtitle": "by Priya Sharma"
      }
    },
    {
      "text": "Butter Naan",
      "type": "dish",
      "metadata": {
        "id": "dish_124",
        "image": "https://cdn.homechef.com/dishes/dish_124.jpg",
        "subtitle": "by Multiple Chefs"
      }
    }
  ]
}
```

### Trending Searches
```http
GET /search/trending
?location=mumbai&period=week&limit=10
```

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "query": "biryani",
      "search_count": 1250,
      "growth": "+25%"
    },
    {
      "query": "north indian",
      "search_count": 980,
      "growth": "+18%"
    }
  ]
}
```

## Popular Content

### Get Popular Items
```http
GET /search/popular
?type=dishes&location=mumbai&period=week&limit=10
```

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "dish_123",
      "name": "Butter Chicken",
      "chef_count": 23,
      "order_count": 456,
      "avg_rating": 4.8,
      "avg_price": 280.00,
      "image": "https://cdn.homechef.com/dishes/dish_123.jpg"
    }
  ]
}
```

## Search Filters

### Get Available Filters
```http
GET /search/filters
?location=mumbai
```

**Response**:
```json
{
  "success": true,
  "data": {
    "cuisine_types": [
      {
        "id": "north_indian",
        "name": "North Indian",
        "count": 89
      },
      {
        "id": "south_indian",
        "name": "South Indian",
        "count": 67
      }
    ],
    "price_ranges": [
      {
        "min": 0,
        "max": 200,
        "label": "Under ₹200",
        "count": 45
      },
      {
        "min": 200,
        "max": 500,
        "label": "₹200 - ₹500",
        "count": 123
      }
    ],
    "dietary_options": [
      {
        "id": "vegetarian",
        "name": "Vegetarian",
        "count": 234
      },
      {
        "id": "vegan",
        "name": "Vegan",
        "count": 45
      }
    ],
    "delivery_times": [
      {
        "max_time": 30,
        "label": "Under 30 mins",
        "count": 67
      },
      {
        "max_time": 60,
        "label": "Under 1 hour",
        "count": 156
      }
    ]
  }
}
```

## Personalized Search

### Get Personalized Recommendations
```http
GET /search/recommendations
Authorization: Bearer <customer_token>
?type=chefs&limit=10
```

**Response**:
```json
{
  "success": true,
  "data": {
    "recommendations": [
      {
        "id": "chef_123",
        "name": "Priya Sharma",
        "reason": "Based on your love for North Indian cuisine",
        "confidence": 0.85,
        "specialty": "North Indian Cuisine",
        "rating": 4.8,
        "distance": 2.3
      }
    ],
    "reasoning": {
      "based_on": ["previous_orders", "cuisine_preferences", "location"],
      "user_preferences": {
        "favorite_cuisines": ["north_indian", "punjabi"],
        "avg_order_value": 250.00,
        "preferred_delivery_time": "evening"
      }
    }
  }
}
```

### Search History
```http
GET /search/history
Authorization: Bearer <customer_token>
?limit=20
```

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "query": "butter chicken",
      "filters": {
        "location": "mumbai",
        "cuisine_type": "north_indian"
      },
      "results_count": 45,
      "clicked_result": "chef_123",
      "searched_at": "2024-01-15T10:30:00Z"
    }
  ]
}
```

## Saved Searches

### Save Search Query
```http
POST /search/save
Authorization: Bearer <customer_token>
{
  "query": "north indian near me",
  "filters": {
    "cuisine_type": ["north_indian"],
    "location": "mumbai",
    "rating_min": 4.0
  },
  "name": "My Favorite North Indian",
  "notify_new_results": true
}
```

### Get Saved Searches
```http
GET /search/saved
Authorization: Bearer <customer_token>
```

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "saved_123",
      "name": "My Favorite North Indian",
      "query": "north indian near me",
      "filters": {
        "cuisine_type": ["north_indian"],
        "location": "mumbai",
        "rating_min": 4.0
      },
      "notify_new_results": true,
      "last_checked": "2024-01-15T10:30:00Z",
      "new_results_count": 3,
      "created_at": "2024-01-10T10:30:00Z"
    }
  ]
}
```

## Search Analytics

### Get Search Analytics (Admin)
```http
GET /admin/search/analytics
Authorization: Bearer <admin_token>
?period=month
```

**Response**:
```json
{
  "success": true,
  "data": {
    "total_searches": 45678,
    "unique_searchers": 12345,
    "avg_searches_per_user": 3.7,
    "top_queries": [
      {
        "query": "biryani",
        "count": 2345,
        "conversion_rate": 15.6
      }
    ],
    "search_to_order_conversion": 12.8,
    "zero_result_queries": [
      {
        "query": "thai food",
        "count": 234,
        "suggestions": ["asian cuisine", "chinese food"]
      }
    ],
    "popular_filters": {
      "cuisine_type": 78.5,
      "price_range": 45.2,
      "rating": 34.7
    }
  }
}
```

## Search Optimization

### Update Search Rankings (Admin)
```http
PUT /admin/search/rankings
Authorization: Bearer <admin_token>
{
  "chef_id": "chef_123",
  "boost_factor": 1.2,
  "reason": "Featured chef promotion"
}
```

### Manage Search Synonyms (Admin)
```http
POST /admin/search/synonyms
Authorization: Bearer <admin_token>
{
  "term": "biryani",
  "synonyms": ["biriyani", "briyani", "rice dish"],
  "category": "dish"
}
```

## Error Codes

| Code | Message | Description |
|------|---------|-------------|
| SEARCH_001 | Invalid query | Search query is empty or invalid |
| SEARCH_002 | No results found | No results match the search criteria |
| SEARCH_003 | Invalid filter | Filter parameters are invalid |
| SEARCH_004 | Location required | Location is required for this search |
| SEARCH_005 | Search limit exceeded | Too many search requests |
| SEARCH_006 | Saved search not found | Saved search ID doesn't exist |
| SEARCH_007 | Invalid sort parameter | Sort parameter is not supported |
| SEARCH_008 | Search timeout | Search request timed out |
| SEARCH_009 | Invalid coordinates | GPS coordinates are invalid |
| SEARCH_010 | Service unavailable | Search service temporarily unavailable |