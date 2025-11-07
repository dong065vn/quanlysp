# ⚠️ LỖI PHỔ BIẾN: Nhầm lẫn giữa API Key và Client Secret

## 🚨 Lỗi bạn đang gặp phải

**Triệu chứng:**
```
502 Bad Gateway
GET https://content.googleapis.com/discovery/v1/apis/drive/v3/rest?key=GOCSPX-...
API discovery response missing required fields
```

**Nguyên nhân:**
Bạn đang sử dụng **OAuth Client Secret** (`GOCSPX-...`) làm API Key!

---

## 🔑 Phân biệt các loại Credentials

### 1. **OAuth Client ID** ✅ (Đúng)
```
693198093701-abc123xyz.apps.googleusercontent.com
```
- Kết thúc với `.apps.googleusercontent.com`
- Dùng để: Xác thực người dùng
- Đặt trong: `VITE_GOOGLE_CLIENT_ID`

### 2. **OAuth Client Secret** ❌ (KHÔNG dùng làm API Key)
```
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
```
- Bắt đầu với `GOCSPX-`
- Dùng để: Server-side authentication (backend)
- **KHÔNG BAO GIỜ** dùng trong frontend
- **KHÔNG BAO GIỜ** dùng làm API Key

### 3. **API Key** ✅ (Cần dùng)
```
AIzaSyAbCdEfGhIjKlMnOpQrStUvWxYz1234567
```
- Thường bắt đầu với `AIzaSy...`
- Hoặc chuỗi ký tự ngẫu nhiên khác (39 ký tự)
- Dùng để: Truy cập Google APIs
- Đặt trong: `VITE_GOOGLE_API_KEY`

---

## 🛠️ Cách sửa lỗi

### Bước 1: Tạo API Key mới

1. Truy cập [Google Cloud Console Credentials](https://console.cloud.google.com/apis/credentials)

2. Click **"Create Credentials"** → **"API key"**

3. API Key mới sẽ được tạo, có dạng:
   ```
   AIzaSyAbCdEfGhIjKlMnOpQrStUvWxYz1234567
   ```

4. (Quan trọng) Click **"Restrict Key"** để bảo mật:
   - **Application restrictions**: Chọn "HTTP referrers (web sites)"
   - Click "Add an item" và thêm:
     ```
     http://localhost:5173/*
     https://yourdomain.com/*
     ```
   - **API restrictions**: Chọn "Restrict key"
   - Chọn: **Google Drive API**
   - Click **"Save"**

### Bước 2: Cập nhật file .env

Mở file `.env` trong thư mục `product-manager/`:

```bash
cd /home/user/quanlysp/product-manager
nano .env
```

Cập nhật với credentials **ĐÚNG**:

```env
# OAuth 2.0 Client ID (giữ nguyên nếu đúng)
VITE_GOOGLE_CLIENT_ID=693198093701-your-actual-id.apps.googleusercontent.com

# API Key (thay bằng API Key vừa tạo, BẮT ĐẦU VỚI AIzaSy...)
VITE_GOOGLE_API_KEY=AIzaSyYourNewApiKeyHere1234567890
```

**QUAN TRỌNG:**
- ❌ **KHÔNG** dùng `GOCSPX-...` (Client Secret)
- ✅ **DÙNG** `AIzaSy...` (API Key)

### Bước 3: Restart dev server

```bash
# Stop server (Ctrl+C)
# Start lại
npm run dev
```

### Bước 4: Test lại

1. Mở http://localhost:5173
2. Click Settings (⚙️)
3. Click "Kết nối Google Drive"
4. Nếu đúng, bạn sẽ thấy popup Google OAuth
5. Sau khi login, kết nối sẽ thành công

---

## 📋 Checklist để tránh lỗi này

### Kiểm tra file .env của bạn:

```env
# ✅ ĐÚNG
VITE_GOOGLE_CLIENT_ID=123456789-abc.apps.googleusercontent.com
VITE_GOOGLE_API_KEY=AIzaSyAbCdEfGhIjKlMnOpQrStUvWxYz1234567

# ❌ SAI - Dùng Client Secret làm API Key
VITE_GOOGLE_CLIENT_ID=123456789-abc.apps.googleusercontent.com
VITE_GOOGLE_API_KEY=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  ← SAI!
```

### Validation tự động

Ứng dụng giờ đã có validation tự động:
- ❌ Nếu dùng `GOCSPX-...` làm API Key → Hiển thị lỗi rõ ràng
- ✅ Nếu dùng đúng API Key → Kết nối bình thường

---

## 🔍 Cách phân biệt nhanh

| Type | Prefix | Ví dụ | Dùng cho |
|------|--------|-------|----------|
| **Client ID** | Số-chữ | `123456-abc.apps.googleusercontent.com` | OAuth authentication |
| **Client Secret** | `GOCSPX-` | `GOCSPX-xxxxx` | Backend only (KHÔNG dùng) |
| **API Key** | `AIzaSy` hoặc random | `AIzaSyAbCd...` | API calls |

---

## 📸 Screenshots để so sánh

### Google Cloud Console - Credentials Page

**OAuth 2.0 Client IDs:**
```
Client ID: 693198093701-abc123.apps.googleusercontent.com
Client Secret: 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  ← KHÔNG dùng cái này!
```

**API Keys:**
```
Key: AIzaSyAbCdEfGhIjKlMnOpQrStUvWxYz1234567  ← Dùng cái này!
```

---

## 🚀 Sau khi sửa

Khi đã cấu hình đúng:

1. **Không còn lỗi 502 Bad Gateway**
2. **Google API khởi tạo thành công**
3. **Kết nối Google Drive OK**
4. **Lưu dữ liệu lên cloud hoạt động**

---

## 💡 Tips bảo mật

### API Key:
- ✅ Restrict với HTTP referrers
- ✅ Restrict với Google Drive API only
- ✅ Regenerate định kỳ
- ✅ Monitor usage trong Console

### Client Secret:
- ❌ **KHÔNG BAO GIỜ** commit vào Git
- ❌ **KHÔNG BAO GIỜ** dùng trong frontend
- ❌ **KHÔNG BAO GIỜ** share publicly
- ❌ **KHÔNG BAO GIỜ** dùng làm API Key

---

## 🆘 Vẫn gặp lỗi?

### Nếu vẫn thấy 502 Bad Gateway:

1. **Kiểm tra API Key đã đúng chưa:**
   ```bash
   # In ra console
   console.log('API Key:', import.meta.env.VITE_GOOGLE_API_KEY);
   ```
   - Phải bắt đầu với `AIzaSy...`
   - KHÔNG bắt đầu với `GOCSPX-`

2. **Kiểm tra Google Drive API đã enable:**
   - [Google Cloud Console > APIs & Services > Library](https://console.cloud.google.com/apis/library)
   - Search "Google Drive API"
   - Click "Enable"

3. **Kiểm tra API Key restrictions:**
   - Application restrictions: HTTP referrers
   - Domain đã được whitelist
   - API restrictions: Google Drive API

4. **Clear cache và thử lại:**
   ```bash
   # Clear browser cache
   # Reload page (Ctrl+F5)
   ```

---

## 📚 Tài liệu tham khảo

- [Google API Keys Best Practices](https://cloud.google.com/docs/authentication/api-keys)
- [OAuth 2.0 for Client-side Web Apps](https://developers.google.com/identity/protocols/oauth2/javascript-implicit-flow)
- [Google Drive API Documentation](https://developers.google.com/drive/api/guides/about-sdk)

---

## ✅ Tóm tắt

1. **GOCSPX-...** là Client Secret → **KHÔNG dùng**
2. **AIzaSy...** là API Key → **DÙNG cái này**
3. Tạo API Key mới trong Google Cloud Console
4. Restrict API Key với domain và Google Drive API
5. Update file `.env` với API Key đúng
6. Restart dev server
7. Test lại kết nối

**Sau khi sửa, lỗi 502 sẽ biến mất!** ✨
