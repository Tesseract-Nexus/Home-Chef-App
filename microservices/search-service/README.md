# HomeChef Search Service

A comprehensive search and discovery microservice built with Go 1.24, providing intelligent search capabilities, trending analysis, and personalized recommendations for the HomeChef platform.

## Features

- **Global Search**: Platform-wide search across chefs, dishes, and cuisines
- **Advanced Filtering**: Multi-dimensional filtering with faceted search
- **Auto-complete Suggestions**: Real-time search suggestions with type-ahead
- **Trending Analysis**: Track and display trending searches by location and time
- **Popular Items**: Discover popular chefs, dishes, and cuisines
- **Search History**: Personal search history with privacy controls
- **Saved Searches**: Save and manage favorite search queries
- **Search Analytics**: Comprehensive search analytics and insights
- **Real-time Updates**: WebSocket notifications for search trends
- **HTTPS Support**: SSL/TLS encryption for secure communication

## Quick Start

### Local Development

1. **Setup and run:**
   ```bash
   cd microservices/search-service
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

### Global Search
- `GET /v1/search` - Global search across platform with advanced filtering
- `GET /v1/search/suggestions` - Auto-complete suggestions
- `GET /v1/search/trending` - Trending search queries
- `GET /v1/search/popular` - Popular items (chefs, dishes, cuisines)
- `GET /v1/search/filters` - Available search filters

### Search Management
- `GET /v1/search/history` - Get user search history
- `DELETE /v1/search/history` - Clear search history
- `POST /v1/search/save` - Save search query
- `GET /v1/search/saved` - Get saved searches

### WebSocket
- `GET /ws` - WebSocket connection endpoint

## Configuration

Environment variables:

```bash
PORT=8095                    # Server port
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

### Advanced Search Capabilities
- **Multi-type Search**: Search across chefs, dishes, and cuisines simultaneously
- **Faceted Search**: Filter by cuisine type, price range, dietary options, delivery time
- **Location-based Search**: Radius-based search with distance calculations
- **Relevance Ranking**: Intelligent ranking based on popularity and user preferences

### Search Intelligence
- **Auto-complete**: Real-time suggestions with metadata
- **Trending Analysis**: Track popular searches by location and time period
- **Popular Items**: Discover trending chefs, dishes, and cuisines
- **Search Analytics**: Track search patterns and zero-result queries

### Personalization
- **Search History**: Track user search patterns for personalization
- **Saved Searches**: Save favorite queries with notification options
- **Personalized Results**: Tailor results based on user preferences and history

### Business Intelligence
- **Search Analytics**: Daily processing of search metrics
- **Trending Tracking**: Real-time trending search identification
- **Popular Item Scoring**: Algorithm-based popularity scoring
- **Zero-result Analysis**: Track and improve search coverage

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
The service includes pre-seeded search data:
- Trending searches for popular queries
- Popular items across different categories
- Search analytics with metrics
- Sample search history and saved searches

## Integration

This service integrates with:
- **Chef Service**: Chef search and discovery
- **Customer Service**: Personalized search results
- **Analytics Service**: Search behavior analytics
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
- **Optional Authentication**: Public search with enhanced features for authenticated users
- **Input Validation**: Comprehensive request validation
- **CORS**: Cross-origin resource sharing configuration

## Health Monitoring

- **Health Check**: `GET /health`
- **WebSocket Stats**: Connection monitoring
- **Database Health**: Automatic connection monitoring
- **Cron Job Monitoring**: Automated processing status

## License

MIT License