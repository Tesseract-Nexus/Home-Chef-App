#!/bin/bash

# HomeChef Docker Deployment Script
# This script handles deployment of the HomeChef application

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Configuration
IMAGE_NAME="homechef"
CONTAINER_NAME="homechef-app"
PORT="80"

# Parse command line arguments
ENVIRONMENT="production"
while [[ $# -gt 0 ]]; do
    case $1 in
        -e|--environment)
            ENVIRONMENT="$2"
            shift 2
            ;;
        -p|--port)
            PORT="$2"
            shift 2
            ;;
        -h|--help)
            echo "Usage: $0 [OPTIONS]"
            echo "Options:"
            echo "  -e, --environment    Environment (development|production) [default: production]"
            echo "  -p, --port          Port to expose [default: 80]"
            echo "  -h, --help          Show this help message"
            exit 0
            ;;
        *)
            print_error "Unknown option: $1"
            exit 1
            ;;
    esac
done

print_status "Deploying HomeChef in $ENVIRONMENT mode on port $PORT..."

# Stop and remove existing container
if docker ps -a | grep -q $CONTAINER_NAME; then
    print_status "Stopping existing container..."
    docker stop $CONTAINER_NAME || true
    docker rm $CONTAINER_NAME || true
fi

# Build the application
print_status "Building application..."
./scripts/docker-build.sh

# Run the container
print_status "Starting container..."
if [ "$ENVIRONMENT" = "development" ]; then
    docker run -d \
        --name $CONTAINER_NAME \
        -p $PORT:8081 \
        -v $(pwd):/app \
        -v /app/node_modules \
        -e NODE_ENV=development \
        $IMAGE_NAME:test \
        npm run web
else
    docker run -d \
        --name $CONTAINER_NAME \
        -p $PORT:80 \
        -e NODE_ENV=production \
        --restart unless-stopped \
        $IMAGE_NAME:latest
fi

# Wait for container to be ready
print_status "Waiting for application to start..."
sleep 5

# Health check
if [ "$ENVIRONMENT" = "production" ]; then
    HEALTH_URL="http://localhost:$PORT/health"
else
    HEALTH_URL="http://localhost:$PORT"
fi

for i in {1..30}; do
    if curl -f $HEALTH_URL > /dev/null 2>&1; then
        print_success "Application is running successfully!"
        print_status "Access the application at: http://localhost:$PORT"
        break
    fi
    
    if [ $i -eq 30 ]; then
        print_error "Application failed to start within 30 seconds"
        docker logs $CONTAINER_NAME
        exit 1
    fi
    
    sleep 1
done

# Show container status
print_status "Container status:"
docker ps | grep $CONTAINER_NAME

print_success "Deployment completed successfully!"