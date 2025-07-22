# HomeChef Tipping Service

A microservice for handling tip transactions between customers and service providers (chefs and delivery partners) in the HomeChef platform.

## Features

- **Send Tips**: Allow customers to send tips to chefs and delivery partners
- **Tip History**: View complete tip transaction history
- **Analytics**: Comprehensive analytics for service providers
- **Real-time Updates**: WebSocket support for live tip notifications
- **Payment Integration**: Secure payment processing
- **Multi-recipient Support**: Support for both chef and delivery partner tips

## API Endpoints

### Tipping Operations

- `POST /api/v1/tips/send` - Send a tip to chef or delivery partner
- `GET /api/v1/tips/history` - Get tip history with filtering options
- `GET /api/v1/tips/received` - Get tips received (chef/delivery only)
- `GET /api/v1/tips/analytics` - Get tipping analytics (chef/delivery only)
- `GET /api/v1/tips/{id}` - Get specific tip details

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
DB_NAME=tipping_service
DB_SSLMODE=disable

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# JWT Configuration
JWT_SECRET=your-jwt-secret-key
JWT_EXPIRATION=3600

# Payment Configuration
STRIPE_SECRET_KEY=sk_test_your_stripe_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
PAYMENT_PROCESSOR_URL=http://payment-service:8080

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
docker-compose logs -f tipping-service

# Stop services
docker-compose down
```

### Running Locally

```bash
# Install dependencies
go mod download

# Run database migrations
make db-migrate

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

### Send a Tip

```bash
curl -X POST http://localhost:8080/api/v1/tips/send \
  -H "Authorization: Bearer your-jwt-token" \
  -H "Content-Type: application/json" \
  -d '{
    "recipient_id": "chef_123",
    "recipient_type": "chef",
    "amount": 25.00,
    "message": "Great food!",
    "order_id": "order_123"
  }'
```

### Get Tip History

```bash
curl -X GET "http://localhost:8080/api/v1/tips/history?type=sent&page=1&limit=10" \
  -H "Authorization: Bearer your-jwt-token"
```

### Get Tip Analytics

```bash
curl -X GET "http://localhost:8080/api/v1/tips/analytics?period=month" \
  -H "Authorization: Bearer your-jwt-token"
```

## WebSocket Usage

Connect to the WebSocket endpoint for real-time tip notifications:

```javascript
const ws = new WebSocket('ws://localhost:8080/ws?user_id=user123&user_type=chef');

ws.onmessage = function(event) {
    const message = JSON.parse(event.data);
    console.log('Received:', message);
    
    switch(message.type) {
        case 'tip_received':
            // Handle tip received notification
            console.log(`Received tip of $${message.data.amount} from ${message.data.from_user}`);
            break;
        case 'tip_sent':
            // Handle tip sent confirmation
            console.log(`Successfully sent tip of $${message.data.amount}`);
            break;
    }
};
```

## Architecture

The service follows a clean architecture pattern with the following layers:

- **Handlers**: HTTP request handlers and input validation
- **Services**: Business logic and core functionality
- **Models**: Data structures and database models
- **Middleware**: Authentication, CORS, logging
- **Utils**: Shared utilities and helpers
- **WebSocket**: Real-time communication hub

## Database Schema

### tip_transactions

| Column | Type | Description |
|--------|------|-------------|
| id | varchar(255) | Unique tip transaction ID |
| from_user_id | varchar(255) | ID of user sending tip |
| from_user_name | varchar(255) | Name of user sending tip |
| to_user_id | varchar(255) | ID of tip recipient |
| to_user_name | varchar(255) | Name of tip recipient |
| to_user_type | varchar(50) | Type of recipient (chef/delivery) |
| amount | decimal(10,2) | Tip amount |
| message | text | Optional message with tip |
| order_id | varchar(255) | Associated order ID |
| status | varchar(50) | Transaction status |
| transaction_id | varchar(255) | Payment transaction ID |
| payment_method_id | varchar(255) | Payment method used |
| processed_at | timestamp | Processing timestamp |
| failure_reason | text | Failure reason if applicable |
| created_at | timestamp | Creation timestamp |
| updated_at | timestamp | Last update timestamp |

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

## Monitoring and Logging

The service uses structured logging with logrus. Logs include:

- Request/response logging
- Error tracking
- Performance metrics
- WebSocket connection events
- Tip transaction events

## Security

- JWT-based authentication
- Input validation and sanitization
- SQL injection prevention with GORM
- CORS protection
- Rate limiting (planned)
- Audit logging

## Performance

- Connection pooling for database
- Redis caching for frequent queries
- Efficient database indexes
- WebSocket connection management
- Horizontal scaling support

## Deployment

### Kubernetes

The service includes Kubernetes manifests in the `k8s/` directory:

```bash
# Deploy to Kubernetes
kubectl apply -f k8s/manifests/

# Deploy with Helm
helm install tipping-service k8s/helm-charts/homechef-microservices/
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