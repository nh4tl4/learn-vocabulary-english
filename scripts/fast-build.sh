#!/bin/bash

# Fast Build Script - Tối ưu cho development và testing
set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() {
    echo -e "${BLUE}[BUILD]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

# Configuration
CACHE_DIR=".build-cache"
BUILD_PARALLEL=${BUILD_PARALLEL:-true}

# Function to build with cache
build_with_cache() {
    local service=$1
    local dockerfile=$2

    print_status "Building $service with cache optimization..."

    # Create cache directory
    mkdir -p $CACHE_DIR

    # Build with BuildKit and cache mount
    DOCKER_BUILDKIT=1 docker build \
        --cache-from nh4tl5/vocabulary:${service}-latest \
        --build-arg BUILDKIT_INLINE_CACHE=1 \
        -f $dockerfile \
        -t nh4tl5/vocabulary:${service}-latest \
        -t nh4tl5/vocabulary:${service}-$(date +%Y%m%d) \
        .

    print_success "$service build completed!"
}

# Main build function
fast_build() {
    local component=${1:-"all"}

    print_status "Starting fast build process..."
    print_status "Parallel build: $BUILD_PARALLEL"

    case $component in
        "backend")
            build_with_cache "backend" "apps/backend/Dockerfile"
            ;;
        "frontend")
            build_with_cache "frontend" "apps/frontend/Dockerfile"
            ;;
        "all")
            if [ "$BUILD_PARALLEL" = "true" ]; then
                print_status "Building backend and frontend in parallel..."
                (build_with_cache "backend" "apps/backend/Dockerfile") &
                (build_with_cache "frontend" "apps/frontend/Dockerfile") &
                wait
            else
                build_with_cache "backend" "apps/backend/Dockerfile"
                build_with_cache "frontend" "apps/frontend/Dockerfile"
            fi
            ;;
        *)
            echo "Usage: $0 {backend|frontend|all}"
            exit 1
            ;;
    esac

    print_success "Fast build completed!"
}

# Clean cache function
clean_cache() {
    print_status "Cleaning build cache..."
    docker builder prune -f
    rm -rf $CACHE_DIR
    print_success "Cache cleaned!"
}

# Main script logic
case "${1:-all}" in
    "backend"|"frontend"|"all")
        fast_build "$1"
        ;;
    "clean")
        clean_cache
        ;;
    "help"|*)
        echo "Fast Build Script - Tối ưu tốc độ build"
        echo ""
        echo "Usage: $0 [COMMAND]"
        echo ""
        echo "Commands:"
        echo "  backend    Build backend only"
        echo "  frontend   Build frontend only"
        echo "  all        Build both (default, parallel)"
        echo "  clean      Clean build cache"
        echo "  help       Show this help"
        echo ""
        echo "Environment Variables:"
        echo "  BUILD_PARALLEL=false   Disable parallel builds"
        echo ""
        echo "Examples:"
        echo "  $0 all                 # Build both in parallel"
        echo "  $0 backend             # Build backend only"
        echo "  BUILD_PARALLEL=false $0 all  # Sequential build"
        ;;
esac
