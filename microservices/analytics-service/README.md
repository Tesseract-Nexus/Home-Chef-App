# HomeChef Analytics Service

A comprehensive analytics microservice built with Go 1.24, providing detailed insights, reporting, and real-time analytics for the HomeChef platform.

## Features

- **Platform Analytics**: Comprehensive overview with revenue, orders, and user metrics
- **Financial Analytics**: Revenue analysis, cost tracking, and profit calculations
- **User Analytics**: Customer behavior, cohort analysis, and retention metrics
- **Order Analytics**: Order performance, completion rates, and trends
- **Chef Analytics**: Individual chef performance and ranking systems
- **Delivery Analytics**: Delivery partner performance and efficiency metrics
- **Operational Analytics**: Kitchen, delivery, and support efficiency metrics
- **Custom Reports**: Configurable report generation with scheduling
- **Real-time Dashboard**: Live metrics and system health monitoring
- **Data Export**: Export capabilities in multiple formats (CSV, JSON, Excel)
- **WebSocket Support**: Real-time analytics updates and notifications

## Quick Start

### Local Development

1. **Setup and run:**
   ```bash
   cd microservices/analytics-service
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

### Platform Analytics
- `GET /v1/analytics/platform/overview` - Get platform overview metrics

### Financial Analytics
- `GET /v1/analytics/revenue` - Get revenue analytics with breakdowns
- `GET /v1/analytics/financial/dashboard` - Get financial dashboard

### User Analytics
- `GET /v1/analytics/users` - Get user behavior analytics
- `GET /v1/analytics/customers/insights` - Get customer insights
- `GET /v1/analytics/customers/cohorts` - Get cohort analysis

### Order Analytics
- `GET /v1/analytics/orders` - Get order performance analytics

### Chef Analytics
- `GET /v1/analytics/chefs/{chef_id}/performance` - Get chef performance
- `GET /v1/analytics/chefs/ranking` - Get chef rankings

### Delivery Analytics
- `GET /v1/analytics/delivery/performance` - Get delivery performance

### Operational Analytics
- `GET /v1/analytics/operational/metrics` - Get operational metrics

### Custom Reports
- `POST /v1/analytics/reports/custom` - Create custom report
- `GET /v1/analytics/reports/{report_id}` - Get generated report

### Real-time Analytics
- `GET /v1/analytics/realtime/dashboard` - Get real-time dashboard

### Data Export
- `POST /v1/analytics/export` - Export analytics data

### WebSocket
- `GET /ws` - WebSocket connection endpoint

## Configuration

Environment variables:

```bash
PORT=8085                    # Server port
HOST=localhost              # Server host
SSL_CERT_PATH=./certs/cert.pem    # SSL certificate
SSL_KEY_PATH=./certs/key.pem      # SSL private key
JWT_SECRET=your-secret-key        # JWT signing secret
DATABASE_URL=postgres://...       # PostgreSQL connection
REDIS_URL=redis://localhost:6379  # Redis connection
ENVIRONMENT=development           # Environment mode
```

## Features

### Analytics Capabilities
- **Multi-dimensional Analysis**: Revenue, users, orders, chefs, delivery
- **Time-based Reporting**: Daily, weekly, monthly, quarterly, yearly
- **Segmentation**: User segments, geographic analysis, performance tiers
- **Trend Analysis**: Growth rates, performance trends, predictive insights
- **Real-time Metrics**: Live dashboard with system health monitoring

### Report Generation
- **Custom Reports**: Configurable metrics and dimensions
- **Scheduled Reports**: Automated report generation and distribution
- **Multiple Formats**: JSON, CSV, Excel, PDF export capabilities
- **Data Filtering**: Advanced filtering and date range selection

### WebSocket Features
- Real-time analytics updates
- Performance milestone notifications
- System health alerts
- Custom dashboard streaming

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
- **Admin Service**: Dashboard analytics and reporting
- **Chef Service**: Chef performance tracking
- **Order Service**: Order analytics and trends
- **Database Service**: Centralized data operations
- **Financial Service**: P/L calculations and expense tracking

## Production Deployment

1. **Set production environment variables**
2. **Configure SSL certificates**
3. **Deploy with Docker Compose:**
   ```bash
   ENVIRONMENT=production make docker-run
   ```

## Security Features

- **HTTPS/TLS**: Encrypted communication
- **JWT Authentication**: Secure admin/analyst access
- **Input Validation**: Comprehensive request validation
- **CORS**: Cross-origin resource sharing configuration

## Health Monitoring

- **Health Check**: `GET /health`
- **WebSocket Stats**: Connection monitoring
- **System Health**: Database and Redis monitoring

## License

MIT License