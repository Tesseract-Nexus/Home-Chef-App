# API Server (Go)

This is the backend API for the HomeChef application, built with Go and the Gin web framework.

## Key Features
- **RESTful API:** Provides all necessary endpoints for user management, profiles, menus, orders, carts, payments, and administration.
- **Authentication:** JWT-based authentication for protected endpoints.
- **Database:** Uses PostgreSQL with GORM for object-relational mapping.
- **Modularity:** Organized into packages for controllers, routes, models, middleware, and database management.

## Tech Stack
- **Language:** Go
- **Web Framework:** Gin
- **Database:** PostgreSQL
- **ORM:** GORM
- **Authentication:** JWT (`golang-jwt/jwt`) and `bcrypt`
- **Payments:** Stripe (`stripe-go`)

## Getting Started
1. Ensure you have installed Go (v1.25.4 or higher) and have a running PostgreSQL instance.
2. Create a `.env` file in this directory (`apps/api`).
3. Fill in the required environment variables:
    - `DB_URL` (the connection string for your PostgreSQL database)
    - `JWT_SECRET` (a long, random string for signing JWTs)
    - `STRIPE_SECRET_KEY` (your secret Stripe API key)
4. Tidy the Go modules:
```bash
go mod tidy
```
5. Run the development server:
```bash
go run main.go
```
The API will be available at `http://localhost:8080`.
