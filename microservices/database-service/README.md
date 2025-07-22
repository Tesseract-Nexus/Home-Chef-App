# HomeChef Database Service

A comprehensive database middleware service built with Go 1.24, providing PostgreSQL, Redis, and WebSocket integration for the HomeChef platform.

## Features

- **PostgreSQL Integration**: Full GORM-based database operations with auto-migration
- **Redis Caching**: High-performance caching with JSON support and TTL management
- **WebSocket Support**: Real-time communication with role-based broadcasting
- **Mock Data**: Pre-seeded development data for testing
- **HTTPS Support**: SSL/TLS encryption for secure communication
- **Docker Ready**: Complete containerization with Docker Compose
- **Health Monitoring**: Built-in health checks and statistics endpoints

## Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   PostgreSQL    │    │      Redis      │    │   WebSocket     │
│   Database      │    │     Cache       │    │      Hub        │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │  Database API   │
                    │    Service      │
                    └─────────────────┘
```

## Quick Start

### Local Development

1. **Setup and run:**
   ```bash
   cd microservices/database-service
   make setup  # This will install deps, generate certs, and start services
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

### Database Operations
- `GET /v1/database/users` - Get all users with pagination
- `GET /v1/database/users/{id}` - Get user by ID
- `GET /v1/database/chefs` - Get all chef profiles
- `GET /v1/database/menu-items` - Get menu items (with chef filter)
- `GET /v1/database/orders` - Get orders (with filters)
- `POST /v1/database/test-order` - Create test order

### Cache Operations
- `GET /v1/cache/{key}` - Get cache value
- `POST /v1/cache/{key}` - Set cache value
- `DELETE /v1/cache/{key}` - Delete cache value
- `GET /v1/cache/chef-availability/{chef_id}` - Get chef availability
- `PUT /v1/cache/chef-availability/{chef_id}` - Update chef availability
- `GET /v1/cache/popular-dishes` - Get popular dishes
- `GET /v1/cache/delivery-location/{delivery_id}` - Get delivery location
- `PUT /v1/cache/delivery-location/{delivery_id}` - Update delivery location
- `GET /v1/cache/stats` - Get cache statistics

### WebSocket Operations
- `GET /ws` - WebSocket connection endpoint
- `POST /v1/ws/broadcast` - Broadcast to all clients
- `POST /v1/ws/broadcast/user/{user_id}` - Send to specific user
- `POST /v1/ws/broadcast/role/{role}` - Send to role
- `POST /v1/ws/order-update` - Send order update notification
- `POST /v1/ws/delivery-location` - Send delivery location update
- `GET /v1/ws/stats` - Get WebSocket statistics

## Database Schema

The service includes comprehensive models for:

- **Users**: Customer, chef, and delivery partner accounts
- **Chef Profiles**: Chef-specific information and business details
- **Delivery Profiles**: Delivery partner information
- **Addresses**: User addresses with geolocation
- **Menu Items**: Chef menu items with nutritional info
- **Orders**: Order management with items and status tracking
- **Reviews**: Order reviews and ratings
- **Notifications**: System notifications

## WebSocket Events

### Event Types
- `order_created` - New order notification
- `order_updated` - Order status change
- `order_cancelled` - Order cancellation
- `order_delivered` - Order delivery confirmation
- `chef_online/offline` - Chef availability status
- `menu_updated` - Menu changes
- `delivery_assigned` - Delivery partner assignment
- `delivery_location` - Real-time location updates
- `notification` - General notifications
- `heartbeat` - Connection health check

### WebSocket Connection
```javascript
const ws = new WebSocket('ws://localhost:8081/ws?user_id=user123&role=customer');

ws.onmessage = function(event) {
    const message = JSON.parse(event.data);
    console.log('Received:', message);
};
```

## Mock Data

The service automatically seeds mock data including:

- **Users**: Sample chef, customer, and delivery partner accounts
- **Chef Profile**: Complete chef profile with menu items
- **Menu Items**: Sample dishes with pricing and nutritional info
- **Cache Data**: Chef availability, popular dishes, delivery locations
- **Session Data**: Sample authentication sessions

## Configuration

Environment variables:

```bash
PORT=8081                    # Server port
HOST=localhost              # Server host
SSL_CERT_PATH=./certs/cert.pem    # SSL certificate
SSL_KEY_PATH=./certs/key.pem      # SSL private key
DATABASE_URL=postgres://...       # PostgreSQL connection
REDIS_URL=redis://localhost:6379  # Redis connection
REDIS_PASSWORD=                   # Redis password (optional)
REDIS_DB=0                       # Redis database number
WEBSOCKET_ORIGIN=*               # WebSocket CORS origin
ENVIRONMENT=development          # Environment mode
LOG_LEVEL=debug                  # Logging level
```

## Development Tools

### Available Commands
```bash
make build          # Build the application
make run            # Build and run
make dev            # Run with hot reload (requires air)
make test           # Run tests
make deps           # Download dependencies
make gen-certs      # Generate SSL certificates
make docker-build   # Build Docker image
make docker-run     # Run with Docker Compose
make redis-cli      # Access Redis CLI
make ws-test        # WebSocket connection info
make setup          # Complete development setup
```

### Database Management
- PostgreSQL runs on `localhost:5432`
- Redis runs on `localhost:6379`
- Redis Commander UI: `http://localhost:8082`

### WebSocket Testing
Connect to WebSocket at: `ws://localhost:8081/ws`

Example connection with user info:
```
ws://localhost:8081/ws?user_id=chef-1&role=chef
```

## Integration with Other Services

This database service acts as the central data layer for all HomeChef microservices:

1. **Chef Service**: Uses database endpoints for chef data operations
2. **Customer Service**: Accesses user and order information
3. **Delivery Service**: Manages delivery partner data and locations
4. **Real-time Updates**: WebSocket integration for live notifications

## Production Deployment

1. **Set production environment variables**
2. **Ensure SSL certificates are available**
3. **Deploy with Docker Compose:**
   ```bash
   ENVIRONMENT=production make docker-run
   ```

## Monitoring and Health

- **Health Check**: `GET /health`
- **WebSocket Stats**: `GET /v1/ws/stats`
- **Cache Stats**: `GET /v1/cache/stats`
- **Database Connection**: Automatic health monitoring

## Security Features

- **HTTPS/TLS**: Encrypted communication
- **CORS**: Cross-origin resource sharing configuration
- **Connection Limits**: PostgreSQL connection pooling
- **Input Validation**: Comprehensive request validation
- **Graceful Shutdown**: Clean resource cleanup

## Contributing

1. Follow Go best practices
2. Add tests for new features
3. Update documentation
4. Run `make fmt` and `make lint` before committing

## License

MIT License