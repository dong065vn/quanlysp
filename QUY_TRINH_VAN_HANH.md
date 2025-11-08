# 📋 QUY TRÌNH VẬN HÀNH DỰ ÁN QUẢN LÝ SẢN PHẨM

> Tài liệu hướng dẫn chi tiết về quy trình vận hành, phát triển và triển khai hệ thống quản lý sản phẩm.

**Phiên bản:** 1.0
**Cập nhật lần cuối:** 2025-11-08

---

## 📑 MỤC LỤC

1. [Tổng quan dự án](#1-tổng-quan-dự-án)
2. [Yêu cầu hệ thống](#2-yêu-cầu-hệ-thống)
3. [Thiết lập môi trường phát triển](#3-thiết-lập-môi-trường-phát-triển)
4. [Cấu hình Google Drive Sync](#4-cấu-hình-google-drive-sync-tùy-chọn)
5. [Quy trình làm việc hàng ngày](#5-quy-trình-làm-việc-hàng-ngày)
6. [Quy trình phát triển tính năng](#6-quy-trình-phát-triển-tính-năng)
7. [Triển khai Production](#7-triển-khai-production)
8. [Bảo trì và nâng cấp](#8-bảo-trì-và-nâng-cấp)
9. [Xử lý sự cố](#9-xử-lý-sự-cố)
10. [Checklist vận hành](#10-checklist-vận-hành)

---

## 1. TỔNG QUAN DỰ ÁN

### 1.1. Giới thiệu

**Product Management System** là hệ thống quản lý sản phẩm chuyên nghiệp với giao diện spreadsheet-like, giúp quản lý thông tin sản phẩm, hình ảnh, liên kết và trạng thái công khai một cách hiệu quả.

### 1.2. Tính năng chính

- ✅ **CRUD Operations**: Thêm, sửa, xóa sản phẩm
- ✅ **Spreadsheet View**: Giao diện bảng biểu giống Excel/Google Sheets
- ✅ **Import/Export**: Nhập/xuất dữ liệu Excel
- ✅ **Google Drive Sync**: Đồng bộ dữ liệu với Google Drive
- ✅ **Multi-status**: Quản lý trạng thái Published, Draft, Archived, Scheduled, Private
- ✅ **Offline Support**: Hoạt động offline với LocalStorage

### 1.3. Tech Stack

- **Frontend**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **UI Components**: Lucide React (icons)
- **Data Table**: TanStack Table
- **Storage**: LocalStorage + Google Drive API
- **Excel**: SheetJS (xlsx)

### 1.4. Cấu trúc thư mục

```
quanlysp/
├── product-manager/              # Ứng dụng chính
│   ├── src/
│   │   ├── components/          # React components
│   │   ├── services/            # Business logic & APIs
│   │   ├── types/               # TypeScript types
│   │   ├── App.tsx              # Main component
│   │   └── main.tsx             # Entry point
│   ├── public/                  # Static assets
│   ├── .env.example             # Environment variables template
│   ├── package.json             # Dependencies
│   └── vite.config.ts           # Vite config
├── WORKFLOW.md                  # Quy trình Google Drive
├── GOOGLE_DRIVE_SETUP.md        # Hướng dẫn setup Google Drive
├── DEPLOYMENT.md                # Hướng dẫn deploy Vercel
└── TROUBLESHOOTING.md           # Xử lý sự cố
```

---

## 2. YÊU CẦU HỆ THỐNG

### 2.1. Yêu cầu phần cứng

**Tối thiểu:**
- CPU: 2 cores
- RAM: 4GB
- Ổ cứng: 500MB trống

**Khuyến nghị:**
- CPU: 4 cores
- RAM: 8GB+
- SSD: 1GB trống

### 2.2. Yêu cầu phần mềm

**Bắt buộc:**
- Node.js: >= 18.0.0
- npm: >= 9.0.0 hoặc yarn >= 1.22.0
- Git: >= 2.30.0

**Tùy chọn:**
- VS Code (hoặc IDE tương đương)
- Google Chrome (khuyến nghị cho testing)

### 2.3. Kiểm tra yêu cầu

```bash
# Kiểm tra phiên bản
node --version    # Cần >= v18.0.0
npm --version     # Cần >= 9.0.0
git --version     # Cần >= 2.30.0
```

---

## 3. THIẾT LẬP MÔI TRƯỜNG PHÁT TRIỂN

### 3.1. Clone Repository

```bash
# Clone repository từ GitHub
git clone https://github.com/dong065vn/quanlysp.git

# Di chuyển vào thư mục dự án
cd quanlysp

# Kiểm tra branch hiện tại
git branch
```

### 3.2. Cài đặt Dependencies

```bash
# Di chuyển vào thư mục product-manager
cd product-manager

# Cài đặt tất cả dependencies
npm install

# Hoặc sử dụng yarn
yarn install
```

### 3.3. Cấu hình môi trường

```bash
# Copy file environment example
cp .env.example .env

# Mở file .env để chỉnh sửa (nếu cần Google Drive)
# Xem phần 4 để biết cách cấu hình Google Drive
```

### 3.4. Chạy Development Server

```bash
# Khởi động dev server
npm run dev

# Server sẽ chạy tại: http://localhost:5173
```

**Kết quả mong đợi:**
```
VITE v7.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h to show help
```

### 3.5. Mở ứng dụng

Mở trình duyệt và truy cập: `http://localhost:5173`

---

## 4. CẤU HÌNH GOOGLE DRIVE SYNC (TÙY CHỌN)

> **Lưu ý**: Google Drive Sync là tính năng tùy chọn. Nếu không cần đồng bộ cloud, bạn có thể bỏ qua phần này.

### 4.1. Tạo Google Cloud Project

**Bước 1: Truy cập Google Cloud Console**
1. Mở https://console.cloud.google.com/
2. Đăng nhập bằng tài khoản Google
3. Tạo project mới hoặc chọn project hiện có

**Bước 2: Bật Google Drive API**
1. Vào menu **"APIs & Services"** → **"Library"**
2. Tìm **"Google Drive API"**
3. Click **"Enable"**

### 4.2. Tạo OAuth 2.0 Credentials

**Bước 1: Tạo OAuth Client ID**
1. Vào **"APIs & Services"** → **"Credentials"**
2. Click **"Create Credentials"** → **"OAuth client ID"**
3. Chọn **"Web application"**
4. Điền thông tin:
   - **Name**: Product Manager (hoặc tên tùy thích)
   - **Authorized JavaScript origins**:
     - `http://localhost:5173` (development)
     - URL production (nếu có)
   - **Authorized redirect URIs**:
     - `http://localhost:5173` (development)
     - URL production (nếu có)
5. Click **"Create"**
6. **Lưu lại Client ID** (dạng: `xxx.apps.googleusercontent.com`)

**Bước 2: Tạo API Key**
1. Click **"Create Credentials"** → **"API key"**
2. **Lưu lại API Key**
3. (Khuyến nghị) Click **"Restrict Key"**:
   - **API restrictions**: Chọn **"Google Drive API"**
   - **Application restrictions**: Chọn **"HTTP referrers"**
   - Thêm `http://localhost:5173/*` và domain production

### 4.3. Cấu hình OAuth Consent Screen

1. Vào **"OAuth consent screen"**
2. Chọn **"External"** (hoặc Internal nếu dùng G Suite)
3. Điền thông tin:
   - **App name**: Product Manager
   - **User support email**: Email của bạn
   - **Developer contact**: Email của bạn
4. Thêm scopes:
   - `.../auth/drive.file`
   - `.../auth/userinfo.profile`
   - `.../auth/userinfo.email`
5. Thêm **Test users** (email của bạn và team)
6. Click **"Save and Continue"**

### 4.4. Cấu hình trong Ứng dụng

```bash
# Mở file .env
nano .env  # hoặc code .env

# Điền thông tin credentials
VITE_GOOGLE_CLIENT_ID=your_client_id_here.apps.googleusercontent.com
VITE_GOOGLE_API_KEY=your_api_key_here
```

**Ví dụ:**
```env
VITE_GOOGLE_CLIENT_ID=123456789-abc123.apps.googleusercontent.com
VITE_GOOGLE_API_KEY=AIzaSyABC123DEF456GHI789
```

### 4.5. Restart Development Server

```bash
# Dừng server hiện tại (Ctrl+C)
# Khởi động lại
npm run dev
```

### 4.6. Kết nối Google Drive

1. Mở ứng dụng: `http://localhost:5173`
2. Click icon **⚙️ Settings** (góc trên bên phải)
3. Click **"Kết nối Google Drive"**
4. Đăng nhập bằng tài khoản Google
5. Cấp quyền cho ứng dụng
6. Thành công! Bạn sẽ thấy avatar và badge "✅ Đã kết nối"

### 4.7. Sử dụng Google Drive Sync

**Có 2 chế độ:**

**1. Auto-save (Khuyến nghị cho 1 thiết bị)**
- Bật toggle **"Auto-save"**
- Mỗi thay đổi sẽ tự động lưu lên cloud sau 2 giây
- Giống Google Docs/Sheets

**2. Manual save (Khuyến nghị cho nhiều thiết bị)**
- Tắt toggle **"Auto-save"**
- Click **"↑ Lưu lên Cloud"** khi cần backup
- Click **"↓ Tải từ Cloud"** khi chuyển thiết bị

**Chi tiết xem:** [WORKFLOW.md](./WORKFLOW.md)

---

## 5. QUY TRÌNH LÀM VIỆC HÀNG NGÀY

### 5.1. Bắt đầu ngày làm việc

```bash
# 1. Cập nhật code mới nhất
cd quanlysp
git fetch origin
git pull origin main  # hoặc branch đang làm việc

# 2. Cài đặt dependencies mới (nếu có)
cd product-manager
npm install

# 3. Khởi động dev server
npm run dev
```

### 5.2. Làm việc với dữ liệu

**Nếu dùng 1 thiết bị:**
1. Mở ứng dụng
2. Bật **"Auto-save"** trong Settings
3. Thêm/sửa/xóa sản phẩm thoải mái
4. Hệ thống tự động lưu

**Nếu dùng nhiều thiết bị:**
1. Mở ứng dụng
2. Click **"↓ Tải từ Cloud"** để lấy dữ liệu mới nhất
3. Làm việc
4. Click **"↑ Lưu lên Cloud"** khi hoàn thành
5. Chuyển sang máy khác, lặp lại từ bước 1

### 5.3. Thao tác với sản phẩm

**Thêm sản phẩm mới:**
1. Click nút **"+ Thêm sản phẩm"**
2. Điền thông tin: Tên, SKU, Danh mục, Giá, Tồn kho
3. Chọn trạng thái (Published/Draft/etc.)
4. Click **"Thêm mới"**

**Chỉnh sửa sản phẩm:**
1. Click icon **✏️** ở cột "Thao tác"
2. Cập nhật thông tin
3. Click **"Cập nhật"**

**Xóa sản phẩm:**
1. Click icon **🗑️** ở cột "Thao tác"
2. Xác nhận xóa

**Lọc và tìm kiếm:**
- Sử dụng thanh **Search** để tìm kiếm
- Dropdown **"Lọc"** để lọc theo trạng thái
- Click header cột để sắp xếp

**Import/Export:**
- **Export**: Click nút **"Export Excel"** → file tự động download
- **Import**: Click nút **"Import Excel"** → chọn file → dữ liệu được import

### 5.4. Kết thúc ngày làm việc

```bash
# 1. Đảm bảo dữ liệu đã lưu
# - Nếu dùng Auto-save: Kiểm tra indicator "✅ Đã lưu"
# - Nếu Manual: Click "↑ Lưu lên Cloud"

# 2. Export backup (khuyến nghị)
# - Click "Export Excel" để tạo backup local

# 3. Dừng dev server
# - Nhấn Ctrl+C trong terminal
```

---

## 6. QUY TRÌNH PHÁT TRIỂN TÍNH NĂNG

### 6.1. Quy trình Git Workflow

**Bước 1: Tạo branch mới**
```bash
# Format: feature/tên-tính-năng hoặc bugfix/tên-bug
git checkout -b feature/add-product-images

# Hoặc
git checkout -b bugfix/fix-export-excel
```

**Bước 2: Phát triển tính năng**
```bash
# Làm việc trên code
# Test thường xuyên với npm run dev
```

**Bước 3: Commit changes**
```bash
# Xem thay đổi
git status
git diff

# Add files
git add .

# Commit với message rõ ràng
git commit -m "✨ Add product image upload feature"

# Hoặc
git commit -m "🐛 Fix Excel export encoding issue"
```

**Commit message conventions:**
- ✨ `:sparkles:` - Tính năng mới
- 🐛 `:bug:` - Fix bug
- 📝 `:memo:` - Cập nhật docs
- ♻️ `:recycle:` - Refactor code
- 🎨 `:art:` - Cải thiện UI/UX
- ⚡ `:zap:` - Cải thiện performance
- 🔒 `:lock:` - Bảo mật

**Bước 4: Push lên GitHub**
```bash
git push -u origin feature/add-product-images
```

**Bước 5: Tạo Pull Request**
```bash
# Trên GitHub:
# 1. Vào repository
# 2. Click "Compare & pull request"
# 3. Điền mô tả chi tiết
# 4. Request review (nếu có team)
# 5. Merge sau khi review OK
```

### 6.2. Quy tắc code

**TypeScript:**
- Luôn define types rõ ràng
- Tránh `any` type
- Sử dụng interfaces cho objects

**React:**
- Components phải có props typing
- Sử dụng functional components + hooks
- Tách logic phức tạp ra custom hooks
- Memo hóa components khi cần thiết

**Styling:**
- Sử dụng Tailwind CSS classes
- Tuân thủ design system hiện có
- Mobile-first approach

**Naming conventions:**
- Components: PascalCase (`ProductTable.tsx`)
- Functions: camelCase (`addProduct()`)
- Constants: UPPER_SNAKE_CASE (`API_ENDPOINT`)
- Files: kebab-case hoặc PascalCase

### 6.3. Testing

**Test thủ công:**
```bash
# 1. Chạy dev server
npm run dev

# 2. Test tính năng mới
# - Kiểm tra UI
# - Test các edge cases
# - Test trên nhiều browsers (Chrome, Firefox, Safari)
# - Test responsive (mobile, tablet, desktop)

# 3. Kiểm tra console log
# - Không có errors
# - Không có warnings quan trọng
```

**Build test:**
```bash
# Build production
npm run build

# Preview build
npm run preview

# Test trên http://localhost:4173
```

### 6.4. Code Review Checklist

- [ ] Code chạy không có lỗi
- [ ] Không có TypeScript errors
- [ ] UI/UX nhất quán với design hiện có
- [ ] Mobile responsive
- [ ] Performance tốt (không lag)
- [ ] Code clean và có comments khi cần
- [ ] Đã test trên nhiều browsers
- [ ] Đã update documentation (nếu cần)

---

## 7. TRIỂN KHAI PRODUCTION

### 7.1. Chuẩn bị Deploy

**Checklist trước khi deploy:**
- [ ] Code đã được review và merge vào main
- [ ] Đã test kỹ trên local
- [ ] Build thành công không lỗi
- [ ] Environment variables đã chuẩn bị
- [ ] Google Drive credentials đã setup (nếu dùng)

### 7.2. Deploy lên Vercel (Khuyến nghị)

**Option 1: Deploy qua Vercel Dashboard**

1. **Đăng nhập Vercel**
   - Truy cập https://vercel.com
   - Đăng nhập bằng GitHub

2. **Import Project**
   - Click **"Add New..."** → **"Project"**
   - Chọn repository: `dong065vn/quanlysp`
   - Authorize Vercel access

3. **Configure Settings**
   ```
   Project Name: product-manager
   Framework Preset: Vite
   Root Directory: product-manager
   Build Command: npm run build
   Output Directory: dist
   Install Command: npm install
   Node Version: 18.x
   ```

4. **Environment Variables** (nếu dùng Google Drive)
   ```
   VITE_GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
   VITE_GOOGLE_API_KEY=AIzaSyXXX
   ```

5. **Deploy**
   - Click **"Deploy"**
   - Đợi 2-3 phút
   - Nhận production URL: `https://your-project.vercel.app`

6. **Cập nhật Google OAuth settings**
   - Vào Google Cloud Console
   - Thêm production URL vào **"Authorized JavaScript origins"**
   - Thêm production URL vào **"Authorized redirect URIs"**
   - Click **"Save"**

**Option 2: Deploy qua Vercel CLI**

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Di chuyển vào thư mục project
cd product-manager

# Deploy preview
vercel

# Deploy production
vercel --prod
```

### 7.3. Deploy lên Netlify (Thay thế)

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Di chuyển vào thư mục project
cd product-manager

# Deploy
netlify deploy --prod

# Build settings:
# Build command: npm run build
# Publish directory: dist
```

### 7.4. Kiểm tra sau Deploy

**Test checklist:**
- [ ] Website load được
- [ ] Thêm sản phẩm mới
- [ ] Sửa sản phẩm
- [ ] Xóa sản phẩm
- [ ] Export Excel
- [ ] Import Excel
- [ ] Google Drive sync (nếu có)
- [ ] Mobile responsive
- [ ] Performance tốt (PageSpeed)

### 7.5. Auto Deploy

**Vercel tự động deploy khi:**
- Push code lên branch `main` → Production
- Push code lên branch khác → Preview deployment
- Merge Pull Request → Production

---

## 8. BẢO TRÌ VÀ NÂNG CẤP

### 8.1. Cập nhật Dependencies

**Định kỳ (hàng tháng):**
```bash
# Kiểm tra packages cũ
npm outdated

# Cập nhật minor versions
npm update

# Cập nhật major versions (cẩn thận!)
npm install <package>@latest

# Test kỹ sau khi update
npm run dev
npm run build
```

**Security updates:**
```bash
# Kiểm tra vulnerabilities
npm audit

# Fix tự động (nếu có)
npm audit fix

# Fix thủ công nếu cần
npm audit fix --force
```

### 8.2. Backup Dữ liệu

**LocalStorage backup:**
1. Vào ứng dụng
2. Click **"Export Excel"**
3. Lưu file vào thư mục backup
4. Đặt tên file: `backup-YYYY-MM-DD.xlsx`

**Google Drive backup:**
- Dữ liệu tự động backup lên Drive
- File: `ProductManagerData/products.json`
- Có thể tải về từ Google Drive

**Database backup (nếu có backend sau này):**
```bash
# PostgreSQL example
pg_dump -U username dbname > backup-$(date +%Y%m%d).sql
```

### 8.3. Monitoring

**Metrics cần theo dõi:**
- **Performance**: Thời gian load trang
- **Errors**: Console errors, crash reports
- **Usage**: Số lượng users, sessions
- **Storage**: Dung lượng LocalStorage, Google Drive

**Tools:**
- Vercel Analytics (built-in)
- Google Analytics (tùy chọn)
- Sentry (error tracking - tùy chọn)

### 8.4. Rotate Credentials

**Định kỳ (3-6 tháng):**
1. Tạo Google API Key mới
2. Cập nhật trong Vercel Environment Variables
3. Deploy lại
4. Xóa API Key cũ sau 1 tuần

---

## 9. XỬ LÝ SỰ CỐ

### 9.1. Lỗi phổ biến và cách xử lý

**Lỗi: "Failed to connect to Google Drive"**

**Nguyên nhân:**
- Chưa cấu hình credentials
- API Key/Client ID sai
- Authorized origins không đúng

**Cách xử lý:**
1. Kiểm tra file `.env`:
   ```bash
   cat .env
   # Verify VITE_GOOGLE_CLIENT_ID và VITE_GOOGLE_API_KEY
   ```

2. Kiểm tra Google Cloud Console:
   - APIs & Services → Credentials
   - Verify Authorized JavaScript origins
   - Verify Authorized redirect URIs

3. Restart dev server:
   ```bash
   npm run dev
   ```

**Chi tiết xem:** [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)

---

**Lỗi: "502 Bad Gateway"**

**Nguyên nhân:**
- API Key bị giới hạn
- Quota exceeded

**Cách xử lý:**
1. Kiểm tra Google Cloud Console quota
2. Tạo API Key mới nếu cần
3. Xem: [COMMON_ERROR_API_KEY.md](./COMMON_ERROR_API_KEY.md)

---

**Lỗi: Build failed**

**Nguyên nhân:**
- TypeScript errors
- Missing dependencies
- Vite config issues

**Cách xử lý:**
```bash
# Xem chi tiết lỗi
npm run build

# Fix TypeScript errors
# Kiểm tra console output

# Clear cache và rebuild
rm -rf node_modules package-lock.json
npm install
npm run build
```

---

**Lỗi: Dữ liệu bị mất**

**Nguyên nhân:**
- Clear browser cache
- LocalStorage bị xóa
- Google Drive sync failed

**Cách xử lý:**
1. Kiểm tra Google Drive:
   - Folder: `ProductManagerData`
   - File: `products.json`

2. Restore từ backup Excel:
   - Click **"Import Excel"**
   - Chọn file backup
   - Import lại dữ liệu

3. **Phòng ngừa:**
   - Export Excel định kỳ
   - Bật Auto-save với Google Drive
   - Không clear browser cache thường xuyên

### 9.2. Rollback Deployment

**Trên Vercel:**
1. Vào Dashboard → Deployments
2. Chọn deployment trước đó (working version)
3. Click **"..."** → **"Promote to Production"**
4. Confirm

**Trên code:**
```bash
# Revert commit
git revert <commit-hash>
git push

# Hoặc rollback hard (cẩn thận!)
git reset --hard <commit-hash>
git push --force
```

### 9.3. Liên hệ hỗ trợ

**Nếu cần hỗ trợ:**
1. Kiểm tra tài liệu:
   - [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
   - [GOOGLE_DRIVE_SETUP.md](./GOOGLE_DRIVE_SETUP.md)
   - [WORKFLOW.md](./WORKFLOW.md)

2. Tạo GitHub Issue:
   - Mô tả chi tiết lỗi
   - Screenshot/video
   - Console logs (bỏ sensitive info)
   - Các bước đã thử

3. Tham khảo:
   - Vite docs: https://vitejs.dev
   - React docs: https://react.dev
   - Vercel docs: https://vercel.com/docs

---

## 10. CHECKLIST VẬN HÀNH

### 10.1. Setup ban đầu

**Lần đầu thiết lập dự án:**
- [ ] Clone repository từ GitHub
- [ ] Cài đặt Node.js >= 18.0.0
- [ ] Cài đặt dependencies: `npm install`
- [ ] Copy `.env.example` → `.env` (nếu dùng Google Drive)
- [ ] Setup Google Cloud Project (nếu dùng Google Drive)
- [ ] Cấu hình OAuth credentials
- [ ] Test chạy dev server: `npm run dev`
- [ ] Test build: `npm run build`
- [ ] Kết nối Google Drive thành công

### 10.2. Hàng ngày

**Checklist làm việc hàng ngày:**
- [ ] Pull code mới nhất: `git pull`
- [ ] Cài dependencies mới (nếu có): `npm install`
- [ ] Khởi động dev server: `npm run dev`
- [ ] (Nếu nhiều máy) Tải dữ liệu từ Cloud
- [ ] Làm việc và lưu dữ liệu
- [ ] Export backup Excel
- [ ] Commit và push code (nếu có thay đổi)

### 10.3. Trước khi Deploy

**Checklist trước deployment:**
- [ ] Code đã merge vào main branch
- [ ] Đã test kỹ trên local
- [ ] Build thành công: `npm run build`
- [ ] Không có TypeScript errors
- [ ] Không có console errors
- [ ] Test trên nhiều browsers
- [ ] Mobile responsive OK
- [ ] Environment variables đã setup
- [ ] Google OAuth origins đã update
- [ ] Đã tạo backup

### 10.4. Sau khi Deploy

**Checklist sau deployment:**
- [ ] Website load được
- [ ] Test CRUD operations
- [ ] Test Import/Export
- [ ] Test Google Drive sync
- [ ] Mobile responsive hoạt động
- [ ] Performance tốt (< 3s load time)
- [ ] Không có errors trong console
- [ ] SSL certificate hoạt động
- [ ] SEO meta tags hiển thị đúng

### 10.5. Hàng tháng

**Bảo trì định kỳ:**
- [ ] Kiểm tra dependencies cũ: `npm outdated`
- [ ] Update dependencies: `npm update`
- [ ] Kiểm tra security: `npm audit`
- [ ] Fix vulnerabilities: `npm audit fix`
- [ ] Test sau khi update
- [ ] Backup dữ liệu
- [ ] Review performance metrics
- [ ] Kiểm tra Google API quota
- [ ] Review error logs

### 10.6. Hàng quý (3 tháng)

**Bảo trì mở rộng:**
- [ ] Rotate Google API credentials
- [ ] Review và clean up code
- [ ] Update documentation
- [ ] Performance optimization
- [ ] Security audit
- [ ] Backup restoration test
- [ ] Disaster recovery plan review

---

## 📞 HỖ TRỢ VÀ TÀI LIỆU THAM KHẢO

### Tài liệu dự án

- **Quy trình Google Drive**: [WORKFLOW.md](./WORKFLOW.md)
- **Cấu hình Google Drive**: [GOOGLE_DRIVE_SETUP.md](./GOOGLE_DRIVE_SETUP.md)
- **Hướng dẫn Deploy**: [DEPLOYMENT.md](./product-manager/DEPLOYMENT.md)
- **Xử lý sự cố**: [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
- **Lỗi API Key**: [COMMON_ERROR_API_KEY.md](./COMMON_ERROR_API_KEY.md)

### Tài liệu kỹ thuật

- **React**: https://react.dev
- **TypeScript**: https://www.typescriptlang.org/docs
- **Vite**: https://vitejs.dev
- **Tailwind CSS**: https://tailwindcss.com/docs
- **TanStack Table**: https://tanstack.com/table
- **Vercel**: https://vercel.com/docs

### Repository

- **GitHub**: https://github.com/dong065vn/quanlysp
- **Issues**: https://github.com/dong065vn/quanlysp/issues

---

## 📝 LỊCH SỬ CẬP NHẬT

| Phiên bản | Ngày       | Thay đổi                          | Người cập nhật |
|-----------|------------|-----------------------------------|----------------|
| 1.0       | 2025-11-08 | Tạo tài liệu quy trình vận hành  | Claude         |

---

## ✅ KẾT LUẬN

Quy trình vận hành này cung cấp hướng dẫn toàn diện từ setup, phát triển, deploy đến bảo trì hệ thống Product Management.

**Nguyên tắc vàng:**
1. 📋 **Luôn backup dữ liệu** trước khi thay đổi lớn
2. 🧪 **Test kỹ trước khi deploy** production
3. 📝 **Document mọi thay đổi** quan trọng
4. 🔒 **Bảo mật credentials** - không commit .env
5. 🔄 **Follow Git workflow** - branch → commit → PR → merge
6. 📊 **Monitor performance** thường xuyên
7. 🆘 **Có rollback plan** cho mọi deployment

**Chúc bạn vận hành dự án thành công! 🚀**
