# HomeChef Webhook Service

A comprehensive webhook management service for the HomeChef platform that enables real-time event notifications to external systems.

## Features

- **Webhook Management**: Create, update, delete, and manage webhook endpoints
- **Event Subscriptions**: Subscribe to specific events like orders, payments, tips, etc.
- **Reliable Delivery**: Automatic retry mechanism with configurable policies
- **Security**: HMAC-SHA256 signature verification for webhook authenticity
- **Real-time Monitoring**: WebSocket support for live delivery status updates
- **Delivery Tracking**: Comprehensive logging and analytics for webhook deliveries
- **Test Webhooks**: Send test events to validate webhook endpoints

## API Endpoints

### Webhook Management

- `GET /api/v1/webhooks` - Get all webhook endpoints
- `POST /api/v1/webhooks` - Create new webhook endpoint
- `GET /api/v1/webhooks/{webhook_id}` - Get webhook details
- `PUT /api/v1/webhooks/{webhook_id}` - Update webhook endpoint
- `DELETE /api/v1/webhooks/{webhook_id}` - Delete webhook endpoint
- `POST /api/v1/webhooks/{webhook_id}/test` - Test webhook endpoint

### Event Information

- `GET /api/v1/webhooks/events` - Get available webhook events

### Delivery Management

- `GET /api/v1/webhooks/deliveries` - Get webhook delivery logs
- `POST /api/v1/webhooks/deliveries/{delivery_id}/retry` - Retry failed delivery

### WebSocket Support

- `GET /ws` - WebSocket endpoint for real-time updates
- `GET /ws/status` - WebSocket connection status

### Health Check

- `GET /health` - Service health check

## Quick Start

### Prerequisites

- Go 1.24+
- PostgreSQL 15+
- Redis 7+
- Docker & Docker Compose (optional)

### Environment Variables

Create a `.env` file with the following variables:

```env
# Server Configuration
SERVER_PORT=8080
ENVIRONMENT=development
SERVER_HOST=0.0.0.0

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=webhook_service
DB_SSLMODE=disable

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# JWT Configuration
JWT_SECRET=your-jwt-secret-key
JWT_EXPIRATION=3600

# Webhook Configuration
WEBHOOK_MAX_RETRIES=3
WEBHOOK_RETRY_DELAY=60
WEBHOOK_TIMEOUT=30
WEBHOOK_MAX_PAYLOAD_SIZE=1048576
WEBHOOK_SIGNATURE_HEADER=X-HomeChef-Signature

# External Services
USER_SERVICE_URL=http://user-service:8080
ORDER_SERVICE_URL=http://order-service:8080
PAYMENT_SERVICE_URL=http://payment-service:8080
NOTIFICATION_SERVICE_URL=http://notification-service:8080
```

### Running with Docker Compose

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f webhook-service

# Stop services
docker-compose down
```

### Running Locally

```bash
# Install dependencies
go mod download

# Start the service
make run

# Or with hot reload (requires air)
make dev
```

### Development Commands

```bash
# Setup development environment
make setup

# Run tests
make test

# Run tests with coverage
make test-coverage

# Format code
make fmt

# Lint code
make lint

# Build application
make build

# Generate swagger docs
make swagger

# Run all checks
make check
```

## API Usage Examples

### Create a Webhook Endpoint

```bash
curl -X POST http://localhost:8080/api/v1/webhooks \
  -H "Authorization: Bearer your-jwt-token" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://your-app.com/webhooks/homechef",
    "events": ["order.created", "order.completed", "payment.success"],
    "description": "Main webhook endpoint for order events",
    "retry_policy": {
      "max_retries": 3,
      "retry_delay": 60
    }
  }'
```

### Get Webhook Endpoints

```bash
curl -X GET http://localhost:8080/api/v1/webhooks \
  -H "Authorization: Bearer your-jwt-token"
```

### Test a Webhook

```bash
curl -X POST http://localhost:8080/api/v1/webhooks/webhook_123/test \
  -H "Authorization: Bearer your-jwt-token" \
  -H "Content-Type: application/json" \
  -d '{
    "event_type": "order.created"
  }'
```

### Get Delivery Logs

```bash
curl -X GET "http://localhost:8080/api/v1/webhooks/deliveries?status=failed&page=1&limit=10" \
  -H "Authorization: Bearer your-jwt-token"
```

## Available Webhook Events

The service supports the following webhook events:

- `order.created` - New order placed
- `order.completed` - Order completed
- `order.cancelled` - Order cancelled
- `payment.success` - Payment successful
- `payment.failed` - Payment failed
- `tip.received` - Tip received by chef/delivery
- `chef.approved` - Chef approved by admin
- `delivery.assigned` - Delivery partner assigned

## Webhook Payload Format

All webhooks are sent with the following payload structure:

```json
{
  "event": "order.created",
  "data": {
    "order_id": "order_123",
    "customer_id": "customer_456",
    "chef_id": "chef_789",
    "total_amount": 45.99,
    "status": "pending"
  },
  "timestamp": "2024-01-15T10:30:00Z",
  "webhook_id": "webhook_123",
  "delivery_id": "delivery_456"
}
```

## Security

### Webhook Signature Verification

All webhooks include an HMAC-SHA256 signature in the `X-HomeChef-Signature` header:

```javascript
const crypto = require('crypto');

function verifyWebhookSignature(payload, signature, secret) {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  
  return signature === `sha256=${expectedSignature}`;
}

// Usage in your webhook handler
app.post('/webhooks/homechef', (req, res) => {
  const signature = req.headers['x-homechef-signature'];
  const payload = JSON.stringify(req.body);
  
  if (!verifyWebhookSignature(payload, signature, 'your-webhook-secret')) {
    return res.status(401).send('Invalid signature');
  }
  
  // Process webhook...
  res.status(200).send('OK');
});
```

## WebSocket Usage

Connect to the WebSocket endpoint for real-time webhook delivery updates:

```javascript
const ws = new WebSocket('ws://localhost:8080/ws?user_id=user123&user_type=developer');

ws.onmessage = function(event) {
    const message = JSON.parse(event.data);
    console.log('Received:', message);
    
    switch(message.type) {
        case 'webhook_delivery':
            console.log(`Webhook delivered: ${message.data.delivery_id}`);
            break;
        case 'webhook_failed':
            console.log(`Webhook failed: ${message.data.error_message}`);
            break;
        case 'webhook_retry':
            console.log(`Webhook retry initiated: ${message.data.delivery_id}`);
            break;
    }
};
```

## Architecture

The service follows a clean architecture pattern with the following layers:

- **Handlers**: HTTP request handlers and input validation
- **Services**: Business logic and webhook delivery
- **Models**: Data structures and database models
- **Middleware**: Authentication, CORS, logging
- **Utils**: Shared utilities and crypto functions
- **WebSocket**: Real-time communication hub
- **Cron**: Scheduled tasks for retries and cleanup

## Database Schema

### webhook_endpoints

| Column | Type | Description |
|--------|------|-------------|
| id | varchar(255) | Unique webhook endpoint ID |
| user_id | varchar(255) | ID of user who owns the webhook |
| url | text | Webhook endpoint URL |
| events | text | JSON array of subscribed events |
| secret | varchar(255) | Secret for signature verification |
| description | text | Optional description |
| is_active | boolean | Whether webhook is active |
| retry_policy | jsonb | Retry configuration |
| created_at | timestamp | Creation timestamp |
| updated_at | timestamp | Last update timestamp |

### webhook_deliveries

| Column | Type | Description |
|--------|------|-------------|
| id | varchar(255) | Unique delivery ID |
| webhook_id | varchar(255) | Associated webhook endpoint |
| event_type | varchar(100) | Type of event |
| payload | jsonb | Event payload |
| status | varchar(50) | Delivery status |
| http_status | integer | HTTP response status |
| response | text | HTTP response body |
| attempt_count | integer | Number of delivery attempts |
| next_retry_at | timestamp | Next retry timestamp |
| delivered_at | timestamp | Successful delivery timestamp |
| failed_at | timestamp | Final failure timestamp |
| error_message | text | Error message if failed |
| created_at | timestamp | Creation timestamp |
| updated_at | timestamp | Last update timestamp |

## Retry Logic

The service implements an intelligent retry mechanism:

1. **Immediate Retry**: Failed deliveries are retried based on the webhook's retry policy
2. **Exponential Backoff**: Retry delays increase with each attempt
3. **Maximum Attempts**: Configurable maximum retry attempts
4. **Automatic Cleanup**: Old delivery logs are automatically cleaned up

## Monitoring and Logging

The service provides comprehensive monitoring:

- Structured JSON logging with logrus
- Request/response logging
- Webhook delivery tracking
- Performance metrics
- Real-time WebSocket notifications

## Testing

```bash
# Run all tests
make test

# Run tests with coverage
make test-coverage

# Run specific test
go test -v ./handlers/

# Run tests with race detection
go test -race ./...
```

## Performance

- Asynchronous webhook delivery
- Connection pooling for database
- Efficient database indexes
- Configurable timeouts and limits
- Horizontal scaling support

## Deployment

### Kubernetes

The service includes Kubernetes manifests in the `k8s/` directory:

```bash
# Deploy to Kubernetes
kubectl apply -f k8s/manifests/

# Deploy with Helm
helm install webhook-service k8s/helm-charts/homechef-microservices/
```

### Docker

```bash
# Build Docker image
make docker-build

# Push to registry
make docker-push

# Run container
make docker-run
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Write tests for your changes
4. Implement your changes
5. Run `make check` to verify code quality
6. Submit a pull request

## License

This project is part of the HomeChef microservices platform.