# Setup GitLab CI/CD + Render Integration

## 🔧 Bước 1: Lấy thông tin từ Render

### 1.1 Service IDs
1. Vào https://dashboard.render.com
2. Click vào service `vocabulary-backend`
3. URL sẽ có dạng: `https://dashboard.render.com/web/srv-XXXXXXXXXX`
4. Copy `srv-XXXXXXXXXX` (đây là BACKEND_SERVICE_ID)
5. Làm tương tự với `vocabulary-frontend`

### 1.2 Render API Key
1. Vào Account Settings → API Keys
2. Click "Create API Key"
3. Copy API key

## 🚀 Bước 2: Setup GitLab Variables

Vào GitLab project → Settings → CI/CD → Variables, thêm:

### Required Variables:
```
RENDER_API_KEY = rnd_xxxxxxxxxxxxxxxxxxxxxxxx
RENDER_BACKEND_SERVICE_ID = srv-xxxxxxxxxx
RENDER_FRONTEND_SERVICE_ID = srv-yyyyyyyyyy
BACKEND_URL = https://vocabulary-backend-lm26.onrender.com
FRONTEND_URL = https://vocabulary-frontend-lm26.onrender.com
```

### Optional (cho notifications):
```
SLACK_WEBHOOK_URL = https://hooks.slack.com/...
DISCORD_WEBHOOK_URL = https://discord.com/api/webhooks/...
```

## 🎯 Bước 3: Cách hoạt động

### Khi push code:
1. **Change Detection**: Tự động phát hiện thay đổi
2. **Testing**: Chạy tests cho service bị thay đổi
3. **Deployment**: Deploy chỉ service cần thiết
4. **Health Check**: Kiểm tra service hoạt động
5. **Notification**: Báo cáo kết quả

### Test Pipeline:
```bash
# Test backend only
echo "console.log('test');" >> apps/backend/src/app.controller.ts
git add apps/backend/
git commit -m "Test backend deploy"
git push

# Test frontend only  
echo "// test" >> apps/frontend/src/app/page.tsx
git add apps/frontend/
git commit -m "Test frontend deploy"
git push
```

## 📊 Monitoring

- **GitLab**: CI/CD → Pipelines
- **Render**: Dashboard → Services → Logs
- **Health Checks**: 
  - Backend: https://vocabulary-backend-lm26.onrender.com/api/health
  - Frontend: https://vocabulary-frontend-lm26.onrender.com

## 🛠️ Troubleshooting

### Deployment failed?
1. Kiểm tra GitLab pipeline logs
2. Kiểm tra Render service logs
3. Verify API key và Service IDs
4. Check health endpoints

### Manual trigger deployment:
```bash
# Trigger qua API
curl -X POST \
  -H "Authorization: Bearer $RENDER_API_KEY" \
  "https://api.render.com/v1/services/$SERVICE_ID/deploys"
```
