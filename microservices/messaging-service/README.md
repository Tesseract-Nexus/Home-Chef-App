# HomeChef Messaging Service

A comprehensive real-time messaging microservice built with Go 1.24, providing complete communication capabilities between customers, chefs, and delivery partners on the HomeChef platform.

## Features

- **Real-time Messaging**: WebSocket-based instant messaging with delivery confirmations
- **Conversation Management**: Order-based conversations with participant management
- **Multi-media Support**: Text, image, and location message types
- **Message Templates**: Pre-defined quick response templates for common scenarios
- **Read Receipts**: Message read status tracking and notifications
- **Conversation Controls**: Archive, block, and manage conversation states
- **Role-based Messaging**: Different message capabilities based on user roles
- **Message History**: Complete conversation history with pagination
- **WebSocket Support**: Real-time message delivery and status updates
- **HTTPS Support**: SSL/TLS encryption for secure communication

## Quick Start

### Local Development

1. **Setup and run:**
   ```bash
   cd microservices/messaging-service
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

### Conversation Management
- `GET /v1/messages/conversations` - Get user conversations
- `POST /v1/messages/conversations` - Create new conversation
- `GET /v1/messages/conversations/{conversation_id}` - Get conversation details
- `PUT /v1/messages/conversations/{conversation_id}/archive` - Archive conversation
- `PUT /v1/messages/conversations/{conversation_id}/block` - Block conversation

### Message Management
- `GET /v1/messages/conversations/{conversation_id}/messages` - Get conversation messages
- `POST /v1/messages/conversations/{conversation_id}/messages` - Send message
- `PUT /v1/messages/conversations/{conversation_id}/read` - Mark messages as read

### Message Templates
- `GET /v1/messages/templates` - Get message templates

### WebSocket
- `GET /ws` - WebSocket connection endpoint

## Configuration

Environment variables:

```bash
PORT=8091                    # Server port
HOST=localhost              # Server host
SSL_CERT_PATH=./certs/cert.pem    # SSL certificate
SSL_KEY_PATH=./certs/key.pem      # SSL private key
JWT_SECRET=your-secret-key        # JWT signing secret
DATABASE_URL=postgres://...       # PostgreSQL connection
REDIS_URL=redis://localhost:6379  # Redis connection
ENVIRONMENT=development           # Environment mode
```

## Features

### Message Types
- **Text**: Standard text messages with emoji support
- **Image**: Image sharing with automatic compression
- **Location**: GPS coordinates with address information
- **Order Update**: Structured order status updates

### Conversation Features
- **Order-based**: Each conversation is linked to a specific order
- **Multi-participant**: Support for customer, chef, and delivery partner
- **Status Management**: Active, archived, and blocked states
- **Read Tracking**: Individual message read status

### Real-time Features
- **Instant Delivery**: WebSocket-based real-time message delivery
- **Typing Indicators**: Show when participants are typing
- **Online Status**: Track participant online/offline status
- **Message Status**: Sent, delivered, and read confirmations

### Message Templates
- **Quick Responses**: Pre-defined templates for common scenarios
- **Role-specific**: Different templates for different user roles
- **Variable Support**: Dynamic content insertion in templates
- **Category-based**: Organized by order updates, delivery, and general

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
The service includes pre-seeded messaging data:
- Sample conversation between customer and chef
- Message templates for different scenarios
- Conversation participants with roles

## Integration

This service integrates with:
- **Customer Service**: Customer messaging and notifications
- **Chef Service**: Chef communication and order updates
- **Delivery Service**: Delivery partner communication
- **Order Service**: Order-based conversation creation
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
- **Message Encryption**: Optional end-to-end encryption support

## Health Monitoring

- **Health Check**: `GET /health`
- **WebSocket Stats**: Connection monitoring
- **Database Health**: Automatic connection monitoring

## License

MIT License