# API Overview

## Architecture

HomeChef follows a microservices architecture with the following core services:

### Core Services
- **Auth Service**: User authentication and authorization
- **User Service**: User profile management
- **Chef Service**: Chef onboarding and management
- **Menu Service**: Menu items and catalog management
- **Order Service**: Order processing and lifecycle
- **Payment Service**: Payment processing and wallet management
- **Delivery Service**: Delivery partner and logistics management
- **Notification Service**: Push notifications and messaging
- **Analytics Service**: Business intelligence and reporting

## User Roles

### Customer
- Browse chefs and menus
- Place and track orders
- Make payments
- Rate and review
- Manage profile and addresses

### Chef
- Manage profile and menu
- Accept/reject orders
- Track earnings
- Manage availability
- View analytics

### Delivery Partner
- View available deliveries
- Accept delivery requests
- Track earnings
- Update delivery status

### Admin
- Manage all users
- Approve chef applications
- Handle customer support
- View platform analytics
- Manage payouts

## Data Models

### User
```json
{
  "id": "string",
  "email": "string",
  "name": "string",
  "phone": "string",
  "role": "customer|chef|delivery|admin",
  "status": "active|inactive|suspended",
  "created_at": "timestamp",
  "updated_at": "timestamp"
}
```

### Chef
```json
{
  "id": "string",
  "user_id": "string",
  "specialty": "string",
  "experience": "string",
  "location": "object",
  "rating": "number",
  "status": "pending|approved|active|inactive",
  "documents": "object",
  "created_at": "timestamp"
}
```

### Order
```json
{
  "id": "string",
  "customer_id": "string",
  "chef_id": "string",
  "items": "array",
  "total_amount": "number",
  "status": "pending|confirmed|preparing|ready|delivering|delivered|cancelled",
  "delivery_address": "object",
  "created_at": "timestamp"
}
```

## Response Format

All API responses follow this standard format:

### Success Response
```json
{
  "success": true,
  "data": {},
  "message": "Operation successful",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "details": {}
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

## Authentication

All authenticated endpoints require a Bearer token in the Authorization header:

```
Authorization: Bearer <jwt_token>
```

## Rate Limiting

- **Authenticated users**: 1000 requests per hour
- **Unauthenticated**: 100 requests per hour
- **Admin users**: 5000 requests per hour

Rate limit headers are included in responses:
- `X-RateLimit-Limit`: Request limit per hour
- `X-RateLimit-Remaining`: Remaining requests
- `X-RateLimit-Reset`: Time when limit resets

## Pagination

List endpoints support pagination with these parameters:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20, max: 100)
- `sort`: Sort field
- `order`: Sort order (asc|desc)

Pagination response includes:
```json
{
  "data": [],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "pages": 8,
    "has_next": true,
    "has_prev": false
  }
}
```

## Filtering and Search

Most list endpoints support filtering:
- `search`: Text search across relevant fields
- `status`: Filter by status
- `created_after`: Filter by creation date
- `created_before`: Filter by creation date

Example: `/api/v1/chefs?search=north+indian&status=active&page=1&limit=10`