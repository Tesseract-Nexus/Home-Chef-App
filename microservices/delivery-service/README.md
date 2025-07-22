# HomeChef Delivery Service

A comprehensive delivery management microservice built with Go 1.24, providing complete delivery partner management, order tracking, and earnings calculation for the HomeChef platform.

## Features

- **Delivery Partner Management**: Complete profile management with vehicle and document verification
- **Order Management**: Available orders, acceptance, pickup, delivery tracking
- **Real-time Location Tracking**: GPS tracking during delivery with customer updates
- **Earnings Management**: Detailed earnings calculation with tips, bonuses, and deductions
- **Performance Analytics**: Delivery metrics, ratings, and performance tracking
- **Vehicle Management**: Vehicle registration and insurance tracking
- **Document Verification**: Upload and verification of required documents
- **Emergency Support**: Emergency reporting system with location tracking
- **WebSocket Support**: Real-time updates and notifications
- **HTTPS Support**: SSL/TLS encryption for secure communication

## Quick Start

### Local Development

1. **Setup and run:**
   ```bash
   cd microservices/delivery-service
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

### Delivery Partner Profile
- `GET /v1/delivery/profile` - Get delivery partner profile
- `PUT /v1/delivery/profile` - Update delivery partner profile
- `PUT /v1/delivery/status` - Update availability status and location

### Order Management
- `GET /v1/delivery/orders/available` - Get available delivery orders
- `POST /v1/delivery/orders/{order_id}/accept` - Accept delivery order
- `PUT /v1/delivery/orders/{order_id}/pickup` - Mark order as picked up
- `PUT /v1/delivery/orders/{order_id}/deliver` - Mark order as delivered
- `PUT /v1/delivery/orders/{order_id}/location` - Update current location
- `GET /v1/delivery/orders/active` - Get active delivery orders
- `GET /v1/delivery/orders/history` - Get delivery history

### Earnings
- `GET /v1/delivery/earnings` - Get earnings summary
- `GET /v1/delivery/earnings/breakdown` - Get detailed earnings breakdown

### Analytics
- `GET /v1/delivery/analytics` - Get delivery performance analytics

### Vehicle Management
- `PUT /v1/delivery/vehicle` - Update vehicle information

### Document Management
- `POST /v1/delivery/documents` - Upload verification documents

### Emergency
- `POST /v1/delivery/emergency` - Report emergency situation

### WebSocket
- `GET /ws` - WebSocket connection endpoint

## Configuration

Environment variables:

```bash
PORT=8088                    # Server port
HOST=localhost              # Server host
SSL_CERT_PATH=./certs/cert.pem    # SSL certificate
SSL_KEY_PATH=./certs/key.pem      # SSL private key
JWT_SECRET=your-secret-key        # JWT signing secret
DATABASE_URL=postgres://...       # PostgreSQL connection
REDIS_URL=redis://localhost:6379  # Redis connection
ENVIRONMENT=development           # Environment mode
```

## Features

### Delivery Partner Features
- Complete profile management with emergency contacts
- Vehicle registration and insurance tracking
- Document upload and verification system
- Real-time availability status management

### Order Management
- Intelligent order matching based on location and preferences
- Real-time GPS tracking during delivery
- Proof of delivery with photos and signatures
- Order history with detailed analytics

### Earnings System
- Base earnings calculation per delivery
- Tips and bonus tracking
- Deduction management (fuel, penalties)
- Detailed earnings breakdown by date range
- Payout status and scheduling

### Performance Analytics
- Delivery completion rates and timing
- Customer ratings and feedback
- Distance and efficiency metrics
- Peak hours performance analysis

### Safety Features
- Emergency reporting system
- Real-time location sharing
- Emergency contact notifications
- Safety incident tracking

### WebSocket Features
- Real-time order assignments
- Location updates during delivery
- Emergency alerts and notifications
- Earnings and performance updates

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
The service includes pre-seeded delivery data:
- Sample delivery partner profile with vehicle details
- Mock earnings records with tips and bonuses
- Document verification status
- Emergency contact information

## Integration

This service integrates with:
- **Order Service**: Order assignment and status updates
- **Customer Service**: Real-time delivery tracking
- **Analytics Service**: Performance data aggregation
- **Financial Service**: Earnings and payout calculations
- **Database Service**: Centralized data operations

## Production Deployment

1. **Set production environment variables**
2. **Configure SSL certificates**
3. **Deploy with Docker Compose:**
   ```bash
   ENVIRONMENT=production make docker-run
   ```

## Security Features

- **HTTPS/TLS**: Encrypted communication
- **JWT Authentication**: Secure delivery partner access
- **Input Validation**: Comprehensive request validation
- **CORS**: Cross-origin resource sharing configuration
- **Document Security**: Secure document upload and storage

## Health Monitoring

- **Health Check**: `GET /health`
- **WebSocket Stats**: Connection monitoring
- **Database Health**: Automatic connection monitoring

## License

MIT License