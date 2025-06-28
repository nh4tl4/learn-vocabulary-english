# Deployment Guide - Render

## Quick Deploy

Chạy script tự động:
```bash
./deploy-render.sh
```

## Manual Deploy Steps

### 1. Cài đặt Render CLI
```bash
npm install -g @render/cli
```

### 2. Login vào Render
```bash
render login
```

### 3. Deploy services
```bash
render deploy
```

### 4. Thiết lập Environment Variables

Sau khi deploy, bạn cần thêm OPENAI_API_KEY:

1. Vào https://dashboard.render.com
2. Chọn service `vocabulary-backend`
3. Vào tab **Environment**
4. Thêm biến môi trường:
   - **Key**: `OPENAI_API_KEY`
   - **Value**: API key của bạn từ OpenAI
5. Click **Save Changes**
6. Service sẽ tự động redeploy

## Service URLs

- **Backend**: https://vocabulary-backend-lm26.onrender.com
- **Frontend**: https://vocabulary-frontend-lm26.onrender.com
- **Health Check**: https://vocabulary-backend-lm26.onrender.com/api/health

## Troubleshooting

### Build Failed
- Kiểm tra logs trong Render dashboard
- Đảm bảo tất cả dependencies được install đúng

### Service không start
- Kiểm tra PORT environment variable
- Verify health check endpoint hoạt động

### Database issues
- SQLite database sẽ được tạo tự động
- Migrations sẽ chạy khi start service

## Development vs Production

### Development
```bash
# Backend
cd apps/backend && npm run dev

# Frontend  
cd apps/frontend && npm run dev
```

### Production Build Test
```bash
# Backend
cd apps/backend && npm run build && npm run start:prod

# Frontend
cd apps/frontend && npm run build && npm start
```
