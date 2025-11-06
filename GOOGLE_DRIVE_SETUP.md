# Hướng dẫn cấu hình Google Drive API

## 1. Tạo project trên Google Cloud Console

1. Truy cập [Google Cloud Console](https://console.cloud.google.com/)
2. Tạo project mới hoặc chọn project hiện có
3. Tại menu bên trái, chọn "APIs & Services" > "Library"
4. Tìm và bật "Google Drive API"

## 2. Tạo OAuth 2.0 Client ID

1. Tại menu bên trái, chọn "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth client ID"
3. Chọn "Web application"
4. Thêm "Authorized JavaScript origins":
   - `http://localhost:5173` (cho development)
   - URL production của bạn (nếu có)
5. Thêm "Authorized redirect URIs":
   - `http://localhost:5173` (cho development)
   - URL production của bạn (nếu có)
6. Click "Create" và lưu lại **Client ID**

## 3. Tạo API Key

1. Tại trang "Credentials", click "Create Credentials" > "API key"
2. Lưu lại **API Key**
3. (Tùy chọn) Click "Restrict Key" để giới hạn phạm vi sử dụng:
   - Chọn "HTTP referrers"
   - Thêm `http://localhost:5173/*` và domain production
   - Trong "API restrictions", chọn "Restrict key" và chọn "Google Drive API"

## 4. Cấu hình OAuth consent screen

1. Tại menu bên trái, chọn "OAuth consent screen"
2. Chọn "External" hoặc "Internal" (tùy theo nhu cầu)
3. Điền thông tin ứng dụng:
   - App name: Product Manager
   - User support email: email của bạn
   - Developer contact information: email của bạn
4. Thêm scopes:
   - `.../auth/drive.file`
   - `.../auth/drive.appdata`
5. Thêm test users (nếu chọn External)

## 5. Cấu hình trong ứng dụng

1. Copy file `.env.example` thành `.env`:
   ```bash
   cp .env.example .env
   ```

2. Mở file `.env` và điền thông tin:
   ```
   VITE_GOOGLE_CLIENT_ID=your_client_id_here.apps.googleusercontent.com
   VITE_GOOGLE_API_KEY=your_api_key_here
   ```

3. Restart development server:
   ```bash
   npm run dev
   ```

## 6. Sử dụng

1. Mở ứng dụng trong trình duyệt
2. Click vào icon Settings (⚙️) ở góc trên bên phải
3. Click "Kết nối Google Drive"
4. Đăng nhập bằng Google account
5. Cấp quyền cho ứng dụng truy cập Google Drive
6. Bật "Auto-sync" để tự động đồng bộ dữ liệu

## Tính năng

- **Tự động đồng bộ**: Dữ liệu sẽ được tự động lưu lên Google Drive mỗi 30 giây
- **Đồng bộ thủ công**: Click vào icon refresh để đồng bộ ngay lập tức
- **Phát hiện thay đổi**: Hệ thống tự động phát hiện khi có thay đổi từ Google Drive
- **Offline support**: Ứng dụng vẫn hoạt động offline, dữ liệu sẽ được đồng bộ khi có kết nối

## Lưu ý bảo mật

- **KHÔNG commit file `.env`** vào Git
- Client ID và API Key nên được giữ bí mật
- Chỉ thêm domain tin cậy vào "Authorized JavaScript origins"
- Định kỳ xoay (rotate) API keys để đảm bảo bảo mật
- Với production app, nên publish OAuth consent screen để người dùng không nhận cảnh báo

## Troubleshooting

### Lỗi "Access blocked: This app's request is invalid"
- Kiểm tra lại "Authorized JavaScript origins" trong OAuth credentials
- Đảm bảo domain hiện tại được thêm vào whitelist

### Lỗi "The API key doesn't have the required scopes"
- Kiểm tra API key restrictions trong Google Cloud Console
- Đảm bảo Google Drive API được bật

### Lỗi "Invalid token"
- Clear browser cache và cookies
- Sign out và sign in lại
- Kiểm tra token expiration time

### Dữ liệu không đồng bộ
- Kiểm tra console log để xem lỗi chi tiết
- Đảm bảo internet connection ổn định
- Kiểm tra quyền Google Drive của ứng dụng trong Google account settings
