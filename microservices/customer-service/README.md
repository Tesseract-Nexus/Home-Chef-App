# HomeChef Customer Service

A comprehensive customer management microservice built with Go 1.24, providing complete customer account management, preferences, and personalized experiences for the HomeChef platform.

## Features

- **Customer Profile Management**: Complete profile management with preferences
- **Address Management**: Multiple delivery addresses with geolocation
- **Payment Methods**: Secure payment method storage and management
- **Favorites**: Chef and dish favorites with personalized recommendations
- **Order History**: Complete order tracking and history
- **Reviews & Ratings**: Review management with image uploads
- **Notification Settings**: Granular notification preferences (email, push, SMS)
- **Personalized Recommendations**: ML-based chef and dish recommendations
- **Customer Analytics**: Activity tracking and insights
- **WebSocket Support**: Real-time updates and notifications
- **HTTPS Support**: SSL/TLS encryption for secure communication

## Quick Start

### Local Development

1. **Setup and run:**
   ```bash
   cd microservices/customer-service
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

### Customer Profile
- `GET /v1/customers/profile` - Get customer profile
- `PUT /v1/customers/profile` - Update customer profile
- `GET /v1/customers/activity` - Get customer activity summary

### Address Management
- `GET /v1/customers/addresses` - Get customer addresses
- `POST /v1/customers/addresses` - Add new address
- `PUT /v1/customers/addresses/{address_id}` - Update address
- `DELETE /v1/customers/addresses/{address_id}` - Delete address
- `PUT /v1/customers/addresses/{address_id}/default` - Set default address

### Payment Methods
- `GET /v1/customers/payment-methods` - Get payment methods
- `POST /v1/customers/payment-methods` - Add payment method
- `DELETE /v1/customers/payment-methods/{payment_method_id}` - Delete payment method

### Favorites
- `GET /v1/customers/favorites/chefs` - Get favorite chefs
- `POST /v1/customers/favorites/chefs` - Add chef to favorites
- `DELETE /v1/customers/favorites/chefs/{chef_id}` - Remove chef from favorites
- `GET /v1/customers/favorites/dishes` - Get favorite dishes
- `POST /v1/customers/favorites/dishes` - Add dish to favorites

### Order History
- `GET /v1/customers/orders` - Get customer orders with filtering

### Reviews
- `GET /v1/customers/reviews` - Get customer reviews
- `POST /v1/customers/reviews` - Submit review
- `PUT /v1/customers/reviews/{review_id}` - Update review
- `DELETE /v1/customers/reviews/{review_id}` - Delete review

### Notifications
- `GET /v1/customers/notifications/settings` - Get notification settings
- `PUT /v1/customers/notifications/settings` - Update notification settings

### Recommendations
- `GET /v1/customers/recommendations` - Get personalized recommendations

### WebSocket
- `GET /ws` - WebSocket connection endpoint

## Configuration

Environment variables:

```bash
PORT=8087                    # Server port
HOST=localhost              # Server host
SSL_CERT_PATH=./certs/cert.pem    # SSL certificate
SSL_KEY_PATH=./certs/key.pem      # SSL private key
JWT_SECRET=your-secret-key        # JWT signing secret
DATABASE_URL=postgres://...       # PostgreSQL connection
REDIS_URL=redis://localhost:6379  # Redis connection
ENVIRONMENT=development           # Environment mode
```

## Features

### Customer Profile Features
- Personal information management
- Dietary preferences and restrictions
- Cuisine preferences
- Spice level preferences
- Avatar upload support

### Address Management
- Multiple address types (home, work, other)
- Geolocation coordinates
- Delivery instructions
- Default address management

### Payment Security
- Secure payment method storage
- Card tokenization (production ready)
- UPI VPA management
- Multiple payment types support

### Personalization
- ML-based recommendations
- Order history analysis
- Favorite tracking
- Preference-based suggestions

### Notification Management
- Email notifications (order updates, promotions, newsletter)
- Push notifications (orders, promotions, chat)
- SMS notifications (orders, OTP, promotions)
- Granular control over each type

### WebSocket Features
- Real-time order updates
- Personalized notifications
- Recommendation updates
- Profile change notifications

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
The service includes pre-seeded customer data:
- Sample customer profile with preferences
- Mock addresses with coordinates
- Favorite chefs and dishes
- Notification settings

## Integration

This service integrates with:
- **Chef Service**: Favorite chefs and recommendations
- **Order Service**: Order history and reviews
- **Address Service**: Address validation and geocoding
- **Analytics Service**: Customer behavior tracking
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
- **JWT Authentication**: Secure customer access
- **Input Validation**: Comprehensive request validation
- **CORS**: Cross-origin resource sharing configuration
- **Payment Security**: Tokenized payment method storage

## Health Monitoring

- **Health Check**: `GET /health`
- **WebSocket Stats**: Connection monitoring
- **Database Health**: Automatic connection monitoring

## License

MIT License