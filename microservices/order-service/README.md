# HomeChef Order Service

A comprehensive order management microservice built with Go 1.24, providing complete order lifecycle management with advanced cancellation policies and countdown timers for the HomeChef platform.

## Features

- **Order Management**: Complete order lifecycle from placement to delivery
- **30-Second Countdown Timer**: Free cancellation window with real-time countdown
- **Smart Penalty System**: Automatic penalty calculation based on timing and order value
- **Tipping System**: Direct bank transfers to chefs and delivery partners
- **Policy Management**: Configurable cancellation policies with admin controls
- **Real-time Analytics**: Cancellation analytics and reporting
- **WebSocket Support**: Real-time order updates and countdown notifications
- **Automated Processing**: Cron jobs for expired countdown handling
- **HTTPS Support**: SSL/TLS encryption for secure communication

## Quick Start

### Local Development

1. **Setup and run:**
   ```bash
   cd microservices/order-service
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

### Order Management
- `POST /v1/orders` - Place order with countdown timer
- `GET /v1/orders` - Get user orders with filtering
- `POST /v1/orders/{order_id}/tip` - Add tip with direct transfer

### Order Cancellation
- `POST /v1/orders/{order_id}/cancel` - Cancel order with penalty calculation
- `GET /v1/orders/{order_id}/cancellation-info` - Get cancellation information
- `GET /v1/orders/{order_id}/countdown-status` - Get countdown timer status
- `POST /v1/orders/{order_id}/confirm-after-timer` - Confirm order after countdown

### Admin Policy Management
- `GET /v1/admin/cancellation-policy` - Get current cancellation policy
- `PUT /v1/admin/cancellation-policy` - Update cancellation policy
- `GET /v1/admin/cancellation-analytics` - Get cancellation analytics

### Notifications
- `POST /v1/notifications/order-cancellation` - Send cancellation notifications

### WebSocket
- `GET /ws` - WebSocket connection endpoint

## Configuration

Environment variables:

```bash
PORT=8092                    # Server port
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

### Countdown Timer System
- **30-second free cancellation window** (configurable)
- **Real-time countdown updates** via WebSocket
- **Automatic order confirmation** after timer expiry
- **Progress percentage tracking** for UI components

### Smart Penalty Calculation
- **Configurable penalty rates** (default 40% of order value)
- **Minimum and maximum penalty limits** to ensure fairness
- **Time-based penalty application** (free within window, penalty after)
- **Automatic refund calculation** with processing timeline

### Tipping System
- **Direct bank transfers** to recipients (no platform fees)
- **Real-time tip notifications** to recipients
- **Support for chef and delivery partner tips**
- **Tip tracking and analytics** for recipients

### Policy Management
- **Admin-configurable policies** for cancellation rules
- **Real-time policy updates** affecting new orders
- **Policy versioning** and audit trail
- **Flexible penalty structures** based on business needs

### Analytics & Reporting
- **Cancellation rate tracking** by time period
- **Free vs penalty cancellation breakdown**
- **Revenue impact analysis** from cancellations
- **Reason-based cancellation analytics**

### Automated Processing
- **Cron job for expired countdowns** (runs every minute)
- **Automatic order confirmation** when countdown expires
- **Daily analytics aggregation** for reporting
- **Notification triggers** for status changes

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
The service includes pre-seeded order data:
- Default cancellation policy (30 seconds, 40% penalty)
- Sample order with countdown timer
- Order items and analytics data

## Integration

This service integrates with:
- **Customer Service**: Order placement and management
- **Chef Service**: Order confirmation and preparation
- **Delivery Service**: Order assignment and tracking
- **Financial Service**: Penalty and refund processing
- **Messaging Service**: Order-related communications
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
- **Admin-only endpoints**: Protected policy management

## Health Monitoring

- **Health Check**: `GET /health`
- **WebSocket Stats**: Connection monitoring
- **Database Health**: Automatic connection monitoring
- **Cron Job Monitoring**: Automated processing status

## License

MIT License