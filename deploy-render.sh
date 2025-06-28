#!/bin/bash

echo "🚀 Deploying Vocabulary Learning App to Render"
echo "=============================================="

# Check if render CLI is installed
if ! command -v render &> /dev/null; then
    echo "❌ Render CLI not found. Installing..."
    npm install -g @render/cli
fi

# Login to Render (if not already logged in)
echo "🔐 Checking Render authentication..."
if ! render whoami &> /dev/null; then
    echo "Please login to Render:"
    render login
fi

# Deploy using render.yaml
echo "📦 Deploying services from render.yaml..."
render deploy

echo ""
echo "✅ Deployment initiated!"
echo ""
echo "📋 Next steps:"
echo "1. Go to https://dashboard.render.com"
echo "2. Navigate to your vocabulary-backend service"
echo "3. Go to Environment tab"
echo "4. Add OPENAI_API_KEY with your actual API key"
echo "5. Redeploy the service after adding the API key"
echo ""
echo "🔗 Your services will be available at:"
echo "- Backend: https://vocabulary-backend-lm26.onrender.com"
echo "- Frontend: https://vocabulary-frontend-lm26.onrender.com"
