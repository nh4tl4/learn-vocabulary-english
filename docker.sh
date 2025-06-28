#!/bin/bash

# Learn Vocabulary English - Docker Management Script

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

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if Docker is running
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker first."
        exit 1
    fi
}

# Function to build and start the application
start() {
    print_status "Starting Learn Vocabulary English application..."
    check_docker

    print_status "Building and starting services..."
    docker-compose up -d --build

    print_status "Waiting for services to be ready..."
    sleep 10

    print_status "Running database migrations..."
    docker exec vocab-backend npm run migration:run || print_warning "Migration failed or already applied"

    print_success "Application started successfully!"
    print_status "Frontend: http://localhost:3000"
    print_status "Backend API: http://localhost:3001"
    print_status "Database: localhost:5432"
}

# Function to stop the application
stop() {
    print_status "Stopping Learn Vocabulary English application..."
    docker-compose down
    print_success "Application stopped successfully!"
}

# Function to restart the application
restart() {
    print_status "Restarting Learn Vocabulary English application..."
    stop
    start
}

# Function to view logs
logs() {
    if [ -z "$1" ]; then
        print_status "Showing logs for all services..."
        docker-compose logs -f
    else
        print_status "Showing logs for $1..."
        docker-compose logs -f "$1"
    fi
}

# Function to clean up
clean() {
    print_warning "This will remove all containers and volumes. Are you sure? (y/N)"
    read -r response
    if [[ "$response" =~ ^[Yy]$ ]]; then
        print_status "Cleaning up..."
        docker-compose down -v --remove-orphans
        docker system prune -f
        print_success "Cleanup completed!"
    else
        print_status "Cleanup cancelled."
    fi
}

# Function to show status
status() {
    print_status "Service status:"
    docker-compose ps
}

# Function to show help
help() {
    echo "Learn Vocabulary English - Docker Management"
    echo ""
    echo "Usage: ./docker.sh [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  start     Build and start the application"
    echo "  stop      Stop the application"
    echo "  restart   Restart the application"
    echo "  logs      Show logs (optionally specify service: frontend|backend|postgres)"
    echo "  status    Show service status"
    echo "  clean     Remove all containers and volumes"
    echo "  help      Show this help message"
    echo ""
    echo "Examples:"
    echo "  ./docker.sh start"
    echo "  ./docker.sh logs backend"
    echo "  ./docker.sh restart"
}

# Main script logic
case "${1:-help}" in
    start)
        start
        ;;
    stop)
        stop
        ;;
    restart)
        restart
        ;;
    logs)
        logs "$2"
        ;;
    status)
        status
        ;;
    clean)
        clean
        ;;
    help|*)
        help
        ;;
esac
