# HomeChef Inventory Service

A comprehensive inventory management microservice built with Go 1.24, providing complete ingredient tracking, stock management, and automated alerts for chefs on the HomeChef platform.

## Features

- **Ingredient Management**: Complete CRUD operations for ingredient inventory
- **Stock Tracking**: Real-time stock level monitoring with movement history
- **Recipe Integration**: Link ingredients to dishes with quantity requirements
- **Availability Checking**: Real-time ingredient availability for order fulfillment
- **Smart Alerts**: Low stock and expiry notifications with customizable thresholds
- **Supplier Management**: Supplier information and contact management
- **Usage Reports**: Detailed ingredient usage and cost analysis
- **Waste Tracking**: Food waste monitoring and reporting
- **Automated Processing**: Daily expiry checks and alert generation
- **WebSocket Support**: Real-time inventory updates and notifications

## Quick Start

### Local Development

1. **Setup and run:**
   ```bash
   cd microservices/inventory-service
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

### Ingredient Management
- `GET /v1/inventory/ingredients` - Get chef's ingredient inventory
- `POST /v1/inventory/ingredients` - Add ingredient to inventory
- `GET /v1/inventory/ingredients/{ingredient_id}` - Get ingredient details
- `PUT /v1/inventory/ingredients/{ingredient_id}` - Update ingredient
- `DELETE /v1/inventory/ingredients/{ingredient_id}` - Remove ingredient

### Stock Management
- `PUT /v1/inventory/ingredients/{ingredient_id}/stock` - Update ingredient stock

### Recipe Management
- `GET /v1/inventory/recipes/{dish_id}/ingredients` - Get recipe ingredients
- `PUT /v1/inventory/recipes/{dish_id}/ingredients` - Update recipe ingredients

### Availability Check
- `POST /v1/inventory/availability/check` - Check ingredient availability for orders

### Inventory Alerts
- `GET /v1/inventory/alerts` - Get inventory alerts
- `GET /v1/inventory/alerts/settings` - Get alert settings
- `PUT /v1/inventory/alerts/settings` - Update alert settings

### Suppliers
- `GET /v1/inventory/suppliers` - Get supplier information

### Reports
- `GET /v1/inventory/reports/usage` - Get ingredient usage report
- `GET /v1/inventory/reports/waste` - Get food waste report

### WebSocket
- `GET /ws` - WebSocket connection endpoint

## Configuration

Environment variables:

```bash
PORT=8089                    # Server port
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

### Ingredient Categories
- **Vegetables**: Fresh produce and vegetables
- **Spices**: Spices, herbs, and seasonings
- **Dairy**: Milk, cheese, yogurt, and dairy products
- **Meat**: Chicken, mutton, fish, and meat products
- **Grains**: Rice, wheat, lentils, and grain products
- **Others**: Miscellaneous ingredients

### Stock Management
- Real-time stock level tracking
- Multiple unit support (kg, grams, liters, ml, pieces, packets)
- Stock movement history with reasons
- Automatic status calculation (in_stock, low_stock, out_of_stock)

### Smart Alerts
- **Low Stock Alerts**: Customizable threshold-based notifications
- **Expiry Alerts**: Configurable warning days before expiration
- **Out of Stock Alerts**: Immediate notifications for zero stock
- **Multi-channel Notifications**: Email, push, and SMS support

### Recipe Integration
- Link ingredients to specific dishes
- Quantity requirements per serving
- Optional ingredient support
- Ingredient substitution suggestions

### Automated Processing
- **Daily Expiry Check**: Runs at 2 AM daily
- **Automatic Status Updates**: Real-time stock status calculation
- **Alert Generation**: Automated alert creation based on thresholds

### WebSocket Features
- Real-time stock updates
- Instant alert notifications
- Inventory change broadcasts
- Recipe availability updates

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
The service includes pre-seeded inventory data:
- Sample ingredients across all categories
- Recipe ingredient mappings
- Alert settings configuration
- Stock movement history

## Integration

This service integrates with:
- **Chef Service**: Recipe and menu management
- **Order Service**: Ingredient availability checking
- **Analytics Service**: Usage and waste reporting
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
- **JWT Authentication**: Secure chef access
- **Input Validation**: Comprehensive request validation
- **CORS**: Cross-origin resource sharing configuration

## Health Monitoring

- **Health Check**: `GET /health`
- **WebSocket Stats**: Connection monitoring
- **Database Health**: Automatic connection monitoring
- **Cron Job Monitoring**: Automated processing status

## License

MIT License