# HomeChef - Authentic Homemade Food Delivery Platform

<div align="center">
  <img src="./assets/images/icon.png" alt="HomeChef Logo" width="120" height="120">
  
  **Connecting home chefs with food lovers for authentic homemade meals**
  
  [![React Native](https://img.shields.io/badge/React%20Native-0.75.4-blue.svg)](https://reactnative.dev/)
  [![Expo](https://img.shields.io/badge/Expo-52.0.0-black.svg)](https://expo.dev/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.3.3-blue.svg)](https://www.typescriptlang.org/)
  [![Docker](https://img.shields.io/badge/Docker-Multi--Stage-blue.svg)](https://www.docker.com/)
  [![License](https://img.shields.io/badge/License-MIT-green.svg)](./LICENSE)
</div>

## 📱 Overview

HomeChef is a comprehensive food delivery platform that connects certified home chefs with customers seeking authentic, homemade meals. Built with React Native and Expo, it provides a seamless experience across mobile and web platforms.

### 🌟 Key Features

- **Multi-Role Authentication** - Customer, Chef, Delivery Partner, Admin
- **30-Second Countdown Timer** - Free order cancellation window
- **Real-Time Order Tracking** - Live status updates and GPS tracking
- **Direct Tipping System** - 100% tips go to recipients' bank accounts
- **Rewards & Subscription** - Token-based rewards with premium subscriptions
- **Advanced Search & Filtering** - AI-powered chef and cuisine discovery
- **Review & Rating System** - Comprehensive feedback mechanism
- **Admin Analytics Dashboard** - Business intelligence and reporting
- **Responsive Design** - Optimized for mobile, tablet, and desktop

## 🏗️ Architecture

### Frontend Architecture
```
┌─────────────────────────────────────────────────────────────┐
│                    React Native Web App                     │
├─────────────────────────────────────────────────────────────┤
│  Expo Router (File-based Routing)                          │
│  ├── app/(tabs)/                 # Tab-based navigation    │
│  ├── app/auth/                   # Authentication screens  │
│  ├── app/chef/[id]/             # Dynamic chef routes     │
│  └── components/                 # Reusable components    │
├─────────────────────────────────────────────────────────────┤
│  State Management                                          │
│  ├── Context API                 # Global state           │
│  ├── Custom Hooks               # Business logic          │
│  └── Local Storage              # Persistence             │
├─────────────────────────────────────────────────────────────┤
│  UI Components                                             │
│  ├── Lucide Icons               # Icon library            │
│  ├── Custom Components          # Reusable UI elements    │
│  └── Responsive Design          # Multi-device support    │
└─────────────────────────────────────────────────────────────┘
```

### Backend Integration
```
┌─────────────────────────────────────────────────────────────┐
│                    API Integration Layer                    │
├─────────────────────────────────────────────────────────────┤
│  Authentication Service                                     │
│  ├── JWT Token Management       # Secure authentication   │
│  ├── Multi-Provider Auth        # Email, Phone, Social    │
│  └── Role-Based Access          # Customer/Chef/Admin     │
├─────────────────────────────────────────────────────────────┤
│  Core Services                                             │
│  ├── Order Management           # Complete order lifecycle │
│  ├── Payment Processing         # Multiple payment methods │
│  ├── Real-Time Updates          # WebSocket integration   │
│  ├── Notification System        # Push, SMS, Email        │
│  └── Analytics Engine           # Business intelligence   │
├─────────────────────────────────────────────────────────────┤
│  External Integrations                                     │
│  ├── Payment Gateways           # Stripe, Razorpay, UPI   │
│  ├── SMS/Email Services         # Twilio, SendGrid        │
│  ├── Maps & Location            # Google Maps API         │
│  └── Cloud Storage              # AWS S3, Cloudinary      │
└─────────────────────────────────────────────────────────────┘
```

### Database Schema
```
┌─────────────────────────────────────────────────────────────┐
│                    Database Architecture                    │
├─────────────────────────────────────────────────────────────┤
│  Core Tables                                               │
│  ├── users                      # User accounts           │
│  ├── orders                     # Order management        │
│  ├── chefs                      # Chef profiles           │
│  ├── dishes                     # Menu items              │
│  └── addresses                  # Delivery locations      │
├─────────────────────────────────────────────────────────────┤
│  Feature Tables                                           │
│  ├── tips                       # Direct bank transfers   │
│  ├── reviews                    # Rating system           │
│  ├── user_rewards               # Token-based rewards     │
│  ├── order_timeline             # Status tracking         │
│  └── support_tickets            # Customer support        │
├─────────────────────────────────────────────────────────────┤
│  Analytics Tables                                         │
│  ├── order_analytics            # Order metrics           │
│  ├── platform_analytics_daily   # Daily aggregations     │
│  └── tip_analytics              # Tipping insights        │
└─────────────────────────────────────────────────────────────┘
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ 
- **npm** or **yarn**
- **Expo CLI** (optional, for additional features)
- **Docker** (for containerized deployment)

### 1. Clone the Repository

```bash
git clone https://github.com/your-org/homechef-mobile-app.git
cd homechef-mobile-app
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Start Development Server

```bash
# Start Expo development server
npm start

# Or start web development directly
npm run web

# For mobile development
npm run android  # Android
npm run ios      # iOS
```

### 4. Access the Application

- **Web**: http://localhost:8081
- **Mobile**: Scan QR code with Expo Go app
- **Development**: Hot reload enabled for instant updates

## 🐳 Docker Deployment

### Quick Start with Docker

```bash
# Build and run in one command
docker-compose up homechef-prod

# Or use the automated script
./scripts/docker-deploy.sh --environment production --port 80
```

### Development with Docker

```bash
# Start development environment with hot reload
docker-compose up homechef-dev

# Access at http://localhost:8081
```

### Multi-Stage Build Process

```bash
# Run the complete build pipeline
./scripts/docker-build.sh

# This will:
# 1. Build dependencies stage
# 2. Run tests and linting
# 3. Create production build
# 4. Generate optimized Docker image
```

### Docker Commands Reference

```bash
# Build specific stage
docker build --target dependencies -t homechef:deps .
docker build --target test -t homechef:test .
docker build --target build -t homechef:build .
docker build --target production -t homechef:prod .

# Run tests in container
docker run --rm homechef:test npm test

# Deploy with custom settings
./scripts/docker-deploy.sh --environment production --port 3000
```

## 🛠️ Development

### Project Structure

```
homechef-mobile-app/
├── app/                          # Expo Router pages
│   ├── (tabs)/                   # Tab navigation screens
│   │   ├── home.tsx              # Customer home page
│   │   ├── orders.tsx            # Order management
│   │   ├── chef-home.tsx         # Chef dashboard
│   │   ├── dashboard.tsx         # Admin dashboard
│   │   └── delivery-dashboard.tsx # Delivery partner dashboard
│   ├── auth/                     # Authentication screens
│   │   ├── login.tsx             # Multi-method login
│   │   ├── register.tsx          # User registration
│   │   └── delivery-onboarding.tsx # Delivery partner onboarding
│   ├── chef/[id]/               # Dynamic chef routes
│   │   └── menu.tsx             # Chef menu display
│   ├── _layout.tsx              # Root layout with providers
│   └── index.tsx                # App entry point
├── components/                   # Reusable components
│   ├── ui/                      # UI component library
│   │   ├── Button.tsx           # Custom button component
│   │   ├── Card.tsx             # Card component
│   │   ├── Badge.tsx            # Badge component
│   │   └── Avatar.tsx           # Avatar component
│   ├── OrderCountdownTimer.tsx  # 30-second countdown timer
│   ├── TippingModal.tsx         # Direct tipping interface
│   ├── ReviewModal.tsx          # Review submission
│   └── DeliveryTracker.tsx      # Real-time tracking
├── hooks/                       # Custom React hooks
│   ├── useAuth.tsx              # Authentication management
│   ├── useCart.tsx              # Shopping cart logic
│   ├── useOrderManagement.tsx   # Order lifecycle
│   ├── useRewards.tsx           # Rewards system
│   ├── useTipping.tsx           # Tipping functionality
│   └── useAddresses.tsx         # Address management
├── services/                    # API services
│   └── apiService.ts            # HTTP client and API calls
├── config/                      # Configuration files
│   └── featureFlags.ts          # Feature toggles
├── utils/                       # Utility functions
│   ├── constants.ts             # App constants
│   ├── helpers.ts               # Helper functions
│   └── responsive.ts            # Responsive design utilities
├── docs/                        # Documentation
│   ├── api/                     # API documentation
│   └── deployment/              # Deployment guides
├── scripts/                     # Build and deployment scripts
│   ├── docker-build.sh          # Docker build automation
│   └── docker-deploy.sh         # Deployment automation
├── Dockerfile                   # Multi-stage Docker build
├── docker-compose.yml           # Docker services configuration
└── README.md                    # This file
```

### Available Scripts

```bash
# Development
npm start                 # Start Expo development server
npm run web              # Start web development server
npm run android          # Start Android development
npm run ios              # Start iOS development

# Building
npm run build:web        # Build for web production
npm run export           # Export static files

# Code Quality
npm run lint             # Run ESLint
npm run type-check       # TypeScript type checking

# Docker
./scripts/docker-build.sh    # Build Docker images
./scripts/docker-deploy.sh   # Deploy with Docker
```

### Environment Configuration

Create a `.env` file in the root directory:

```env
# API Configuration
EXPO_PUBLIC_API_URL=https://api.homechef.com
EXPO_PUBLIC_WS_URL=wss://api.homechef.com/ws

# Feature Flags
EXPO_PUBLIC_ENABLE_REWARDS=true
EXPO_PUBLIC_ENABLE_SUBSCRIPTIONS=false
EXPO_PUBLIC_SHOW_ADS=true

# External Services
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_key
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_key
```

## 🎯 Core Features

### 1. Multi-Role Authentication System

```typescript
// Supports 4 user roles with different interfaces
const USER_ROLES = {
  CUSTOMER: 'customer',      // Browse and order food
  CHEF: 'chef',             // Manage menu and orders
  DELIVERY: 'delivery',     // Handle deliveries
  ADMIN: 'admin'            // Platform management
};
```

**Authentication Methods:**
- 📧 **Email/Password** - Traditional login
- 📱 **Phone/OTP** - SMS-based verification
- 🔗 **Social Login** - Google, Facebook, Instagram, Twitter

### 2. Order Management with Countdown Timer

```typescript
// 30-second free cancellation window
const ORDER_CANCELLATION_POLICY = {
  FREE_WINDOW: 30,          // seconds
  PENALTY_RATE: 0.40,       // 40% of order value
  MIN_PENALTY: 20,          // ₹20 minimum
  MAX_PENALTY: 500          // ₹500 maximum
};
```

**Order Flow:**
1. 🛒 **Order Placement** - Instant payment confirmation
2. ⏱️ **30-Second Timer** - Free cancellation window
3. 👨‍🍳 **Chef Assignment** - Automatic chef notification
4. 🍳 **Preparation** - Real-time status updates
5. 🚚 **Delivery** - GPS tracking and notifications
6. ✅ **Completion** - Rating and tipping options

### 3. Direct Tipping System

```typescript
// 100% tips go directly to recipients
const TIPPING_CONFIG = {
  MIN_AMOUNT: 10,           // ₹10 minimum tip
  MAX_AMOUNT: 500,          // ₹500 maximum tip
  TRANSFER_METHOD: 'direct', // Direct bank transfer
  PLATFORM_FEE: 0          // No platform fees on tips
};
```

### 4. Rewards & Subscription System

```typescript
// Token-based rewards with subscription multipliers
const REWARDS_CONFIG = {
  BASE_RATE: 10,            // 1 token per ₹10 spent
  SUBSCRIPTION_MULTIPLIER: {
    MONTHLY: 3,             // 3x tokens
    YEARLY: 5               // 5x tokens
  }
};
```

## 🔧 Configuration

### Feature Flags

The app uses feature flags for controlled rollouts:

```typescript
// config/featureFlags.ts
export const FEATURE_FLAGS = {
  ENABLE_REWARDS_SYSTEM: true,
  ENABLE_SUBSCRIPTION_MODEL: false,
  SHOW_ADS_TO_FREE_USERS: true,
  USE_MOCK_DATA: false,
  ENABLE_DEBUG_LOGS: false
};
```

### Platform Configuration

```typescript
// Platform-specific settings
export const PLATFORM_CONFIG = {
  CHEF_COMMISSION_RATE: 0.15,      // 15% platform fee
  DELIVERY_COMMISSION_RATE: 0.10,   // 10% delivery fee
  FREE_CANCELLATION_WINDOW: 30,     // 30 seconds
  CANCELLATION_PENALTY_RATE: 0.40   // 40% penalty
};
```

## 📱 Responsive Design

### Breakpoints

```typescript
export const BREAKPOINTS = {
  mobile: 0,
  tablet: 768,
  desktop: 1024,
  large: 1440
};
```

### Grid System

- **Mobile**: Single column layout
- **Tablet**: 2-column grid for cards
- **Desktop**: 3+ column grid with CSS Grid
- **Auto-responsive**: Cards adapt to screen width

## 🧪 Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests in Docker
docker-compose up homechef-test

# Run specific test suites
npm run test:unit
npm run test:integration
npm run test:e2e
```

### Test Structure

```
tests/
├── unit/                 # Unit tests
├── integration/          # Integration tests
├── e2e/                 # End-to-end tests
└── __mocks__/           # Mock data and services
```

## 🚀 Deployment

### Production Deployment

```bash
# Build and deploy to production
./scripts/docker-deploy.sh --environment production --port 80

# Or use Docker Compose
docker-compose up homechef-prod
```

### Staging Deployment

```bash
# Deploy to staging environment
./scripts/docker-deploy.sh --environment development --port 8081
```

### Health Checks

The application includes built-in health monitoring:

```bash
# Check application health
curl http://localhost/health

# Expected response: "healthy"
```

## 📊 Monitoring & Analytics

### Built-in Analytics

- 📈 **Order Analytics** - Completion rates, cancellation patterns
- 👥 **User Analytics** - Engagement, retention, behavior
- 💰 **Revenue Analytics** - Platform fees, chef earnings
- 🚚 **Delivery Analytics** - Performance, efficiency metrics

### Performance Monitoring

- ⚡ **Response Times** - API endpoint performance
- 🔄 **Real-time Updates** - WebSocket connection health
- 📱 **Mobile Performance** - App startup and navigation
- 🌐 **Web Performance** - Page load times and metrics

## 🔐 Security

### Security Features

- 🔒 **JWT Authentication** - Secure token-based auth
- 🛡️ **Role-Based Access** - Granular permissions
- 🔐 **Data Encryption** - Sensitive data protection
- 🚫 **Rate Limiting** - API abuse prevention
- 📱 **Device Security** - Secure storage on mobile

### Compliance

- ✅ **GDPR Compliant** - Data privacy protection
- ✅ **PCI DSS** - Payment security standards
- ✅ **Data Retention** - Configurable retention policies
- ✅ **Audit Trails** - Complete action logging

## 🤝 Contributing

### Development Workflow

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Code Standards

- ✅ **TypeScript** - Strict type checking
- ✅ **ESLint** - Code quality enforcement
- ✅ **Prettier** - Consistent formatting
- ✅ **Conventional Commits** - Standardized commit messages

### Pull Request Guidelines

- 📝 **Clear description** of changes
- ✅ **Tests included** for new features
- 📱 **Mobile testing** on iOS and Android
- 🌐 **Web compatibility** verified
- 📚 **Documentation** updated

## 📚 API Documentation

### Core Endpoints

```bash
# Authentication
POST /auth/login              # User login
POST /auth/send-otp          # Send OTP
POST /auth/verify-otp        # Verify OTP

# Orders
POST /orders                 # Place order
GET /orders/{id}            # Get order details
POST /orders/{id}/cancel    # Cancel order
GET /orders/{id}/countdown  # Get countdown status

# Chefs
GET /chefs/search           # Search chefs
GET /chefs/{id}/menu        # Get chef menu
POST /chefs/apply           # Chef application

# Payments & Tips
POST /orders/{id}/tip       # Add tip
GET /tips/history           # Tip history
POST /payments/process      # Process payment
```

### WebSocket Events

```typescript
// Real-time order updates
{
  "event": "order_status_update",
  "data": {
    "order_id": "order_123",
    "status": "preparing",
    "estimated_time": "25 minutes"
  }
}
```

## 🆘 Support

### Getting Help

- 📖 **Documentation**: [docs/](./docs/)
- 🐛 **Bug Reports**: [GitHub Issues](https://github.com/your-org/homechef-mobile-app/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/your-org/homechef-mobile-app/discussions)
- 📧 **Email**: support@homechef.com

### Common Issues

#### Build Issues
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear Expo cache
npx expo start --clear
```

#### Docker Issues
```bash
# Rebuild without cache
docker build --no-cache -t homechef:latest .

# Clean up Docker system
docker system prune -a
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Expo Team** - For the amazing React Native framework
- **React Native Community** - For continuous innovation
- **Contributors** - For making this project better
- **Home Chefs** - For inspiring authentic food experiences

---

<div align="center">
  <p><strong>Built with ❤️ for authentic food experiences</strong></p>
  <p>
    <a href="#-overview">Overview</a> •
    <a href="#-architecture">Architecture</a> •
    <a href="#-quick-start">Quick Start</a> •
    <a href="#-docker-deployment">Docker</a> •
    <a href="#-development">Development</a> •
    <a href="#-deployment">Deployment</a>
  </p>
</div>