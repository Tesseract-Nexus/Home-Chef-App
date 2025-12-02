# HomeChef Web Application

The frontend application for HomeChef, built with Next.js 16 and the App Router.

## Overview

This is a modern React application that provides the user interface for all HomeChef users: customers, chefs, delivery drivers, and administrators. It features OAuth authentication, Stripe payments, and a responsive design.

## Tech Stack

| Technology | Purpose |
|------------|---------|
| Next.js 16 | React framework with App Router |
| React 19 | UI library |
| TypeScript | Type safety |
| Tailwind CSS 4 | Styling |
| NextAuth.js | OAuth authentication |
| Stripe.js | Payment processing |
| Recharts | Data visualization |
| @homechef/ui | Shared UI components |

## Project Structure

```
apps/web/
├── src/
│   ├── app/                        # App Router pages
│   │   ├── layout.tsx              # Root layout
│   │   ├── page.tsx                # Home page
│   │   ├── providers.tsx           # Context providers
│   │   │
│   │   ├── api/
│   │   │   └── auth/
│   │   │       └── [...nextauth]/  # NextAuth API route
│   │   │           └── route.ts
│   │   │
│   │   ├── auth/                   # Authentication pages
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   └── register/
│   │   │       └── page.tsx
│   │   │
│   │   ├── chefs/                  # Chef discovery
│   │   │   ├── page.tsx            # List all chefs
│   │   │   └── [id]/
│   │   │       └── page.tsx        # Chef detail page
│   │   │
│   │   ├── chef/                   # Chef dashboard
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx
│   │   │   ├── profile/
│   │   │   │   └── page.tsx
│   │   │   ├── menu/
│   │   │   │   └── page.tsx
│   │   │   └── orders/
│   │   │       └── page.tsx
│   │   │
│   │   ├── admin/                  # Admin dashboard
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx
│   │   │   └── analytics/
│   │   │       └── page.tsx
│   │   │
│   │   ├── delivery/               # Driver dashboard
│   │   │   └── dashboard/
│   │   │       └── page.tsx
│   │   │
│   │   ├── cart/
│   │   │   └── page.tsx            # Shopping cart
│   │   │
│   │   ├── checkout/
│   │   │   └── [orderId]/
│   │   │       └── page.tsx        # Stripe checkout
│   │   │
│   │   ├── orders/                 # Order history
│   │   │   ├── page.tsx
│   │   │   └── [id]/
│   │   │       └── page.tsx
│   │   │
│   │   ├── profile/
│   │   │   └── page.tsx            # User profile
│   │   │
│   │   └── ads/                    # Ad management
│   │       ├── page.tsx
│   │       ├── new/
│   │       │   └── page.tsx
│   │       └── [id]/
│   │           └── page.tsx
│   │
│   ├── components/                 # React components
│   │   ├── CheckoutForm.tsx        # Stripe payment form
│   │   ├── AdBanner.tsx            # Ad display
│   │   ├── ReviewForm.tsx          # Review submission
│   │   └── AuthButtons.tsx         # OAuth buttons
│   │
│   └── types/
│       └── next-auth.d.ts          # NextAuth type extensions
│
├── public/                         # Static assets
├── package.json
├── tsconfig.json
├── next.config.ts
├── postcss.config.mjs
├── eslint.config.mjs
└── Dockerfile
```

## Getting Started

### Prerequisites

- Node.js v20.9.0+
- pnpm v9.15.0+
- PostgreSQL (for NextAuth adapter)

### Environment Variables

Create a `.env.local` file:

```bash
# NextAuth
NEXTAUTH_SECRET=your-random-secret-key
NEXTAUTH_URL=http://localhost:3000

# OAuth Providers
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
FACEBOOK_CLIENT_ID=your-facebook-client-id
FACEBOOK_CLIENT_SECRET=your-facebook-client-secret

# Database (for NextAuth sessions)
DB_URL=postgresql://username:password@localhost:5432/homechef_dev

# API
NEXT_PUBLIC_API_URL=http://localhost:8080

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key
```

### Installation

```bash
# From monorepo root
pnpm install

# Or from this directory
pnpm install
```

### Running the Development Server

```bash
# From monorepo root
pnpm dev

# Or from this directory
pnpm dev
```

The application will be available at `http://localhost:3000`.

### Building for Production

```bash
pnpm build
pnpm start
```

## Features

### For Customers

- **Browse Chefs**: Discover home chefs with search and filtering
- **View Menus**: See what each chef offers with pricing
- **Shopping Cart**: Add items, manage quantities
- **Checkout**: Secure payment via Stripe
- **Order Tracking**: Monitor order status
- **Reviews**: Rate and review delivered orders
- **Loyalty Points**: Earn points on purchases

### For Chefs

- **Profile Management**: Set up kitchen details
- **Menu Management**: Create, edit, delete menu items
- **Order Management**: View and update order status
- **Dashboard**: Overview of orders and performance

### For Drivers

- **Order Queue**: View assigned deliveries
- **Status Updates**: Mark orders as out for delivery/delivered
- **Dashboard**: Daily delivery overview

### For Admins

- **User Management**: View and suspend users
- **Chef Verification**: Approve chef profiles
- **Review Moderation**: Approve/reject customer reviews
- **Analytics**: Platform statistics and sales data

## Authentication

### OAuth Providers

The app supports authentication via:
- Google
- Facebook

### Session Management

NextAuth.js handles sessions with JWT strategy:

```typescript
// src/app/api/auth/[...nextauth]/route.ts
export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({...}),
    FacebookProvider({...}),
  ],
  adapter: PostgresAdapter(pool),
  session: {
    strategy: "jwt",
  },
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        token.role = user.role;
        token.id = user.id;
      }
      return token;
    },
    session: async ({ session, token }) => {
      if (session.user) {
        session.user.role = token.role;
        session.user.id = token.id;
      }
      return session;
    },
  },
};
```

### Protected Routes

Use the session to protect routes:

```typescript
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export default async function ProtectedPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/login");
  }

  return <div>Protected content</div>;
}
```

## Payment Integration

### Stripe Checkout

The checkout flow uses Stripe Elements:

```typescript
// components/CheckoutForm.tsx
import { useStripe, useElements, PaymentElement } from "@stripe/react-stripe-js";

export function CheckoutForm({ clientSecret }: { clientSecret: string }) {
  const stripe = useStripe();
  const elements = useElements();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/orders`,
      },
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement />
      <button type="submit">Pay</button>
    </form>
  );
}
```

## Styling

### Tailwind CSS

The app uses Tailwind CSS 4 for styling:

```typescript
// Example component with Tailwind
export function Button({ children }: { children: React.ReactNode }) {
  return (
    <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
      {children}
    </button>
  );
}
```

### Shared UI Components

Import from the `@homechef/ui` package:

```typescript
import { Button } from "@homechef/ui";
```

## API Integration

### Fetching Data

```typescript
const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Public endpoint
async function getChefs() {
  const res = await fetch(`${API_URL}/profiles/chefs`);
  return res.json();
}

// Protected endpoint (with token)
async function getOrders(token: string) {
  const res = await fetch(`${API_URL}/orders/`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.json();
}
```

### Important Note

The frontend currently uses placeholder JWTs for API calls. A robust solution for bridging NextAuth.js sessions with the Go backend's JWT validation needs to be implemented for production use.

## Docker

### Build Image

```bash
docker build -f apps/web/Dockerfile -t homechef-web .
```

### Run Container

```bash
docker run -p 3000:3000 \
  -e NEXTAUTH_SECRET=... \
  -e NEXT_PUBLIC_API_URL=http://api:8080 \
  -e NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_... \
  homechef-web
```

### Health Check

```dockerfile
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000 || exit 1
```

## Scripts

| Script | Description |
|--------|-------------|
| `pnpm dev` | Start development server |
| `pnpm build` | Build for production |
| `pnpm start` | Start production server |
| `pnpm lint` | Run ESLint |
| `pnpm test` | Run tests |

## Documentation

For more information, see:

- [API Reference](../../docs/api-reference.md)
- [Architecture](../../docs/architecture.md)
- [Main README](../../README.md)
