# HomeChef Reviews Service

A comprehensive review and rating microservice built with Go 1.24, providing complete review management, rating analytics, and community features for the HomeChef platform.

## Features

- **Review Management**: Complete CRUD operations for customer reviews
- **Rating System**: 5-star rating system with detailed analytics
- **Image Support**: Review photos with image upload capabilities
- **Community Features**: Helpful votes and review reporting
- **Chef Analytics**: Comprehensive review statistics and trends
- **Dish Reviews**: Dish-specific review tracking
- **Review Moderation**: Report system for inappropriate content
- **Real-time Updates**: WebSocket notifications for new reviews
- **HTTPS Support**: SSL/TLS encryption for secure communication

## Quick Start

### Local Development

1. **Setup and run:**
   ```bash
   cd microservices/reviews-service
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

### Review Management
- `POST /v1/reviews` - Submit new review
- `GET /v1/reviews` - Get user reviews (given/received)
- `GET /v1/reviews/{review_id}` - Get review details
- `PUT /v1/reviews/{review_id}` - Update review
- `DELETE /v1/reviews/{review_id}` - Delete review
- `POST /v1/reviews/{review_id}/helpful` - Mark review as helpful
- `POST /v1/reviews/{review_id}/report` - Report inappropriate review

### Chef Reviews
- `GET /v1/chefs/{chef_id}/reviews` - Get chef reviews with filtering
- `GET /v1/chefs/{chef_id}/reviews/stats` - Get chef review statistics

### Dish Reviews
- `GET /v1/dishes/{dish_id}/reviews` - Get dish-specific reviews

### WebSocket
- `GET /ws` - WebSocket connection endpoint

## Configuration

Environment variables:

```bash
PORT=8093                    # Server port
HOST=localhost              # Server host
SSL_CERT_PATH=./certs/cert.pem    # SSL certificate
SSL_KEY_PATH=./certs/key.pem      # SSL private key
JWT_SECRET=your-secret-key        # JWT signing secret
DATABASE_URL=postgres://...       # PostgreSQL connection
REDIS_URL=redis://localhost:6379  # Redis connection
ENVIRONMENT=development           # Environment mode
```

## Features

### Review System
- **5-star rating system** with detailed feedback
- **Image uploads** for visual reviews
- **Verified reviews** from actual orders
- **Review editing** within time limits
- **Duplicate prevention** per order

### Community Features
- **Helpful voting** system for review quality
- **Review reporting** for inappropriate content
- **Review moderation** with admin controls
- **Community guidelines** enforcement

### Analytics & Insights
- **Rating distribution** analysis
- **Monthly review trends** tracking
- **Chef performance** metrics
- **Review sentiment** analysis

### Security & Moderation
- **Verified reviews** only from completed orders
- **Spam detection** and prevention
- **Content moderation** tools
- **User reporting** system

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
The service includes pre-seeded review data:
- Sample reviews with ratings and images
- Helpful votes and community interactions
- Review statistics and analytics

## Integration

This service integrates with:
- **Customer Service**: Customer review management
- **Chef Service**: Chef rating updates
- **Order Service**: Order-based review verification
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
- **JWT Authentication**: Secure user authentication
- **Input Validation**: Comprehensive request validation
- **CORS**: Cross-origin resource sharing configuration

## Health Monitoring

- **Health Check**: `GET /health`
- **WebSocket Stats**: Connection monitoring
- **Database Health**: Automatic connection monitoring

## License

MIT License