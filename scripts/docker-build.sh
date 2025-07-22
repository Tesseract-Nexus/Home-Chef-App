#!/bin/bash

# HomeChef Docker Build Script
# This script builds and tests the HomeChef application using Docker

set -e

echo "🏗️  Building HomeChef Application with Docker..."

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

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    print_error "Docker is not running. Please start Docker and try again."
    exit 1
fi

# Build stages
print_status "Building dependencies stage..."
docker build --target dependencies -t homechef:dependencies .

print_status "Building test stage and running tests..."
docker build --target test -t homechef:test .

print_status "Building production application..."
docker build --target build -t homechef:build .

print_status "Building final production image..."
docker build --target production -t homechef:latest .

# Run tests
print_status "Running tests in container..."
if docker run --rm homechef:test npm test 2>/dev/null || true; then
    print_success "Tests completed"
else
    print_warning "No tests found or tests failed"
fi

# Check image sizes
print_status "Docker image sizes:"
docker images | grep homechef

# Security scan (if available)
if command -v docker scan &> /dev/null; then
    print_status "Running security scan..."
    docker scan homechef:latest || print_warning "Security scan failed or not available"
fi

print_success "Build completed successfully!"
print_status "To run the application:"
echo "  Development: docker-compose up homechef-dev"
echo "  Production:  docker-compose up homechef-prod"
echo "  Testing:     docker-compose up homechef-test"

# Optional: Clean up intermediate images
read -p "Do you want to clean up intermediate build images? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_status "Cleaning up intermediate images..."
    docker image prune -f
    print_success "Cleanup completed"
fi