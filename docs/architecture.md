# HomeChef Architecture

System architecture overview and design decisions.

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Client Layer                            │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │   Browser   │  │  Mobile App │  │    Third-party Apps     │  │
│  │  (Next.js)  │  │   (Future)  │  │       (API users)       │  │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                       API Gateway Layer                          │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                    Go API (Gin)                          │    │
│  │  ┌─────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │    │
│  │  │  Auth   │  │  Chefs   │  │  Orders  │  │  Reviews │  │    │
│  │  │ Routes  │  │  Routes  │  │  Routes  │  │  Routes  │  │    │
│  │  └─────────┘  └──────────┘  └──────────┘  └──────────┘  │    │
│  │  ┌─────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │    │
│  │  │  Cart   │  │   Menu   │  │   Ads    │  │  Admin   │  │    │
│  │  │ Routes  │  │  Routes  │  │  Routes  │  │  Routes  │  │    │
│  │  └─────────┘  └──────────┘  └──────────┘  └──────────┘  │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                       Data Layer                                 │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐              ┌───────────────────────────┐ │
│  │   PostgreSQL    │              │         Stripe            │ │
│  │   (Primary DB)  │              │    (Payment Gateway)      │ │
│  └─────────────────┘              └───────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## Component Overview

### Frontend (apps/web)

**Technology:** Next.js 16 with App Router

```
┌────────────────────────────────────────────┐
│               Next.js Application          │
├────────────────────────────────────────────┤
│  ┌────────────────┐  ┌─────────────────┐   │
│  │   App Router   │  │    NextAuth     │   │
│  │    (Pages)     │  │  (OAuth + JWT)  │   │
│  └────────────────┘  └─────────────────┘   │
│  ┌────────────────┐  ┌─────────────────┐   │
│  │   Components   │  │    Stripe.js    │   │
│  │  (@homechef/ui)│  │   (Payments)    │   │
│  └────────────────┘  └─────────────────┘   │
└────────────────────────────────────────────┘
```

**Key Components:**
- **App Router**: File-based routing with server components
- **NextAuth.js**: OAuth authentication (Google, Facebook)
- **Stripe.js**: Client-side payment handling
- **@homechef/ui**: Shared UI component library

### Backend (apps/api)

**Technology:** Go with Gin Framework

```
┌─────────────────────────────────────────────────────┐
│                   Go API Service                     │
├─────────────────────────────────────────────────────┤
│  ┌────────────────────────────────────────────────┐ │
│  │                  HTTP Layer                     │ │
│  │  ┌─────────┐  ┌──────────┐  ┌───────────────┐  │ │
│  │  │  Routes │  │Middleware│  │   Handlers    │  │ │
│  │  └─────────┘  └──────────┘  └───────────────┘  │ │
│  └────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────┐ │
│  │                Business Layer                   │ │
│  │  ┌───────────┐  ┌──────────┐  ┌─────────────┐  │ │
│  │  │Controllers│  │  Models  │  │  Services   │  │ │
│  │  └───────────┘  └──────────┘  └─────────────┘  │ │
│  └────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────┐ │
│  │                 Data Layer                      │ │
│  │  ┌───────────┐  ┌──────────────────────────┐   │ │
│  │  │   GORM    │  │      Stripe SDK          │   │ │
│  │  │  (ORM)    │  │   (Payment Processing)   │   │ │
│  │  └───────────┘  └──────────────────────────┘   │ │
│  └────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
```

**Key Components:**
- **Routes**: URL path definitions and handler mapping
- **Middleware**: Authentication, CORS, logging
- **Controllers**: Request handling and business logic
- **Models**: GORM models for database entities
- **GORM**: PostgreSQL ORM for data access
- **Stripe SDK**: Payment processing integration

## Request Flow

### Authentication Flow

```
┌────────┐     ┌─────────┐     ┌─────────┐     ┌────────────┐
│ Client │────▶│ Next.js │────▶│NextAuth │────▶│   OAuth    │
└────────┘     └─────────┘     └─────────┘     │  Provider  │
                    │                          └────────────┘
                    │                                │
                    ▼                                │
              ┌─────────┐◀───────────────────────────┘
              │ Session │
              │ Created │
              └─────────┘
                    │
                    ▼
              ┌─────────┐     ┌─────────┐     ┌────────────┐
              │ Client  │────▶│ Go API  │────▶│ PostgreSQL │
              │ + JWT   │     │ + Auth  │     │            │
              └─────────┘     └─────────┘     └────────────┘
```

### Order Flow

```
┌────────┐                                              ┌────────┐
│Customer│                                              │  Chef  │
└───┬────┘                                              └───┬────┘
    │                                                       │
    │ 1. Add to Cart                                        │
    ├──────────────────▶ POST /cart/                        │
    │                                                       │
    │ 2. Checkout                                           │
    ├──────────────────▶ POST /cart/checkout                │
    │                    (Order created)                    │
    │                                                       │
    │ 3. Create Payment Intent                              │
    ├──────────────────▶ POST /payments/create-payment-intent
    │                                                       │
    │ 4. Pay with Stripe                                    │
    ├──────────────────▶ Stripe.js                          │
    │                                                       │
    │                    5. Chef sees order                 │
    │                    ◀──────────────────────────────────┤
    │                    GET /orders/chef/                  │
    │                                                       │
    │                    6. Update status                   │
    │                    ◀──────────────────────────────────┤
    │                    PUT /orders/chef/:id/status        │
    │                                                       │
    │ 7. Track order                                        │
    ├──────────────────▶ GET /orders/:id                    │
    │                                                       │
    │ 8. Order delivered                                    │
    │◀──────────────────────────────────────────────────────┤
    │                                                       │
    │ 9. Write review                                       │
    ├──────────────────▶ POST /reviews/                     │
    ▼                                                       ▼
```

## Directory Structure

### Monorepo Layout

```
Home-Chef-App/
├── apps/
│   ├── api/                    # Go API Service
│   │   ├── controllers/        # Request handlers
│   │   │   ├── auth.go
│   │   │   ├── cart.go
│   │   │   ├── menu.go
│   │   │   ├── order.go
│   │   │   ├── profile.go
│   │   │   ├── review.go
│   │   │   ├── admin.go
│   │   │   ├── analytics.go
│   │   │   ├── ads.go
│   │   │   ├── delivery.go
│   │   │   └── payment.go
│   │   ├── models/             # Database models
│   │   │   ├── user.go
│   │   │   ├── chef_profile.go
│   │   │   ├── menu_item.go
│   │   │   ├── cart.go
│   │   │   ├── order.go
│   │   │   ├── review.go
│   │   │   └── ads.go
│   │   ├── routes/             # Route definitions
│   │   │   └── routes.go
│   │   ├── middleware/         # Auth middleware
│   │   │   ├── require_auth.go
│   │   │   └── require_admin.go
│   │   ├── database/           # DB connection
│   │   ├── initializers/       # App initialization
│   │   ├── main.go             # Entry point
│   │   ├── go.mod
│   │   └── Dockerfile
│   │
│   └── web/                    # Next.js Application
│       ├── src/
│       │   ├── app/            # App Router pages
│       │   │   ├── page.tsx    # Home
│       │   │   ├── layout.tsx  # Root layout
│       │   │   ├── providers.tsx
│       │   │   ├── api/auth/   # NextAuth route
│       │   │   ├── auth/       # Auth pages
│       │   │   ├── chefs/      # Chef discovery
│       │   │   ├── chef/       # Chef dashboard
│       │   │   ├── admin/      # Admin dashboard
│       │   │   ├── delivery/   # Driver dashboard
│       │   │   ├── cart/       # Shopping cart
│       │   │   ├── checkout/   # Payment
│       │   │   ├── orders/     # Order history
│       │   │   ├── profile/    # User profile
│       │   │   └── ads/        # Ad management
│       │   └── components/     # React components
│       ├── package.json
│       └── Dockerfile
│
├── packages/
│   ├── ui/                     # Shared UI components
│   │   ├── components/
│   │   ├── index.ts
│   │   └── package.json
│   └── config/                 # Shared config
│       ├── index.js
│       └── package.json
│
├── docs/                       # Documentation
│   ├── api-reference.md
│   ├── database-schema.md
│   └── architecture.md
│
├── .github/
│   ├── workflows/              # CI/CD pipelines
│   │   ├── homechef-web-build.yml
│   │   ├── homechef-web-release.yml
│   │   ├── homechef-api-build.yml
│   │   └── homechef-api-release.yml
│   ├── ISSUE_TEMPLATE/
│   └── dependabot.yml
│
├── package.json                # Root package.json
├── pnpm-workspace.yaml         # Workspace config
└── README.md
```

## Security

### Authentication & Authorization

```
┌─────────────────────────────────────────────────────┐
│                 Security Layers                      │
├─────────────────────────────────────────────────────┤
│                                                      │
│  Layer 1: OAuth (Frontend)                          │
│  ┌────────────────────────────────────────────┐     │
│  │  NextAuth.js                               │     │
│  │  - Google OAuth                            │     │
│  │  - Facebook OAuth                          │     │
│  │  - JWT Session Tokens                      │     │
│  └────────────────────────────────────────────┘     │
│                                                      │
│  Layer 2: JWT Validation (Backend)                  │
│  ┌────────────────────────────────────────────┐     │
│  │  RequireAuth Middleware                    │     │
│  │  - Bearer token validation                 │     │
│  │  - Token expiration check                  │     │
│  │  - User lookup from claims                 │     │
│  └────────────────────────────────────────────┘     │
│                                                      │
│  Layer 3: Role-Based Access Control                 │
│  ┌────────────────────────────────────────────┐     │
│  │  RequireAdmin Middleware                   │     │
│  │  Controller-level role checks              │     │
│  │  - admin: Full access                      │     │
│  │  - chef: Chef-specific routes              │     │
│  │  - driver: Delivery routes                 │     │
│  │  - customer: Customer routes               │     │
│  └────────────────────────────────────────────┘     │
│                                                      │
│  Layer 4: Resource Ownership                        │
│  ┌────────────────────────────────────────────┐     │
│  │  Controller Logic                          │     │
│  │  - Users can only access own resources     │     │
│  │  - Chefs can only modify own menu          │     │
│  │  - Drivers can only update own deliveries  │     │
│  └────────────────────────────────────────────┘     │
│                                                      │
└─────────────────────────────────────────────────────┘
```

### Password Security

- Passwords hashed using bcrypt (cost factor 10)
- Never stored or transmitted in plain text
- Password field excluded from JSON serialization

### JWT Token Structure

```json
{
  "sub": "user_id",
  "exp": 1234567890
}
```

- 30-day expiration
- Signed with HS256 algorithm
- Secret stored in environment variable

## Deployment

### Container Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Container Orchestration                   │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐  │
│  │  homechef-web   │  │  homechef-api   │  │  PostgreSQL │  │
│  │  (Next.js)      │  │  (Go/Gin)       │  │  (Database) │  │
│  │  Port: 3000     │  │  Port: 8080     │  │  Port: 5432 │  │
│  └─────────────────┘  └─────────────────┘  └─────────────┘  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### CI/CD Pipeline

```
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│   Push   │────▶│  Build   │────▶│  Test    │────▶│   Push   │
│  to Git  │     │  Docker  │     │  Suite   │     │  to GHCR │
└──────────┘     └──────────┘     └──────────┘     └──────────┘
                                                         │
                                                         ▼
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│  Deploy  │◀────│  Create  │◀────│ Security │◀────│  Tag     │
│  (K8s)   │     │ Release  │     │   Scan   │     │  Push    │
└──────────┘     └──────────┘     └──────────┘     └──────────┘
```

## Scalability Considerations

### Horizontal Scaling

| Component | Scaling Strategy |
|-----------|-----------------|
| Web App | Multiple replicas behind load balancer |
| API | Multiple replicas, stateless design |
| Database | Read replicas, connection pooling |

### Performance Optimizations

1. **Database**
   - Indexed queries on frequently accessed columns
   - GORM preloading to reduce N+1 queries
   - Connection pooling via GORM

2. **Caching** (Future)
   - Redis for session storage
   - API response caching
   - Static asset CDN

3. **API**
   - Stateless design for horizontal scaling
   - JSON response compression
   - Rate limiting (to be implemented)

## Future Architecture Considerations

### Microservices Migration

Current monolithic API could be split into:
- Authentication Service
- Chef Service
- Order Service
- Payment Service
- Notification Service

### Event-Driven Architecture

Potential message queue integration for:
- Order status updates
- Real-time notifications
- Analytics event processing

### CDN Integration

- Static asset delivery
- Image optimization
- Global edge caching
