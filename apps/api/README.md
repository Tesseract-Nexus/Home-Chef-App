# HomeChef API Server

The backend API for the HomeChef application, built with Go and the Gin web framework.

## Overview

This API provides all the backend functionality for the HomeChef platform, including user authentication, chef management, menu management, order processing, payment integration, and administrative functions.

## Tech Stack

| Technology | Purpose |
|------------|---------|
| Go 1.25 | Programming language |
| Gin | HTTP web framework |
| GORM | ORM for PostgreSQL |
| PostgreSQL | Primary database |
| JWT | Authentication tokens |
| bcrypt | Password hashing |
| Stripe | Payment processing |

## Project Structure

```
apps/api/
├── main.go                 # Application entry point
├── go.mod                  # Go module definition
├── go.sum                  # Dependency checksums
├── controllers/            # Request handlers
│   ├── auth.go             # Authentication (signup, login, profile)
│   ├── profile.go          # Chef profile management
│   ├── menu.go             # Menu item CRUD
│   ├── cart.go             # Shopping cart operations
│   ├── order.go            # Order management
│   ├── payment.go          # Stripe payment integration
│   ├── review.go           # Review submission & moderation
│   ├── admin.go            # Admin operations
│   ├── analytics.go        # Platform analytics
│   ├── ads.go              # Ad management
│   └── delivery.go         # Delivery driver operations
├── models/                 # Database models
│   ├── user.go             # User model with roles
│   ├── chef_profile.go     # Chef profile model
│   ├── menu_item.go        # Menu item model
│   ├── cart.go             # Cart & cart item models
│   ├── order.go            # Order & order item models
│   ├── review.go           # Review model
│   └── ads.go              # Ad-related models
├── routes/                 # Route definitions
│   └── routes.go           # All API route mappings
├── middleware/             # HTTP middleware
│   ├── require_auth.go     # JWT authentication
│   └── require_admin.go    # Admin role check
├── database/               # Database connection
│   └── connect.go
└── initializers/           # App initialization
    └── load_env.go
```

## Getting Started

### Prerequisites

- Go v1.25.4 or higher
- PostgreSQL 15+
- Stripe account (for payments)

### Environment Variables

Create a `.env` file in this directory:

```bash
# Database
DB_URL=postgresql://username:password@localhost:5432/homechef_dev

# Authentication
JWT_SECRET=your-very-long-random-secret-key-here

# Stripe
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
```

### Running the Server

```bash
# Install dependencies
go mod tidy

# Run the server
go run main.go

# Or from the monorepo root
pnpm dev:api
```

The API will be available at `http://localhost:8080`.

### Running Tests

```bash
go test -v ./...

# With coverage
go test -v -race -coverprofile=coverage.out ./...
```

## API Endpoints

### Public Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Health check |
| POST | `/signup` | Register new user |
| POST | `/login` | Authenticate user |
| GET | `/profiles/chefs` | List verified chefs |
| GET | `/profiles/chef/:id` | Get chef details |
| GET | `/menu/chef/:chef_id` | Get chef's menu |
| GET | `/reviews/chef/:chef_id` | Get chef's reviews |
| GET | `/ads/serve` | Get random active ad |

### Protected Endpoints (Require JWT)

| Method | Path | Role | Description |
|--------|------|------|-------------|
| GET | `/profile` | Any | Get own profile |
| PUT | `/profiles/chef` | Chef | Update chef profile |
| POST | `/menu/` | Chef | Create menu item |
| PUT | `/menu/:item_id` | Chef | Update menu item |
| DELETE | `/menu/:item_id` | Chef | Delete menu item |
| GET | `/menu/my-menu` | Chef | Get own menu |
| POST | `/cart/` | Customer | Add to cart |
| GET | `/cart/` | Customer | Get cart |
| PUT | `/cart/item/:id` | Customer | Update cart item |
| DELETE | `/cart/item/:id` | Customer | Remove from cart |
| POST | `/cart/checkout` | Customer | Create order |
| GET | `/orders/` | Customer | Get own orders |
| GET | `/orders/:id` | Customer | Get order details |
| GET | `/orders/chef/` | Chef | Get chef's orders |
| PUT | `/orders/chef/:id/status` | Chef | Update order status |
| POST | `/payments/create-payment-intent` | Customer | Create payment |
| POST | `/reviews/` | Customer | Submit review |
| GET | `/delivery/orders` | Driver | Get assigned orders |
| PUT | `/delivery/orders/:id/status` | Driver | Update delivery |

### Admin Endpoints (Require Admin Role)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/admin/users` | List all users |
| GET | `/admin/chefs` | List chef profiles |
| PUT | `/admin/chefs/:id/verify` | Verify chef |
| DELETE | `/admin/users/:id/suspend` | Suspend user |
| POST | `/admin/orders/assign-driver` | Assign driver |
| GET | `/reviews/admin/pending` | List pending reviews |
| PUT | `/reviews/admin/:id/status` | Approve/reject review |
| GET | `/analytics/summary` | Platform statistics |
| GET | `/analytics/sales` | Sales data |

## Authentication

### JWT Token

Tokens are issued on successful login and must be included in the `Authorization` header:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Token structure:
```json
{
  "sub": "user_id",
  "exp": 1234567890
}
```

- Expiration: 30 days
- Algorithm: HS256

### User Roles

| Role | Access Level |
|------|--------------|
| `admin` | Full platform access |
| `chef` | Chef profile, menu, orders |
| `driver` | Delivery orders |
| `customer` | Browse, order, review |

## Database Models

See [Database Schema](../../docs/database-schema.md) for complete model documentation.

### Key Models

- **User**: Core user with role-based access
- **ChefProfile**: Extended profile for chefs
- **MenuItem**: Food items with pricing
- **Cart/CartItem**: Shopping cart
- **Order/OrderItem**: Customer orders
- **Review**: Customer reviews with moderation
- **AdAccount/AdCampaign/Ad**: Advertising system

## Payment Integration

The API integrates with Stripe for payment processing:

1. Client calls `POST /payments/create-payment-intent` with order ID
2. API creates Stripe PaymentIntent
3. API returns `clientSecret`
4. Frontend uses Stripe.js to complete payment

```go
// Example payment flow
stripe.Key = os.Getenv("STRIPE_SECRET_KEY")

params := &stripe.PaymentIntentParams{
    Amount:   stripe.Int64(int64(order.TotalAmount * 100)), // cents
    Currency: stripe.String("usd"),
}

pi, err := paymentintent.New(params)
```

## Error Handling

All errors return JSON with an `error` field:

```json
{
  "error": "Description of the error"
}
```

### Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 500 | Internal Server Error |

## Docker

### Build Image

```bash
docker build -f apps/api/Dockerfile -t homechef-api .
```

### Run Container

```bash
docker run -p 8080:8080 \
  -e DB_URL=postgresql://... \
  -e JWT_SECRET=your-secret \
  -e STRIPE_SECRET_KEY=sk_test_... \
  homechef-api
```

### Health Check

The container includes a health check on `/health`:

```dockerfile
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/health || exit 1
```

## Development

### Adding a New Endpoint

1. Create/update model in `models/`
2. Create controller function in `controllers/`
3. Register route in `routes/routes.go`
4. Update documentation

### Middleware

```go
// Public route
router.GET("/public", controller.Handler)

// Protected route
router.GET("/protected", middleware.RequireAuth, controller.Handler)

// Admin only
router.GET("/admin", middleware.RequireAdmin, controller.Handler)
```

## API Documentation

For complete API documentation including request/response examples, see:

- [API Reference](../../docs/api-reference.md)
- [Database Schema](../../docs/database-schema.md)
- [Architecture](../../docs/architecture.md)
