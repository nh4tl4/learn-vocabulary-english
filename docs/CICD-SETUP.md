# GitLab CI/CD Setup Guide

## 📋 Tổng quan

GitLab CI/CD pipeline này sẽ tự động:
- ✅ Lint code (kiểm tra code style)
- ✅ Chạy tests (unit tests + e2e tests)
- ✅ Build Docker images
- ✅ Deploy lên staging/production
- ✅ Health checks sau deployment
- ✅ Rollback nếu cần thiết

## 🔧 Setup GitLab CI/CD

### 1. Cấu hình Variables trong GitLab

Vào **Project Settings > CI/CD > Variables** và thêm các biến sau:

#### Required Variables (Bắt buộc):
```bash
# Database
POSTGRES_PASSWORD = "your-secure-password"     # Type: Variable, Protected: ✓, Masked: ✓

# Authentication
JWT_SECRET = "your-jwt-secret-key"             # Type: Variable, Protected: ✓, Masked: ✓

# Deployment Servers
STAGING_SERVER = "staging.yourdomain.com"      # Type: Variable, Protected: ✓
STAGING_USER = "deploy"                        # Type: Variable, Protected: ✓

PRODUCTION_SERVER = "yourdomain.com"           # Type: Variable, Protected: ✓
PRODUCTION_USER = "deploy"                     # Type: Variable, Protected: ✓
PRODUCTION_DOMAIN = "https://yourdomain.com"   # Type: Variable, Protected: ✓

# SSH Key for server access
SSH_PRIVATE_KEY = [Your private key content]   # Type: File, Protected: ✓
```

#### Optional Variables:
```bash
NEXT_PUBLIC_API_URL = "https://api.yourdomain.com"  # Frontend API URL
SLACK_WEBHOOK_URL = "https://hooks.slack.com/..."   # Slack notifications
```

### 2. Chuẩn bị Server

#### Cài đặt Docker trên server:
```bash
# Ubuntu/Debian
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Cài Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

#### Tạo thư mục deploy:
```bash
sudo mkdir -p /opt/learn-vocabulary-english
sudo chown $USER:$USER /opt/learn-vocabulary-english
cd /opt/learn-vocabulary-english

# Copy docker-compose.prod.yml lên server
```

#### Setup SSH Key:
```bash
# Trên local machine, tạo SSH key
ssh-keygen -t ed25519 -C "gitlab-ci@yourdomain.com"

# Copy public key lên server
ssh-copy-id deploy@yourdomain.com

# Copy private key vào GitLab CI/CD Variables (SSH_PRIVATE_KEY)
```

## 🚀 Sử dụng CI/CD Pipeline

### Pipeline Stages:

1. **Lint Stage**: Kiểm tra code style
   - `lint:backend` - ESLint cho NestJS
   - `lint:frontend` - ESLint cho Next.js

2. **Test Stage**: Chạy tests
   - `test:backend` - Unit tests + E2E tests
   - `test:frontend` - Jest tests

3. **Build Stage**: Build Docker images
   - `build:backend` - Build backend image
   - `build:frontend` - Build frontend image

4. **Deploy Stage**: Deploy ứng dụng
   - `deploy:staging` - Deploy lên staging (branch: develop)
   - `deploy:production` - Deploy lên production (branch: main/master)

### Workflow:

```bash
# Development workflow
git checkout develop
git add .
git commit -m "feat: new feature"
git push origin develop
# → Tự động deploy lên staging

# Production workflow
git checkout main
git merge develop
git push origin main
# → Manual deploy lên production (click nút Deploy trong GitLab)
```

## 🔄 Deployment Commands

### Sử dụng script deploy.sh:
```bash
# Deploy với tag cụ thể
./scripts/deploy.sh deploy production v1.2.3

# Rollback về version trước
./scripts/deploy.sh rollback previous

# Xem logs
./scripts/deploy.sh logs backend

# Kiểm tra status
./scripts/deploy.sh status
```

### Manual deployment trên server:
```bash
cd /opt/learn-vocabulary-english

# Set environment variables
export CI_REGISTRY_IMAGE="registry.gitlab.com/your-username/learn-vocabulary-english"
export POSTGRES_PASSWORD="your-password"
export JWT_SECRET="your-jwt-secret"

# Deploy
docker-compose -f docker-compose.prod.yml pull
docker-compose -f docker-compose.prod.yml up -d

# Run migrations
docker-compose -f docker-compose.prod.yml exec backend npm run migration:run
```

## 📊 Monitoring

### Health Checks:
- Backend: `http://your-domain:3001/health`
- Frontend: `http://your-domain:3000`
- Database: Tự động check trong Docker Compose

### Logs:
```bash
# Xem logs tất cả services
docker-compose -f docker-compose.prod.yml logs -f

# Xem logs service cụ thể
docker-compose -f docker-compose.prod.yml logs -f backend
docker-compose -f docker-compose.prod.yml logs -f frontend
```

## 🔒 Security Best Practices

1. **Protect sensitive variables** trong GitLab CI/CD
2. **Use non-root users** trong Docker containers
3. **SSH key rotation** định kỳ
4. **HTTPS/SSL** cho production
5. **Firewall rules** cho database ports
6. **Regular security updates** cho server

## 🚨 Troubleshooting

### Pipeline fails:
```bash
# Check GitLab CI/CD logs
# Verify environment variables
# Check server SSH access
```

### Deployment fails:
```bash
# Check server resources
docker system df
docker system prune -f

# Check logs
./scripts/deploy.sh logs

# Manual rollback
./scripts/deploy.sh rollback
```

### Database issues:
```bash
# Check database connection
docker-compose -f docker-compose.prod.yml exec postgres psql -U postgres -d vocabulary_db

# Run migrations manually
docker-compose -f docker-compose.prod.yml exec backend npm run migration:run
```

## 📞 Support

Nếu gặp vấn đề với CI/CD pipeline, hãy kiểm tra:
1. GitLab CI/CD Variables
2. Server SSH access
3. Docker service status
4. Available disk space
5. Network connectivity
