# Admin Panel APIs

## Overview

Admin panel APIs provide comprehensive platform management capabilities for administrators.

## Dashboard & Overview

### Get Admin Dashboard
```http
GET /admin/dashboard
Authorization: Bearer <admin_token>
```

**Response**:
```json
{
  "success": true,
  "data": {
    "overview": {
      "total_revenue": 2456780.00,
      "total_orders": 12456,
      "active_users": 8934,
      "active_chefs": 456,
      "active_delivery_partners": 234,
      "pending_approvals": 23
    },
    "today_metrics": {
      "revenue": 45680.00,
      "orders": 234,
      "new_users": 45,
      "new_chefs": 3,
      "support_tickets": 12
    },
    "growth_metrics": {
      "revenue_growth": 23.5,
      "user_growth": 15.7,
      "order_growth": 18.2
    },
    "pending_actions": {
      "chef_approvals": 12,
      "delivery_approvals": 8,
      "payout_requests": 15,
      "support_tickets": 25
    },
    "system_health": {
      "api_status": "healthy",
      "database_status": "healthy",
      "payment_gateway": "healthy",
      "notification_service": "degraded"
    }
  }
}
```

### Get Platform Statistics
```http
GET /admin/statistics
Authorization: Bearer <admin_token>
?period=this_month&metrics=all
```

## User Management

### Get All Users
```http
GET /admin/users
Authorization: Bearer <admin_token>
?role=customer&status=active&search=john&page=1&limit=50
```

### Get User Details
```http
GET /admin/users/{user_id}
Authorization: Bearer <admin_token>
```

**Response**:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_123",
      "email": "user@example.com",
      "name": "John Doe",
      "phone": "+919876543210",
      "role": "customer",
      "status": "active",
      "email_verified": true,
      "phone_verified": true,
      "created_at": "2024-01-01T00:00:00Z",
      "last_login": "2024-01-15T10:00:00Z"
    },
    "profile": {
      "avatar": "https://cdn.homechef.com/avatars/user_123.jpg",
      "addresses": 3,
      "payment_methods": 2,
      "preferences": {...}
    },
    "activity": {
      "total_orders": 25,
      "total_spent": 5670.50,
      "avg_order_value": 226.82,
      "last_order": "2024-01-14T19:30:00Z",
      "favorite_chefs": 5,
      "reviews_given": 18
    },
    "support_history": {
      "total_tickets": 3,
      "resolved_tickets": 2,
      "avg_resolution_time": 24.5
    }
  }
}
```

### Update User Status
```http
PUT /admin/users/{user_id}/status
Authorization: Bearer <admin_token>
{
  "status": "suspended",
  "reason": "Violation of terms of service",
  "notes": "Multiple complaints about inappropriate behavior",
  "duration": "7 days"
}
```

### Impersonate User (for support)
```http
POST /admin/users/{user_id}/impersonate
Authorization: Bearer <admin_token>
{
  "reason": "Customer support assistance",
  "duration": 3600
}
```

## Chef Management

### Get Chef Applications
```http
GET /admin/chefs/applications
Authorization: Bearer <admin_token>
?status=pending&location=mumbai&page=1&limit=20
```

### Review Chef Application
```http
GET /admin/chefs/applications/{application_id}
Authorization: Bearer <admin_token>
```

**Response**:
```json
{
  "success": true,
  "data": {
    "application": {
      "id": "app_123",
      "chef_id": "chef_123",
      "status": "pending",
      "submitted_at": "2024-01-10T10:00:00Z"
    },
    "personal_info": {
      "name": "Priya Sharma",
      "email": "priya@example.com",
      "phone": "+919876543210",
      "address": {...}
    },
    "professional_info": {
      "specialty": "North Indian Cuisine",
      "experience": "8 years",
      "description": "...",
      "cuisine_types": ["north_indian", "punjabi"]
    },
    "documents": {
      "identity_proof": {
        "type": "aadhaar",
        "status": "verified",
        "url": "https://cdn.homechef.com/docs/identity_123.jpg"
      },
      "fssai_license": {
        "status": "pending_verification",
        "url": "https://cdn.homechef.com/docs/fssai_123.jpg",
        "license_number": "12345678901234"
      },
      "address_proof": {
        "status": "verified",
        "url": "https://cdn.homechef.com/docs/address_123.jpg"
      }
    },
    "verification_notes": [
      {
        "reviewer": "admin_456",
        "note": "All documents look good",
        "timestamp": "2024-01-12T14:30:00Z"
      }
    ]
  }
}
```

### Approve Chef
```http
POST /admin/chefs/{chef_id}/approve
Authorization: Bearer <admin_token>
{
  "notes": "All documents verified successfully",
  "welcome_bonus": 500.00,
  "featured_duration": 7
}
```

### Reject Chef
```http
POST /admin/chefs/{chef_id}/reject
Authorization: Bearer <admin_token>
{
  "reason": "incomplete_documentation",
  "notes": "FSSAI license is not clear, please resubmit",
  "resubmission_allowed": true
}
```

### Suspend Chef
```http
POST /admin/chefs/{chef_id}/suspend
Authorization: Bearer <admin_token>
{
  "reason": "quality_issues",
  "notes": "Multiple customer complaints about food quality",
  "duration": "14 days",
  "notify_customers": true
}
```

## Order Management

### Get All Orders
```http
GET /admin/orders
Authorization: Bearer <admin_token>
?status=active&chef_id=chef_123&date_from=2024-01-01&page=1&limit=50
```

### Get Order Details
```http
GET /admin/orders/{order_id}
Authorization: Bearer <admin_token>
```

### Force Cancel Order
```http
POST /admin/orders/{order_id}/force-cancel
Authorization: Bearer <admin_token>
{
  "reason": "chef_unavailable",
  "refund_amount": 748.05,
  "compensation": 50.00,
  "notify_customer": true,
  "notes": "Chef had emergency, full refund + compensation provided"
}
```

### Process Refund
```http
POST /admin/orders/{order_id}/refund
Authorization: Bearer <admin_token>
{
  "amount": 748.05,
  "reason": "order_cancelled",
  "refund_type": "full",
  "processing_fee_waived": true,
  "notes": "Customer requested cancellation"
}
```

## Payment & Payout Management

### Get Payout Queue
```http
GET /admin/payouts/queue
Authorization: Bearer <admin_token>
?status=pending&recipient_type=chef&amount_min=1000
```

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "payout_123",
      "recipient": {
        "id": "chef_123",
        "name": "Priya Sharma",
        "type": "chef"
      },
      "amount": 12450.00,
      "period": "2024-01-08 to 2024-01-14",
      "breakdown": {
        "gross_earnings": 14650.00,
        "platform_fee": 2190.00,
        "processing_fee": 10.00,
        "net_amount": 12450.00
      },
      "bank_details": {
        "account_number": "****1234",
        "ifsc_code": "SBIN0001234",
        "account_holder": "Priya Sharma"
      },
      "due_date": "2024-01-15T00:00:00Z",
      "status": "pending"
    }
  ]
}
```

### Process Bulk Payouts
```http
POST /admin/payouts/process-bulk
Authorization: Bearer <admin_token>
{
  "payout_ids": ["payout_123", "payout_124", "payout_125"],
  "notes": "Weekly payout batch processing"
}
```

### Get Payment Analytics
```http
GET /admin/payments/analytics
Authorization: Bearer <admin_token>
?period=this_month&breakdown=method
```

## Support Ticket Management

### Get Support Tickets
```http
GET /admin/support/tickets
Authorization: Bearer <admin_token>
?status=open&priority=high&assigned_to=agent_123&page=1&limit=20
```

### Get Ticket Details
```http
GET /admin/support/tickets/{ticket_id}
Authorization: Bearer <admin_token>
```

**Response**:
```json
{
  "success": true,
  "data": {
    "ticket": {
      "id": "ticket_123",
      "title": "Order not delivered",
      "description": "My order was marked as delivered but I never received it",
      "category": "delivery_issue",
      "priority": "high",
      "status": "in_progress",
      "created_by": {
        "id": "customer_123",
        "name": "John Doe",
        "email": "john@example.com"
      },
      "assigned_to": {
        "id": "agent_456",
        "name": "Support Agent"
      },
      "order_id": "order_789",
      "created_at": "2024-01-15T10:00:00Z"
    },
    "messages": [
      {
        "id": "msg_123",
        "sender": {
          "id": "customer_123",
          "name": "John Doe",
          "type": "customer"
        },
        "message": "My order was marked as delivered but I never received it",
        "timestamp": "2024-01-15T10:00:00Z",
        "attachments": []
      }
    ],
    "related_data": {
      "order": {...},
      "delivery_partner": {...},
      "chef": {...}
    }
  }
}
```

### Assign Ticket
```http
PUT /admin/support/tickets/{ticket_id}/assign
Authorization: Bearer <admin_token>
{
  "agent_id": "agent_456",
  "priority": "high",
  "notes": "Urgent delivery issue, needs immediate attention"
}
```

### Resolve Ticket
```http
PUT /admin/support/tickets/{ticket_id}/resolve
Authorization: Bearer <admin_token>
{
  "resolution": "Contacted delivery partner, order was delivered to wrong address. Full refund processed.",
  "resolution_type": "refund_processed",
  "customer_satisfaction": 4,
  "follow_up_required": false
}
```

## Content Management

### Get Platform Content
```http
GET /admin/content
Authorization: Bearer <admin_token>
?type=banners&status=active
```

### Create Banner
```http
POST /admin/content/banners
Authorization: Bearer <admin_token>
{
  "title": "Weekend Special Offer",
  "description": "Get 30% off on all orders above ₹500",
  "image": "base64_encoded_image",
  "link": "/offers/weekend-special",
  "target_audience": {
    "user_roles": ["customer"],
    "locations": ["mumbai", "delhi"]
  },
  "schedule": {
    "start_date": "2024-01-20T00:00:00Z",
    "end_date": "2024-01-22T23:59:59Z"
  },
  "position": "home_top"
}
```

### Manage Promotions
```http
POST /admin/promotions
Authorization: Bearer <admin_token>
{
  "code": "WEEKEND30",
  "type": "percentage",
  "value": 30,
  "min_order_amount": 500.00,
  "max_discount": 150.00,
  "usage_limit": 1000,
  "user_limit": 1,
  "valid_from": "2024-01-20T00:00:00Z",
  "valid_until": "2024-01-22T23:59:59Z",
  "applicable_to": {
    "user_roles": ["customer"],
    "first_time_users": false,
    "chef_ids": [],
    "cuisine_types": []
  }
}
```

## System Configuration

### Get Platform Settings
```http
GET /admin/settings
Authorization: Bearer <admin_token>
```

**Response**:
```json
{
  "success": true,
  "data": {
    "commission": {
      "chef_commission_rate": 0.15,
      "delivery_commission_rate": 0.10,
      "payment_processing_fee": 0.025
    },
    "delivery": {
      "base_delivery_fee": 25.00,
      "per_km_rate": 5.00,
      "max_delivery_distance": 10.0,
      "free_delivery_threshold": 500.00
    },
    "orders": {
      "min_order_amount": 100.00,
      "max_order_amount": 5000.00,
      "auto_accept_timeout": 300,
      "preparation_buffer": 5
    },
    "business": {
      "platform_name": "HomeChef",
      "support_email": "support@homechef.com",
      "support_phone": "+91-1800-123-4567",
      "business_hours": {
        "start": "06:00",
        "end": "23:00"
      }
    }
  }
}
```

### Update Platform Settings
```http
PUT /admin/settings
Authorization: Bearer <admin_token>
{
  "commission": {
    "chef_commission_rate": 0.18
  },
  "delivery": {
    "base_delivery_fee": 30.00
  }
}
```

### Manage Feature Flags
```http
PUT /admin/feature-flags
Authorization: Bearer <admin_token>
{
  "subscription_model": true,
  "live_tracking": true,
  "chef_ratings": true,
  "promotional_notifications": false
}
```

## Analytics & Reporting

### Generate Custom Report
```http
POST /admin/reports/generate
Authorization: Bearer <admin_token>
{
  "report_type": "revenue_analysis",
  "parameters": {
    "date_from": "2024-01-01",
    "date_to": "2024-01-31",
    "group_by": "day",
    "include_breakdown": true
  },
  "format": "pdf",
  "email_to": ["admin@homechef.com"]
}
```

### Get System Logs
```http
GET /admin/logs
Authorization: Bearer <admin_token>
?level=error&service=payment&date_from=2024-01-15&limit=100
```

### Monitor API Performance
```http
GET /admin/monitoring/api-performance
Authorization: Bearer <admin_token>
?endpoint=/orders&period=last_24_hours
```

## Bulk Operations

### Bulk User Operations
```http
POST /admin/users/bulk-update
Authorization: Bearer <admin_token>
{
  "user_ids": ["user_123", "user_124", "user_125"],
  "operation": "update_status",
  "parameters": {
    "status": "active",
    "reason": "Bulk reactivation after review"
  }
}
```

### Bulk Chef Operations
```http
POST /admin/chefs/bulk-approve
Authorization: Bearer <admin_token>
{
  "chef_ids": ["chef_123", "chef_124"],
  "notes": "Batch approval after document verification",
  "welcome_bonus": 500.00
}
```

### Bulk Notification Send
```http
POST /admin/notifications/bulk-send
Authorization: Bearer <admin_token>
{
  "recipient_criteria": {
    "user_roles": ["customer"],
    "locations": ["mumbai"],
    "last_order_days": 30
  },
  "notification": {
    "title": "We miss you!",
    "body": "Come back and enjoy 20% off your next order",
    "type": "promotional"
  },
  "channels": ["push", "email"]
}
```

## Data Management

### Export Platform Data
```http
POST /admin/data/export
Authorization: Bearer <admin_token>
{
  "data_type": "users|orders|chefs|payments",
  "format": "csv|json|excel",
  "date_range": {
    "start": "2024-01-01",
    "end": "2024-01-31"
  },
  "filters": {
    "status": "active",
    "location": "mumbai"
  }
}
```

### Data Cleanup
```http
POST /admin/data/cleanup
Authorization: Bearer <admin_token>
{
  "cleanup_type": "inactive_users|old_logs|expired_sessions",
  "criteria": {
    "inactive_days": 365,
    "confirm_deletion": true
  }
}
```

## Security & Compliance

### Get Security Audit Log
```http
GET /admin/security/audit-log
Authorization: Bearer <admin_token>
?action=login_attempt&user_id=user_123&date_from=2024-01-01
```

### Manage API Keys
```http
POST /admin/api-keys
Authorization: Bearer <admin_token>
{
  "name": "Mobile App v2.0",
  "permissions": ["read_orders", "create_orders"],
  "rate_limit": 5000,
  "expires_at": "2025-01-15T00:00:00Z"
}
```

### GDPR Data Request
```http
POST /admin/gdpr/data-request
Authorization: Bearer <admin_token>
{
  "user_id": "user_123",
  "request_type": "export|delete",
  "requester_email": "user@example.com",
  "verification_token": "gdpr_token_123"
}
```

## Error Codes

| Code | Message | Description |
|------|---------|-------------|
| ADMIN_001 | Insufficient privileges | Admin access required |
| ADMIN_002 | Invalid operation | Operation not allowed |
| ADMIN_003 | Bulk operation failed | Bulk operation partially failed |
| ADMIN_004 | Report generation failed | Failed to generate report |
| ADMIN_005 | Invalid configuration | Configuration parameters invalid |
| ADMIN_006 | Data export failed | Failed to export data |
| ADMIN_007 | Security violation | Security policy violation detected |
| ADMIN_008 | Audit log error | Failed to access audit logs |
| ADMIN_009 | Feature flag error | Feature flag update failed |
| ADMIN_010 | System maintenance | System in maintenance mode |