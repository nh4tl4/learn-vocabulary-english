# GitLab CI/CD + Vercel Setup Guide

## GitLab Variables Setup

Go to your GitLab project → Settings → CI/CD → Variables and add:

### Required Variables:
```
# Backend (Render) - Keep existing
RENDER_API_KEY=your_render_api_key
RENDER_BACKEND_SERVICE_ID=your_backend_service_id
BACKEND_URL=https://your-backend.onrender.com

# Frontend (Vercel) - New
FRONTEND_URL=https://your-app.vercel.app
```

### Optional Variables:
```
# For notifications (optional)
SLACK_WEBHOOK_URL=your_slack_webhook_url
```

## Vercel Project Configuration

### 1. Root Directory Setting
In your Vercel project settings, set:
- **Root Directory**: `apps/frontend`
- **Framework Preset**: Next.js
- **Node.js Version**: 20.x

### 2. Environment Variables in Vercel
Add these in Vercel Dashboard → Project → Settings → Environment Variables:
```
NEXT_PUBLIC_API_URL=https://your-backend.onrender.com
NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=your-ga-id
NEXT_PUBLIC_SENTRY_DSN=your-sentry-dsn
```

### 3. Build Settings
Vercel should auto-detect these, but verify:
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm ci`

## Deploy Hook URL
Your current deploy hook:
```
https://api.vercel.com/v1/integrations/deploy/prj_p9p0pWrULpQD2enAxBxoCP3bs8st/Zllx4JLO3y
```

## How It Works

1. **Code Push**: Push to `main` or `develop` branch
2. **Change Detection**: Pipeline detects frontend/backend changes
3. **Testing**: Runs tests for changed components
4. **Deployment**: 
   - Backend → Render (if changed)
   - Frontend → Vercel (if changed)
5. **Health Check**: Verifies deployments are successful

## Manual Deployment
You can also trigger manual frontend deployment from GitLab:
- Go to CI/CD → Pipelines
- Click "Run Pipeline" 
- Select the `deploy-frontend-manual` job

## Branch Strategy
- `main` → Production deployment
- `develop` → Preview deployment
- Other branches → No auto-deployment

## Troubleshooting

### Common Issues:
1. **Deploy Hook Not Working**: Verify the hook URL is correct in Vercel
2. **Build Fails**: Check Node.js version and dependencies
3. **Environment Variables**: Ensure all required vars are set in both GitLab and Vercel

### Debug Commands:
```bash
# Test deploy hook manually
curl -X POST https://api.vercel.com/v1/integrations/deploy/prj_p9p0pWrULpQD2enAxBxoCP3bs8st/Zllx4JLO3y

# Check frontend build locally
cd apps/frontend
npm ci
npm run build
```
