# 📋 Quy trình làm việc với Google Drive Sync

Tài liệu này mô tả quy trình làm việc hiệu quả với tính năng đồng bộ Google Drive.

## 🎯 Tổng quan

Product Manager hỗ trợ 2 chế độ lưu trữ:
- **Local Storage** (Trình duyệt): Tự động lưu ngay lập tức
- **Google Drive** (Cloud): Lưu/tải thủ công hoặc tự động

---

## 🔄 Quy trình làm việc

### 1️⃣ **Kết nối Google Drive** (Chỉ làm 1 lần)

#### Bước 1: Mở Settings
- Click vào icon **⚙️ Settings** ở góc trên bên phải
- Panel "Google Drive Sync" sẽ hiển thị

#### Bước 2: Kết nối
- Click nút **"Kết nối Google Drive"**
- Đọc kỹ các quyền được yêu cầu trong popup
- Click **"Kết nối"** → Login với tài khoản Google
- Sau khi kết nối thành công, bạn sẽ thấy:
  - Avatar và tên tài khoản
  - Badge "✅ Đã kết nối"
  - Các nút điều khiển Cloud

---

### 2️⃣ **Làm việc với dữ liệu**

#### 📝 Thêm/Sửa/Xóa sản phẩm

Khi bạn thêm, sửa, hoặc xóa sản phẩm:

1. **Local Storage** (Tự động ✅)
   - Dữ liệu được lưu **ngay lập tức** vào trình duyệt
   - Không cần làm gì thêm
   - Indicator hiển thị: `Chưa lưu` (màu cam)

2. **Google Drive** (Tùy chọn)
   - Bạn có 2 lựa chọn:
     - **Lưu thủ công**: Click nút `↑ Lưu lên Cloud`
     - **Lưu tự động**: Bật toggle `Auto-save` (tự động sau 2 giây)

---

### 3️⃣ **Các nút điều khiển Cloud**

#### 🔵 `↑ Lưu lên Cloud` (Upload)
**Khi nào dùng:**
- Sau khi thêm/sửa nhiều sản phẩm
- Muốn backup dữ liệu lên cloud
- Trước khi chuyển sang thiết bị khác

**Cách dùng:**
1. Click nút `↑ Lưu lên Cloud`
2. Đợi animation "đang lưu..."
3. Thông báo "✅ Đã lưu lên Cloud thành công!"
4. Indicator hiển thị: `Đã lưu 1 phút trước`

---

#### 🟢 `↓ Tải từ Cloud` (Download)
**Khi nào dùng:**
- Chuyển sang thiết bị mới
- Muốn khôi phục dữ liệu từ cloud
- Làm việc trên nhiều máy tính

**Cách dùng:**
1. Click nút `↓ Tải từ Cloud`
2. Xác nhận: "⚠️ Tải dữ liệu từ Cloud sẽ ghi đè dữ liệu local"
3. Click "OK"
4. Dữ liệu từ cloud sẽ thay thế dữ liệu hiện tại
5. Thông báo "✅ Đã tải dữ liệu từ Cloud thành công!"

⚠️ **Lưu ý quan trọng:**
- Nếu bạn có thay đổi chưa lưu lên cloud, chúng sẽ **bị mất**
- Nên click `↑ Lưu lên Cloud` trước khi `↓ Tải từ Cloud`

---

#### ⚡ `Auto-save` Toggle
**Khi nào dùng:**
- Muốn tự động backup liên tục
- Làm việc trên 1 thiết bị chính
- Không muốn click "Lưu" thủ công

**Cách hoạt động:**
1. **Bật** (Toggle màu xanh 🟦):
   - Mỗi khi bạn thêm/sửa/xóa sản phẩm
   - Sau 2 giây không hoạt động
   - Tự động lưu lên Google Drive
   - Giống như Google Docs/Sheets

2. **Tắt** (Toggle màu xám ⬜):
   - Không tự động lưu
   - Bạn phải click `↑ Lưu lên Cloud` thủ công

**Khuyến nghị:**
- ✅ **Bật** nếu bạn làm việc 1 mình trên 1 thiết bị
- ❌ **Tắt** nếu bạn làm việc trên nhiều thiết bị (tránh conflict)

---

## 📊 Hiểu Save Status Indicator

Indicator bên cạnh các nút cloud cho biết trạng thái:

| Icon | Text | Ý nghĩa |
|------|------|---------|
| ✅ | `Đã lưu 2 phút trước` | Dữ liệu đã đồng bộ với cloud |
| 🔄 | `Đang lưu...` | Đang upload lên cloud |
| ⚠️ | `Chưa lưu` | Có thay đổi chưa lưu lên cloud |
| ❌ | `Lỗi` | Có lỗi khi lưu, thử lại |

---

## 💡 Quy trình làm việc khuyến nghị

### Scenario 1: Làm việc trên 1 thiết bị

```
1. Kết nối Google Drive (1 lần)
2. Bật toggle "Auto-save" ⚡
3. Thêm/sửa/xóa sản phẩm thoải mái
4. Hệ thống tự động lưu lên cloud sau 2s
5. ✅ Hoàn thành - không cần làm gì thêm!
```

**Ưu điểm:**
- Tự động backup liên tục
- Không sợ mất dữ liệu
- Giống Google Docs

---

### Scenario 2: Làm việc trên nhiều thiết bị

```
Trên Máy A:
1. Thêm/sửa sản phẩm
2. Click ↑ "Lưu lên Cloud" (thủ công)
3. Đợi "✅ Đã lưu"

Chuyển sang Máy B:
1. Click ↓ "Tải từ Cloud"
2. Xác nhận "OK"
3. Dữ liệu từ Máy A hiện ra!
4. Thêm/sửa tiếp
5. Click ↑ "Lưu lên Cloud" khi xong

Quay lại Máy A:
1. Click ↓ "Tải từ Cloud"
2. Nhận thay đổi từ Máy B
```

**Lưu ý:**
- ❌ **KHÔNG BẬT** Auto-save khi làm việc trên nhiều máy
- ✅ Luôn click ↓ "Tải từ Cloud" trước khi bắt đầu
- ✅ Luôn click ↑ "Lưu lên Cloud" sau khi hoàn thành

---

### Scenario 3: Backup định kỳ

```
1. Tắt Auto-save (toggle xám)
2. Làm việc bình thường
3. Cuối ngày/tuần:
   - Click ↑ "Lưu lên Cloud"
   - Tạo backup snapshot
4. ✅ An tâm đi ngủ!
```

---

## 🔒 Bảo mật & Quyền riêng tư

### Dữ liệu được lưu ở đâu?

1. **Local Storage**:
   - Lưu trong trình duyệt của bạn
   - Chỉ bạn truy cập được
   - Bị xóa nếu clear browser data

2. **Google Drive**:
   - Folder: `ProductManagerData`
   - File: `products.json`
   - Chỉ app này truy cập (scope: `drive.file`)
   - Không ai khác nhìn thấy (kể cả developer)

### Quyền được yêu cầu:

| Quyền | Mục đích |
|-------|----------|
| `drive.file` | Tạo/đọc/ghi file mà app tạo ra |
| `userinfo.profile` | Hiển thị tên và avatar |
| `userinfo.email` | Hiển thị email |

**Không yêu cầu:**
- ❌ Đọc tất cả files trên Drive
- ❌ Xóa files khác
- ❌ Chia sẻ dữ liệu với bên thứ 3

---

## ❓ Câu hỏi thường gặp (FAQ)

### 1. Tôi có thể làm việc offline không?
✅ **Có!**
- Local Storage vẫn hoạt động offline
- Khi online trở lại, click ↑ "Lưu lên Cloud"

### 2. Dữ liệu có bị mất khi đóng trình duyệt?
❌ **Không!**
- Local Storage lưu vĩnh viễn (trừ khi clear cache)
- Google Drive backup an toàn

### 3. Tôi có thể xem file JSON trên Drive không?
✅ **Có!**
- Vào Google Drive
- Tìm folder `ProductManagerData`
- File `products.json` chứa tất cả dữ liệu

### 4. Auto-save có tốn băng thông không?
⚡ **Không đáng kể!**
- Chỉ upload khi có thay đổi
- File JSON nhỏ (< 100KB cho 1000 sản phẩm)
- Debounce 2 giây (giống Google Docs)

### 5. Nếu 2 thiết bị cùng lưu cùng lúc?
⚠️ **Conflict có thể xảy ra!**
- Thiết bị lưu sau sẽ ghi đè
- Khuyến nghị: Tắt Auto-save khi dùng nhiều máy
- Hoặc: Chỉ làm việc trên 1 máy mỗi lần

### 6. Tôi muốn ngắt kết nối thì sao?
👋 **Dễ dàng!**
- Mở Settings → Click icon ☁️❌ "Ngắt kết nối"
- Dữ liệu local vẫn giữ nguyên
- Dữ liệu trên Drive vẫn còn đó

---

## 🚨 Xử lý sự cố

### Lỗi: "Không thể lưu lên Cloud"
1. Kiểm tra kết nối internet
2. Kiểm tra còn dung lượng Google Drive (15GB miễn phí)
3. Thử ngắt kết nối và kết nối lại
4. Xem log console (F12) để debug

### Lỗi: "502 Bad Gateway"
- Lỗi cấu hình API Key
- Xem: [COMMON_ERROR_API_KEY.md](./COMMON_ERROR_API_KEY.md)

### Lỗi: "Không thể kết nối Google Drive"
- Kiểm tra `.env` file
- Xem: [GOOGLE_DRIVE_SETUP.md](./GOOGLE_DRIVE_SETUP.md)

---

## 📞 Hỗ trợ

Nếu gặp vấn đề:
1. Đọc [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
2. Kiểm tra [SECURITY_ALERT.md](./SECURITY_ALERT.md) nếu lộ credentials
3. Mở GitHub Issue với log lỗi

---

## ✅ Checklist làm việc hiệu quả

### Lần đầu setup:
- [ ] Đọc [GOOGLE_DRIVE_SETUP.md](./GOOGLE_DRIVE_SETUP.md)
- [ ] Cấu hình `.env` với API Key và Client ID đúng
- [ ] Kết nối Google Drive
- [ ] Chọn chế độ Auto-save phù hợp

### Mỗi ngày:
- [ ] Mở app → Tự động load từ Local Storage
- [ ] (Nếu dùng nhiều máy) Click ↓ "Tải từ Cloud" để sync
- [ ] Làm việc bình thường
- [ ] (Nếu tắt Auto-save) Click ↑ "Lưu lên Cloud" cuối ngày

### Khi chuyển máy:
- [ ] Máy cũ: Click ↑ "Lưu lên Cloud"
- [ ] Máy mới: Kết nối Google Drive
- [ ] Máy mới: Click ↓ "Tải từ Cloud"
- [ ] ✅ Dữ liệu đã sync!

---

## 🎓 Tóm tắt

| Hành động | Local Storage | Google Drive | Khuyến nghị |
|-----------|---------------|--------------|-------------|
| Thêm sản phẩm | ✅ Tự động | ⚡ Auto (nếu bật) hoặc 📤 Thủ công | Bật Auto-save |
| Sửa sản phẩm | ✅ Tự động | ⚡ Auto (nếu bật) hoặc 📤 Thủ công | Bật Auto-save |
| Xóa sản phẩm | ✅ Tự động | ⚡ Auto (nếu bật) hoặc 📤 Thủ công | Bật Auto-save |
| Chuyển máy | ❌ Không có | 📥 Tải từ Cloud | Click ↓ trước |
| Backup | ❌ Không an toàn | 📤 Lưu lên Cloud | Click ↑ định kỳ |

---

**🎯 Mục tiêu:** Làm việc hiệu quả, an toàn, không mất dữ liệu!

**💡 Tip:** Nếu không chắc, luôn click ↑ "Lưu lên Cloud" trước khi tắt trình duyệt!
