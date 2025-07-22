# Reviews & Ratings

## Overview

The review and rating system allows customers to provide feedback on chefs, dishes, and delivery experiences.

## Customer Reviews

### Submit Review
```http
POST /reviews
Authorization: Bearer <customer_token>
{
  "order_id": "order_123",
  "chef_id": "chef_123",
  "dish_id": "dish_123",
  "rating": 5,
  "review_text": "Amazing butter chicken! Authentic taste and perfect spice level.",
  "review_type": "chef|dish|delivery",
  "images": ["base64_image1", "base64_image2"],
  "tags": ["delicious", "authentic", "fast_delivery"]
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "review_123",
    "order_id": "order_123",
    "chef_id": "chef_123",
    "dish_id": "dish_123",
    "customer": {
      "id": "customer_123",
      "name": "John D.",
      "avatar": "https://cdn.homechef.com/avatars/customer_123.jpg"
    },
    "rating": 5,
    "review_text": "Amazing butter chicken! Authentic taste and perfect spice level.",
    "images": [
      "https://cdn.homechef.com/reviews/review_123_1.jpg"
    ],
    "tags": ["delicious", "authentic", "fast_delivery"],
    "helpful_count": 0,
    "status": "published",
    "created_at": "2024-01-15T14:30:00Z"
  }
}
```

### Update Review
```http
PUT /reviews/{review_id}
Authorization: Bearer <customer_token>
{
  "rating": 4,
  "review_text": "Updated review text",
  "images": ["base64_updated_image"]
}
```

### Delete Review
```http
DELETE /reviews/{review_id}
Authorization: Bearer <customer_token>
```

### Get Customer Reviews
```http
GET /customers/reviews
Authorization: Bearer <customer_token>
?page=1&limit=20&sort=created_at&order=desc
```

## Chef Reviews

### Get Chef Reviews
```http
GET /chefs/{chef_id}/reviews
?rating=5&sort=helpful&page=1&limit=20
```

**Response**:
```json
{
  "success": true,
  "data": {
    "reviews": [
      {
        "id": "review_123",
        "customer": {
          "name": "John D.",
          "avatar": "https://cdn.homechef.com/avatars/customer_123.jpg",
          "total_reviews": 25
        },
        "rating": 5,
        "review_text": "Amazing butter chicken! Authentic taste and perfect spice level.",
        "dish": {
          "id": "dish_123",
          "name": "Butter Chicken"
        },
        "images": [
          "https://cdn.homechef.com/reviews/review_123_1.jpg"
        ],
        "tags": ["delicious", "authentic"],
        "helpful_count": 12,
        "is_helpful": false,
        "created_at": "2024-01-15T14:30:00Z",
        "updated_at": "2024-01-15T14:30:00Z"
      }
    ],
    "summary": {
      "total_reviews": 234,
      "average_rating": 4.8,
      "rating_distribution": {
        "5": 156,
        "4": 45,
        "3": 20,
        "2": 8,
        "1": 5
      }
    },
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 234,
      "pages": 12
    }
  }
}
```

### Get Review Statistics
```http
GET /chefs/{chef_id}/reviews/stats
```

**Response**:
```json
{
  "success": true,
  "data": {
    "overall": {
      "average_rating": 4.8,
      "total_reviews": 234,
      "rating_trend": "+0.2"
    },
    "rating_distribution": {
      "5": 156,
      "4": 45,
      "3": 20,
      "2": 8,
      "1": 5
    },
    "categories": {
      "food_quality": 4.9,
      "delivery_time": 4.7,
      "packaging": 4.8,
      "value_for_money": 4.6
    },
    "recent_trend": {
      "last_30_days": {
        "average_rating": 4.9,
        "total_reviews": 45,
        "trend": "+0.3"
      }
    },
    "top_tags": [
      {"tag": "delicious", "count": 89},
      {"tag": "authentic", "count": 67},
      {"tag": "fast_delivery", "count": 45}
    ]
  }
}
```

## Dish Reviews

### Get Dish Reviews
```http
GET /dishes/{dish_id}/reviews
?page=1&limit=10
```

### Get Dish Rating Summary
```http
GET /dishes/{dish_id}/rating-summary
```

**Response**:
```json
{
  "success": true,
  "data": {
    "dish_id": "dish_123",
    "dish_name": "Butter Chicken",
    "average_rating": 4.8,
    "total_reviews": 89,
    "rating_distribution": {
      "5": 56,
      "4": 20,
      "3": 8,
      "2": 3,
      "1": 2
    },
    "aspects": {
      "taste": 4.9,
      "spice_level": 4.7,
      "portion_size": 4.6,
      "presentation": 4.8
    }
  }
}
```

## Review Interactions

### Mark Review as Helpful
```http
POST /reviews/{review_id}/helpful
Authorization: Bearer <token>
```

### Report Review
```http
POST /reviews/{review_id}/report
Authorization: Bearer <token>
{
  "reason": "inappropriate|spam|fake|offensive",
  "description": "Review contains inappropriate language"
}
```

### Chef Response to Review
```http
POST /reviews/{review_id}/response
Authorization: Bearer <chef_token>
{
  "response_text": "Thank you for your feedback! We're glad you enjoyed the butter chicken.",
  "is_public": true
}
```

### Get Review Responses
```http
GET /reviews/{review_id}/responses
```

## Review Moderation (Admin)

### Get Reported Reviews
```http
GET /admin/reviews/reported
Authorization: Bearer <admin_token>
?status=pending&page=1&limit=20
```

### Moderate Review
```http
PUT /admin/reviews/{review_id}/moderate
Authorization: Bearer <admin_token>
{
  "action": "approve|reject|hide",
  "reason": "Violates community guidelines",
  "notes": "Contains inappropriate language"
}
```

### Get Review Analytics
```http
GET /admin/reviews/analytics
Authorization: Bearer <admin_token>
?period=this_month
```

**Response**:
```json
{
  "success": true,
  "data": {
    "total_reviews": 1250,
    "average_rating": 4.6,
    "review_velocity": 45.2,
    "sentiment_analysis": {
      "positive": 78.5,
      "neutral": 15.2,
      "negative": 6.3
    },
    "top_keywords": [
      {"keyword": "delicious", "frequency": 234, "sentiment": "positive"},
      {"keyword": "authentic", "frequency": 189, "sentiment": "positive"},
      {"keyword": "spicy", "frequency": 156, "sentiment": "neutral"}
    ],
    "chef_performance": {
      "top_rated": [
        {
          "chef_id": "chef_123",
          "name": "Priya Sharma",
          "rating": 4.9,
          "reviews": 89
        }
      ],
      "needs_attention": [
        {
          "chef_id": "chef_456",
          "name": "Chef Name",
          "rating": 3.2,
          "reviews": 25
        }
      ]
    }
  }
}
```

## Review Incentives

### Get Review Incentives
```http
GET /reviews/incentives
Authorization: Bearer <customer_token>
```

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "incentive_123",
      "type": "review_bonus",
      "title": "Review & Earn",
      "description": "Get 50 reward points for each detailed review",
      "reward": {
        "type": "points",
        "amount": 50
      },
      "conditions": {
        "min_characters": 100,
        "include_image": false,
        "verified_order": true
      },
      "valid_until": "2024-12-31T23:59:59Z"
    }
  ]
}
```

### Claim Review Reward
```http
POST /reviews/{review_id}/claim-reward
Authorization: Bearer <customer_token>
```

## Review Templates

### Get Review Templates
```http
GET /reviews/templates
Authorization: Bearer <customer_token>
?category=food_quality&rating=5
```

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "template_123",
      "category": "food_quality",
      "rating": 5,
      "template": "The {dish_name} was absolutely delicious! Perfect {aspect} and great {quality}.",
      "placeholders": ["dish_name", "aspect", "quality"],
      "suggested_tags": ["delicious", "authentic", "perfect"]
    }
  ]
}
```

## Review Aggregation

### Get Platform Review Summary
```http
GET /reviews/platform-summary
```

**Response**:
```json
{
  "success": true,
  "data": {
    "overall_rating": 4.6,
    "total_reviews": 12450,
    "categories": {
      "chefs": {
        "average_rating": 4.7,
        "total_reviews": 8900
      },
      "dishes": {
        "average_rating": 4.6,
        "total_reviews": 8900
      },
      "delivery": {
        "average_rating": 4.5,
        "total_reviews": 7800
      }
    },
    "trends": {
      "this_month": {
        "average_rating": 4.7,
        "total_reviews": 890,
        "growth": "+12%"
      }
    }
  }
}
```

### Get Trending Reviews
```http
GET /reviews/trending
?period=this_week&limit=10
```

### Get Featured Reviews
```http
GET /reviews/featured
?category=chef&limit=5
```

## Review Export

### Export Reviews (Chef)
```http
GET /chefs/reviews/export
Authorization: Bearer <chef_token>
?format=csv&date_from=2024-01-01&date_to=2024-01-31
```

### Export Reviews (Admin)
```http
GET /admin/reviews/export
Authorization: Bearer <admin_token>
?format=json&chef_id=chef_123&include_responses=true
```

## Review Notifications

### Review Notification Settings
```http
PUT /reviews/notification-settings
Authorization: Bearer <chef_token>
{
  "new_review": true,
  "review_response": true,
  "rating_milestone": true,
  "weekly_summary": true
}
```

### Get Review Notifications
```http
GET /reviews/notifications
Authorization: Bearer <chef_token>
?unread_only=true&page=1&limit=20
```

## Error Codes

| Code | Message | Description |
|------|---------|-------------|
| REV_001 | Review not found | Review ID doesn't exist |
| REV_002 | Already reviewed | Customer already reviewed this order |
| REV_003 | Order not eligible | Order not completed or too old |
| REV_004 | Invalid rating | Rating must be between 1-5 |
| REV_005 | Review too short | Review text below minimum length |
| REV_006 | Image upload failed | Failed to upload review images |
| REV_007 | Cannot edit | Review editing time expired |
| REV_008 | Inappropriate content | Review contains inappropriate content |
| REV_009 | Spam detected | Review flagged as spam |
| REV_010 | Permission denied | User cannot perform this action |