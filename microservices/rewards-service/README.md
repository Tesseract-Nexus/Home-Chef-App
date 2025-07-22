# HomeChef Rewards Service

A comprehensive rewards and subscription microservice built with Go 1.24, providing token-based loyalty programs and premium subscription management for the HomeChef platform.

## Features

- **Rewards System**: Token-based loyalty program with tier progression
- **Subscription Management**: Premium subscription plans with automated billing
- **Token Economy**: Earn tokens from orders, redeem for discounts/cashback/free delivery
- **Tier System**: Bronze, Silver, Gold, Platinum tiers with increasing benefits
- **Automated Processing**: Cron jobs for token expiry and subscription renewals
- **Real-time Updates**: WebSocket notifications for rewards and subscription changes
- **HTTPS Support**: SSL/TLS encryption for secure communication

## Quick Start

### Local Development

1. **Setup and run:**
   ```bash
   cd microservices/rewards-service
   make setup  # Complete development setup
   ```

2. **Or run step by step:**
   ```bash
   make deps           # Install Go dependencies
   make gen-certs      # Generate SSL certificates
   make docker-run     # Start PostgreSQL and Redis
   make run            # Start the service
   ```

### Docker Deployment

```bash
make docker-build
make docker-run
```

## API Endpoints

### Rewards Management
- `GET /v1/rewards/profile` - Get user rewards profile
- `POST /v1/rewards/earn` - Earn tokens from orders
- `POST /v1/rewards/redeem` - Redeem tokens for rewards
- `GET /v1/rewards/transactions` - Get reward transaction history

### Subscription Management
- `GET /v1/subscriptions` - Get available subscription plans
- `POST /v1/subscriptions` - Subscribe to a plan
- `GET /v1/subscriptions/current` - Get current subscription
- `PUT /v1/subscriptions/current` - Update subscription
- `DELETE /v1/subscriptions/current` - Cancel subscription

### WebSocket
- `GET /ws` - WebSocket connection endpoint

## Configuration

Environment variables:

```bash
PORT=8094                    # Server port
HOST=localhost              # Server host
SSL_CERT_PATH=./certs/cert.pem    # SSL certificate
SSL_KEY_PATH=./certs/key.pem      # SSL private key
JWT_SECRET=your-secret-key        # JWT signing secret
DATABASE_URL=postgres://...       # PostgreSQL connection
REDIS_URL=redis://localhost:6379  # Redis connection
ENVIRONMENT=development           # Environment mode
CRON_ENABLED=true                # Enable automated processing
```

## Features

### Rewards System
- **Token Earning**: 1 token per ₹10 spent on orders
- **Tier Progression**: Bronze (0), Silver (500), Gold (1500), Platinum (5000) tokens
- **Multiple Redemption Options**: Discounts, cashback, free delivery
- **Token Expiry**: Tokens expire after 1 year
- **Streak Tracking**: Consecutive order streaks for bonus rewards

### Subscription Plans
- **Premium Monthly**: ₹299/month with 3x tokens and free delivery
- **Premium Yearly**: ₹2990/year (2 months free) with premium benefits
- **Gold Monthly**: ₹199/month with 2x tokens and priority support
- **Automated Billing**: Automatic renewals with payment processing

### Automated Processing
- **Token Expiry**: Daily processing at 2 AM
- **Subscription Renewals**: Daily processing at 3 AM
- **Expired Subscriptions**: Daily cleanup at 4 AM

## Development

### Available Commands
```bash
make build          # Build the application
make run            # Build and run
make dev            # Run with hot reload
make test           # Run tests
make deps           # Download dependencies
make gen-certs      # Generate SSL certificates
make docker-build   # Build Docker image
make docker-run     # Run with Docker Compose
make ws-test        # WebSocket connection info
make setup          # Complete development setup
```

### Mock Data
The service includes pre-seeded data:
- Subscription plans (Premium Monthly/Yearly, Gold Monthly)
- Sample user rewards profile with tokens and tier
- Reward transaction history

## Integration

This service integrates with:
- **Customer Service**: User rewards and subscription management
- **Order Service**: Token earning from completed orders
- **Payment Service**: Subscription billing and payment processing
- **Database Service**: Centralized data operations

## Production Deployment

1. **Set production environment variables**
2. **Configure SSL certificates**
3. **Enable automated processing**
4. **Deploy with Docker Compose:**
   ```bash
   ENVIRONMENT=production make docker-run
   ```

## Security Features

- **HTTPS/TLS**: Encrypted communication
- **JWT Authentication**: Secure user authentication
- **Input Validation**: Comprehensive request validation
- **CORS**: Cross-origin resource sharing configuration

## Health Monitoring

- **Health Check**: `GET /health`
- **WebSocket Stats**: Connection monitoring
- **Database Health**: Automatic connection monitoring
- **Cron Job Monitoring**: Automated processing status

## License

MIT License