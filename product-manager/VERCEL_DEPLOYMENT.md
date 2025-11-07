# Hướng dẫn Deploy lên Vercel và Fix lỗi Google Login

## Vấn đề

Khi chạy local thì login Gmail được, nhưng khi deploy lên Vercel (https://quanlysp-qf6d.vercel.app/) thì không login được.

## Nguyên nhân

Có 2 nguyên nhân chính:

### 1. Environment Variables chưa được config trên Vercel
- File `.env` ở local không được tự động deploy lên Vercel
- Vercel cần config riêng cho environment variables

### 2. Authorized Redirect URIs chưa có domain Vercel
- Google OAuth chỉ cho phép login từ các domain được authorized
- Domain Vercel (`https://quanlysp-qf6d.vercel.app`) chưa được thêm vào Google Cloud Console

## Cách Fix

### Bước 1: Cấu hình Environment Variables trên Vercel

1. Truy cập Vercel Dashboard: https://vercel.com/dashboard
2. Chọn project `quanlysp`
3. Vào **Settings** → **Environment Variables**
4. Thêm 2 biến sau:

```
VITE_GOOGLE_CLIENT_ID = <your_client_id>.apps.googleusercontent.com
VITE_GOOGLE_API_KEY = <your_api_key>
```

**Lấy giá trị từ đâu?**
- Mở file `.env` trong thư mục `product-manager/` (local)
- Copy giá trị của `VITE_GOOGLE_CLIENT_ID` và `VITE_GOOGLE_API_KEY`
- Paste vào Vercel

**Lưu ý:**
- Environment có 3 loại: Production, Preview, Development
- Nên chọn **All** (Production, Preview, Development) để áp dụng cho tất cả

5. Click **Save**

### Bước 2: Thêm Vercel Domain vào Google Cloud Console

1. Truy cập Google Cloud Console: https://console.cloud.google.com/apis/credentials

2. Chọn project của bạn

3. Trong phần **Credentials**, click vào **OAuth 2.0 Client ID** mà bạn đang dùng

4. Trong phần **Authorized JavaScript origins**, thêm:
   ```
   https://quanlysp-qf6d.vercel.app
   ```

5. Trong phần **Authorized redirect URIs**, thêm:
   ```
   https://quanlysp-qf6d.vercel.app
   https://quanlysp-qf6d.vercel.app/
   ```

6. Click **Save**

**Lưu ý:**
- Nếu bạn có custom domain, cũng cần thêm domain đó
- Giữ lại `http://localhost:5173` để dev local vẫn hoạt động

### Bước 3: Redeploy trên Vercel

Sau khi config xong environment variables:

1. Quay lại Vercel Dashboard
2. Vào tab **Deployments**
3. Click vào deployment mới nhất
4. Click nút **Redeploy** (hoặc push code mới lên Git)

**Hoặc:**
```bash
# Push code mới lên Git để trigger auto-deploy
git add .
git commit -m "Update deployment config"
git push
```

### Bước 4: Kiểm tra

1. Truy cập https://quanlysp-qf6d.vercel.app/
2. Click nút "Kết nối Google Drive" hoặc "Login"
3. Popup Google OAuth sẽ xuất hiện
4. Chọn tài khoản Gmail
5. Cho phép quyền truy cập
6. Login thành công!

## Troubleshooting

### Lỗi: "Error: redirect_uri_mismatch"
- **Nguyên nhân:** Domain Vercel chưa được thêm vào Authorized redirect URIs
- **Fix:** Làm lại Bước 2 ở trên, đảm bảo đã Save

### Lỗi: "Google Client ID not configured"
- **Nguyên nhân:** Environment variables chưa được set trên Vercel
- **Fix:** Làm lại Bước 1, sau đó Redeploy (Bước 3)

### Lỗi: "idpiframe_initialization_failed"
- **Nguyên nhân:** JavaScript origins chưa được thêm
- **Fix:** Thêm `https://quanlysp-qf6d.vercel.app` vào **Authorized JavaScript origins**

### Popup không xuất hiện
- **Check:** Mở Console (F12), xem có error gì không
- **Check:** Đảm bảo đã config đúng environment variables
- **Fix:** Clear cache và thử lại

## Checklist

- [ ] Đã thêm `VITE_GOOGLE_CLIENT_ID` vào Vercel Environment Variables
- [ ] Đã thêm `VITE_GOOGLE_API_KEY` vào Vercel Environment Variables
- [ ] Đã thêm `https://quanlysp-qf6d.vercel.app` vào Authorized JavaScript origins
- [ ] Đã thêm `https://quanlysp-qf6d.vercel.app` vào Authorized redirect URIs
- [ ] Đã Save changes trong Google Cloud Console
- [ ] Đã Redeploy trên Vercel
- [ ] Đã test login trên production

## Thông tin thêm

### Security Notes
- **KHÔNG** commit file `.env` vào Git (đã được ignore)
- Environment variables trên Vercel được encrypt và secured
- Chỉ team members có quyền xem environment variables

### Custom Domain
Nếu bạn setup custom domain (ví dụ: `quanlysp.yourdomain.com`):
1. Thêm domain mới vào Google Cloud Console (cả Authorized JavaScript origins và redirect URIs)
2. Không cần thêm environment variables mới
3. Vercel tự động áp dụng cho tất cả domains

### Multiple Environments
Nếu bạn có nhiều environments (staging, production):
1. Có thể tạo nhiều OAuth Client IDs khác nhau
2. Dùng Vercel Environment Variables để phân biệt:
   - Production: dùng production client ID
   - Preview: dùng preview/staging client ID

## Tài liệu tham khảo

- Vercel Environment Variables: https://vercel.com/docs/environment-variables
- Google OAuth Setup: https://developers.google.com/identity/protocols/oauth2
- Google Cloud Console: https://console.cloud.google.com/
