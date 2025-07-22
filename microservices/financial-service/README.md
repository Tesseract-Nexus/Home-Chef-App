# HomeChef Financial Service

A comprehensive financial management microservice built with Go 1.24, providing automated expense tracking, P&L calculations, and payout management for chefs on the HomeChef platform.

## Features

- **Automated Financial Tracking**: Real-time expense and revenue tracking
- **P&L Calculations**: Daily, weekly, monthly, half-yearly, and annual profit/loss reports
- **Expense Management**: Chef expense recording with receipt uploads
- **Payout Processing**: Automated payout calculations and requests
- **Cron Scheduling**: Automated daily/weekly/monthly financial processing
- **WebSocket Support**: Real-time financial updates and notifications
- **HTTPS Support**: SSL/TLS encryption for secure communication
- **Docker Ready**: Complete containerization with Docker Compose

## Quick Start

### Local Development

1. **Setup and run:**
   ```bash
   cd microservices/financial-service
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

### Chef Financial Management
- `GET /v1/financial/chefs/{chef_id}/summary` - Get financial summary
- `GET /v1/financial/chefs/{chef_id}/profit-loss` - Get P&L report

### Chef Expenses
- `GET /v1/financial/chefs/{chef_id}/expenses` - Get expenses with pagination
- `POST /v1/financial/chefs/{chef_id}/expenses` - Create new expense

### Chef Payouts
- `GET /v1/financial/chefs/{chef_id}/payouts` - Get payout history
- `POST /v1/financial/chefs/{chef_id}/payouts` - Request payout

### WebSocket
- `GET /ws` - WebSocket connection endpoint

## Configuration

Environment variables:

```bash
PORT=8086                    # Server port
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

### Automated P&L Calculations
- **Daily Processing**: Runs at 1 AM daily
- **Weekly Processing**: Runs on Mondays at 2 AM
- **Monthly Processing**: Runs on 1st of month at 3 AM
- **Custom Period Analysis**: Support for half-yearly and annual reports

### Financial Tracking
- Revenue tracking from orders
- Expense categorization (ingredients, packaging, utilities)
- Platform fee calculations
- Tips and bonus tracking
- Net earnings calculations

### Expense Management
- Multiple expense categories
- Receipt upload support
- Approval workflow
- Automatic financial record updates

### Payout System
- Automated payout calculations
- Multiple payment methods
- Status tracking (pending, processing, completed)
- Historical payout records

### WebSocket Features
- Real-time financial updates
- P&L calculation notifications
- Payout status updates
- Expense approval notifications

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
The service includes pre-seeded financial data:
- Sample chef financial records
- Mock expense entries
- Payout history examples

## Integration

This service integrates with:
- **Chef Service**: Revenue and order data
- **Analytics Service**: Financial analytics and reporting
- **Admin Service**: Payout approval and management
- **Database Service**: Centralized data operations

## Cron Jobs

The service includes automated financial processing:

```
Daily (1 AM):    Process daily P&L calculations
Weekly (Mon 2 AM): Process weekly financial summaries  
Monthly (1st 3 AM): Process monthly financial reports
```

## Production Deployment

1. **Set production environment variables**
2. **Configure SSL certificates**
3. **Enable cron processing**
4. **Deploy with Docker Compose:**
   ```bash
   ENVIRONMENT=production make docker-run
   ```

## Security Features

- **HTTPS/TLS**: Encrypted communication
- **JWT Authentication**: Secure chef/admin access
- **Input Validation**: Comprehensive request validation
- **CORS**: Cross-origin resource sharing configuration

## Health Monitoring

- **Health Check**: `GET /health`
- **WebSocket Stats**: Connection monitoring
- **Database Health**: Automatic connection monitoring
- **Cron Job Monitoring**: Automated processing status

## License

MIT License