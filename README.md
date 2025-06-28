# Learn English Vocabulary - Monorepo

Ứng dụng học từ vựng tiếng Anh với NestJS backend và NextJS frontend.

## 🚀 Tính năng

### Backend (NestJS)
- ✅ Authentication với JWT
- ✅ Quản lý người dùng
- ✅ Quản lý từ vựng
- ✅ Theo dõi tiến độ học tập
- ✅ API RESTful
- ✅ PostgreSQL database với TypeORM
- ✅ Validation và error handling

### Frontend (NextJS)
- ✅ Giao diện hiện đại với TailwindCSS
- ✅ Authentication system
- ✅ Dashboard với thống kê
- ✅ Trang học từ vựng tương tác
- ✅ State management với Zustand
- ✅ Form validation với React Hook Form
- ✅ Toast notifications

## 🛠 Công nghệ sử dụng

### Backend
- **NestJS** - Node.js framework
- **TypeORM** - ORM cho TypeScript
- **PostgreSQL** - Database
- **JWT** - Authentication
- **Passport** - Authentication middleware
- **Class Validator** - Validation

### Frontend
- **NextJS 14** - React framework
- **TypeScript** - Type safety
- **TailwindCSS** - Styling
- **Zustand** - State management
- **Axios** - HTTP client
- **React Hook Form** - Form handling
- **React Hot Toast** - Notifications

## 🏗 Cấu trúc project

```
learn-vocabulary-english/
├── apps/
│   ├── backend/          # NestJS API
│   └── frontend/         # NextJS app
├── packages/             # Shared packages (future)
└── package.json          # Root package.json
```

## 🚀 Cài đặt và chạy

### 1. Cài đặt dependencies

```bash
# Cài đặt dependencies cho toàn bộ project
npm install

# Hoặc cài đặt riêng cho từng app
npm install --workspace=@vocab/backend
npm install --workspace=@vocab/frontend
```

### 2. Cấu hình môi trường

```bash
# Copy file cấu hình mẫu
cp .env.example .env

# Chỉnh sửa file .env với thông tin database của bạn
```

### 3. Cài đặt PostgreSQL

```bash
# macOS với Homebrew
brew install postgresql
brew services start postgresql

# Tạo database
createdb vocabulary_db
```

### 4. Chạy ứng dụng

```bash
# Chạy cả backend và frontend cùng lúc
npm run dev

# Hoặc chạy riêng từng service
npm run dev:backend  # Backend chạy trên port 3001
npm run dev:frontend # Frontend chạy trên port 3000
```

## 📱 Sử dụng

1. **Đăng ký/Đăng nhập**: Truy cập http://localhost:3000
2. **Dashboard**: Xem thống kê và tiến độ học tập
3. **Học từ vựng**: Click "Bắt đầu học" để học từ vựng mới
4. **Ôn tập**: Click "Ôn tập" để ôn lại từ vựng đã học

## 🗃 Database Schema

### Users
- id, email, password, name, role, createdAt, updatedAt

### Vocabularies  
- id, word, meaning, pronunciation, example, level, partOfSpeech, createdAt, updatedAt

### UserVocabularies
- id, userId, vocabularyId, isLearned, correctCount, incorrectCount, lastReviewedAt, createdAt, updatedAt

## 📝 API Endpoints

### Authentication
- `POST /api/auth/register` - Đăng ký
- `POST /api/auth/login` - Đăng nhập

### User
- `GET /api/user/profile` - Lấy thông tin profile
- `GET /api/user/stats` - Lấy thống kê học tập
- `PUT /api/user/profile` - Cập nhật profile

### Vocabulary
- `GET /api/vocabulary` - Lấy danh sách từ vựng
- `GET /api/vocabulary/random` - Lấy từ vựng ngẫu nhiên
- `GET /api/vocabulary/progress` - Lấy tiến độ học tập
- `POST /api/vocabulary/progress` - Cập nhật tiến độ
- `POST /api/vocabulary` - Tạo từ vựng mới

## 🔧 Scripts có sẵn

```bash
# Development
npm run dev                 # Chạy cả backend và frontend
npm run dev:backend        # Chỉ chạy backend
npm run dev:frontend       # Chỉ chạy frontend

# Build
npm run build              # Build cả hai apps
npm run build:backend      # Build backend
npm run build:frontend     # Build frontend

# Production
npm start                  # Chạy production
npm run start:backend      # Chạy backend production
npm run start:frontend     # Chạy frontend production

# Testing & Linting
npm run test               # Chạy tests
npm run lint               # Lint code
```

## 🎯 Roadmap

- [ ] Thêm audio phát âm từ vựng
- [ ] Các loại bài tập đa dạng (multiple choice, fill in the blank)
- [ ] Hệ thống level và achievements
- [ ] Export/Import từ vựng
- [ ] PWA support
- [ ] Mobile app với React Native

## 🤝 Đóng góp

1. Fork project
2. Tạo branch mới (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add some amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Tạo Pull Request

## 📄 License

MIT License - xem file [LICENSE](LICENSE) để biết thêm chi tiết.
