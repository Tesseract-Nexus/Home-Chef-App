# HomeChef Location Service

A comprehensive location and geospatial microservice built with Go 1.24, providing geocoding, route planning, and delivery zone management for the HomeChef platform.

## Features

- **Location Services**: Supported cities and serviceable areas management
- **Address Validation**: Real-time address validation and serviceability checking
- **Geocoding**: Address to coordinates conversion with Google Maps integration
- **Reverse Geocoding**: Coordinates to address conversion
- **Proximity Search**: Find nearby chefs, delivery partners, and landmarks
- **Distance Calculation**: Calculate distance and duration between points
- **Route Planning**: Turn-by-turn directions and route optimization
- **Delivery Zones**: Chef delivery zone management and validation
- **Location Caching**: Intelligent caching for improved performance
- **WebSocket Support**: Real-time location updates and notifications

## Quick Start

### Local Development

1. **Setup and run:**
   ```bash
   cd microservices/location-service
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

### Location Services
- `GET /v1/locations/cities` - Get supported cities
- `GET /v1/locations/areas` - Get serviceable areas

### Location Validation
- `POST /v1/locations/validate` - Validate location and check serviceability

### Geocoding
- `POST /v1/locations/geocode` - Convert address to coordinates
- `POST /v1/locations/reverse-geocode` - Convert coordinates to address

### Proximity Search
- `GET /v1/locations/nearby` - Find nearby locations (chefs, delivery partners)

### Distance & Route Planning
- `POST /v1/locations/distance` - Calculate distance between points
- `POST /v1/locations/route` - Get route with turn-by-turn directions

### Delivery Zones
- `GET /v1/locations/delivery-zones` - Get delivery zones
- `POST /v1/locations/delivery-zones/check` - Check if location is in delivery zone

### WebSocket
- `GET /ws` - WebSocket connection endpoint

## Configuration

Environment variables:

```bash
PORT=8090                    # Server port
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

### Geocoding Services
- Google Maps API integration for accurate geocoding
- Intelligent caching to reduce API calls and improve performance
- Fallback mock data for development without API keys
- Address component parsing (street, area, city, state, pincode)

### Location Validation
- Real-time address validation
- Serviceability checking based on delivery zones
- Address suggestions for invalid inputs
- Coordinate validation and normalization

### Proximity & Distance
- Haversine formula for accurate distance calculations
- Multiple transportation modes (driving, walking, bicycling)
- Nearby location search with configurable radius
- Performance optimized with spatial indexing

### Delivery Zone Management
- Circular and polygon-based delivery zones
- Chef-specific delivery areas with custom fees
- Minimum order requirements per zone
- Real-time zone validation for orders

### Caching Strategy
- Location cache with configurable TTL
- Redis integration for high-performance lookups
- Automatic cache invalidation and refresh
- Reduced external API dependency

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
The service includes pre-seeded location data:
- Major Indian cities (Mumbai, Delhi, Bangalore)
- Serviceable areas with pincodes
- Chef delivery zones with radius and fees
- Location cache examples

## Integration

This service integrates with:
- **Chef Service**: Delivery zone management
- **Customer Service**: Address validation and geocoding
- **Order Service**: Delivery zone checking
- **Delivery Service**: Route planning and distance calculation
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
- **API Key Management**: Secure Google Maps API integration
- **Input Validation**: Comprehensive request validation
- **CORS**: Cross-origin resource sharing configuration

## Health Monitoring

- **Health Check**: `GET /health`
- **WebSocket Stats**: Connection monitoring
- **Database Health**: Automatic connection monitoring

## License

MIT License