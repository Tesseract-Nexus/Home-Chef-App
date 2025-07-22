# HomeChef Microservices Platform

A comprehensive food delivery platform built with Go 1.24 microservices architecture, featuring real-time order tracking, tipping system, rewards program, and advanced analytics.

## 🏗️ Architecture Overview

The platform consists of **16 production-ready microservices**:

1. **Chef Service** (8080): Menu management, orders, analytics
2. **Database Service** (8081): PostgreSQL, Redis, WebSocket hub
3. **Address Service** (8082): Geolocation, validation
4. **Admin Service** (8083): Platform management
5. **Ads Service** (8084): Advertisement management
6. **Analytics Service** (8085): Platform analytics and reporting
7. **Financial Service** (8086): P&L calculations and expense tracking
8. **Customer Service** (8087): Customer account and preference management
9. **Delivery Service** (8088): Delivery partner management and tracking
10. **Inventory Service** (8089): Ingredient inventory and stock management
11. **Location Service** (8090): Geospatial services and location management
12. **Messaging Service** (8091): Real-time messaging and communication
13. **Order Service** (8092): Order management with countdown timer and cancellation policy
14. **Reviews Service** (8093): Review and rating system with analytics
15. **Rewards Service** (8094): Rewards and subscription system with loyalty programs
16. **Search Service** (8095): Intelligent search and discovery with analytics

## 🚀 Key Features

### Order Management with Countdown Timer
- **30-second cancellation window** with real-time countdown
- **Smart penalty system** based on order status
- **Real-time order tracking** with WebSocket updates
- **Multi-role order management** (Customer, Chef, Delivery)
- **Order Journey Tracking**: Complete order timeline with participant information
- **Chef Operations**: Order acceptance/decline with preparation time estimates
- **Delivery Management**: Delivery partner assignment and tracking

### Tipping System
- **Direct bank transfers** to chefs and delivery partners
- **Real-time tip notifications** via WebSocket
- **Tip tracking and analytics** for recipients

### Rewards & Loyalty Program
- **Token-based rewards system** with tier progression
- **Multiple redemption options** (discounts, cashback, free delivery)
- **Streak tracking** and bonus rewards

### Advanced Search & Discovery
- **Multi-filter chef search** (cuisine, rating, distance, offers)
- **Real-time availability** checking
- **Personalized recommendations** based on order history

### Real-time Features
- **WebSocket integration** across all services
- **Live order tracking** with GPS coordinates
- **Real-time notifications** for all stakeholders
- **Live analytics dashboards**

### Security & Authentication
- **Multi-role JWT authentication** (Customer, Chef, Delivery, Admin)
- **OTP-based phone verification**
- **Role-based access control**
- **HTTPS/TLS encryption**

## 🛠️ Technology Stack

- **Backend**: Go 1.24 with Gin framework
- **Database**: PostgreSQL with GORM
- **Cache**: Redis for session management
- **WebSocket**: Real-time communication
- **Container**: Docker with multi-stage builds
- **Orchestration**: Kubernetes with Helm charts
- **Monitoring**: Health checks, metrics, logging

## 🚀 Quick Start

### Local Development

```bash
# Clone the repository
git clone <repository-url>
cd homechef-microservices

# Start all services
./scripts/start-all.sh

# Or start individual services
cd microservices/chef-service
make setup
```

### Kubernetes Deployment

```bash
# Deploy all microservices to Kubernetes
./k8s/scripts/deploy.sh

# Check deployment status
kubectl get pods -n homechef

# Access services
kubectl port-forward -n homechef svc/homechef-chef-service 8080:8080
```

## 📊 Service Endpoints

### Authentication
- `POST /v1/auth/login` - Email/password login
- `POST /v1/auth/send-otp` - Send OTP for phone verification
- `POST /v1/auth/verify-otp` - Verify OTP and authenticate

### Order Management
- `POST /v1/orders` - Place order with countdown timer
- `GET /v1/orders/{order_id}/countdown-status` - Get countdown status
- `POST /v1/orders/{order_id}/cancel` - Cancel with penalty calculation
- `POST /v1/orders/{order_id}/tip` - Add tip with direct transfer

### Chef Discovery
- `GET /v1/chefs/search` - Search chefs with filters
- `GET /v1/chefs/{chef_id}/menu` - Get chef menu
- `GET /v1/chefs/{chef_id}/reviews` - Get chef reviews

### Rewards System
- `GET /v1/rewards/profile` - Get rewards profile
- `POST /v1/rewards/redeem` - Redeem tokens

### Admin Analytics
- `GET /v1/admin/analytics/platform` - Platform overview
- `GET /v1/admin/cancellation-policy` - Get cancellation policy
- `PUT /v1/admin/cancellation-policy` - Update policy

## 🏃‍♂️ Development Workflow

### Individual Service Development
```bash
cd microservices/[service-name]
make dev  # Hot reload with air
make test # Run tests
make lint # Code linting
```

### Docker Development
```bash
make docker-build  # Build Docker image
make docker-run    # Run with Docker Compose
make docker-logs   # View logs
```

### Kubernetes Development
```bash
# Deploy to local cluster
helm install homechef ./k8s/helm-charts/homechef-microservices \
  --namespace homechef \
  --create-namespace

# Update deployment
helm upgrade homechef ./k8s/helm-charts/homechef-microservices \
  --namespace homechef
```

## 📈 Monitoring & Observability

### Health Checks
All services include comprehensive health checks:
- Database connectivity
- Redis connectivity
- WebSocket status
- Service dependencies

### Logging
Structured logging with Zap:
- Request/response logging
- Error tracking
- Performance metrics
- Business event logging

### Metrics
Prometheus-compatible metrics:
- Request latency
- Error rates
- Business KPIs
- Resource utilization

## 🔒 Security Features

- **JWT-based authentication** with role-based access
- **Input validation** with comprehensive error handling
- **Rate limiting** and DDoS protection
- **HTTPS/TLS** encryption for all communications
- **Network policies** for Kubernetes security
- **Secret management** with Kubernetes secrets

## 🌐 Production Deployment

### Prerequisites
- Kubernetes cluster (v1.20+)
- Helm 3.x
- NGINX Ingress Controller
- PostgreSQL and Redis (or use Helm dependencies)

### Deployment Steps
1. **Configure secrets**: Update JWT secrets, database credentials
2. **Set up TLS**: Configure SSL certificates
3. **Deploy**: Run the deployment script
4. **Verify**: Check all pods and services are running

```bash
# Production deployment
ENVIRONMENT=production ./k8s/scripts/deploy.sh

# Verify deployment
kubectl get all -n homechef
```

## 📚 API Documentation

Complete API documentation is available via Swagger UI:
- **Development**: http://localhost:8080/swagger/index.html
- **Production**: https://api.homechef.com/swagger/

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- **Documentation**: https://docs.homechef.com
- **API Support**: api-support@homechef.com
- **Issues**: Create an issue in this repository

---

Built with ❤️ using Go 1.24 and modern microservices architecture.