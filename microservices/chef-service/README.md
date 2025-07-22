# HomeChef Chef Service

A Go microservice handling chef-specific operations for the HomeChef platform.

## Features

- **Chef Onboarding**: Application submission and profile management
- **Menu Management**: Create, update, and manage menu items
- **Order Management**: Handle order status updates and tracking
- **Analytics**: Dashboard and performance metrics
- **Earnings**: Payout management and financial tracking
- **HTTPS Support**: SSL/TLS encryption for secure communication
- **JWT Authentication**: Secure API access with role-based authorization
- **Docker Ready**: Containerized deployment with Docker and Docker Compose

## Prerequisites

- Go 1.24 or higher
- Docker and Docker Compose (for containerized deployment)
- PostgreSQL database
- Redis for caching
- SSL certificates (for HTTPS)

## Quick Start

### Local Development

1. **Clone and setup:**
   ```bash
   cd microservices/chef-service
   cp .env.example .env
   # Edit .env with your configuration
   ```

2. **Install dependencies:**
   ```bash
   make deps
   ```

3. **Generate SSL certificates (for local HTTPS):**
   ```bash
   make gen-certs
   ```

4. **Run the service:**
   ```bash
   make run
   # or for hot reload (requires air)
   make dev
   ```

### Docker Deployment

1. **Build and run with Docker Compose:**
   ```bash
   make docker-build
   make docker-run
   ```

2. **Check logs:**
   ```bash
   make docker-logs
   ```

## API Endpoints

### Authentication
All endpoints (except `/chefs/apply`) require JWT authentication:
```
Authorization: Bearer <jwt_token>
```

### Chef Profile
- `POST /v1/chefs/apply` - Submit chef application
- `GET /v1/chefs/profile` - Get chef profile
- `PUT /v1/chefs/profile` - Update chef profile
- `PUT /v1/chefs/availability` - Update availability status
- `POST /v1/chefs/vacation` - Set vacation mode

### Menu Management
- `GET /v1/chefs/menu` - Get chef's menu
- `POST /v1/chefs/menu` - Add menu item
- `PUT /v1/chefs/menu/{dish_id}` - Update menu item
- `DELETE /v1/chefs/menu/{dish_id}` - Delete menu item
- `POST /v1/chefs/menu/{dish_id}/images` - Upload dish images
- `PUT /v1/chefs/menu/{dish_id}/availability` - Toggle item availability

### Order Management
- `GET /v1/chefs/orders` - Get chef orders
- `PUT /v1/chefs/orders/{order_id}/status` - Update order status

### Analytics & Earnings
- `GET /v1/chefs/dashboard` - Get dashboard data
- `GET /v1/chefs/analytics` - Get detailed analytics
- `GET /v1/chefs/earnings` - Get earnings summary
- `GET /v1/chefs/payouts` - Get payout history
- `POST /v1/chefs/payouts/request` - Request instant payout

## Configuration

Environment variables:

```bash
PORT=8080                    # Server port
HOST=localhost              # Server host
SSL_CERT_PATH=./certs/cert.pem    # SSL certificate path
SSL_KEY_PATH=./certs/key.pem      # SSL private key path
JWT_SECRET=your-secret-key        # JWT signing secret
DATABASE_URL=postgres://...       # PostgreSQL connection string
REDIS_URL=redis://localhost:6379  # Redis connection string
STORAGE_BASE_URL=https://cdn.homechef.com  # CDN base URL
API_BASE_URL=https://api.homechef.com/v1   # API base URL
ENVIRONMENT=development           # Environment (development/production)
```

## Development

### Code Structure
```
├── config/          # Configuration management
├── handlers/        # HTTP request handlers
├── middleware/      # HTTP middleware
├── models/          # Data structures
├── routes/          # Route definitions
├── utils/           # Utility functions
├── main.go         # Application entry point
├── Dockerfile      # Docker configuration
└── docker-compose.yml  # Docker Compose setup
```

### Available Commands
```bash
make build          # Build the application
make run            # Build and run
make dev            # Run with hot reload
make test           # Run tests
make clean          # Clean build artifacts
make deps           # Download dependencies
make gen-certs      # Generate SSL certificates
make docker-build   # Build Docker image
make docker-run     # Run with Docker Compose
make fmt            # Format code
make lint           # Lint code
make security       # Security scan
```

## Security Features

- **HTTPS/TLS**: Encrypted communication
- **JWT Authentication**: Secure token-based authentication
- **Role-based Access**: Chef-only endpoints
- **Input Validation**: Comprehensive request validation
- **CORS**: Cross-origin resource sharing configuration
- **Rate Limiting**: (To be implemented)

## Health Check

The service provides a health check endpoint:
```bash
GET /health
```

Response:
```json
{
  "status": "healthy",
  "service": "chef-service"
}
```

## Testing

Run tests:
```bash
make test
```

## Deployment

### Production Deployment

1. **Set production environment variables**
2. **Ensure SSL certificates are available**
3. **Deploy with Docker Compose:**
   ```bash
   ENVIRONMENT=production make docker-run
   ```

### SSL Certificate Setup

For production, obtain SSL certificates from a trusted CA. For development:
```bash
make gen-certs
```

## Monitoring and Logging

- **Structured Logging**: Uses Zap logger with JSON output in production
- **Request Logging**: All HTTP requests are logged with timing
- **Health Checks**: Built-in health check endpoint
- **Graceful Shutdown**: Handles SIGINT/SIGTERM for clean shutdown

## Contributing

1. Follow Go best practices
2. Add tests for new features
3. Update documentation
4. Run `make fmt` and `make lint` before committing

## License

MIT License