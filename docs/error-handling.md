# Error Handling

## Overview

HomeChef API uses conventional HTTP response codes and provides detailed error information in a consistent format.

## HTTP Status Codes

### Success Codes (2xx)
- **200 OK** - Request successful
- **201 Created** - Resource created successfully
- **202 Accepted** - Request accepted for processing
- **204 No Content** - Request successful, no content to return

### Client Error Codes (4xx)
- **400 Bad Request** - Invalid request format or parameters
- **401 Unauthorized** - Authentication required or invalid
- **403 Forbidden** - Insufficient permissions
- **404 Not Found** - Resource not found
- **409 Conflict** - Resource already exists or conflict
- **422 Unprocessable Entity** - Validation errors
- **429 Too Many Requests** - Rate limit exceeded

### Server Error Codes (5xx)
- **500 Internal Server Error** - Unexpected server error
- **502 Bad Gateway** - Upstream service error
- **503 Service Unavailable** - Service temporarily unavailable
- **504 Gateway Timeout** - Upstream service timeout

## Error Response Format

All error responses follow this standard format:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "details": {
      "field": "Specific field error message"
    },
    "request_id": "req_123456789",
    "documentation_url": "https://docs.homechef.com/errors/ERROR_CODE"
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

## Authentication Errors

### AUTH_001 - Invalid Credentials
```json
{
  "success": false,
  "error": {
    "code": "AUTH_001",
    "message": "Invalid email or password",
    "details": {
      "email": "Email not found or password incorrect"
    }
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### AUTH_002 - Account Not Verified
```json
{
  "success": false,
  "error": {
    "code": "AUTH_002",
    "message": "Account verification required",
    "details": {
      "verification_type": "email",
      "verification_sent": true
    }
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### AUTH_003 - Account Suspended
```json
{
  "success": false,
  "error": {
    "code": "AUTH_003",
    "message": "Account has been suspended",
    "details": {
      "reason": "Violation of terms of service",
      "suspension_until": "2024-01-22T00:00:00Z",
      "appeal_url": "https://homechef.com/appeal"
    }
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### AUTH_007 - Token Expired
```json
{
  "success": false,
  "error": {
    "code": "AUTH_007",
    "message": "Access token has expired",
    "details": {
      "expired_at": "2024-01-15T09:30:00Z",
      "refresh_token_required": true
    }
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

## Validation Errors

### Validation Error Example
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed",
    "details": {
      "email": "Invalid email format",
      "password": "Password must be at least 6 characters",
      "phone": "Phone number must be in +91XXXXXXXXXX format",
      "price": "Price must be a positive number"
    }
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

## Business Logic Errors

### ORDER_003 - Chef Unavailable
```json
{
  "success": false,
  "error": {
    "code": "ORDER_003",
    "message": "Chef is currently unavailable",
    "details": {
      "chef_id": "chef_123",
      "availability_status": "offline",
      "next_available": "2024-01-15T18:00:00Z",
      "alternative_chefs": ["chef_456", "chef_789"]
    }
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### ORDER_005 - Minimum Order Not Met
```json
{
  "success": false,
  "error": {
    "code": "ORDER_005",
    "message": "Order total below minimum amount",
    "details": {
      "current_total": 150.00,
      "minimum_required": 200.00,
      "shortfall": 50.00,
      "suggested_items": [
        {
          "dish_id": "dish_456",
          "name": "Garlic Naan",
          "price": 60.00
        }
      ]
    }
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### PAY_001 - Payment Failed
```json
{
  "success": false,
  "error": {
    "code": "PAY_001",
    "message": "Payment processing failed",
    "details": {
      "payment_id": "pay_123",
      "gateway_error": "Insufficient funds",
      "gateway_code": "INSUFFICIENT_FUNDS",
      "retry_allowed": true,
      "alternative_methods": ["upi", "wallet"]
    }
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

## Rate Limiting Errors

### Rate Limit Response
```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests",
    "details": {
      "limit": 1000,
      "remaining": 0,
      "reset_time": "2024-01-15T11:00:00Z",
      "retry_after": 1800
    }
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

## Server Errors

### Internal Server Error
```json
{
  "success": false,
  "error": {
    "code": "INTERNAL_SERVER_ERROR",
    "message": "An unexpected error occurred",
    "details": {
      "error_id": "err_123456789",
      "support_contact": "api-support@homechef.com"
    }
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### Service Unavailable
```json
{
  "success": false,
  "error": {
    "code": "SERVICE_UNAVAILABLE",
    "message": "Service temporarily unavailable",
    "details": {
      "service": "payment_gateway",
      "estimated_recovery": "2024-01-15T11:00:00Z",
      "status_page": "https://status.homechef.com"
    }
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

## Error Code Categories

### Authentication (AUTH_xxx)
- AUTH_001: Invalid credentials
- AUTH_002: Account not verified
- AUTH_003: Account suspended
- AUTH_004: Invalid OTP
- AUTH_005: OTP expired
- AUTH_006: Too many attempts
- AUTH_007: Token expired
- AUTH_008: Invalid token
- AUTH_009: Account exists
- AUTH_010: Weak password

### User Management (USER_xxx)
- USER_001: User not found
- USER_002: Invalid address
- USER_003: Payment method invalid
- USER_004: Address limit exceeded
- USER_005: Cannot delete default
- USER_006: Profile incomplete
- USER_007: Invalid coordinates
- USER_008: Duplicate address
- USER_009: Permission denied
- USER_010: Account deactivated

### Chef Management (CHEF_xxx)
- CHEF_001: Application not found
- CHEF_002: Already applied
- CHEF_003: Invalid documents
- CHEF_004: Not verified
- CHEF_005: Chef not found
- CHEF_006: Inactive chef
- CHEF_007: Outside delivery area
- CHEF_008: Kitchen closed
- CHEF_009: Minimum order not met
- CHEF_010: Invalid working hours

### Menu Management (MENU_xxx)
- MENU_001: Dish not found
- MENU_002: Invalid category
- MENU_003: Duplicate dish name
- MENU_004: Invalid price
- MENU_005: Image upload failed
- MENU_006: Invalid ingredients
- MENU_007: Dish unavailable
- MENU_008: Category limit exceeded
- MENU_009: Invalid nutritional info
- MENU_010: Modifier not found

### Order Management (ORDER_xxx)
- ORDER_001: Order not found
- ORDER_002: Invalid order status
- ORDER_003: Chef unavailable
- ORDER_004: Dish unavailable
- ORDER_005: Minimum order not met
- ORDER_006: Outside delivery area
- ORDER_007: Payment failed
- ORDER_008: Cannot cancel
- ORDER_009: Invalid modification
- ORDER_010: Delivery partner unavailable

### Payment Processing (PAY_xxx)
- PAY_001: Payment failed
- PAY_002: Insufficient funds
- PAY_003: Invalid payment method
- PAY_004: Payment declined
- PAY_005: Duplicate payment
- PAY_006: Refund failed
- PAY_007: Invalid amount
- PAY_008: Gateway error
- PAY_009: Security check failed
- PAY_010: Payout failed

## Error Handling Best Practices

### Client-Side Handling

1. **Always check the `success` field** before processing response data
2. **Display user-friendly messages** based on error codes
3. **Implement retry logic** for transient errors (5xx codes)
4. **Handle rate limiting** by respecting retry-after headers
5. **Log errors** with request IDs for debugging

### Example Error Handling (JavaScript)
```javascript
async function makeAPICall(url, options) {
  try {
    const response = await fetch(url, options);
    const data = await response.json();
    
    if (!data.success) {
      throw new APIError(data.error);
    }
    
    return data.data;
  } catch (error) {
    if (error instanceof APIError) {
      handleAPIError(error);
    } else {
      handleNetworkError(error);
    }
  }
}

function handleAPIError(error) {
  switch (error.code) {
    case 'AUTH_007':
      // Token expired, refresh token
      refreshToken();
      break;
    case 'ORDER_005':
      // Show minimum order message
      showMinimumOrderError(error.details);
      break;
    case 'RATE_LIMIT_EXCEEDED':
      // Wait and retry
      setTimeout(() => retryRequest(), error.details.retry_after * 1000);
      break;
    default:
      showGenericError(error.message);
  }
}
```

### Server-Side Error Logging

```json
{
  "timestamp": "2024-01-15T10:30:00Z",
  "level": "ERROR",
  "request_id": "req_123456789",
  "user_id": "user_123",
  "endpoint": "/orders",
  "method": "POST",
  "error_code": "ORDER_003",
  "error_message": "Chef unavailable",
  "stack_trace": "...",
  "request_body": {...},
  "response_time": 150
}
```

## Monitoring and Alerting

### Error Rate Monitoring
- Track error rates by endpoint
- Alert when error rate exceeds threshold
- Monitor specific error codes for trends

### Error Response Times
- Track response times for error scenarios
- Ensure error responses are fast
- Monitor timeout errors

### Error Recovery
- Implement circuit breakers for external services
- Provide fallback responses when possible
- Graceful degradation of features

## Support and Debugging

### Request ID Tracking
Every API response includes a `request_id` that can be used for:
- Debugging specific requests
- Correlating logs across services
- Customer support investigations

### Error Documentation
Each error code has detailed documentation at:
`https://docs.homechef.com/errors/{ERROR_CODE}`

### Support Contact
For API support and error resolution:
- Email: api-support@homechef.com
- Slack: #api-support (for partners)
- Status Page: https://status.homechef.com