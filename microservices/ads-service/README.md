# HomeChef Ads Service

A comprehensive advertisement management microservice built with Go 1.24, providing campaign management, ad serving, and performance tracking for the HomeChef platform.

## Features

- **Campaign Management**: Create, update, and manage ad campaigns
- **Ad Serving**: Intelligent ad delivery based on targeting criteria
- **Performance Tracking**: Real-time impression and click tracking
- **Analytics**: Campaign performance metrics and ROI analysis
- **WebSocket Support**: Real-time ad updates and notifications
- **HTTPS Support**: SSL/TLS encryption for secure communication
- **Docker Ready**: Complete containerization with Docker Compose

## Quick Start

### Local Development

1. **Setup and run:**
   ```bash
   cd microservices/ads-service
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

### Campaign Management (Admin Only)
- `GET /v1/ads/campaigns` - Get ad campaigns with filtering
- `POST /v1/ads/campaigns` - Create new campaign
- `GET /v1/ads/campaigns/{campaign_id}` - Get campaign details
- `PUT /v1/ads/campaigns/{campaign_id}` - Update campaign
- `DELETE /v1/ads/campaigns/{campaign_id}` - Delete campaign
- `GET /v1/ads/campaigns/{campaign_id}/performance` - Get performance metrics

### Ad Serving (Public)
- `GET /v1/ads/serve` - Get ads for user based on targeting

### Ad Tracking (Public)
- `POST /v1/ads/track/impression` - Track ad impression
- `POST /v1/ads/track/click` - Track ad click

### WebSocket
- `GET /ws` - WebSocket connection endpoint

## Configuration

Environment variables:

```bash
PORT=8084                    # Server port
HOST=localhost              # Server host
SSL_CERT_PATH=./certs/cert.pem    # SSL certificate
SSL_KEY_PATH=./certs/key.pem      # SSL private key
JWT_SECRET=your-secret-key        # JWT signing secret
DATABASE_URL=postgres://...       # PostgreSQL connection
REDIS_URL=redis://localhost:6379  # Redis connection
ENVIRONMENT=development           # Environment mode
```

## Features

### Campaign Types
- **Banner**: Display ads in app/web interface
- **Interstitial**: Full-screen ads between content
- **Native**: Ads that match app content style
- **Video**: Video advertisement content
- **Sponsored Content**: Promoted chef/restaurant content

### Targeting Options
- User types (customer, chef, delivery)
- Geographic locations
- Age groups
- Interest categories
- Time-based scheduling

### Performance Metrics
- Impressions and clicks tracking
- Click-through rate (CTR) calculation
- Cost tracking and ROI analysis
- Real-time performance updates

### WebSocket Events
- Campaign status updates
- Performance milestone notifications
- Real-time analytics updates

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
The service includes pre-seeded campaign data:
- Sample banner campaign with targeting
- Mock ad content with images and CTAs
- Performance tracking data

## Integration

This service integrates with:
- **Admin Service**: Campaign management interface
- **Customer Service**: Ad serving and user targeting
- **Analytics Service**: Performance data aggregation
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
- **JWT Authentication**: Secure admin access
- **Input Validation**: Comprehensive request validation
- **CORS**: Cross-origin resource sharing configuration

## Health Monitoring

- **Health Check**: `GET /health`
- **WebSocket Stats**: Connection monitoring
- **Database Health**: Automatic connection monitoring

## License

MIT License