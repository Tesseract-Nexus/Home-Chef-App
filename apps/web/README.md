# Web Application (Next.js)

This is the frontend application for HomeChef, built with Next.js and the App Router.

## Key Features
- **Authentication:** Handles user signup, login (email/password and social providers via NextAuth.js).
- **Customer Facing Pages:** Browse chefs, view menus, manage cart, place orders, and view order history.
- **Chef Dashboard:** A dedicated section for chefs to manage their profile, menu, and incoming orders.
- **Admin Dashboard:** A protected area for administrators to manage users, chefs, and moderate content.

## Tech Stack
- **Framework:** Next.js
- **Language:** TypeScript
- **Styling:** Tailwind CSS (via PostCSS)
- **Authentication:** NextAuth.js
- **UI Components:** Shared components from `packages/ui`.
- **Linting:** ESLint, with shared configuration from `packages/config`.

## Getting Started
1. Ensure you have installed all dependencies from the root of the monorepo (`pnpm install`).
2. Create a `.env.local` file in this directory (`apps/web`).
3. Fill in the required environment variables:
    - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
    - `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
    - `FACEBOOK_CLIENT_ID`, `FACEBOOK_CLIENT_SECRET`
    - `NEXTAUTH_SECRET`
    - `NEXTAUTH_URL` (should be `http://localhost:3000` for development)
    - `DB_URL` (for the NextAuth adapter)
4. Run the development server:
```bash
pnpm dev
```
The application will be available at `http://localhost:3000`.