#!/bin/bash

# Deployment script for Learn Vocabulary English
# Used by GitLab CI/CD pipeline

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() {
    echo -e "${BLUE}[DEPLOY]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Environment variables check
check_env() {
    local required_vars=(
        "CI_REGISTRY_IMAGE"
        "POSTGRES_PASSWORD"
        "JWT_SECRET"
    )

    for var in "${required_vars[@]}"; do
        if [ -z "${!var}" ]; then
            print_error "Required environment variable $var is not set"
            exit 1
        fi
    done
}

# Health check function
health_check() {
    local service=$1
    local url=$2
    local max_attempts=30
    local attempt=1

    print_status "Waiting for $service to be healthy..."

    while [ $attempt -le $max_attempts ]; do
        if curl -f -s "$url" > /dev/null 2>&1; then
            print_success "$service is healthy!"
            return 0
        fi

        echo -n "."
        sleep 2
        attempt=$((attempt + 1))
    done

    print_error "$service health check failed after $max_attempts attempts"
    return 1
}

# Main deployment function
deploy() {
    local environment=${1:-production}
    local image_tag=${2:-latest}

    print_status "Starting deployment to $environment environment..."
    print_status "Using image tag: $image_tag"

    # Check required environment variables
    check_env

    # Set environment-specific variables
    export IMAGE_TAG=$image_tag
    export COMPOSE_PROJECT_NAME="vocab-$environment"

    # Pull latest images
    print_status "Pulling Docker images..."
    docker-compose -f docker-compose.prod.yml pull

    # Stop existing containers
    print_status "Stopping existing containers..."
    docker-compose -f docker-compose.prod.yml down

    # Start new containers
    print_status "Starting new containers..."
    docker-compose -f docker-compose.prod.yml up -d

    # Wait for database to be ready
    print_status "Waiting for database to be ready..."
    sleep 15

    # Run database migrations
    print_status "Running database migrations..."
    docker-compose -f docker-compose.prod.yml exec -T backend npm run migration:run || {
        print_error "Migration failed"
        docker-compose -f docker-compose.prod.yml logs backend
        exit 1
    }

    # Health checks
    print_status "Performing health checks..."

    if ! health_check "Backend API" "http://localhost:3001/health"; then
        print_error "Backend health check failed"
        docker-compose -f docker-compose.prod.yml logs backend
        exit 1
    fi

    if ! health_check "Frontend" "http://localhost:3000"; then
        print_error "Frontend health check failed"
        docker-compose -f docker-compose.prod.yml logs frontend
        exit 1
    fi

    print_success "Deployment to $environment completed successfully!"
    print_status "Application is available at:"
    print_status "  Frontend: http://localhost:3000"
    print_status "  Backend API: http://localhost:3001"
}

# Rollback function
rollback() {
    local previous_tag=${1:-previous}

    print_status "Rolling back to image tag: $previous_tag"

    export IMAGE_TAG=$previous_tag

    # Stop current containers
    docker-compose -f docker-compose.prod.yml down

    # Start with previous images
    docker-compose -f docker-compose.prod.yml up -d

    # Health checks
    sleep 30
    if health_check "Backend API" "http://localhost:3001/health" &&
       health_check "Frontend" "http://localhost:3000"; then
        print_success "Rollback completed successfully!"
    else
        print_error "Rollback failed - manual intervention required"
        exit 1
    fi
}

# Show logs
logs() {
    local service=${1:-}

    if [ -z "$service" ]; then
        docker-compose -f docker-compose.prod.yml logs -f
    else
        docker-compose -f docker-compose.prod.yml logs -f "$service"
    fi
}

# Show status
status() {
    print_status "Deployment status:"
    docker-compose -f docker-compose.prod.yml ps

    print_status "Resource usage:"
    docker stats --no-stream
}

# Main script logic
case "${1:-help}" in
    deploy)
        deploy "$2" "$3"
        ;;
    rollback)
        rollback "$2"
        ;;
    logs)
        logs "$2"
        ;;
    status)
        status
        ;;
    *)
        echo "Usage: $0 {deploy|rollback|logs|status}"
        echo ""
        echo "Commands:"
        echo "  deploy [env] [tag]  Deploy application (default: production latest)"
        echo "  rollback [tag]      Rollback to previous version"
        echo "  logs [service]      Show logs"
        echo "  status              Show deployment status"
        echo ""
        echo "Examples:"
        echo "  $0 deploy production v1.2.3"
        echo "  $0 rollback previous"
        echo "  $0 logs backend"
        exit 1
        ;;
esac
