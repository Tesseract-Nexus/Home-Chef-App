# Makefile for HomeChef Webhook Service

# Variables
APP_NAME=webhook-service
DOCKER_IMAGE=homechef/$(APP_NAME)
VERSION=latest
DOCKER_COMPOSE_FILE=docker-compose.yml

# Go variables
GOCMD=go
GOBUILD=$(GOCMD) build
GOCLEAN=$(GOCMD) clean
GOTEST=$(GOCMD) test
GOGET=$(GOCMD) get
GOMOD=$(GOCMD) mod
BINARY_NAME=main

# Build the application
build:
	$(GOBUILD) -o $(BINARY_NAME) -v .

# Run the application
run:
	$(GOBUILD) -o $(BINARY_NAME) -v .
	./$(BINARY_NAME)

# Run with hot reload (requires air: go install github.com/cosmtrek/air@latest)
dev:
	air

# Clean build files
clean:
	$(GOCLEAN)
	rm -f $(BINARY_NAME)

# Run tests
test:
	$(GOTEST) -v ./...

# Run tests with coverage
test-coverage:
	$(GOTEST) -v -coverprofile=coverage.out ./...
	$(GOCMD) tool cover -html=coverage.out

# Download dependencies
deps:
	$(GOMOD) download
	$(GOMOD) verify

# Update dependencies
deps-update:
	$(GOMOD) tidy
	$(GOGET) -u ./...

# Security scan
security:
	gosec ./...

# Lint code
lint:
	golangci-lint run

# Format code
fmt:
	$(GOCMD) fmt ./...

# Vet code
vet:
	$(GOCMD) vet ./...

# Docker commands
docker-build:
	docker build -t $(DOCKER_IMAGE):$(VERSION) .

docker-run:
	docker run -p 8080:8080 $(DOCKER_IMAGE):$(VERSION)

docker-push:
	docker push $(DOCKER_IMAGE):$(VERSION)

# Docker Compose commands
compose-up:
	docker-compose -f $(DOCKER_COMPOSE_FILE) up -d

compose-down:
	docker-compose -f $(DOCKER_COMPOSE_FILE) down

compose-logs:
	docker-compose -f $(DOCKER_COMPOSE_FILE) logs -f

compose-build:
	docker-compose -f $(DOCKER_COMPOSE_FILE) build

compose-restart:
	docker-compose -f $(DOCKER_COMPOSE_FILE) restart

# Database commands
db-migrate:
	migrate -path migrations -database "postgres://postgres:postgres@localhost:5432/webhook_service?sslmode=disable\" up

db-migrate-down:
	migrate -path migrations -database "postgres://postgres:postgres@localhost:5432/webhook_service?sslmode=disable\" down

db-reset:
	migrate -path migrations -database "postgres://postgres:postgres@localhost:5432/webhook_service?sslmode=disable\" drop

# Generate swagger docs (requires swag: go install github.com/swaggo/swag/cmd/swag@latest)
swagger:
	swag init -g main.go

# Run all checks
check: fmt vet lint test

# Setup development environment
setup:
	$(GOMOD) download
	$(GOMOD) verify
	@echo "Installing development tools..."
	go install github.com/cosmtrek/air@latest
	go install github.com/swaggo/swag/cmd/swag@latest
	go install github.com/golangci/golangci-lint/cmd/golangci-lint@latest
	go install github.com/securecodewarrior/gosec/v2/cmd/gosec@latest
	@echo "Development environment setup complete!"

# Help
help:
	@echo "Available commands:"
	@echo "  build          - Build the application"
	@echo "  run            - Run the application"
	@echo "  dev            - Run with hot reload"
	@echo "  clean          - Clean build files"
	@echo "  test           - Run tests"
	@echo "  test-coverage  - Run tests with coverage"
	@echo "  deps           - Download dependencies"
	@echo "  deps-update    - Update dependencies"
	@echo "  security       - Run security scan"
	@echo "  lint           - Lint code"
	@echo "  fmt            - Format code"
	@echo "  vet            - Vet code"
	@echo "  docker-build   - Build Docker image"
	@echo "  docker-run     - Run Docker container"
	@echo "  compose-up     - Start services with docker-compose"
	@echo "  compose-down   - Stop services"
	@echo "  swagger        - Generate swagger docs"
	@echo "  check          - Run all code checks"
	@echo "  setup          - Setup development environment"
	@echo "  help           - Show this help"

.PHONY: build run dev clean test test-coverage deps deps-update security lint fmt vet docker-build docker-run docker-push compose-up compose-down compose-logs compose-build compose-restart db-migrate db-migrate-down db-reset swagger check setup help