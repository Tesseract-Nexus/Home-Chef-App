# Authentication

## Overview

HomeChef uses JWT (JSON Web Tokens) for authentication with multiple sign-in methods.

## Authentication Methods

### 1. Email/Password Authentication

**Endpoint**: `POST /auth/login`

```json
{
  "email": "user@example.com",
  "password": "password123",
  "role": "customer|chef|delivery|admin"
}
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
      "role": "customer"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "refresh_token_here",
    "expires_in": 3600
  }
}
```

### 2. Phone/OTP Authentication

**Step 1: Send OTP**
```http
POST /auth/send-otp
{
  "phone": "+919876543210",
  "role": "customer"
}
```

**Step 2: Verify OTP**
```http
POST /auth/verify-otp
{
  "phone": "+919876543210",
  "otp": "123456",
  "role": "customer"
}
```

### 3. Social Authentication

**Google OAuth**:
```http
POST /auth/google
{
  "id_token": "google_id_token",
  "role": "customer"
}
```

**Facebook OAuth**:
```http
POST /auth/facebook
{
  "access_token": "facebook_access_token",
  "role": "customer"
}
```

## Registration

### Customer Registration
```http
POST /auth/register
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe",
  "phone": "+919876543210",
  "role": "customer"
}
```

### Chef Registration
```http
POST /auth/register/chef
{
  "email": "chef@example.com",
  "password": "password123",
  "name": "Chef Priya",
  "phone": "+919876543210",
  "specialty": "North Indian Cuisine",
  "experience": "5 years",
  "address": {
    "street": "123 Main St",
    "city": "Mumbai",
    "state": "Maharashtra",
    "pincode": "400001"
  }
}
```

### Delivery Partner Registration
```http
POST /auth/register/delivery
{
  "email": "delivery@example.com",
  "password": "password123",
  "name": "Rajesh Kumar",
  "phone": "+919876543210",
  "vehicle_type": "motorcycle",
  "vehicle_number": "MH12AB1234",
  "driving_license": "DL123456789",
  "address": {
    "street": "456 Delivery St",
    "city": "Mumbai",
    "state": "Maharashtra",
    "pincode": "400001"
  }
}
```

## Token Management

### Refresh Token
```http
POST /auth/refresh
{
  "refresh_token": "refresh_token_here"
}
```

### Logout
```http
POST /auth/logout
Authorization: Bearer <token>
```

### Logout All Devices
```http
POST /auth/logout-all
Authorization: Bearer <token>
```

## Password Management

### Forgot Password
```http
POST /auth/forgot-password
{
  "email": "user@example.com"
}
```

### Reset Password
```http
POST /auth/reset-password
{
  "token": "reset_token",
  "new_password": "new_password123"
}
```

### Change Password
```http
PUT /auth/change-password
Authorization: Bearer <token>
{
  "current_password": "old_password",
  "new_password": "new_password123"
}
```

## Account Verification

### Send Email Verification
```http
POST /auth/send-verification
Authorization: Bearer <token>
```

### Verify Email
```http
POST /auth/verify-email
{
  "token": "verification_token"
}
```

### Send Phone Verification
```http
POST /auth/send-phone-verification
Authorization: Bearer <token>
```

### Verify Phone
```http
POST /auth/verify-phone
Authorization: Bearer <token>
{
  "otp": "123456"
}
```

## Security Features

### Two-Factor Authentication (2FA)

**Enable 2FA**:
```http
POST /auth/2fa/enable
Authorization: Bearer <token>
{
  "phone": "+919876543210"
}
```

**Verify 2FA Setup**:
```http
POST /auth/2fa/verify-setup
Authorization: Bearer <token>
{
  "otp": "123456"
}
```

**Login with 2FA**:
```http
POST /auth/2fa/verify
{
  "login_token": "temp_login_token",
  "otp": "123456"
}
```

### Session Management

**Get Active Sessions**:
```http
GET /auth/sessions
Authorization: Bearer <token>
```

**Revoke Session**:
```http
DELETE /auth/sessions/{session_id}
Authorization: Bearer <token>
```

## Error Codes

| Code | Message | Description |
|------|---------|-------------|
| AUTH_001 | Invalid credentials | Email/password combination is incorrect |
| AUTH_002 | Account not verified | Email or phone verification required |
| AUTH_003 | Account suspended | Account has been suspended |
| AUTH_004 | Invalid OTP | OTP is incorrect or expired |
| AUTH_005 | OTP expired | OTP has expired, request new one |
| AUTH_006 | Too many attempts | Too many failed login attempts |
| AUTH_007 | Token expired | JWT token has expired |
| AUTH_008 | Invalid token | JWT token is invalid or malformed |
| AUTH_009 | Account exists | Account with email/phone already exists |
| AUTH_010 | Weak password | Password doesn't meet security requirements |

## JWT Token Structure

```json
{
  "header": {
    "alg": "HS256",
    "typ": "JWT"
  },
  "payload": {
    "sub": "user_123",
    "email": "user@example.com",
    "role": "customer",
    "iat": 1642234567,
    "exp": 1642238167,
    "iss": "homechef-api",
    "aud": "homechef-app"
  }
}
```

## Rate Limiting

- **Login attempts**: 5 per minute per IP
- **OTP requests**: 3 per minute per phone
- **Password reset**: 3 per hour per email
- **Registration**: 10 per hour per IP