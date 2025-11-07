# ⚠️ CẢNH BÁO BẢO MẬT NGHIÊM TRỌNG

## 🚨 CREDENTIALS ĐÃ BỊ LỘ - CẦN XỬ LÝ NGAY

### Vấn đề

Credentials của bạn đã bị lộ trong chat/conversation này:
- **Client ID:** `693198093701-***REDACTED***.apps.googleusercontent.com`
- **API Key:** `GOCSPX-***REDACTED***` ⚠️

> **Lưu ý:** Credentials gốc đã được redacted để bảo vệ. Người dùng biết credentials đầy đủ từ conversation trước.

**Rủi ro:**
- ❌ Bất kỳ ai có thông tin này đều có thể sử dụng Google API với credentials của bạn
- ❌ Có thể tốn quota/credits của bạn
- ❌ Có thể truy cập dữ liệu trong Google Drive (nếu có token)
- ❌ Có thể bị lạm dụng cho mục đích xấu

### ✅ HÀNH ĐỘNG NGAY LẬP TỨC

#### Bước 1: Revoke (Thu hồi) credentials cũ

1. Truy cập [Google Cloud Console Credentials](https://console.cloud.google.com/apis/credentials)

2. **Revoke API Key:**
   - Tìm API Key đã bị lộ (bắt đầu với `GOCSPX-...`)
   - Click vào API Key đó
   - Click "DELETE" hoặc "Regenerate"
   - Xác nhận xóa

3. **Revoke OAuth Client ID:**
   - Tìm Client ID đã bị lộ (ID bắt đầu với `693198093701-...`)
   - Click vào OAuth 2.0 Client ID đó
   - (Tùy chọn) Bạn có thể giữ lại nhưng nên rotate để an toàn

#### Bước 2: Tạo credentials mới

1. **Tạo API Key mới:**
   - Click "Create Credentials" > "API key"
   - Copy API Key mới
   - Click "Restrict Key":
     - Application restrictions: HTTP referrers
     - Website restrictions: Thêm domain của bạn
     - API restrictions: Chọn "Google Drive API"
   - Click "Save"

2. **Tạo OAuth Client ID mới (nếu cần):**
   - Click "Create Credentials" > "OAuth client ID"
   - Application type: Web application
   - Name: Product Manager App (hoặc tên khác)
   - Authorized JavaScript origins:
     - `http://localhost:5173`
     - Domain production của bạn
   - Authorized redirect URIs:
     - `http://localhost:5173`
     - Domain production của bạn
   - Click "Create"
   - Copy Client ID mới

#### Bước 3: Cập nhật file .env

1. Mở file `.env` trong `product-manager/`:
   ```bash
   cd product-manager
   nano .env
   # hoặc
   code .env
   ```

2. Thay thế bằng credentials MỚI:
   ```env
   VITE_GOOGLE_CLIENT_ID=YOUR_NEW_CLIENT_ID_HERE.apps.googleusercontent.com
   VITE_GOOGLE_API_KEY=YOUR_NEW_API_KEY_HERE
   ```

3. Save file

#### Bước 4: Verify .env KHÔNG bị commit

```bash
git status
```

Bạn KHÔNG nên thấy file `.env` trong danh sách files to commit.

Nếu thấy, chạy:
```bash
git restore --staged product-manager/.env
echo "product-manager/.env" >> .gitignore
```

#### Bước 5: Kiểm tra Git history

```bash
git log --all --full-history -- "*.env"
```

Nếu có kết quả, nghĩa là file .env đã từng bị commit. Cần xóa khỏi history:
```bash
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch product-manager/.env" \
  --prune-empty --tag-name-filter cat -- --all
```

⚠️ **Lưu ý:** Lệnh này sẽ rewrite Git history. Chỉ dùng nếu thực sự cần.

### 📋 Checklist An toàn

- [ ] Đã revoke/delete API Key cũ
- [ ] Đã tạo API Key mới với restrictions
- [ ] Đã cập nhật Client ID (nếu cần)
- [ ] Đã cập nhật file .env với credentials mới
- [ ] Verify .env KHÔNG trong git status
- [ ] Verify .env KHÔNG trong git history
- [ ] Restart dev server với credentials mới
- [ ] Test kết nối Google Drive thành công
- [ ] KHÔNG share credentials trong chat/email/public

### 🔒 Best Practices - Nguyên tắc Bảo mật

#### ✅ LUÔN LUÔN:
- Giữ file `.env` trong `.gitignore`
- Sử dụng environment variables
- Restrict API Keys với domain và API specific
- Rotate credentials định kỳ (mỗi 3-6 tháng)
- Sử dụng credentials khác nhau cho dev và production

#### ❌ KHÔNG BAO GIỜ:
- Commit file `.env` vào Git
- Share credentials qua chat, email, hoặc public
- Hard-code credentials trong source code
- Push credentials lên GitHub
- Screenshot credentials và share
- Copy-paste credentials trong public forum

### 🛡️ Bảo vệ trong tương lai

#### 1. Sử dụng .env.example
File `.env.example` đã có sẵn với placeholder:
```env
VITE_GOOGLE_CLIENT_ID=your_client_id_here.apps.googleusercontent.com
VITE_GOOGLE_API_KEY=your_api_key_here
```

Share file này thay vì file `.env` thực.

#### 2. Environment Variables cho Production

Với Vercel/Netlify:
1. Vào project settings
2. Tìm "Environment Variables"
3. Thêm:
   - `VITE_GOOGLE_CLIENT_ID` = giá trị thực
   - `VITE_GOOGLE_API_KEY` = giá trị thực
4. Redeploy

#### 3. Secrets Management

Cho team/enterprise:
- Sử dụng secrets management tools (HashiCorp Vault, AWS Secrets Manager)
- Sử dụng 1Password/LastPass cho team sharing
- Implement role-based access control

#### 4. Monitoring

- Enable Google Cloud Console alerts cho unusual activity
- Monitor API usage trong Google Cloud Console
- Set up quota limits
- Review audit logs định kỳ

### 📚 Tài liệu tham khảo

- [Google API Security Best Practices](https://cloud.google.com/docs/security/best-practices)
- [OWASP API Security](https://owasp.org/www-project-api-security/)
- [How to Remove Sensitive Data from Git](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository)

### ❓ Câu hỏi thường gặp

**Q: Tôi đã share credentials, có nguy hiểm không?**
A: CÓ. Bất kỳ ai có credentials đều có thể sử dụng API với tên bạn.

**Q: Làm sao biết credentials có bị lạm dụng không?**
A: Kiểm tra Google Cloud Console > APIs & Services > Dashboard để xem API usage.

**Q: Tôi có cần xóa toàn bộ project và tạo lại không?**
A: KHÔNG cần thiết. Chỉ cần revoke credentials cũ và tạo mới.

**Q: .env file đã an toàn trong .gitignore chưa?**
A: RỒI. File .env đã được thêm vào .gitignore và sẽ không bị commit.

---

## ✅ File .env đã được tạo LOCAL

File `.env` đã được tạo tại:
```
/home/user/quanlysp/product-manager/.env
```

**Trạng thái:**
- ✅ File tồn tại local
- ✅ KHÔNG bị track bởi Git (.gitignore hoạt động)
- ✅ Chứa credentials của bạn
- ⚠️ CẢNH BÁO: Credentials đã bị lộ trong conversation, cần thay đổi NGAY

**Sử dụng:**
```bash
cd product-manager
npm run dev
# Ứng dụng sẽ đọc credentials từ .env
```

**Nhớ:**
- KHÔNG commit file này
- KHÔNG share file này
- Thay credentials mới theo hướng dẫn trên
