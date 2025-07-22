# Menu Management

## Overview

Menu management handles dish creation, categorization, pricing, and availability for chefs.

## Menu Items

### Get Chef Menu
```http
GET /chefs/{chef_id}/menu
?category=main_course&available=true&sort=popularity
```

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "dish_123",
      "name": "Butter Chicken",
      "description": "Rich and creamy tomato-based curry with tender chicken pieces",
      "price": 280.00,
      "category": "main_course",
      "cuisine_type": "north_indian",
      "images": [
        "https://cdn.homechef.com/dishes/dish_123_1.jpg",
        "https://cdn.homechef.com/dishes/dish_123_2.jpg"
      ],
      "is_vegetarian": false,
      "is_vegan": false,
      "is_gluten_free": false,
      "spice_level": "medium",
      "preparation_time": 25,
      "serves": 2,
      "calories": 420,
      "ingredients": ["chicken", "tomatoes", "cream", "spices"],
      "allergens": ["dairy"],
      "nutritional_info": {
        "calories": 420,
        "protein": 28,
        "carbs": 12,
        "fat": 32,
        "fiber": 3,
        "sugar": 8
      },
      "is_available": true,
      "rating": 4.8,
      "total_orders": 156,
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-15T10:30:00Z"
    }
  ]
}
```

### Add Menu Item
```http
POST /chefs/menu
Authorization: Bearer <chef_token>
{
  "name": "Dal Makhani",
  "description": "Creamy black lentils slow-cooked with butter and cream",
  "price": 220.00,
  "category": "main_course",
  "cuisine_type": "north_indian",
  "is_vegetarian": true,
  "is_vegan": false,
  "is_gluten_free": true,
  "spice_level": "mild",
  "preparation_time": 20,
  "serves": 2,
  "ingredients": ["black_lentils", "butter", "cream", "tomatoes", "spices"],
  "allergens": ["dairy"],
  "nutritional_info": {
    "calories": 320,
    "protein": 18,
    "carbs": 28,
    "fat": 18,
    "fiber": 12,
    "sugar": 6
  },
  "is_available": true
}
```

### Update Menu Item
```http
PUT /chefs/menu/{dish_id}
Authorization: Bearer <chef_token>
{
  "price": 250.00,
  "description": "Updated description with new ingredients",
  "is_available": true
}
```

### Upload Dish Images
```http
POST /chefs/menu/{dish_id}/images
Authorization: Bearer <chef_token>
Content-Type: multipart/form-data

images: <file1>
images: <file2>
images: <file3>
```

### Delete Menu Item
```http
DELETE /chefs/menu/{dish_id}
Authorization: Bearer <chef_token>
```

### Toggle Item Availability
```http
PUT /chefs/menu/{dish_id}/availability
Authorization: Bearer <chef_token>
{
  "is_available": false,
  "reason": "Out of ingredients"
}
```

## Menu Categories

### Get Categories
```http
GET /menu/categories
```

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "appetizers",
      "name": "Appetizers",
      "description": "Starters and small plates",
      "icon": "🥗",
      "sort_order": 1
    },
    {
      "id": "main_course",
      "name": "Main Course",
      "description": "Primary dishes",
      "icon": "🍛",
      "sort_order": 2
    },
    {
      "id": "desserts",
      "name": "Desserts",
      "description": "Sweet treats",
      "icon": "🍰",
      "sort_order": 3
    }
  ]
}
```

### Create Custom Category (Chef)
```http
POST /chefs/menu/categories
Authorization: Bearer <chef_token>
{
  "name": "Chef's Special",
  "description": "Signature dishes",
  "sort_order": 1
}
```

## Menu Search and Filtering

### Search Menu Items
```http
GET /menu/search
?q=butter+chicken
&chef_id=chef_123
&category=main_course
&cuisine=north_indian
&vegetarian=true
&spice_level=mild
&price_min=100
&price_max=500
&available=true
&sort=popularity
&page=1
&limit=20
```

### Get Popular Dishes
```http
GET /menu/popular
?location=mumbai&cuisine=north_indian&limit=10
```

### Get Trending Dishes
```http
GET /menu/trending
?period=this_week&limit=10
```

## Menu Recommendations

### Get Personalized Recommendations
```http
GET /menu/recommendations
Authorization: Bearer <customer_token>
?chef_id=chef_123&limit=10
```

### Get Similar Dishes
```http
GET /menu/{dish_id}/similar
?limit=5
```

### Get Chef's Recommendations
```http
GET /chefs/{chef_id}/recommendations
```

## Menu Analytics

### Get Dish Performance
```http
GET /chefs/menu/{dish_id}/analytics
Authorization: Bearer <chef_token>
?period=last_30_days
```

**Response**:
```json
{
  "success": true,
  "data": {
    "dish_id": "dish_123",
    "name": "Butter Chicken",
    "period": "last_30_days",
    "metrics": {
      "total_orders": 45,
      "revenue": 12600.00,
      "avg_rating": 4.8,
      "total_reviews": 23,
      "view_count": 1250,
      "conversion_rate": 3.6
    },
    "trends": {
      "orders": "+15%",
      "revenue": "+18%",
      "rating": "+0.2"
    },
    "popular_times": [
      {"hour": 12, "orders": 8},
      {"hour": 19, "orders": 12},
      {"hour": 20, "orders": 15}
    ]
  }
}
```

### Get Menu Performance Summary
```http
GET /chefs/menu/analytics
Authorization: Bearer <chef_token>
?period=this_month
```

## Menu Bulk Operations

### Bulk Update Prices
```http
PUT /chefs/menu/bulk/prices
Authorization: Bearer <chef_token>
{
  "operation": "increase",
  "value": 10,
  "type": "percentage",
  "category": "main_course"
}
```

### Bulk Update Availability
```http
PUT /chefs/menu/bulk/availability
Authorization: Bearer <chef_token>
{
  "is_available": false,
  "dish_ids": ["dish_123", "dish_124", "dish_125"],
  "reason": "Kitchen maintenance"
}
```

### Import Menu from CSV
```http
POST /chefs/menu/import
Authorization: Bearer <chef_token>
Content-Type: multipart/form-data

csv_file: <file>
```

### Export Menu to CSV
```http
GET /chefs/menu/export
Authorization: Bearer <chef_token>
```

## Menu Validation

### Validate Menu Item
```http
POST /menu/validate
Authorization: Bearer <chef_token>
{
  "name": "New Dish",
  "price": 250.00,
  "ingredients": ["chicken", "spices"],
  "allergens": ["dairy"]
}
```

### Check Dish Name Availability
```http
GET /chefs/menu/check-name
Authorization: Bearer <chef_token>
?name=Butter+Chicken
```

## Seasonal Menus

### Create Seasonal Menu
```http
POST /chefs/menu/seasonal
Authorization: Bearer <chef_token>
{
  "name": "Winter Special",
  "description": "Warm and comforting dishes for winter",
  "start_date": "2024-12-01",
  "end_date": "2024-02-28",
  "dish_ids": ["dish_123", "dish_124"]
}
```

### Get Active Seasonal Menus
```http
GET /chefs/menu/seasonal/active
Authorization: Bearer <chef_token>
```

## Menu Modifiers and Add-ons

### Get Dish Modifiers
```http
GET /menu/{dish_id}/modifiers
```

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "mod_123",
      "name": "Spice Level",
      "type": "single_select",
      "required": true,
      "options": [
        {"id": "mild", "name": "Mild", "price": 0},
        {"id": "medium", "name": "Medium", "price": 0},
        {"id": "hot", "name": "Hot", "price": 0}
      ]
    },
    {
      "id": "mod_124",
      "name": "Add-ons",
      "type": "multi_select",
      "required": false,
      "options": [
        {"id": "extra_rice", "name": "Extra Rice", "price": 30},
        {"id": "extra_naan", "name": "Extra Naan", "price": 40}
      ]
    }
  ]
}
```

### Add Dish Modifier
```http
POST /chefs/menu/{dish_id}/modifiers
Authorization: Bearer <chef_token>
{
  "name": "Portion Size",
  "type": "single_select",
  "required": true,
  "options": [
    {"name": "Regular", "price": 0},
    {"name": "Large", "price": 50}
  ]
}
```

## Error Codes

| Code | Message | Description |
|------|---------|-------------|
| MENU_001 | Dish not found | Menu item doesn't exist |
| MENU_002 | Invalid category | Category doesn't exist |
| MENU_003 | Duplicate dish name | Dish name already exists for chef |
| MENU_004 | Invalid price | Price must be positive number |
| MENU_005 | Image upload failed | Failed to upload dish image |
| MENU_006 | Invalid ingredients | Ingredients list is invalid |
| MENU_007 | Dish unavailable | Dish is currently unavailable |
| MENU_008 | Category limit exceeded | Maximum categories reached |
| MENU_009 | Invalid nutritional info | Nutritional data is invalid |
| MENU_010 | Modifier not found | Dish modifier doesn't exist |