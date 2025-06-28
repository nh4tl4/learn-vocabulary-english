#!/bin/bash

# Render.com deployment script
set -e

echo "🚀 Starting Render deployment..."

# Build backend
echo "📦 Building backend..."
docker build -f apps/backend/Dockerfile -t vocabulary-backend .

# Build frontend
echo "📦 Building frontend..."
docker build -f apps/frontend/Dockerfile -t vocabulary-frontend .

echo "✅ Build completed successfully!"
