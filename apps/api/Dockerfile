# =============================================================================
# HomeChef API Service - Dockerfile
# Multi-stage build for Go microservice
# Production-ready with security best practices
# =============================================================================

# -----------------------------------------------------------------------------
# Stage 1: Builder
# -----------------------------------------------------------------------------
FROM golang:1.25-alpine AS builder

# Install build dependencies
RUN apk add --no-cache git ca-certificates tzdata

# Set working directory
WORKDIR /build

# Copy go.mod and go.sum from api service
COPY apps/api/go.mod apps/api/go.sum ./apps/api/

# Set working directory to service
WORKDIR /build/apps/api

# Download dependencies
RUN go mod download

# Copy the api service source
COPY apps/api/ ./

# Build arguments for version info
ARG VERSION=dev
ARG COMMIT=unknown
ARG BUILD_TIME=unknown

# Build the application with optimization flags and version info
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build \
    -ldflags="-w -s -X main.Version=${VERSION} -X main.Commit=${COMMIT} -X main.BuildTime=${BUILD_TIME}" \
    -a -installsuffix cgo -o /build/homechef-api .

# -----------------------------------------------------------------------------
# Stage 2: Tester (optional - use --target=tester to run tests)
# -----------------------------------------------------------------------------
FROM golang:1.25-alpine AS tester

# Install test dependencies
RUN apk add --no-cache git ca-certificates

# Set working directory
WORKDIR /test

# Copy go.mod and go.sum from api service
COPY apps/api/go.mod apps/api/go.sum ./apps/api/

# Set working directory to service
WORKDIR /test/apps/api

# Download dependencies
RUN go mod download

# Copy the api service source
COPY apps/api/ ./

# Run tests with coverage
RUN go test -v -race -coverprofile=coverage.out ./...

# Output test results
RUN echo "Tests completed successfully"

# -----------------------------------------------------------------------------
# Stage 3: Production
# -----------------------------------------------------------------------------
FROM alpine:3.19 AS production

# Install ca-certificates and wget for health checks
RUN apk --no-cache add ca-certificates wget tzdata

# Create non-root user
RUN addgroup -g 1000 -S appgroup && adduser -D -u 1000 -S appuser -G appgroup

# Set working directory
WORKDIR /app

# Copy the binary from builder
COPY --from=builder /build/homechef-api .

# Change ownership to non-root user
RUN chown -R appuser:appgroup /app

# Switch to non-root user
USER appuser

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/health || exit 1

# Labels
LABEL org.label-schema.name="homechef-api" \
      org.label-schema.description="HomeChef API Service" \
      org.label-schema.vcs-url="https://github.com/Agent-Sphere/Home-Chef-App"

# Run the service
CMD ["./homechef-api"]
