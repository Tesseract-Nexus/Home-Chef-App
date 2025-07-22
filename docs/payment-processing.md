# Payment Processing

## Overview

Payment processing handles all financial transactions including order payments, refunds, and payouts.

## Payment Methods

### Get Supported Payment Methods
```http
GET /payments/methods
```

**Response**:
```json
{
  "success": true,
  "data": {
    "cards": {
      "supported": true,
      "brands": ["visa", "mastercard", "rupay", "amex"],
      "features": ["save_card", "auto_pay"]
    },
    "upi": {
      "supported": true,
      "providers": ["paytm", "phonepe", "googlepay", "bhim"],
      "features": ["intent", "collect"]
    },
    "wallets": {
      "supported": true,
      "providers": ["paytm", "phonepe", "mobikwik", "freecharge"]
    },
    "netbanking": {
      "supported": true,
      "banks": ["sbi", "hdfc", "icici", "axis", "kotak"]
    },
    "cod": {
      "supported": true,
      "max_amount": 2000.00,
      "areas": ["mumbai", "delhi", "bangalore"]
    }
  }
}
```

### Add Payment Method
```http
POST /payments/methods
Authorization: Bearer <token>
{
  "type": "card",
  "card": {
    "number": "4111111111111111",
    "exp_month": 12,
    "exp_year": 2025,
    "cvc": "123",
    "name": "John Doe"
  },
  "save_for_future": true
}
```

### Tokenize Payment Method
```http
POST /payments/tokenize
Authorization: Bearer <token>
{
  "type": "upi",
  "upi": {
    "vpa": "user@paytm"
  }
}
```

## Order Payments

### Process Order Payment
```http
POST /payments/orders/{order_id}/pay
Authorization: Bearer <customer_token>
{
  "payment_method_id": "pm_123",
  "amount": 748.05,
  "currency": "INR",
  "save_payment_method": false
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "payment_id": "pay_123",
    "status": "processing",
    "amount": 748.05,
    "currency": "INR",
    "payment_method": {
      "type": "card",
      "last4": "1111",
      "brand": "visa"
    },
    "gateway_response": {
      "transaction_id": "txn_gateway_123",
      "status": "success",
      "reference": "REF123456"
    },
    "created_at": "2024-01-15T12:00:00Z"
  }
}
```

### Verify Payment
```http
POST /payments/{payment_id}/verify
Authorization: Bearer <token>
{
  "gateway_transaction_id": "txn_gateway_123",
  "signature": "payment_signature"
}
```

### Get Payment Status
```http
GET /payments/{payment_id}/status
Authorization: Bearer <token>
```

### Retry Failed Payment
```http
POST /payments/{payment_id}/retry
Authorization: Bearer <customer_token>
{
  "payment_method_id": "pm_124"
}
```

## UPI Payments

### Generate UPI Intent
```http
POST /payments/upi/intent
Authorization: Bearer <customer_token>
{
  "order_id": "order_123",
  "amount": 748.05,
  "upi_id": "user@paytm"
}
```

### UPI Collect Request
```http
POST /payments/upi/collect
Authorization: Bearer <customer_token>
{
  "order_id": "order_123",
  "amount": 748.05,
  "upi_id": "user@paytm",
  "description": "Payment for Order #HC240115001"
}
```

### Check UPI Status
```http
GET /payments/upi/{transaction_id}/status
Authorization: Bearer <token>
```

## Wallet Payments

### Get Wallet Balance
```http
GET /payments/wallet/balance
Authorization: Bearer <token>
```

### Add Money to Wallet
```http
POST /payments/wallet/add
Authorization: Bearer <token>
{
  "amount": 1000.00,
  "payment_method_id": "pm_123"
}
```

### Pay from Wallet
```http
POST /payments/wallet/pay
Authorization: Bearer <customer_token>
{
  "order_id": "order_123",
  "amount": 748.05
}
```

### Wallet Transaction History
```http
GET /payments/wallet/transactions
Authorization: Bearer <token>
?page=1&limit=20&type=credit|debit
```

## Refunds

### Process Refund
```http
POST /payments/{payment_id}/refund
Authorization: Bearer <admin_token>
{
  "amount": 748.05,
  "reason": "Order cancelled by customer",
  "refund_type": "full|partial"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "refund_id": "ref_123",
    "payment_id": "pay_123",
    "amount": 748.05,
    "status": "processing",
    "reason": "Order cancelled by customer",
    "estimated_arrival": "3-5 business days",
    "gateway_refund_id": "ref_gateway_123",
    "created_at": "2024-01-15T14:00:00Z"
  }
}
```

### Get Refund Status
```http
GET /payments/refunds/{refund_id}
Authorization: Bearer <token>
```

### Get Refund History
```http
GET /payments/refunds
Authorization: Bearer <token>
?page=1&limit=20
```

## Payouts (Chef/Delivery Partner)

### Get Payout Summary
```http
GET /payments/payouts/summary
Authorization: Bearer <chef_token>
```

**Response**:
```json
{
  "success": true,
  "data": {
    "total_earnings": 25000.00,
    "platform_fee": 3750.00,
    "net_earnings": 21250.00,
    "pending_amount": 2500.00,
    "available_for_payout": 18750.00,
    "last_payout": {
      "amount": 15000.00,
      "date": "2024-01-08T00:00:00Z",
      "status": "completed"
    },
    "next_payout_date": "2024-01-22T00:00:00Z"
  }
}
```

### Request Instant Payout
```http
POST /payments/payouts/instant
Authorization: Bearer <chef_token>
{
  "amount": 5000.00,
  "bank_account_id": "bank_123"
}
```

### Get Payout History
```http
GET /payments/payouts/history
Authorization: Bearer <chef_token>
?page=1&limit=20&status=completed
```

### Update Bank Details
```http
PUT /payments/bank-details
Authorization: Bearer <chef_token>
{
  "account_number": "1234567890",
  "ifsc_code": "SBIN0001234",
  "account_holder_name": "Priya Sharma",
  "bank_name": "State Bank of India",
  "branch_name": "Mumbai Main Branch"
}
```

## Payment Analytics

### Get Payment Analytics
```http
GET /payments/analytics
Authorization: Bearer <admin_token>
?period=this_month&group_by=day
```

**Response**:
```json
{
  "success": true,
  "data": {
    "total_volume": 2500000.00,
    "total_transactions": 8750,
    "avg_transaction_value": 285.71,
    "success_rate": 96.8,
    "payment_method_breakdown": {
      "upi": 45.2,
      "cards": 32.1,
      "wallets": 15.3,
      "netbanking": 5.8,
      "cod": 1.6
    },
    "daily_breakdown": [
      {
        "date": "2024-01-01",
        "volume": 85000.00,
        "transactions": 298,
        "success_rate": 97.2
      }
    ]
  }
}
```

### Get Failed Payments Report
```http
GET /payments/failed-payments
Authorization: Bearer <admin_token>
?date_from=2024-01-01&date_to=2024-01-31
```

## Subscription Payments

### Create Subscription
```http
POST /payments/subscriptions
Authorization: Bearer <customer_token>
{
  "plan_id": "premium_monthly",
  "payment_method_id": "pm_123",
  "start_date": "2024-01-15"
}
```

### Get Subscription Status
```http
GET /payments/subscriptions/{subscription_id}
Authorization: Bearer <token>
```

### Cancel Subscription
```http
PUT /payments/subscriptions/{subscription_id}/cancel
Authorization: Bearer <customer_token>
{
  "reason": "No longer needed",
  "cancel_at_period_end": true
}
```

## Payment Disputes

### Report Payment Dispute
```http
POST /payments/{payment_id}/dispute
Authorization: Bearer <token>
{
  "reason": "unauthorized_charge",
  "description": "I did not make this payment",
  "evidence": ["base64_document1"]
}
```

### Get Dispute Status
```http
GET /payments/disputes/{dispute_id}
Authorization: Bearer <token>
```

### Respond to Dispute (Merchant)
```http
POST /payments/disputes/{dispute_id}/respond
Authorization: Bearer <chef_token>
{
  "response": "Order was delivered successfully",
  "evidence": ["delivery_proof", "customer_signature"]
}
```

## Payment Security

### Verify Payment Signature
```http
POST /payments/verify-signature
{
  "payment_id": "pay_123",
  "order_id": "order_123",
  "signature": "payment_signature",
  "amount": 748.05
}
```

### Report Fraudulent Transaction
```http
POST /payments/{payment_id}/report-fraud
Authorization: Bearer <token>
{
  "reason": "Card stolen",
  "description": "My card was stolen and used for this transaction"
}
```

### Get Payment Security Score
```http
GET /payments/{payment_id}/security-score
Authorization: Bearer <admin_token>
```

## Webhooks

### Payment Status Webhook
```http
POST /webhooks/payment-status
{
  "event": "payment.success",
  "payment_id": "pay_123",
  "order_id": "order_123",
  "amount": 748.05,
  "status": "completed",
  "timestamp": "2024-01-15T12:05:00Z"
}
```

### Refund Status Webhook
```http
POST /webhooks/refund-status
{
  "event": "refund.completed",
  "refund_id": "ref_123",
  "payment_id": "pay_123",
  "amount": 748.05,
  "status": "completed",
  "timestamp": "2024-01-15T14:30:00Z"
}
```

## Error Codes

| Code | Message | Description |
|------|---------|-------------|
| PAY_001 | Payment failed | Payment processing failed |
| PAY_002 | Insufficient funds | Insufficient balance in account |
| PAY_003 | Invalid payment method | Payment method is invalid or expired |
| PAY_004 | Payment declined | Payment was declined by bank |
| PAY_005 | Duplicate payment | Payment already processed |
| PAY_006 | Refund failed | Refund processing failed |
| PAY_007 | Invalid amount | Payment amount is invalid |
| PAY_008 | Gateway error | Payment gateway error |
| PAY_009 | Security check failed | Payment failed security checks |
| PAY_010 | Payout failed | Payout processing failed |