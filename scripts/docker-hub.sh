#!/bin/bash

# Docker Hub Build and Push Script
# Build and push both backend and frontend to single Docker Hub repository

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Configuration
DOCKER_HUB_USERNAME=${DOCKER_HUB_USERNAME:-"nh4tl5"}
REPOSITORY_NAME="vocabulary"
VERSION=${VERSION:-"latest"}

# Function to check if Docker is running
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker first."
        exit 1
    fi
}

# Function to login to Docker Hub
docker_login() {
    print_status "Logging into Docker Hub..."
    if ! docker login; then
        print_error "Failed to login to Docker Hub"
        exit 1
    fi
    print_success "Successfully logged into Docker Hub"
}

# Function to build and push backend
build_push_backend() {
    print_status "Building backend Docker image..."

    docker build \
        -f apps/backend/Dockerfile \
        -t ${DOCKER_HUB_USERNAME}/${REPOSITORY_NAME}:backend-${VERSION} \
        -t ${DOCKER_HUB_USERNAME}/${REPOSITORY_NAME}:backend-latest \
        .

    print_status "Pushing backend image to Docker Hub..."
    docker push ${DOCKER_HUB_USERNAME}/${REPOSITORY_NAME}:backend-${VERSION}
    docker push ${DOCKER_HUB_USERNAME}/${REPOSITORY_NAME}:backend-latest

    print_success "Backend image pushed successfully!"
}

# Function to build and push frontend
build_push_frontend() {
    print_status "Building frontend Docker image..."

    docker build \
        -f apps/frontend/Dockerfile \
        -t ${DOCKER_HUB_USERNAME}/${REPOSITORY_NAME}:frontend-${VERSION} \
        -t ${DOCKER_HUB_USERNAME}/${REPOSITORY_NAME}:frontend-latest \
        .

    print_status "Pushing frontend image to Docker Hub..."
    docker push ${DOCKER_HUB_USERNAME}/${REPOSITORY_NAME}:frontend-${VERSION}
    docker push ${DOCKER_HUB_USERNAME}/${REPOSITORY_NAME}:frontend-latest

    print_success "Frontend image pushed successfully!"
}

# Function to show image info
show_images() {
    print_status "Docker images created:"
    docker images | grep "${DOCKER_HUB_USERNAME}/${REPOSITORY_NAME}"
}

# Function to clean local images
clean_images() {
    print_warning "Cleaning local images..."
    docker rmi $(docker images "${DOCKER_HUB_USERNAME}/${REPOSITORY_NAME}" -q) 2>/dev/null || true
    print_success "Local images cleaned"
}

# Main build and push function
build_and_push() {
    local component=${1:-"all"}

    print_status "Starting Docker Hub build and push process..."
    print_status "Username: ${DOCKER_HUB_USERNAME}"
    print_status "Repository: ${REPOSITORY_NAME}"
    print_status "Version: ${VERSION}"

    check_docker
    docker_login

    case $component in
        "backend")
            build_push_backend
            ;;
        "frontend")
            build_push_frontend
            ;;
        "all")
            build_push_backend
            build_push_frontend
            ;;
        *)
            print_error "Invalid component: $component. Use 'backend', 'frontend', or 'all'"
            exit 1
            ;;
    esac

    show_images

    print_success "All images pushed to Docker Hub successfully!"
    print_status "Repository: https://hub.docker.com/r/${DOCKER_HUB_USERNAME}/${REPOSITORY_NAME}"
}

# Help function
show_help() {
    echo "Docker Hub Build and Push Script"
    echo ""
    echo "Usage: $0 [COMMAND] [OPTIONS]"
    echo ""
    echo "Commands:"
    echo "  build [component]  Build and push images (backend|frontend|all)"
    echo "  clean             Clean local Docker images"
    echo "  images            Show created images"
    echo "  help              Show this help"
    echo ""
    echo "Environment Variables:"
    echo "  DOCKER_HUB_USERNAME  Your Docker Hub username"
    echo "  VERSION              Image version tag (default: latest)"
    echo ""
    echo "Examples:"
    echo "  DOCKER_HUB_USERNAME=myusername $0 build all"
    echo "  VERSION=v1.0.0 $0 build backend"
    echo "  $0 build frontend"
    echo ""
    echo "Image Tags Created:"
    echo "  ${DOCKER_HUB_USERNAME}/${REPOSITORY_NAME}:backend-latest"
    echo "  ${DOCKER_HUB_USERNAME}/${REPOSITORY_NAME}:frontend-latest"
    echo "  ${DOCKER_HUB_USERNAME}/${REPOSITORY_NAME}:backend-v1.0.0"
    echo "  ${DOCKER_HUB_USERNAME}/${REPOSITORY_NAME}:frontend-v1.0.0"
}

# Main script logic
case "${1:-help}" in
    build)
        build_and_push "$2"
        ;;
    clean)
        clean_images
        ;;
    images)
        show_images
        ;;
    help|*)
        show_help
        ;;
esac
