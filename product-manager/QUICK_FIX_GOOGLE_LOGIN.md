# Quick Fix: Google Login không hoạt động trên Vercel

## Vấn đề
- ✅ Local (localhost): Login Gmail OK
- ❌ Vercel (https://quanlysp-qf6d.vercel.app/): Login Gmail FAILED

## Fix nhanh (3 bước)

### Bước 1: Config Environment Variables trên Vercel ⚙️

1. Vào https://vercel.com/dashboard
2. Chọn project `quanlysp` → **Settings** → **Environment Variables**
3. Thêm 2 biến:
   ```
   VITE_GOOGLE_CLIENT_ID = <copy from local .env file>
   VITE_GOOGLE_API_KEY = <copy from local .env file>
   ```
4. Chọn **All** (Production + Preview + Development)
5. Click **Save**

### Bước 2: Thêm Vercel domain vào Google Cloud Console 🔐

1. Vào https://console.cloud.google.com/apis/credentials
2. Click vào OAuth 2.0 Client ID của bạn
3. Thêm vào **Authorized JavaScript origins**:
   ```
   https://quanlysp-qf6d.vercel.app
   ```
4. Thêm vào **Authorized redirect URIs**:
   ```
   https://quanlysp-qf6d.vercel.app
   ```
5. Click **Save**

### Bước 3: Redeploy trên Vercel 🚀

**Cách 1 - Redeploy trực tiếp:**
1. Vào Vercel Dashboard → **Deployments**
2. Click deployment mới nhất
3. Click **Redeploy**

**Cách 2 - Push code mới:**
```bash
git add .
git commit -m "Update deployment config"
git push
```

## Test

1. Truy cập: https://quanlysp-qf6d.vercel.app/
2. Click "Kết nối Google Drive"
3. Login với Gmail
4. ✅ Done!

## Troubleshooting

| Lỗi | Fix |
|-----|-----|
| `redirect_uri_mismatch` | Kiểm tra lại Bước 2 - đảm bảo đã Save |
| `Client ID not configured` | Kiểm tra lại Bước 1 - sau đó Redeploy |
| Popup không xuất hiện | Clear cache, F12 xem Console |

---

📖 **Chi tiết đầy đủ:** Xem file [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md)
