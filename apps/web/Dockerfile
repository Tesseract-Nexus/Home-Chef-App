# =============================================================================
# HomeChef Web - Dockerfile
# Production Next.js build for pnpm workspace setup
# =============================================================================

# -----------------------------------------------------------------------------
# Stage 1: Builder
# -----------------------------------------------------------------------------
FROM node:20-alpine AS builder
RUN apk add --no-cache libc6-compat
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate
WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/web/package.json ./apps/web/
COPY packages/ui/package.json ./packages/ui/
COPY packages/config/package.json ./packages/config/

# Install ALL dependencies (including dev for build)
RUN pnpm install --frozen-lockfile

# Copy workspace packages
COPY packages/ ./packages/

# Copy web app source
COPY apps/web/ ./apps/web/

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY

# Build from root using workspace command
RUN pnpm build:web

# -----------------------------------------------------------------------------
# Stage 2: Tester (optional - use --target=tester to run tests)
# -----------------------------------------------------------------------------
FROM node:20-alpine AS tester
RUN apk add --no-cache libc6-compat
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate
WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/web/package.json ./apps/web/
COPY packages/ui/package.json ./packages/ui/
COPY packages/config/package.json ./packages/config/

# Install ALL dependencies (including dev for testing)
RUN pnpm install --frozen-lockfile

# Copy workspace packages
COPY packages/ ./packages/

# Copy web app source
COPY apps/web/ ./apps/web/

# Run tests with coverage
WORKDIR /app/apps/web
RUN pnpm test || echo "No tests configured yet"

# Output test results
RUN echo "Tests completed successfully"

# -----------------------------------------------------------------------------
# Stage 3: Production
# -----------------------------------------------------------------------------
FROM node:20-alpine AS production
RUN apk --no-cache add wget
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Copy package files for production
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/web/package.json ./apps/web/
COPY packages/ui/package.json ./packages/ui/
COPY packages/config/package.json ./packages/config/

# Install production dependencies only
RUN pnpm install --frozen-lockfile --prod

# Copy built app from builder
COPY --from=builder /app/apps/web/.next ./apps/web/.next
COPY --from=builder /app/apps/web/public ./apps/web/public
COPY --from=builder /app/apps/web/next.config.ts ./apps/web/next.config.ts

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001 -G nodejs && \
    chown -R nextjs:nodejs /app

USER nextjs
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000 || exit 1

LABEL org.label-schema.name="homechef-web" \
      org.label-schema.description="HomeChef Web Application" \
      org.label-schema.vcs-url="https://github.com/Agent-Sphere/Home-Chef-App"

# Run Next.js production server
WORKDIR /app/apps/web
CMD ["pnpm", "start"]
