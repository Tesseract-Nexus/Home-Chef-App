# Notifications

## Overview

Notification system handles push notifications, SMS, email, and in-app messaging across the platform.

## Push Notifications

### Send Push Notification
```http
POST /notifications/push
Authorization: Bearer <admin_token>
{
  "recipient_type": "user|chef|delivery|all",
  "recipient_ids": ["user_123", "user_124"],
  "title": "Order Update",
  "body": "Your order is being prepared",
  "data": {
    "order_id": "order_123",
    "type": "order_update",
    "action": "view_order"
  },
  "image": "https://cdn.homechef.com/notifications/order_update.jpg",
  "sound": "default",
  "badge": 1,
  "priority": "high",
  "schedule_time": null
}
```

### Register Device Token
```http
POST /notifications/register-device
Authorization: Bearer <token>
{
  "device_token": "fcm_device_token_here",
  "platform": "android|ios|web",
  "device_info": {
    "model": "iPhone 12",
    "os_version": "iOS 15.0",
    "app_version": "1.0.0"
  }
}
```

### Update Notification Settings
```http
PUT /notifications/settings
Authorization: Bearer <token>
{
  "push_notifications": {
    "order_updates": true,
    "promotions": false,
    "chat_messages": true,
    "payment_updates": true,
    "new_reviews": true
  },
  "quiet_hours": {
    "enabled": true,
    "start": "22:00",
    "end": "08:00"
  },
  "categories": {
    "orders": true,
    "payments": true,
    "promotions": false,
    "social": true,
    "system": true
  }
}
```

## Email Notifications

### Send Email
```http
POST /notifications/email
Authorization: Bearer <admin_token>
{
  "recipient_email": "user@example.com",
  "template_id": "order_confirmation",
  "subject": "Order Confirmation - #HC240115001",
  "variables": {
    "customer_name": "John Doe",
    "order_number": "HC240115001",
    "chef_name": "Priya Sharma",
    "total_amount": 748.05,
    "estimated_delivery": "2024-01-15T13:30:00Z"
  },
  "attachments": [
    {
      "filename": "invoice.pdf",
      "content": "base64_encoded_pdf"
    }
  ]
}
```

### Get Email Templates
```http
GET /notifications/email/templates
Authorization: Bearer <admin_token>
```

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "order_confirmation",
      "name": "Order Confirmation",
      "subject": "Order Confirmation - #{order_number}",
      "category": "orders",
      "variables": [
        "customer_name",
        "order_number",
        "chef_name",
        "total_amount",
        "estimated_delivery"
      ],
      "preview_url": "https://cdn.homechef.com/templates/order_confirmation.html"
    }
  ]
}
```

### Update Email Preferences
```http
PUT /notifications/email/preferences
Authorization: Bearer <token>
{
  "order_confirmations": true,
  "order_updates": true,
  "payment_receipts": true,
  "promotional_emails": false,
  "weekly_summary": true,
  "chef_newsletters": true,
  "frequency": "immediate|daily|weekly"
}
```

## SMS Notifications

### Send SMS
```http
POST /notifications/sms
Authorization: Bearer <admin_token>
{
  "phone": "+919876543210",
  "message": "Your order #HC240115001 is being prepared. Estimated delivery: 1:30 PM",
  "template_id": "order_update",
  "variables": {
    "order_number": "HC240115001",
    "estimated_time": "1:30 PM"
  },
  "priority": "high"
}
```

### Get SMS Templates
```http
GET /notifications/sms/templates
Authorization: Bearer <admin_token>
```

### Update SMS Preferences
```http
PUT /notifications/sms/preferences
Authorization: Bearer <token>
{
  "order_updates": true,
  "otp_messages": true,
  "payment_alerts": true,
  "promotional_sms": false,
  "delivery_updates": true
}
```

## In-App Notifications

### Get Notifications
```http
GET /notifications
Authorization: Bearer <token>
?unread_only=true&category=orders&page=1&limit=20
```

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "notif_123",
      "type": "order_update",
      "title": "Order Confirmed",
      "message": "Your order #HC240115001 has been confirmed by Chef Priya",
      "data": {
        "order_id": "order_123",
        "chef_id": "chef_123"
      },
      "image": "https://cdn.homechef.com/notifications/order_confirmed.jpg",
      "is_read": false,
      "category": "orders",
      "priority": "normal",
      "action": {
        "type": "navigate",
        "url": "/orders/order_123"
      },
      "created_at": "2024-01-15T12:05:00Z"
    }
  ],
  "unread_count": 5,
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45
  }
}
```

### Mark as Read
```http
PUT /notifications/{notification_id}/read
Authorization: Bearer <token>
```

### Mark All as Read
```http
PUT /notifications/mark-all-read
Authorization: Bearer <token>
{
  "category": "orders"
}
```

### Delete Notification
```http
DELETE /notifications/{notification_id}
Authorization: Bearer <token>
```

## Real-time Messaging

### Send Message
```http
POST /messages
Authorization: Bearer <token>
{
  "conversation_id": "conv_123",
  "recipient_id": "user_456",
  "message_type": "text|image|location|order_update",
  "content": {
    "text": "Your order is ready for pickup",
    "image": "base64_encoded_image",
    "location": {
      "latitude": 19.0760,
      "longitude": 72.8777,
      "address": "123 Main Street"
    }
  },
  "metadata": {
    "order_id": "order_123",
    "urgent": false
  }
}
```

### Get Conversations
```http
GET /messages/conversations
Authorization: Bearer <token>
?page=1&limit=20
```

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "conv_123",
      "participants": [
        {
          "id": "customer_123",
          "name": "John Doe",
          "role": "customer",
          "avatar": "https://cdn.homechef.com/avatars/customer_123.jpg"
        },
        {
          "id": "chef_456",
          "name": "Priya Sharma",
          "role": "chef",
          "avatar": "https://cdn.homechef.com/avatars/chef_456.jpg"
        }
      ],
      "last_message": {
        "content": "Order is ready for pickup",
        "sender_id": "chef_456",
        "timestamp": "2024-01-15T13:00:00Z"
      },
      "unread_count": 2,
      "order_id": "order_123",
      "status": "active",
      "created_at": "2024-01-15T12:00:00Z"
    }
  ]
}
```

### Get Messages
```http
GET /messages/conversations/{conversation_id}/messages
Authorization: Bearer <token>
?page=1&limit=50&before=message_id_123
```

### Mark Messages as Read
```http
PUT /messages/conversations/{conversation_id}/read
Authorization: Bearer <token>
{
  "last_read_message_id": "message_456"
}
```

## Notification Templates

### Create Template
```http
POST /notifications/templates
Authorization: Bearer <admin_token>
{
  "name": "Order Delivered",
  "type": "push|email|sms",
  "category": "orders",
  "title": "Order Delivered Successfully",
  "body": "Your order #{order_number} has been delivered. Enjoy your meal!",
  "variables": ["order_number", "customer_name", "chef_name"],
  "conditions": {
    "user_role": ["customer"],
    "order_status": ["delivered"]
  },
  "scheduling": {
    "send_immediately": true,
    "delay_minutes": 0
  }
}
```

### Get Templates
```http
GET /notifications/templates
Authorization: Bearer <admin_token>
?type=push&category=orders
```

### Update Template
```http
PUT /notifications/templates/{template_id}
Authorization: Bearer <admin_token>
{
  "title": "Updated Order Delivered",
  "body": "Your delicious order #{order_number} from {chef_name} has been delivered!"
}
```

## Notification Campaigns

### Create Campaign
```http
POST /notifications/campaigns
Authorization: Bearer <admin_token>
{
  "name": "Weekend Special Promotion",
  "type": "promotional",
  "channels": ["push", "email"],
  "target_audience": {
    "user_roles": ["customer"],
    "locations": ["mumbai", "delhi"],
    "last_order_days": 30,
    "min_orders": 5
  },
  "content": {
    "push": {
      "title": "Weekend Special - 30% Off!",
      "body": "Order now and get 30% off on all orders above ₹500"
    },
    "email": {
      "subject": "Weekend Special Offer Just for You!",
      "template_id": "promotional_email"
    }
  },
  "schedule": {
    "send_time": "2024-01-20T10:00:00Z",
    "timezone": "Asia/Kolkata"
  },
  "tracking": {
    "track_opens": true,
    "track_clicks": true,
    "conversion_goal": "order_placed"
  }
}
```

### Get Campaign Performance
```http
GET /notifications/campaigns/{campaign_id}/performance
Authorization: Bearer <admin_token>
```

**Response**:
```json
{
  "success": true,
  "data": {
    "campaign_id": "campaign_123",
    "name": "Weekend Special Promotion",
    "status": "completed",
    "sent_at": "2024-01-20T10:00:00Z",
    "metrics": {
      "total_sent": 5000,
      "delivered": 4850,
      "opened": 2425,
      "clicked": 485,
      "conversions": 97,
      "delivery_rate": 97.0,
      "open_rate": 50.0,
      "click_rate": 10.0,
      "conversion_rate": 2.0
    },
    "revenue_generated": 24500.00,
    "roi": 245.0
  }
}
```

## Notification Analytics

### Get Notification Analytics
```http
GET /notifications/analytics
Authorization: Bearer <admin_token>
?period=this_month&type=push
```

**Response**:
```json
{
  "success": true,
  "data": {
    "overview": {
      "total_sent": 125000,
      "delivered": 118750,
      "opened": 59375,
      "clicked": 11875,
      "delivery_rate": 95.0,
      "open_rate": 50.0,
      "click_rate": 10.0
    },
    "by_category": {
      "orders": {
        "sent": 75000,
        "open_rate": 85.0,
        "click_rate": 25.0
      },
      "promotions": {
        "sent": 30000,
        "open_rate": 35.0,
        "click_rate": 8.0
      },
      "system": {
        "sent": 20000,
        "open_rate": 60.0,
        "click_rate": 15.0
      }
    },
    "device_breakdown": {
      "android": 60.0,
      "ios": 35.0,
      "web": 5.0
    },
    "optimal_send_times": [
      {"hour": 12, "open_rate": 65.0},
      {"hour": 19, "open_rate": 70.0},
      {"hour": 20, "open_rate": 68.0}
    ]
  }
}
```

### Get User Engagement
```http
GET /notifications/engagement/{user_id}
Authorization: Bearer <admin_token>
```

## Notification Preferences

### Get Global Preferences
```http
GET /notifications/preferences/global
Authorization: Bearer <admin_token>
```

### Update Global Preferences
```http
PUT /notifications/preferences/global
Authorization: Bearer <admin_token>
{
  "rate_limits": {
    "push_per_hour": 5,
    "email_per_day": 3,
    "sms_per_day": 2
  },
  "quiet_hours": {
    "start": "22:00",
    "end": "08:00",
    "timezone": "Asia/Kolkata"
  },
  "opt_out_keywords": ["STOP", "UNSUBSCRIBE"],
  "retry_policy": {
    "max_retries": 3,
    "retry_delay": 300
  }
}
```

## Webhooks

### Notification Delivery Webhook
```http
POST /webhooks/notification-delivery
{
  "event": "notification.delivered",
  "notification_id": "notif_123",
  "user_id": "user_123",
  "type": "push",
  "status": "delivered",
  "timestamp": "2024-01-15T12:05:00Z",
  "device_info": {
    "platform": "android",
    "app_version": "1.0.0"
  }
}
```

### Notification Interaction Webhook
```http
POST /webhooks/notification-interaction
{
  "event": "notification.clicked",
  "notification_id": "notif_123",
  "user_id": "user_123",
  "action": "view_order",
  "timestamp": "2024-01-15T12:10:00Z"
}
```

## Error Codes

| Code | Message | Description |
|------|---------|-------------|
| NOTIF_001 | Invalid recipient | Recipient ID doesn't exist |
| NOTIF_002 | Template not found | Notification template doesn't exist |
| NOTIF_003 | Delivery failed | Notification delivery failed |
| NOTIF_004 | Rate limit exceeded | Too many notifications sent |
| NOTIF_005 | Invalid device token | Device token is invalid or expired |
| NOTIF_006 | User opted out | User has opted out of notifications |
| NOTIF_007 | Invalid template | Template format is invalid |
| NOTIF_008 | Campaign not found | Campaign ID doesn't exist |
| NOTIF_009 | Scheduling error | Invalid schedule time |
| NOTIF_010 | Content too long | Notification content exceeds limits |