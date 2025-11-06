# Troubleshooting - Khắc phục sự cố

## Lỗi kết nối Google Drive

### Lỗi: "Failed to connect. Please try again."

Đây là lỗi phổ biến khi kết nối với Google Drive. Dưới đây là các nguyên nhân và cách khắc phục:

#### 1. Chưa cấu hình Google Client ID và API Key

**Triệu chứng:**
- Thông báo lỗi: "Chưa cấu hình Google Client ID"
- Thông báo lỗi: "Chưa cấu hình Google API Key"

**Nguyên nhân:**
- Chưa tạo file `.env` hoặc file `.env` không có thông tin credentials
- Credentials chưa được thiết lập trong Google Cloud Console

**Cách khắc phục:**

1. Tạo project và cấu hình trên Google Cloud Console:
   - Xem hướng dẫn chi tiết trong file [`GOOGLE_DRIVE_SETUP.md`](./GOOGLE_DRIVE_SETUP.md)

2. Tạo file `.env` trong thư mục `product-manager/`:
   ```bash
   cd product-manager
   cp .env.example .env
   ```

3. Mở file `.env` và điền thông tin:
   ```env
   VITE_GOOGLE_CLIENT_ID=your_actual_client_id.apps.googleusercontent.com
   VITE_GOOGLE_API_KEY=your_actual_api_key
   ```

4. Restart development server:
   ```bash
   npm run dev
   ```

#### 2. Google Identity Services chưa load xong

**Triệu chứng:**
- Lỗi: "Failed to initialize Google Identity Services"
- Console log: "Google Identity Services not loaded"

**Nguyên nhân:**
- Kết nối internet chậm
- Script Google bị chặn bởi ad blocker hoặc firewall
- Browser extension can thiệp

**Cách khắc phục:**

1. Kiểm tra kết nối internet
2. Tắt ad blocker cho trang web này
3. Thử browser khác (Chrome, Firefox, Edge)
4. Xóa cache và cookies của browser
5. Reload trang và thử lại

#### 3. Quyền truy cập bị từ chối

**Triệu chứng:**
- Lỗi: "Bạn đã từ chối quyền truy cập"
- OAuth error: "access_denied"

**Nguyên nhân:**
- Người dùng click "Deny" trên trang xác nhận quyền của Google

**Cách khắc phục:**

1. Click lại nút "Kết nối Google Drive"
2. Khi Google hỏi quyền, click "Allow" hoặc "Cho phép"
3. Chấp nhận tất cả các quyền cần thiết

#### 4. Authorized JavaScript origins không đúng

**Triệu chứng:**
- Lỗi: "Access blocked: This app's request is invalid"
- OAuth popup bị chặn

**Nguyên nhân:**
- Domain hiện tại không được thêm vào whitelist trong Google Cloud Console

**Cách khắc phục:**

1. Mở Google Cloud Console
2. Vào "APIs & Services" > "Credentials"
3. Click vào OAuth 2.0 Client ID của bạn
4. Trong "Authorized JavaScript origins", thêm:
   - `http://localhost:5173` (cho development)
   - Domain production của bạn
5. Trong "Authorized redirect URIs", thêm:
   - `http://localhost:5173` (cho development)
   - Domain production của bạn
6. Click "Save"
7. Đợi vài phút để changes có hiệu lực
8. Thử kết nối lại

#### 5. API chưa được enable

**Triệu chứng:**
- Lỗi khi đồng bộ dữ liệu
- Console log: "Google Drive API has not been used"

**Nguyên nhân:**
- Google Drive API chưa được bật trong Google Cloud Console

**Cách khắc phục:**

1. Mở Google Cloud Console
2. Vào "APIs & Services" > "Library"
3. Tìm "Google Drive API"
4. Click "Enable"
5. Thử lại

## Debug Tips

### Xem logs trong Console

Mở Developer Tools (F12) và xem tab Console để biết thêm chi tiết về lỗi.

Key logs để tìm:
- `Google Identity Services initialized successfully` - GIS đã khởi tạo thành công
- `Requesting new access token...` - Đang request token
- `Access token received successfully` - Đã nhận token
- Console errors với thông tin chi tiết

### Kiểm tra cấu hình

```javascript
// Mở Console và chạy:
console.log('Client ID:', import.meta.env.VITE_GOOGLE_CLIENT_ID);
console.log('API Key:', import.meta.env.VITE_GOOGLE_API_KEY);
```

Nếu thấy `undefined`, nghĩa là file `.env` chưa được cấu hình đúng.

### Test OAuth Flow

1. Mở Developer Tools > Network tab
2. Click "Kết nối Google Drive"
3. Xem các requests đến `accounts.google.com` và `apis.google.com`
4. Kiểm tra response codes:
   - 200: OK
   - 400: Bad Request (kiểm tra credentials)
   - 403: Forbidden (kiểm tra permissions)
   - 404: Not Found (kiểm tra endpoints)

## Vẫn gặp vấn đề?

Nếu vẫn không giải quyết được:

1. Xem logs chi tiết trong Console
2. Kiểm tra lại tất cả cấu hình trong Google Cloud Console
3. Đảm bảo `.env` file có đúng format
4. Thử xóa cache browser và reload
5. Tạo issue trên GitHub với:
   - Mô tả lỗi chi tiết
   - Screenshots của lỗi
   - Console logs (bỏ sensitive info)
   - Các bước đã thử

## Best Practices

1. **Bảo mật credentials:**
   - Không commit file `.env` vào Git
   - Không share Client ID và API Key publicly
   - Sử dụng environment variables cho production

2. **Regular maintenance:**
   - Định kỳ rotate API keys
   - Review OAuth consent screen
   - Kiểm tra authorized domains

3. **Testing:**
   - Test trên nhiều browsers
   - Test trên nhiều devices
   - Test với nhiều Google accounts khác nhau
