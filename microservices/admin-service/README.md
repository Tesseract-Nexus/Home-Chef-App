# HomeChef Admin Service

A comprehensive administrative microservice built with Go 1.24, providing complete platform management capabilities for the HomeChef platform.

## Features

- **Admin Dashboard**: Comprehensive overview with analytics and metrics
- **User Management**: Complete user lifecycle management with status controls
- **Chef Management**: Chef application approval, rejection, and suspension
- **Order Management**: Order oversight with refund processing capabilities
- **Delivery Management**: Delivery partner approval and management
- **Payout Management**: Individual and bulk payout processing
- **Customer Support**: Support ticket management and assignment
- **Reports**: Revenue and order analytics with various groupings
- **Platform Settings**: Configurable platform parameters and commission rates
- **WebSocket Support**: Real-time admin notifications and updates
- **HTTPS Support**: SSL/TLS encryption for secure communication

## Quick Start

### Local Development

1. **Setup and run:**
   ```bash
   cd microservices/admin-service
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

### Admin Dashboard
- `GET /v1/admin/dashboard` - Get admin dashboard data
- `GET /v1/admin/analytics` - Get platform analytics

### User Management
- `GET /v1/admin/users` - Get all users with filtering
- `GET /v1/admin/users/{user_id}` - Get user details
- `PUT /v1/admin/users/{user_id}` - Update user information
- `PUT /v1/admin/users/{user_id}/status` - Update user status

### Chef Management
- `GET /v1/admin/chefs` - Get all chefs with filtering
- `POST /v1/admin/chefs/{chef_id}/approve` - Approve chef application
- `POST /v1/admin/chefs/{chef_id}/reject` - Reject chef application
- `POST /v1/admin/chefs/{chef_id}/suspend` - Suspend chef account

### Order Management
- `GET /v1/admin/orders` - Get all orders with filtering
- `POST /v1/admin/orders/{order_id}/refund` - Process order refund

### Delivery Management
- `GET /v1/admin/delivery-partners` - Get all delivery partners
- `POST /v1/admin/delivery-partners/{partner_id}/approve` - Approve delivery partner

### Payout Management
- `GET /v1/admin/payouts` - Get all payouts with filtering
- `POST /v1/admin/payouts` - Process bulk payouts
- `POST /v1/admin/payouts/{payout_id}/process` - Process individual payout

### Customer Support
- `GET /v1/admin/support/tickets` - Get support tickets
- `PUT /v1/admin/support/tickets/{ticket_id}/assign` - Assign ticket to agent

### Reports
- `GET /v1/admin/reports/revenue` - Get revenue report
- `GET /v1/admin/reports/orders` - Get orders report

### Platform Settings
- `GET /v1/admin/settings/platform` - Get platform settings
- `PUT /v1/admin/settings/platform` - Update platform settings

### WebSocket
- `GET /ws` - WebSocket connection endpoint

## Configuration

Environment variables:

```bash
PORT=8083                    # Server port
HOST=localhost              # Server host
SSL_CERT_PATH=./certs/cert.pem    # SSL certificate
SSL_KEY_PATH=./certs/key.pem      # SSL private key
JWT_SECRET=your-secret-key        # JWT signing secret
DATABASE_URL=postgres://...       # PostgreSQL connection
REDIS_URL=redis://localhost:6379  # Redis connection
ENVIRONMENT=development           # Environment mode
```

## Security Features

- **Admin-Only Access**: All endpoints require admin role authentication
- **JWT Authentication**: Secure token-based authentication
- **HTTPS/TLS**: Encrypted communication
- **Input Validation**: Comprehensive request validation
- **CORS**: Cross-origin resource sharing configuration

## WebSocket Features

- Real-time admin notifications
- Platform activity updates
- System alerts and warnings
- Multi-admin collaboration support

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

## Integration

This service integrates with:
- **Database Service**: Centralized data operations
- **Chef Service**: Chef management and approval workflows
- **Customer Service**: User management and support
- **Order Service**: Order oversight and refund processing

## Production Deployment

1. **Set production environment variables**
2. **Ensure SSL certificates are available**
3. **Deploy with Docker Compose:**
   ```bash
   ENVIRONMENT=production make docker-run
   ```

## Health Monitoring

- **Health Check**: `GET /health`
- **WebSocket Stats**: Connection monitoring
- **Service Dependencies**: Database and Redis health

## License

MIT License