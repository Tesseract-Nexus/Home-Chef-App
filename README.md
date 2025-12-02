# HomeChef

A modern food ordering platform that connects home chefs with customers. Built as a monorepo with a Go API backend and Next.js frontend.

## Overview

HomeChef enables home cooks to create their own online kitchen, manage menus, and receive orders from customers. The platform includes features for customers, chefs, delivery drivers, and administrators.

### Key Features

- **For Customers**: Browse chefs, order food, track deliveries, write reviews, earn loyalty points
- **For Chefs**: Manage kitchen profile, create menus, handle orders, track earnings
- **For Drivers**: View assigned orders, update delivery status
- **For Admins**: Verify chefs, moderate reviews, view analytics, manage users

## Tech Stack

| Component | Technology |
|-----------|------------|
| **Backend API** | Go 1.25, Gin Framework, GORM |
| **Frontend** | Next.js 16, React 19, TypeScript |
| **Database** | PostgreSQL |
| **Authentication** | JWT (Backend), NextAuth.js (Frontend) |
| **Payments** | Stripe |
| **Package Manager** | pnpm (monorepo workspaces) |
| **Container Registry** | GitHub Container Registry (GHCR) |

## Project Structure

```
Home-Chef-App/
├── apps/
│   ├── api/                 # Go API service
│   │   ├── controllers/     # Request handlers
│   │   ├── models/          # Database models
│   │   ├── routes/          # Route definitions
│   │   ├── middleware/      # Auth middleware
│   │   └── main.go          # Entry point
│   └── web/                 # Next.js web application
│       ├── src/app/         # App router pages
│       └── src/components/  # React components
├── packages/
│   ├── ui/                  # Shared UI components (@homechef/ui)
│   └── config/              # Shared ESLint config (@homechef/config)
├── docs/                    # Documentation
└── .github/workflows/       # CI/CD pipelines
```

## Getting Started

### Prerequisites

- Node.js v20.9.0+
- Go v1.25.4+
- pnpm v9.15.0+
- PostgreSQL 15+

### Installation

```bash
# Clone the repository
git clone https://github.com/Agent-Sphere/Home-Chef-App.git
cd Home-Chef-App

# Install dependencies
pnpm install

# Set up environment variables
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.local.example apps/web/.env.local
```

### Environment Variables

**API (`apps/api/.env`)**:
```bash
DB_URL=postgresql://user:password@localhost:5432/homechef_dev
JWT_SECRET=your-jwt-secret-key
STRIPE_SECRET_KEY=sk_test_...
```

**Web (`apps/web/.env.local`)**:
```bash
NEXTAUTH_SECRET=your-nextauth-secret
NEXTAUTH_URL=http://localhost:3000
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

### Running the Application

```bash
# Start the API server (runs on port 8080)
pnpm dev:api

# Start the web app (runs on port 3000)
pnpm dev

# Run both simultaneously (in separate terminals)
```

### Running Tests

```bash
# Test API
pnpm test:api

# Test Web
pnpm test

# Lint
pnpm lint
```

## Documentation

| Document | Description |
|----------|-------------|
| [API Reference](docs/api-reference.md) | Complete API endpoint documentation |
| [Database Schema](docs/database-schema.md) | Database models and relationships |
| [Architecture](docs/architecture.md) | System architecture overview |
| [Apps/API README](apps/api/README.md) | Backend API documentation |
| [Apps/Web README](apps/web/README.md) | Frontend application documentation |

## Docker

### Build Images

```bash
# Build web image
docker build -f apps/web/Dockerfile -t homechef-web .

# Build API image
docker build -f apps/api/Dockerfile -t homechef-api .
```

### Run Containers

```bash
# Run API
docker run -p 8080:8080 \
  -e DB_URL=... \
  -e JWT_SECRET=... \
  homechef-api

# Run Web
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_API_URL=http://localhost:8080 \
  homechef-web
```

## CI/CD

GitHub Actions workflows are configured for:

| Workflow | Trigger | Description |
|----------|---------|-------------|
| `homechef-web-build` | Push/PR to main | Build and test web app |
| `homechef-api-build` | Push/PR to main | Build and test API |
| `homechef-web-release` | Tag `homechef-web-v*` | Release web app to GHCR |
| `homechef-api-release` | Tag `homechef-api-v*` | Release API to GHCR |

### Creating a Release

```bash
# Release web app
git tag homechef-web-v1.0.0
git push origin homechef-web-v1.0.0

# Release API
git tag homechef-api-v1.0.0
git push origin homechef-api-v1.0.0
```

## User Roles

| Role | Capabilities |
|------|-------------|
| **customer** | Browse chefs, place orders, write reviews, manage cart |
| **chef** | Manage profile, create menus, handle orders, view earnings |
| **driver** | View assigned orders, update delivery status |
| **admin** | All above + verify chefs, moderate reviews, view analytics |

## API Quick Reference

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/signup` | POST | Register new user |
| `/login` | POST | Authenticate and get JWT |
| `/profiles/chefs` | GET | List verified chefs |
| `/menu/chef/:id` | GET | Get chef's menu |
| `/cart/` | POST | Add item to cart |
| `/cart/checkout` | POST | Create order from cart |
| `/orders/` | GET | Get user's orders |
| `/reviews/` | POST | Submit review |

See [API Reference](docs/api-reference.md) for complete documentation.

## Important Note on Authentication

The frontend currently uses placeholder JWTs for making authenticated API calls to the backend. A robust solution for bridging `next-auth` sessions with the Go backend's JWT validation needs to be implemented for production use.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
