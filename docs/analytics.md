# Analytics & Reporting

## Overview

Analytics system provides comprehensive business intelligence, performance metrics, and reporting capabilities.

## Platform Analytics

### Get Platform Overview
```http
GET /analytics/platform/overview
Authorization: Bearer <admin_token>
?period=this_month
```

**Response**:
```json
{
  "success": true,
  "data": {
    "revenue": {
      "total": 2456780.00,
      "growth": 23.5,
      "trend": "increasing",
      "breakdown": {
        "orders": 2200000.00,
        "delivery_fees": 156780.00,
        "platform_fees": 100000.00
      }
    },
    "orders": {
      "total": 12456,
      "growth": 18.2,
      "completion_rate": 94.4,
      "avg_order_value": 197.25
    },
    "users": {
      "total_active": 8934,
      "new_users": 1234,
      "retention_rate": 68.5,
      "churn_rate": 5.2
    },
    "chefs": {
      "total_active": 456,
      "new_chefs": 23,
      "avg_rating": 4.7,
      "retention_rate": 85.3
    },
    "delivery_partners": {
      "total_active": 234,
      "avg_delivery_time": 42,
      "completion_rate": 96.8,
      "avg_rating": 4.5
    }
  }
}
```

### Get Revenue Analytics
```http
GET /analytics/revenue
Authorization: Bearer <admin_token>
?period=last_6_months&group_by=month&breakdown=true
```

**Response**:
```json
{
  "success": true,
  "data": {
    "total_revenue": 12456780.00,
    "period": "last_6_months",
    "growth_rate": 25.3,
    "breakdown": {
      "gross_revenue": 12456780.00,
      "platform_fees": 1867517.00,
      "payment_processing": 311419.50,
      "net_revenue": 10277843.50
    },
    "monthly_data": [
      {
        "month": "2024-01",
        "revenue": 2456780.00,
        "orders": 12456,
        "avg_order_value": 197.25,
        "growth": 23.5
      }
    ],
    "revenue_sources": {
      "commission": 75.2,
      "delivery_fees": 15.8,
      "subscription": 6.3,
      "advertising": 2.7
    }
  }
}
```

### Get User Analytics
```http
GET /analytics/users
Authorization: Bearer <admin_token>
?period=this_month&segment=new_users
```

**Response**:
```json
{
  "success": true,
  "data": {
    "user_metrics": {
      "total_users": 45678,
      "active_users": 8934,
      "new_users": 1234,
      "returning_users": 7700,
      "user_growth_rate": 15.7
    },
    "engagement": {
      "avg_session_duration": 12.5,
      "avg_sessions_per_user": 3.2,
      "bounce_rate": 25.3,
      "retention_rates": {
        "day_1": 85.2,
        "day_7": 68.5,
        "day_30": 45.3
      }
    },
    "demographics": {
      "age_groups": {
        "18-25": 25.3,
        "26-35": 45.7,
        "36-45": 20.1,
        "46+": 8.9
      },
      "gender": {
        "male": 52.3,
        "female": 45.7,
        "other": 2.0
      },
      "locations": {
        "mumbai": 35.2,
        "delhi": 28.7,
        "bangalore": 18.9,
        "others": 17.2
      }
    },
    "user_journey": {
      "acquisition_channels": {
        "organic": 45.2,
        "social_media": 25.8,
        "referrals": 15.3,
        "paid_ads": 13.7
      },
      "conversion_funnel": {
        "visitors": 100000,
        "signups": 15000,
        "first_order": 8500,
        "repeat_customers": 5200
      }
    }
  }
}
```

## Chef Analytics

### Get Chef Performance
```http
GET /analytics/chefs/{chef_id}/performance
Authorization: Bearer <chef_token>
?period=last_30_days
```

**Response**:
```json
{
  "success": true,
  "data": {
    "overview": {
      "total_orders": 89,
      "revenue": 18450.00,
      "avg_order_value": 207.30,
      "rating": 4.8,
      "completion_rate": 96.6
    },
    "trends": {
      "orders": "+15%",
      "revenue": "+18%",
      "rating": "+0.2",
      "avg_order_value": "+5%"
    },
    "order_patterns": {
      "peak_hours": [
        {"hour": 12, "orders": 15},
        {"hour": 19, "orders": 25},
        {"hour": 20, "orders": 20}
      ],
      "peak_days": [
        {"day": "friday", "orders": 18},
        {"day": "saturday", "orders": 22},
        {"day": "sunday", "orders": 16}
      ]
    },
    "dish_performance": [
      {
        "dish_id": "dish_123",
        "name": "Butter Chicken",
        "orders": 25,
        "revenue": 7000.00,
        "rating": 4.9,
        "profit_margin": 65.2
      }
    ],
    "customer_insights": {
      "repeat_customers": 67,
      "new_customers": 22,
      "avg_customer_lifetime_value": 1250.00,
      "customer_satisfaction": 4.8
    }
  }
}
```

### Get Chef Ranking
```http
GET /analytics/chefs/ranking
Authorization: Bearer <admin_token>
?metric=revenue&period=this_month&location=mumbai&limit=50
```

### Get Chef Benchmarks
```http
GET /analytics/chefs/{chef_id}/benchmarks
Authorization: Bearer <chef_token>
```

**Response**:
```json
{
  "success": true,
  "data": {
    "your_performance": {
      "rating": 4.8,
      "orders_per_month": 89,
      "avg_order_value": 207.30,
      "response_time": 5.2
    },
    "market_average": {
      "rating": 4.5,
      "orders_per_month": 65,
      "avg_order_value": 185.50,
      "response_time": 8.5
    },
    "top_10_percentile": {
      "rating": 4.9,
      "orders_per_month": 150,
      "avg_order_value": 250.00,
      "response_time": 3.0
    },
    "recommendations": [
      {
        "area": "response_time",
        "suggestion": "Reduce order confirmation time to improve customer satisfaction",
        "potential_impact": "5-10% increase in repeat orders"
      }
    ]
  }
}
```

## Order Analytics

### Get Order Analytics
```http
GET /analytics/orders
Authorization: Bearer <admin_token>
?period=this_month&group_by=day
```

**Response**:
```json
{
  "success": true,
  "data": {
    "summary": {
      "total_orders": 12456,
      "completed_orders": 11750,
      "cancelled_orders": 706,
      "completion_rate": 94.3,
      "avg_order_value": 197.25,
      "total_revenue": 2456780.00
    },
    "order_flow": {
      "placed": 12456,
      "confirmed": 12200,
      "preparing": 11950,
      "ready": 11850,
      "delivering": 11800,
      "delivered": 11750,
      "cancelled": 706
    },
    "cancellation_analysis": {
      "customer_cancelled": 423,
      "chef_cancelled": 156,
      "system_cancelled": 89,
      "delivery_failed": 38,
      "top_reasons": [
        {"reason": "changed_mind", "count": 234},
        {"reason": "long_wait_time", "count": 189}
      ]
    },
    "timing_analysis": {
      "avg_preparation_time": 28.5,
      "avg_delivery_time": 35.2,
      "avg_total_time": 63.7,
      "on_time_delivery": 89.3
    },
    "daily_breakdown": [
      {
        "date": "2024-01-01",
        "orders": 456,
        "revenue": 89750.00,
        "completion_rate": 95.2
      }
    ]
  }
}
```

### Get Order Heatmap
```http
GET /analytics/orders/heatmap
Authorization: Bearer <admin_token>
?location=mumbai&period=this_month
```

### Get Peak Hours Analysis
```http
GET /analytics/orders/peak-hours
Authorization: Bearer <admin_token>
?location=mumbai&period=last_7_days
```

## Customer Analytics

### Get Customer Insights
```http
GET /analytics/customers
Authorization: Bearer <admin_token>
?segment=high_value&period=this_month
```

**Response**:
```json
{
  "success": true,
  "data": {
    "customer_segments": {
      "high_value": {
        "count": 1234,
        "avg_order_value": 450.00,
        "order_frequency": 8.5,
        "lifetime_value": 3825.00
      },
      "regular": {
        "count": 5678,
        "avg_order_value": 220.00,
        "order_frequency": 4.2,
        "lifetime_value": 924.00
      },
      "occasional": {
        "count": 2345,
        "avg_order_value": 180.00,
        "order_frequency": 1.8,
        "lifetime_value": 324.00
      }
    },
    "behavior_patterns": {
      "preferred_cuisines": [
        {"cuisine": "north_indian", "percentage": 35.2},
        {"cuisine": "south_indian", "percentage": 28.7}
      ],
      "ordering_times": {
        "lunch": 35.8,
        "dinner": 58.2,
        "snacks": 6.0
      },
      "payment_preferences": {
        "upi": 45.2,
        "cards": 32.1,
        "wallets": 15.3,
        "cod": 7.4
      }
    },
    "churn_analysis": {
      "churn_rate": 5.2,
      "at_risk_customers": 456,
      "churn_reasons": [
        {"reason": "poor_experience", "percentage": 35.2},
        {"reason": "price_sensitivity", "percentage": 28.7}
      ]
    }
  }
}
```

### Get Customer Lifetime Value
```http
GET /analytics/customers/ltv
Authorization: Bearer <admin_token>
?segment=all&period=last_12_months
```

### Get Customer Cohort Analysis
```http
GET /analytics/customers/cohorts
Authorization: Bearer <admin_token>
?start_date=2023-01-01&end_date=2024-01-31
```

## Financial Analytics

### Get Financial Dashboard
```http
GET /analytics/financial/dashboard
Authorization: Bearer <admin_token>
?period=this_month
```

**Response**:
```json
{
  "success": true,
  "data": {
    "revenue_streams": {
      "commission": {
        "amount": 1867517.00,
        "percentage": 75.2,
        "growth": 25.3
      },
      "delivery_fees": {
        "amount": 392456.00,
        "percentage": 15.8,
        "growth": 18.7
      },
      "subscription": {
        "amount": 156780.00,
        "percentage": 6.3,
        "growth": 45.2
      }
    },
    "expenses": {
      "payment_processing": 311419.50,
      "technology": 125000.00,
      "marketing": 89000.00,
      "operations": 67500.00,
      "customer_support": 45000.00
    },
    "profitability": {
      "gross_profit": 2145360.50,
      "net_profit": 1507440.50,
      "profit_margin": 61.4,
      "ebitda": 1789440.50
    },
    "cash_flow": {
      "operating_cash_flow": 1567890.00,
      "free_cash_flow": 1234567.00,
      "cash_conversion_cycle": 15.2
    }
  }
}
```

### Get P&L Statement
```http
GET /analytics/financial/pnl
Authorization: Bearer <admin_token>
?period=this_quarter&format=detailed
```

### Get Unit Economics
```http
GET /analytics/financial/unit-economics
Authorization: Bearer <admin_token>
```

**Response**:
```json
{
  "success": true,
  "data":  {
    "customer_acquisition": {
      "cost_per_acquisition": 125.50,
      "lifetime_value": 1250.00,
      "ltv_cac_ratio": 9.96,
      "payback_period": 3.2
    },
    "order_economics": {
      "avg_order_value": 197.25,
      "gross_margin": 18.5,
      "contribution_margin": 15.2,
      "unit_contribution": 29.98
    },
    "chef_economics": {
      "avg_chef_revenue": 15600.00,
      "platform_take_rate": 15.0,
      "chef_retention_rate": 85.3
    }
  }
}
```

## Operational Analytics

### Get Operational Metrics
```http
GET /analytics/operations
Authorization: Bearer <admin_token>
?period=this_month
```

**Response**:
```json
{
  "success": true,
  "data": {
    "order_fulfillment": {
      "avg_preparation_time": 28.5,
      "avg_delivery_time": 35.2,
      "on_time_delivery": 89.3,
      "order_accuracy": 96.8
    },
    "chef_performance": {
      "avg_response_time": 6.2,
      "order_acceptance_rate": 92.5,
      "chef_availability": 78.9,
      "avg_chef_rating": 4.7
    },
    "delivery_performance": {
      "avg_pickup_time": 8.5,
      "delivery_success_rate": 96.8,
      "avg_delivery_rating": 4.5,
      "partner_utilization": 67.3
    },
    "customer_service": {
      "avg_response_time": 2.3,
      "first_contact_resolution": 78.5,
      "customer_satisfaction": 4.6,
      "complaint_resolution_time": 24.5
    }
  }
}
```

### Get Quality Metrics
```http
GET /analytics/quality
Authorization: Bearer <admin_token>
?period=this_month
```

### Get Efficiency Metrics
```http
GET /analytics/efficiency
Authorization: Bearer <admin_token>
?department=all&period=this_month
```

## Custom Reports

### Create Custom Report
```http
POST /analytics/reports/custom
Authorization: Bearer <admin_token>
{
  "name": "Weekly Chef Performance",
  "description": "Weekly performance report for all chefs",
  "metrics": [
    "total_orders",
    "revenue",
    "avg_rating",
    "response_time"
  ],
  "dimensions": [
    "chef_id",
    "location",
    "cuisine_type"
  ],
  "filters": {
    "date_range": {
      "start": "2024-01-01",
      "end": "2024-01-07"
    },
    "chef_status": "active",
    "min_orders": 5
  },
  "schedule": {
    "frequency": "weekly",
    "day_of_week": "monday",
    "time": "09:00",
    "timezone": "Asia/Kolkata"
  },
  "delivery": {
    "email": ["admin@homechef.com"],
    "format": "pdf"
  }
}
```

### Get Report
```http
GET /analytics/reports/{report_id}
Authorization: Bearer <admin_token>
?format=json&download=false
```

### Schedule Report
```http
POST /analytics/reports/{report_id}/schedule
Authorization: Bearer <admin_token>
{
  "frequency": "daily|weekly|monthly",
  "recipients": ["admin@homechef.com"],
  "format": "pdf|excel|csv"
}
```

## Real-time Analytics

### Get Real-time Dashboard
```http
GET /analytics/realtime/dashboard
Authorization: Bearer <admin_token>
```

**Response**:
```json
{
  "success": true,
  "data": {
    "current_metrics": {
      "active_users": 1234,
      "orders_in_progress": 89,
      "active_chefs": 156,
      "active_delivery_partners": 78,
      "avg_response_time": 2.3
    },
    "live_orders": {
      "placed_last_hour": 45,
      "confirmed_last_hour": 42,
      "delivered_last_hour": 38
    },
    "system_health": {
      "api_response_time": 150,
      "database_performance": 95.2,
      "payment_gateway_status": "healthy",
      "notification_delivery": 98.5
    },
    "alerts": [
      {
        "type": "warning",
        "message": "High order volume in Mumbai",
        "timestamp": "2024-01-15T12:30:00Z"
      }
    ]
  }
}
```

### Get Live Metrics
```http
GET /analytics/realtime/metrics
Authorization: Bearer <admin_token>
?metrics=orders,revenue,users&interval=1m
```

### Set Alert Thresholds
```http
POST /analytics/alerts/thresholds
Authorization: Bearer <admin_token>
{
  "metric": "order_volume",
  "threshold": 1000,
  "condition": "greater_than",
  "time_window": "1h",
  "notification_channels": ["email", "slack"]
}
```

## Data Export

### Export Analytics Data
```http
GET /analytics/export
Authorization: Bearer <admin_token>
?type=orders&format=csv&date_from=2024-01-01&date_to=2024-01-31
```

### Get Export Status
```http
GET /analytics/exports/{export_id}/status
Authorization: Bearer <admin_token>
```

### Download Export
```http
GET /analytics/exports/{export_id}/download
Authorization: Bearer <admin_token>
```

## Error Codes

| Code | Message | Description |
|------|---------|-------------|
| ANALYTICS_001 | Invalid date range | Date range is invalid or too large |
| ANALYTICS_002 | Metric not found | Requested metric doesn't exist |
| ANALYTICS_003 | Insufficient data | Not enough data for analysis |
| ANALYTICS_004 | Export failed | Data export failed |
| ANALYTICS_005 | Report not found | Report ID doesn't exist |
| ANALYTICS_006 | Invalid filter | Filter parameters are invalid |
| ANALYTICS_007 | Access denied | User lacks analytics permissions |
| ANALYTICS_008 | Rate limit exceeded | Too many analytics requests |
| ANALYTICS_009 | Invalid aggregation | Aggregation method not supported |
| ANALYTICS_010 | Data processing error | Error processing analytics data |