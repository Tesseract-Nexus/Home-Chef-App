# HomeChef Address Service

A comprehensive address management microservice built with Go 1.24, providing geolocation, validation, and real-time updates for the HomeChef platform.

## Features

- **Address Management**: Complete CRUD operations for user addresses
- **Geolocation**: Google Maps integration for address geocoding
- **Address Validation**: Real-time address validation and serviceability checks
- **WebSocket Support**: Real-time address updates and notifications
- **HTTPS Support**: SSL/TLS encryption for secure communication
- **Docker Ready**: Complete containerization with Docker Compose
- **Mock Data**: Pre-seeded development data for testing

## Quick Start

### Local Development

1. **Setup and run:**
   ```bash
   cd microservices/address-service
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

### Address Management
- `GET /v1/addresses` - Get user addresses
- `POST /v1/addresses` - Add new address
- `GET /v1/addresses/{address_id}` - Get address details
- `PUT /v1/addresses/{address_id}` - Update address
- `DELETE /v1/addresses/{address_id}` - Delete address
- `PUT /v1/addresses/{address_id}/default` - Set default address

### Address Validation
- `POST /v1/addresses/validate` - Validate address and check serviceability

### WebSocket
- `GET /ws` - WebSocket connection endpoint

## Configuration

Environment variables:

```bash
PORT=8082                    # Server port
HOST=localhost              # Server host
SSL_CERT_PATH=./certs/cert.pem    # SSL certificate
SSL_KEY_PATH=./certs/key.pem      # SSL private key
JWT_SECRET=your-secret-key        # JWT signing secret
DATABASE_URL=postgres://...       # PostgreSQL connection
REDIS_URL=redis://localhost:6379  # Redis connection
GOOGLE_MAPS_API_KEY=your-api-key  # Google Maps API key
ENVIRONMENT=development           # Environment mode
```

## Features

### Address Types
- **Home**: Primary residence
- **Work**: Office or workplace
- **Holiday**: Vacation or temporary stay
- **Temporary**: Short-term address

### Geolocation Services
- Google Maps integration for accurate geocoding
- Coordinate-based address lookup
- Distance calculations for nearby addresses

### Validation Features
- Address format validation
- Pincode verification
- Serviceability checks based on location
- Address suggestions for invalid inputs

### WebSocket Events
- Real-time address updates
- Location change notifications
- Service availability alerts

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
The service includes pre-seeded addresses for testing:
- Mumbai addresses with different types
- Bangalore address for multi-city testing
- Complete coordinate and serviceability data

## Integration

This service integrates with:
- **Chef Service**: Chef location and delivery radius
- **Customer Service**: User address management
- **Order Service**: Delivery address validation
- **Database Service**: Centralized data operations

## Production Deployment

1. **Set production environment variables**
2. **Configure Google Maps API key**
3. **Deploy with Docker Compose:**
   ```bash
   ENVIRONMENT=production make docker-run
   ```

## Security Features

- **HTTPS/TLS**: Encrypted communication
- **JWT Authentication**: Secure token-based authentication
- **Input Validation**: Comprehensive request validation
- **CORS**: Cross-origin resource sharing configuration

## Health Monitoring

- **Health Check**: `GET /health`
- **WebSocket Stats**: Connection monitoring
- **Database Health**: Automatic connection monitoring

## License

MIT License