#!/bin/bash

# Script để setup GitLab CI/CD + Render integration
echo "🚀 Setting up GitLab CI/CD + Render Integration"
echo "=============================================="

# Check if required files exist
if [ ! -f ".gitlab-ci.yml" ]; then
    echo "❌ .gitlab-ci.yml not found!"
    exit 1
fi

if [ ! -f "render.yaml" ]; then
    echo "❌ render.yaml not found!"
    exit 1
fi

echo "✅ Configuration files found"

# Validate render.yaml
echo "🔍 Validating render.yaml..."
if grep -q "buildFilter" render.yaml; then
    echo "✅ Build filters configured"
else
    echo "⚠️ Build filters not found in render.yaml"
fi

# Check GitLab project settings
echo ""
echo "📋 Next steps:"
echo "1. Go to GitLab project → Settings → CI/CD → Variables"
echo "2. Add the following variables:"
echo "   - RENDER_API_KEY"
echo "   - RENDER_BACKEND_SERVICE_ID"
echo "   - RENDER_FRONTEND_SERVICE_ID"
echo "   - BACKEND_URL"
echo "   - FRONTEND_URL"
echo ""
echo "3. Get Service IDs from Render Dashboard:"
echo "   https://dashboard.render.com"
echo ""
echo "4. Test pipeline by pushing changes to main branch"

# Test local build
echo ""
echo "🧪 Testing local builds..."

# Test backend
if [ -d "apps/backend" ]; then
    echo "Testing backend..."
    cd apps/backend
    if npm run build > /dev/null 2>&1; then
        echo "✅ Backend build OK"
    else
        echo "❌ Backend build failed"
    fi
    cd ../..
fi

# Test frontend
if [ -d "apps/frontend" ]; then
    echo "Testing frontend..."
    cd apps/frontend
    if npm run build > /dev/null 2>&1; then
        echo "✅ Frontend build OK"
    else
        echo "❌ Frontend build failed"
    fi
    cd ../..
fi

echo ""
echo "🎉 Setup completed! Check docs/GITLAB-RENDER-SETUP.md for detailed instructions."
