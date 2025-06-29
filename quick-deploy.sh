#!/bin/bash

# Quick Build and Deploy Script
set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
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

print_status "🚀 Quick build and deploy process started..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "Please run this script from the project root directory"
    exit 1
fi

# Build and push to git
print_status "📝 Adding changes to git..."
git add .

# Commit with timestamp
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')
git commit -m "Update: Simplified topics page - $TIMESTAMP" || {
    print_status "No changes to commit"
}

print_status "⬆️ Pushing to remote repository..."
git push origin main || git push origin master

print_success "✅ Code pushed successfully!"
print_status "🔄 Render will automatically deploy the changes in a few minutes"
print_status "🌐 Check your app at: https://vocabulary-frontend.onrender.com/topics"

echo ""
print_success "🎉 Deploy process completed!"

