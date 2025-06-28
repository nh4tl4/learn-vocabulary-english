# Hướng dẫn Deploy lên Render.com

## 🚀 Các bước deploy:

### 1. Chuẩn bị GitLab Repository
- Đảm bảo code đã push lên GitLab
- File `render.yaml` đã có trong root directory

### 2. Tạo tài khoản Render.com
- Truy cập https://render.com
- Đăng ký tài khoản miễn phí
- Connect với GitLab account

### 3. Deploy từ GitLab
**Option A: Sử dụng render.yaml (Recommended)**
1. Vào Render Dashboard
2. Click "New" → "Blueprint"
3. Connect GitLab repository
4. Chọn branch `main`
5. Render sẽ tự động đọc `render.yaml` và tạo services

**Option B: Manual Setup**
1. Tạo PostgreSQL Database:
   - New → PostgreSQL
   - Name: `vocabulary-postgres`
   - Plan: Free

2. Tạo Backend Service:
   - New → Web Service
   - Connect GitLab repo
   - Build Command: `docker build -f apps/backend/Dockerfile .`
   - Start Command: Để trống (dùng CMD trong Dockerfile)
   - Environment Variables: Xem section dưới

3. Tạo Frontend Service:
   - New → Web Service  
   - Connect GitLab repo
   - Build Command: `docker build -f apps/frontend/Dockerfile .`
   - Start Command: Để trống
   - Environment Variables: Xem section dưới

### 4. Environment Variables

**Backend Service:**
```
NODE_ENV=production
JWT_SECRET=[auto-generate]
PORT=3000
```

**Frontend Service:**
```
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://[backend-service-url]
PORT=3000
```

**Database sẽ tự động inject:**
- DB_HOST
- DB_PORT  
- DB_USERNAME
- DB_PASSWORD
- DB_NAME

### 5. Health Checks
- Backend: `/health`
- Frontend: `/` (homepage)

### 6. SSL & Custom Domain
- Render tự động cung cấp SSL
- Free subdomain: `your-app.onrender.com`
- Có thể add custom domain (paid plan)

## 💰 Chi phí:
- **Database**: Free (PostgreSQL với limit)
- **Web Services**: Free tier với sleep sau 15 phút không hoạt động
- **Upgrade**: $7/tháng cho mỗi service để tránh sleep

## 🔧 Troubleshooting:
1. **Build fails**: Check Dockerfile paths
2. **Database connection**: Đảm bảo SSL enabled
3. **Frontend không connect backend**: Check NEXT_PUBLIC_API_URL
4. **Service sleep**: Upgrade to paid plan

## 📝 URLs sau khi deploy:
- Frontend: `https://vocabulary-frontend.onrender.com`
- Backend: `https://vocabulary-backend.onrender.com`
- Database: Internal connection only
