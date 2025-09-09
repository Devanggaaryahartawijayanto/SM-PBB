# Docker Commands for IPBB Project

.PHONY: help build up down logs clean

# Default target
help:
	@echo "Available commands:"
	@echo "  build     - Build all Docker images"
	@echo "  up        - Start all services"
	@echo "  down      - Stop all services"
	@echo "  logs      - View logs from all services"
	@echo "  clean     - Remove all containers, images, and volumes"
	@echo "  backend   - View backend logs"
	@echo "  frontend  - View frontend logs"
	@echo "  traefik   - View Traefik logs"

# Build all images
build:
	docker-compose build

# Start services
up:
	docker-compose up -d

# Stop all services
down:
	docker-compose down

# View logs from all services
logs:
	docker-compose logs -f

# View backend logs
backend:
	docker-compose logs -f backend

# View frontend logs
frontend:
	docker-compose logs -f frontend

# View Traefik logs
traefik:
	docker-compose logs -f traefik

# Clean up everything
clean:
	docker-compose down -v --rmi all --remove-orphans
	docker system prune -af

# Rebuild and restart
restart: down build up