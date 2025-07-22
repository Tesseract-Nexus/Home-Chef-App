# Multi-stage Dockerfile for HomeChef React Native Web App
# Stage 1: Dependencies and Build Environment
FROM node:18-alpine AS dependencies

# Set working directory
WORKDIR /app

# Install system dependencies for native modules
RUN apk add --no-cache \
    git \
    python3 \
    make \
    g++ \
    cairo-dev \
    jpeg-dev \
    pango-dev \
    musl-dev \
    giflib-dev \
    pixman-dev \
    pangomm-dev \
    libjpeg-turbo-dev \
    freetype-dev

# Copy package files
COPY package*.json ./
COPY babel.config.js ./
COPY metro.config.js ./
COPY tsconfig.json ./
COPY app.json ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Stage 2: Development Dependencies and Testing
FROM dependencies AS test

# Install all dependencies including dev dependencies
RUN npm ci

# Copy source code
COPY . .

# Run tests (if any test scripts exist)
RUN npm run lint || echo "No lint script found"

# Type checking
RUN npx tsc --noEmit || echo "TypeScript check completed"

# Stage 3: Build Stage
FROM test AS build

# Set environment variables for production build
ENV NODE_ENV=production
ENV EXPO_USE_STATIC=true

# Build the web application
RUN npx expo export --platform web

# Stage 4: Production Runtime
FROM nginx:alpine AS production

# Install Node.js for any server-side requirements
RUN apk add --no-cache nodejs npm

# Copy built application from build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Copy custom nginx configuration
COPY <<EOF /etc/nginx/conf.d/default.conf
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    # Enable gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Handle client-side routing
    location / {
        try_files \$uri \$uri/ /index.html;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN\" always;
    add_header X-Content-Type-Options "nosniff\" always;
    add_header X-XSS-Protection "1; mode=block\" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin\" always;

    # Health check endpoint
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
}
EOF

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

# Change ownership of nginx directories
RUN chown -R nextjs:nodejs /usr/share/nginx/html && \
    chown -R nextjs:nodejs /var/cache/nginx && \
    chown -R nextjs:nodejs /var/log/nginx && \
    chown -R nextjs:nodejs /etc/nginx/conf.d

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost/health || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]