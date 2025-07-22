.PHONY: build run test clean docker-build docker-run docker-stop

# Go parameters
GOCMD=go
GOBUILD=$(GOCMD) build
GOCLEAN=$(GOCMD) clean
GOTEST=$(GOCMD) test
GOGET=$(GOCMD) get
GOMOD=$(GOCMD) mod
BINARY_NAME=messaging-service
BINARY_UNIX=$(BINARY_NAME)_unix

# Build the application
build:
	$(GOBUILD) -o $(BINARY_NAME) -v ./

# Run the application
run:
	$(GOBUILD) -o $(BINARY_NAME) -v ./
	./$(BINARY_NAME)

# Run with hot reload (requires air: go install github.com/air-verse/air@latest)
dev:
	air

# Test the application
test:
	$(GOTEST) -v ./...

# Clean build artifacts
clean:
	$(GOCLEAN)
	rm -f $(BINARY_NAME)
	rm -f $(BINARY_UNIX)

# Download dependencies
deps:
	$(GOMOD) download
	$(GOMOD) tidy

# Cross compilation for Linux
build-linux:
	CGO_ENABLED=0 GOOS=linux GOARCH=amd64 $(GOBUILD) -o $(BINARY_UNIX) -v

# Generate SSL certificates for local development
gen-certs:
	mkdir -p certs
	openssl req -x509 -newkey rsa:4096 -keyout certs/key.pem -out certs/cert.pem -days 365 -nodes -subj "/C=IN/ST=State/L=City/O=HomeChef/CN=localhost"

# Docker commands
docker-build:
	docker build -t messaging-service:latest .

docker-run:
	docker-compose up -d

docker-stop:
	docker-compose down

docker-logs:
	docker-compose logs -f messaging-service

# Format code
fmt:
	go fmt ./...

# Lint code (requires golangci-lint)
lint:
	golangci-lint run

# Security scan (requires gosec)
security:
	gosec ./...

# Generate Swagger documentation (requires swag)
swagger:
	swag init -g main.go

# WebSocket test
ws-test:
	echo "WebSocket available at ws://localhost:8091/ws"

# Full setup for development
setup: deps gen-certs docker-run
	echo "Messaging service setup complete!"
	echo "PostgreSQL: localhost:5432"
	echo "Redis: localhost:6379"
	echo "WebSocket: ws://localhost:8091/ws"
	echo "API: http://localhost:8091/v1"