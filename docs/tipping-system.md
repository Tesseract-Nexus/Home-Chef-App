# Tipping System Documentation

## Overview

The tipping system allows customers to show appreciation to chefs and delivery partners through direct monetary tips that go 100% to the recipient's bank account.

## Core Features

### 1. Direct Bank Transfer
- **100% to recipient** - No platform fees deducted
- **Immediate transfer** to recipient's bank account
- **Real-time notifications** to both parties
- **Transparent process** with confirmation messages

### 2. Flexible Tipping Options
- **Quick amounts**: ₹20, ₹30, ₹50, ₹100
- **Custom amounts**: ₹10 - ₹500 range
- **Personal messages** with tips
- **Multiple recipients** (chef and delivery partner)

### 3. Smart Timing
- **Chef tipping**: Available after order delivery
- **Delivery tipping**: Available after successful delivery
- **Post-order window**: Available for 7 days after delivery
- **One-time per recipient** per order

## API Implementation

### 1. Send Tip
```http
POST /orders/{order_id}/tip
Authorization: Bearer <customer_token>
{
  "recipient_type": "chef",
  "amount": 50.00,
  "message": "Amazing food, thank you!"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "tip_id": "tip_123",
    "amount": 50.00,
    "recipient_notified": true,
    "direct_transfer_initiated": true,
    "transfer_timeline": "Immediate to bank account",
    "transaction_id": "txn_tip_123"
  }
}
```

### 2. Get Tip History
```http
GET /tips/history
Authorization: Bearer <customer_token>
?type=sent&page=1&limit=20
```

### 3. Get Tips Received (Chef/Delivery)
```http
GET /tips/received
Authorization: Bearer <chef_token>
?period=month&page=1&limit=20
```

## Frontend Implementation

### 1. Tipping Modal Component
```typescript
interface TippingModalProps {
  visible: boolean;
  onClose: () => void;
  recipientType: 'chef' | 'delivery';
  recipientName: string;
  orderId: string;
  onTipSubmitted: (amount: number, message: string) => void;
}
```

### 2. Quick Tip Amounts
```typescript
const QUICK_TIP_AMOUNTS = [20, 30, 50, 100];

const renderQuickAmount = (amount: number) => (
  <TouchableOpacity
    style={[
      styles.quickAmountButton,
      selectedAmount === amount && styles.selectedQuickAmount
    ]}
    onPress={() => setSelectedAmount(amount)}
  >
    <Text>₹{amount}</Text>
  </TouchableOpacity>
);
```

### 3. Message Suggestions
```typescript
const getTipSuggestions = (recipientType: 'chef' | 'delivery') => {
  return recipientType === 'chef' 
    ? ['Amazing food! 😋', 'Perfectly cooked! 👨‍🍳', 'Authentic taste! ⭐']
    : ['Super fast delivery! 🚀', 'Very polite! 😊', 'On time delivery! ⏰'];
};
```

## Notification System

### 1. Tip Sent (Customer)
```json
{
  "title": "Tip Sent Successfully! 💝",
  "body": "₹50 has been sent directly to Priya's bank account",
  "data": {
    "tip_amount": 50.00,
    "recipient_name": "Priya Sharma",
    "recipient_type": "chef",
    "order_id": "order_123"
  }
}
```

### 2. Tip Received (Chef/Delivery)
```json
{
  "title": "Tip Received! 💝",
  "body": "You received ₹50 from John: 'Amazing food!'",
  "data": {
    "tip_amount": 50.00,
    "customer_name": "John Doe",
    "message": "Amazing food!",
    "order_id": "order_123",
    "bank_transfer_initiated": true
  }
}
```

## Business Logic

### 1. Tip Validation
```go
func ValidateTip(amount float64, recipientType string, orderID string) error {
  // Amount validation
  if amount < 10 || amount > 500 {
    return errors.New("tip amount must be between ₹10 and ₹500")
  }
  
  // Order validation
  order := getOrder(orderID)
  if order.Status != "delivered" {
    return errors.New("can only tip after order delivery")
  }
  
  // Duplicate tip check
  if hasTippedRecipient(orderID, recipientType) {
    return errors.New("already tipped this recipient for this order")
  }
  
  return nil
}
```

### 2. Direct Transfer Processing
```go
func ProcessTipTransfer(tipID string, amount float64, recipientID string) error {
  // Get recipient bank details
  bankDetails := getRecipientBankDetails(recipientID)
  
  // Initiate direct transfer
  transferID, err := bankingService.DirectTransfer(
    amount,
    bankDetails.AccountNumber,
    bankDetails.IFSCCode,
    "Tip from HomeChef customer"
  )
  
  if err != nil {
    return err
  }
  
  // Update tip record
  updateTipTransferStatus(tipID, transferID, "completed")
  
  // Send notifications
  notifyTipTransferComplete(recipientID, amount)
  
  return nil
}
```

### 3. Analytics Tracking
```go
func TrackTipAnalytics(tip Tip) {
  analytics.Track("tip_sent", map[string]interface{}{
    "amount": tip.Amount,
    "recipient_type": tip.RecipientType,
    "order_value": tip.OrderValue,
    "tip_percentage": (tip.Amount / tip.OrderValue) * 100,
    "customer_id": tip.CustomerID,
    "has_message": tip.Message != "",
  })
}
```

## Database Schema

### 1. Tips Table
```sql
CREATE TABLE tips (
  id VARCHAR(255) PRIMARY KEY,
  order_id VARCHAR(255) NOT NULL,
  customer_id VARCHAR(255) NOT NULL,
  recipient_id VARCHAR(255) NOT NULL,
  recipient_type ENUM('chef', 'delivery') NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  message TEXT,
  status ENUM('pending', 'processing', 'completed', 'failed') DEFAULT 'pending',
  transaction_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP NULL,
  
  FOREIGN KEY (order_id) REFERENCES orders(id),
  FOREIGN KEY (customer_id) REFERENCES users(id),
  FOREIGN KEY (recipient_id) REFERENCES users(id),
  
  UNIQUE KEY unique_tip_per_recipient (order_id, recipient_type),
  INDEX idx_recipient_tips (recipient_id, created_at),
  INDEX idx_customer_tips (customer_id, created_at)
);
```

### 2. Tip Analytics Table
```sql
CREATE TABLE tip_analytics (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  tip_id VARCHAR(255) NOT NULL,
  order_value DECIMAL(10,2) NOT NULL,
  tip_percentage DECIMAL(5,2) NOT NULL,
  recipient_type ENUM('chef', 'delivery') NOT NULL,
  customer_segment VARCHAR(50),
  order_category VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (tip_id) REFERENCES tips(id),
  INDEX idx_analytics_date (created_at),
  INDEX idx_analytics_type (recipient_type, created_at)
);
```

## Security & Compliance

### 1. Financial Security
- **PCI DSS compliance** for payment processing
- **Encrypted bank details** storage
- **Audit trails** for all transactions
- **Fraud detection** for suspicious patterns

### 2. Anti-Money Laundering
- **Transaction limits** (₹10 - ₹500)
- **Daily limits** per customer
- **Suspicious activity monitoring**
- **Compliance reporting**

### 3. Data Protection
- **GDPR compliance** for EU customers
- **Data encryption** at rest and in transit
- **Access logging** for sensitive operations
- **Right to deletion** for tip data

## Analytics & Insights

### 1. Tip Metrics
```http
GET /admin/tips/analytics?period=month
```

**Response**:
```json
{
  "success": true,
  "data": {
    "total_tips": {
      "count": 1250,
      "amount": 62500.00,
      "avg_tip": 50.00
    },
    "by_recipient_type": {
      "chef": {
        "count": 800,
        "amount": 42000.00,
        "avg_tip": 52.50
      },
      "delivery": {
        "count": 450,
        "amount": 20500.00,
        "avg_tip": 45.56
      }
    },
    "tip_distribution": {
      "10-30": 25.0,
      "31-50": 40.0,
      "51-100": 30.0,
      "100+": 5.0
    },
    "customer_segments": {
      "high_value": 45.0,
      "regular": 35.0,
      "occasional": 20.0
    }
  }
}
```

### 2. Performance Metrics
- **Tip conversion rate**: % of delivered orders that receive tips
- **Average tip amount**: By recipient type and order value
- **Customer satisfaction correlation**: Tips vs ratings
- **Revenue impact**: Additional income for partners

## Integration Points

### 1. Banking Integration
```go
type BankingService interface {
  DirectTransfer(amount float64, account string, ifsc string, purpose string) (string, error)
  GetTransferStatus(transferID string) (TransferStatus, error)
  ValidateAccount(account string, ifsc string) error
}
```

### 2. Notification Service
```go
type NotificationService interface {
  SendTipNotification(recipientID string, amount float64, message string) error
  SendTipConfirmation(customerID string, amount float64, recipientName string) error
}
```

### 3. Analytics Service
```go
type AnalyticsService interface {
  TrackTipSent(tip Tip) error
  TrackTipReceived(tip Tip) error
  GetTipInsights(period string) (TipInsights, error)
}
```

This comprehensive tipping system ensures a seamless, secure, and transparent way for customers to show appreciation while providing additional income streams for chefs and delivery partners.