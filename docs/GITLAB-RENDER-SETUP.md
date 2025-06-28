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

## ✅ Cách biết Deployment thành công

### 1. Kiểm tra GitLab Pipeline
1. Vào GitLab project → CI/CD → Pipelines
2. Pipeline status:
   - ✅ **Passed**: Deployment thành công
   - ❌ **Failed**: Deployment thất bại
   - 🟡 **Running**: Đang deploy
3. Click vào pipeline để xem chi tiết từng stage

### 📋 Cách đọc GitLab CI/CD Logs

#### ✅ Dấu hiệu deployment thành công:
```bash
# Kết thúc job
Job succeeded

# Hoặc nếu không có thay đổi
⏭️ No frontend changes, skipping deployment
⏭️ No backend changes, skipping deployment

# Cache được tạo thành công
Created cache main-protected...
Successfully extracted cache

# Docker image được pull thành công
Using docker image sha256:db192479f616473ecaab9dc2fa3c8b131b...
```

#### ❌ Dấu hiệu deployment thất bại:
```bash
# Lỗi khi deploy
ERROR: Deployment failed
Job failed

# Lỗi API call
curl: (22) The requested URL returned error: 400 Bad Request

# Timeout hoặc network error
ERROR: Job execution timeout
ERROR: Failed to pull docker image

# Git repository issues
fatal: Could not read from remote repository
```

#### 🔍 Phân tích logs của bạn:

**Log 1 - Frontend Job:**
- ✅ `Job succeeded` → **Deployment thành công**
- ✅ `⏭️ No frontend changes, skipping deployment` → **Smart deployment**
- ✅ `Created cache` → **Pipeline hoàn tất**

**Log 2 - Backend Job:**
- ✅ `Job succeeded` → **Deployment thành công**
- ✅ `⏭️ No backend changes, skipping deployment` → **Smart deployment**
- ✅ `Successfully extracted cache` → **Cache hoạt động tốt**
- ✅ Docker image pulled successfully → **Container environment OK**

#### ⚠️ Warnings có thể bỏ qua:
```bash
# Những warning này bình thường khi không có node_modules trong cache
WARNING: apps/backend/node_modules/: no matching files
WARNING: apps/frontend/node_modules/: no matching files
WARNING: .npm/: no matching files
```
Đây là warnings bình thường khi dependencies chưa được install hoặc không được cache.

#### 🏃‍♂️ Timeline thông thường:
```
1. Preparing environment (00:00-00:01)
2. Getting source from Git (00:01-00:02)  
3. Restoring cache (00:01)
4. Executing script (00:00-00:01)
5. Saving cache (00:01)
6. Cleanup (00:01)
```

#### 🎯 Smart Deployment Logic:
Hệ thống của bạn hoạt động thông minh:
- Chỉ deploy khi có thay đổi thực sự
- Skip deployment khi không cần thiết
- Cache dependencies để tăng tốc độ
- Sử dụng Docker containers để đảm bảo consistency

### 2. Kiểm tra Render Dashboard
1. Vào https://dashboard.render.com
2. Check service status:
   - 🟢 **Live**: Service đang chạy
   - 🔴 **Deploy Failed**: Deploy thất bại
   - 🟡 **Deploying**: Đang deploy
3. Click "View Logs" để xem deployment logs

### 3. Health Check Endpoints
```bash
# Kiểm tra backend
curl https://vocabulary-backend-lm26.onrender.com/api/health

# Response thành công:
# {"status":"ok","timestamp":"2025-06-29T..."}

# Kiểm tra frontend
curl -I https://vocabulary-frontend-lm26.onrender.com

# Response thành công: HTTP/2 200
```

### 4. Automated Notifications (Tùy chọn)
Nếu đã setup webhook notifications:

#### Slack:
- 🟢 Thông báo "✅ Deployment successful"
- 🔴 Thông báo "❌ Deployment failed"

#### Discord:
- Embed message với status và link service

### 5. GitLab Job Artifacts
- Deployment logs được lưu trong GitLab
- Click vào job → Browse artifacts
- Check file `deployment-status.txt`

### 6. Email Notifications
GitLab tự động gửi email khi:
- Pipeline failed
- Pipeline thành công (nếu enable)

## 🔍 Chi tiết Pipeline Stages

### Stage 1: Test & Build
```
✅ install-dependencies
✅ test-backend (nếu có thay đổi)
✅ test-frontend (nếu có thay đổi)
```

### Stage 2: Deploy
```
✅ deploy-backend
✅ deploy-frontend
```

### Stage 3: Verify
```
✅ health-check-backend
✅ health-check-frontend
✅ notify-success
```

## 📱 Real-time Monitoring

### 1. GitLab Pipeline Badge
Thêm vào README.md:
```markdown
[![Pipeline Status](https://gitlab.com/your-username/your-project/badges/main/pipeline.svg)](https://gitlab.com/your-username/your-project/-/pipelines)
```

### 2. Service Status Page
Tạo simple status page:
```javascript
// Check all services
const services = [
  { name: 'Backend', url: 'https://vocabulary-backend-lm26.onrender.com/api/health' },
  { name: 'Frontend', url: 'https://vocabulary-frontend-lm26.onrender.com' }
];

services.forEach(async service => {
  const status = await fetch(service.url);
  console.log(`${service.name}: ${status.ok ? '🟢 UP' : '🔴 DOWN'}`);
});
```

### 3. Logs Monitoring
- **Render Logs**: Xem trực tiếp trên Render dashboard
- **GitLab Logs**: Tải về và xem chi tiết trong GitLab CI/CD job logs

### 4. Third-party Monitoring Tools
- **Sentry**: Theo dõi lỗi và exceptions
- **Loggly**: Centralized log management
- **New Relic**: Application performance monitoring

### 5. Custom Monitoring Solutions
- Xây dựng dashboard tùy chỉnh với Grafana + Prometheus
- Sử dụng webhook để gửi dữ liệu về server riêng

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
