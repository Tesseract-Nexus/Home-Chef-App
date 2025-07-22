# Inventory Management

## Overview

Inventory management system helps chefs track ingredients, manage stock levels, and ensure dish availability.

## Ingredient Management

### Get Ingredient Inventory
```http
GET /inventory/ingredients
Authorization: Bearer <chef_token>
?category=vegetables&status=in_stock
```

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "ing_123",
      "name": "Basmati Rice",
      "category": "grains",
      "current_stock": {
        "quantity": 5.0,
        "unit": "kg"
      },
      "minimum_stock": 2.0,
      "cost_per_unit": 120.00,
      "supplier": "Local Grocery Store",
      "expiry_date": "2024-03-15",
      "storage_location": "Pantry Shelf 2",
      "status": "in_stock",
      "last_updated": "2024-01-15T10:30:00Z"
    }
  ]
}
```

### Add Ingredient
```http
POST /inventory/ingredients
Authorization: Bearer <chef_token>
{
  "name": "Organic Tomatoes",
  "category": "vegetables",
  "current_stock": {
    "quantity": 3.0,
    "unit": "kg"
  },
  "minimum_stock": 1.0,
  "cost_per_unit": 80.00,
  "supplier": "Organic Farm",
  "expiry_date": "2024-01-20",
  "storage_location": "Refrigerator"
}
```

### Update Stock Level
```http
PUT /inventory/ingredients/{ingredient_id}/stock
Authorization: Bearer <chef_token>
{
  "quantity": 2.0,
  "unit": "kg",
  "operation": "add",
  "reason": "Weekly grocery shopping"
}
```

## Recipe Management

### Get Recipe Ingredients
```http
GET /inventory/recipes/{dish_id}/ingredients
Authorization: Bearer <chef_token>
?servings=4
```

**Response**:
```json
{
  "success": true,
  "data": {
    "dish_id": "dish_123",
    "dish_name": "Butter Chicken",
    "servings": 4,
    "ingredients": [
      {
        "ingredient_id": "ing_123",
        "ingredient_name": "Chicken",
        "quantity": 1.0,
        "unit": "kg",
        "is_optional": false,
        "substitutes": []
      },
      {
        "ingredient_id": "ing_124",
        "ingredient_name": "Tomatoes",
        "quantity": 0.5,
        "unit": "kg",
        "is_optional": false,
        "substitutes": ["canned_tomatoes"]
      }
    ]
  }
}
```

### Update Recipe Ingredients
```http
PUT /inventory/recipes/{dish_id}/ingredients
Authorization: Bearer <chef_token>
{
  "ingredients": [
    {
      "ingredient_id": "ing_123",
      "quantity": 1.0,
      "unit": "kg",
      "is_optional": false
    }
  ]
}
```

## Availability Checking

### Check Ingredient Availability
```http
POST /inventory/availability/check
Authorization: Bearer <chef_token>
{
  "orders": [
    {
      "dish_id": "dish_123",
      "quantity": 2
    },
    {
      "dish_id": "dish_124",
      "quantity": 1
    }
  ]
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "can_fulfill": false,
    "missing_ingredients": [
      {
        "ingredient_name": "Chicken",
        "required_quantity": 2.0,
        "available_quantity": 1.5,
        "shortage": 0.5
      }
    ],
    "dishes_affected": [
      {
        "dish_id": "dish_123",
        "dish_name": "Butter Chicken",
        "can_make": 1,
        "requested": 2
      }
    ]
  }
}
```

## Inventory Alerts

### Get Inventory Alerts
```http
GET /inventory/alerts
Authorization: Bearer <chef_token>
?type=low_stock&priority=high
```

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "alert_123",
      "type": "low_stock",
      "priority": "high",
      "ingredient_id": "ing_123",
      "ingredient_name": "Basmati Rice",
      "current_stock": 1.5,
      "minimum_stock": 2.0,
      "message": "Basmati Rice is running low",
      "created_at": "2024-01-15T10:30:00Z"
    }
  ]
}
```

### Update Alert Settings
```http
PUT /inventory/alerts/settings
Authorization: Bearer <chef_token>
{
  "low_stock_threshold": 10.0,
  "expiry_warning_days": 3,
  "notifications": {
    "email": true,
    "push": true,
    "sms": false
  }
}
```

## Supplier Management

### Get Suppliers
```http
GET /inventory/suppliers
Authorization: Bearer <chef_token>
?location=mumbai&category=vegetables
```

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "supplier_123",
      "name": "Fresh Vegetables Mart",
      "category": "vegetables",
      "contact": {
        "phone": "+919876543210",
        "email": "contact@freshveggies.com"
      },
      "location": "Bandra West, Mumbai",
      "rating": 4.5,
      "delivery_available": true,
      "minimum_order": 500.00,
      "payment_terms": "Cash on Delivery"
    }
  ]
}
```

## Inventory Reports

### Get Usage Report
```http
GET /inventory/reports/usage
Authorization: Bearer <chef_token>
?period=month&ingredient_id=ing_123
```

**Response**:
```json
{
  "success": true,
  "data": {
    "period": "month",
    "ingredient": {
      "id": "ing_123",
      "name": "Basmati Rice"
    },
    "usage_summary": {
      "total_used": 15.0,
      "unit": "kg",
      "avg_daily_usage": 0.5,
      "cost": 1800.00
    },
    "daily_usage": [
      {
        "date": "2024-01-01",
        "quantity_used": 0.8,
        "dishes_made": ["dish_123", "dish_124"],
        "cost": 96.00
      }
    ],
    "top_consuming_dishes": [
      {
        "dish_id": "dish_123",
        "dish_name": "Biryani",
        "quantity_used": 8.0,
        "percentage": 53.3
      }
    ]
  }
}
```

### Get Waste Report
```http
GET /inventory/reports/waste
Authorization: Bearer <chef_token>
?period=month
```

**Response**:
```json
{
  "success": true,
  "data": {
    "period": "month",
    "total_waste": {
      "quantity": 2.5,
      "cost": 450.00
    },
    "waste_by_category": {
      "vegetables": {
        "quantity": 1.5,
        "cost": 300.00,
        "percentage": 60.0
      },
      "dairy": {
        "quantity": 1.0,
        "cost": 150.00,
        "percentage": 40.0
      }
    },
    "waste_reasons": [
      {
        "reason": "expired",
        "quantity": 2.0,
        "cost": 350.00
      },
      {
        "reason": "spoiled",
        "quantity": 0.5,
        "cost": 100.00
      }
    ],
    "recommendations": [
      "Consider reducing order quantity for vegetables",
      "Implement FIFO (First In, First Out) system"
    ]
  }
}
```

## Batch Operations

### Bulk Stock Update
```http
PUT /inventory/ingredients/bulk-update
Authorization: Bearer <chef_token>
{
  "updates": [
    {
      "ingredient_id": "ing_123",
      "quantity": 5.0,
      "operation": "set"
    },
    {
      "ingredient_id": "ing_124",
      "quantity": 2.0,
      "operation": "add"
    }
  ],
  "reason": "Weekly inventory update"
}
```

### Import Inventory
```http
POST /inventory/import
Authorization: Bearer <chef_token>
Content-Type: multipart/form-data

csv_file: <file>
```

### Export Inventory
```http
GET /inventory/export
Authorization: Bearer <chef_token>
?format=csv&include_history=true
```

## Integration Features

### Shopping List Generation
```http
POST /inventory/shopping-list/generate
Authorization: Bearer <chef_token>
{
  "period": "week",
  "include_low_stock": true,
  "include_expiring": true,
  "budget_limit": 5000.00
}
```

### Automatic Reordering
```http
POST /inventory/auto-reorder/setup
Authorization: Bearer <chef_token>
{
  "ingredient_id": "ing_123",
  "reorder_level": 2.0,
  "reorder_quantity": 5.0,
  "supplier_id": "supplier_123",
  "auto_approve": false
}
```

## Error Codes

| Code | Message | Description |
|------|---------|-------------|
| INV_001 | Ingredient not found | Ingredient ID doesn't exist |
| INV_002 | Insufficient stock | Not enough stock for operation |
| INV_003 | Invalid quantity | Quantity must be positive |
| INV_004 | Invalid unit | Unit type not supported |
| INV_005 | Recipe not found | Recipe doesn't exist |
| INV_006 | Supplier not found | Supplier ID doesn't exist |
| INV_007 | Invalid expiry date | Expiry date is in the past |
| INV_008 | Duplicate ingredient | Ingredient already exists |
| INV_009 | Category not found | Invalid ingredient category |
| INV_010 | Stock update failed | Failed to update stock level |