# HomeChef: The Monorepo

This repository contains the full source code for the HomeChef application, a platform connecting home cooks with customers. It is structured as a monorepo using pnpm workspaces.

## What's Inside?

This monorepo contains the following packages and applications:

- `apps/web`: The Next.js frontend application for customers, chefs, and admins.
- `apps/api`: The Go (Gin) backend API that powers the application.
- `packages/ui`: A shared React component library used by the web app.
- `packages/config`: Shared configurations for ESLint and other tools.

## Getting Started

To get started with this project, you'll need to have the following installed:
- Node.js (v20.9.0 or higher)
- Go (v1.25.4 or higher)
- pnpm
- PostgreSQL

### 1. Install Dependencies

From the root of the project, install all dependencies for all packages:
```bash
pnpm install
```

### 2. Set Up Environment Variables

Each application (`apps/web` and `apps/api`) has its own `.env` file (`.env.local` for the web app). Copy the example files and fill in the required secrets and keys for:
- Database connection
- JWT secrets
- NextAuth.js providers (Google, Facebook)
- Stripe API keys

### 3. Set Up the Database

Make sure you have a running PostgreSQL instance. Create a database (e.g., `homechef_dev`) and update the `DB_URL` in `apps/api/.env`.

### 4. Run the Development Servers

You can run both the frontend and backend concurrently.

**To run the Go backend:**
```bash
cd apps/api
go run main.go
```
The API will be available at `http://localhost:8080`.

**To run the Next.js frontend:**
```bash
cd apps/web
pnpm dev
```
The web app will be available at `http://localhost:3000`.

## Important Note on Authentication

The frontend currently uses placeholder JWTs for making authenticated API calls to the backend. A robust solution for bridging `next-auth` sessions with the Go backend's JWT validation needs to be implemented for production use.
