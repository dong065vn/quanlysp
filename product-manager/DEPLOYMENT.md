# 🚀 Hướng dẫn Deploy lên Vercel

Tài liệu này hướng dẫn cách deploy Product Management System lên Vercel.

---

## 📋 Chuẩn bị

- [x] Tài khoản Vercel (https://vercel.com)
- [x] GitHub repository (đã có)
- [x] Project đã build thành công local

---

## 🎯 Cách 1: Deploy qua Vercel Dashboard (RECOMMENDED)

### Bước 1: Đăng nhập Vercel
1. Truy cập https://vercel.com
2. Đăng nhập bằng GitHub account

### Bước 2: Import Project
1. Click **"Add New..."** → **"Project"**
2. Click **"Import Git Repository"**
3. Authorize Vercel truy cập GitHub
4. Chọn repository: `dong065vn/quanlysp`

### Bước 3: Configure Project
Điền các thông tin sau:

```
Project Name: product-manager (hoặc tên tùy thích)
Framework Preset: Vite
Root Directory: product-manager (QUAN TRỌNG!)
Build Command: npm run build
Output Directory: dist
Install Command: npm install
Node Version: 18.x (recommended)
```

**Environment Variables**: Không cần (vì dùng LocalStorage)

### Bước 4: Deploy
1. Click **"Deploy"**
2. Đợi 2-3 phút để Vercel build và deploy
3. Nhận link production: `https://your-project.vercel.app`

### Bước 5: Configure Domain (Optional)
- Vào **Settings** → **Domains**
- Thêm custom domain nếu có

---

## 🖥️ Cách 2: Deploy qua Vercel CLI

### Bước 1: Install Vercel CLI

```bash
# Cài đặt global
npm install -g vercel

# Hoặc dùng npx (không cần cài)
npx vercel
```

### Bước 2: Đăng nhập

```bash
cd product-manager
vercel login
```

Làm theo hướng dẫn để authenticate qua browser.

### Bước 3: Deploy Preview

```bash
vercel
```

CLI sẽ hỏi:
- **Set up and deploy?** → Y
- **Which scope?** → Chọn account của bạn
- **Link to existing project?** → N (lần đầu) hoặc Y (nếu đã có)
- **What's your project's name?** → product-manager
- **In which directory is your code?** → ./ (enter)

Vercel sẽ tự động:
1. Detect framework (Vite)
2. Build project
3. Deploy lên preview URL

### Bước 4: Deploy Production

```bash
vercel --prod
```

---

## 🔧 File cấu hình Vercel

File `vercel.json` đã được tạo sẵn:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "installCommand": "npm install",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

**Giải thích:**
- `buildCommand`: Lệnh build project
- `outputDirectory`: Thư mục output sau khi build
- `rewrites`: Redirect tất cả routes về index.html (SPA routing)

---

## 🌐 Sau khi Deploy

### Check deployment
1. Truy cập URL được Vercel cung cấp
2. Test các tính năng:
   - ✅ Thêm sản phẩm
   - ✅ Sửa sản phẩm
   - ✅ Xóa sản phẩm
   - ✅ Filter theo trạng thái
   - ✅ Export Excel
   - ✅ Import Excel

### Lưu ý về LocalStorage
- Dữ liệu lưu trên browser của user
- Mỗi browser/device có data riêng
- Clear cache sẽ mất dữ liệu
- **Khuyến nghị**: Export Excel thường xuyên để backup

---

## 🔄 Auto Deploy

Vercel tự động deploy khi:
1. Push code mới lên GitHub
2. Merge Pull Request
3. Update branch được connect

**Branch deployment:**
- `main` → Production
- `claude/*` → Preview deployment

Mỗi commit sẽ tạo preview URL riêng để test.

---

## 🐛 Troubleshooting

### Build failed
```bash
# Test build local trước
npm run build

# Nếu lỗi, fix rồi commit lại
git add .
git commit -m "Fix build errors"
git push
```

### Blank page sau deploy
- Check Console trong browser (F12)
- Check Vercel build logs
- Verify `vercel.json` config
- Verify `dist` folder được generate

### 404 Not Found
- Kiểm tra `rewrites` trong `vercel.json`
- Verify root directory setting

### Slow loading
- Check bundle size: `npm run build`
- Consider code splitting (lazy loading)

---

## 📊 Vercel Dashboard Features

### Deployments
- Xem lịch sử deployments
- Rollback về version cũ
- View build logs

### Analytics (Pro plan)
- Page views
- Unique visitors
- Performance metrics

### Settings
- Environment variables
- Custom domains
- Build & output settings

---

## 💡 Tips

1. **Preview trước khi deploy prod:**
   ```bash
   vercel  # Preview
   # Test OK rồi mới:
   vercel --prod
   ```

2. **Rollback nhanh:**
   - Vào Dashboard → Deployments
   - Click deployment cũ → Promote to Production

3. **Environment Variables:**
   - Hiện tại không cần (dùng LocalStorage)
   - Nếu sau này dùng API: Settings → Environment Variables

4. **Custom Domain:**
   - Vercel free plan: Support custom domain
   - Settings → Domains → Add

5. **Performance:**
   - Vercel tự động optimize
   - CDN global
   - Automatic HTTPS

---

## 🎉 Hoàn thành!

Sau khi deploy xong, anh sẽ có:
- ✅ Production URL: `https://your-project.vercel.app`
- ✅ Auto deploy khi push code
- ✅ Preview URL cho mỗi branch
- ✅ SSL certificate tự động
- ✅ CDN global

**Share link với team/client để sử dụng!**

---

## 📞 Support

- Vercel Docs: https://vercel.com/docs
- Vite Docs: https://vitejs.dev/guide/
- GitHub Issues: (repository của anh)

Happy deploying! 🚀
