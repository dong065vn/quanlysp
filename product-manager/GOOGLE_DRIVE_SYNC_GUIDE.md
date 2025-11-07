# 📚 Hướng Dẫn Đồng Bộ Dữ Liệu với Google Drive

## 🎯 Tổng Quan

Ứng dụng Product Manager hỗ trợ đồng bộ dữ liệu tự động và thủ công với Google Drive, giúp bạn:
- ✅ Sao lưu dữ liệu an toàn trên cloud
- ✅ Đồng bộ giữa nhiều thiết bị
- ✅ Khôi phục dữ liệu khi cần thiết
- ✅ Tự động lưu như Google Docs

---

## 🔧 Thiết Lập Ban Đầu

### Bước 1: Kết nối Google Drive

1. Nhấn vào biểu tượng **⚙️ Settings** ở góc trên bên phải
2. Trong panel "Google Drive Sync", nhấn **"Kết nối Google Drive"**
3. Đọc thông tin về quyền truy cập được yêu cầu
4. Nhấn **"Tiếp tục"** để mở cửa sổ đăng nhập Google
5. Chọn tài khoản Google và cho phép các quyền:
   - 📁 Tạo và quản lý files trong Google Drive
   - 📂 Truy cập folder riêng của ứng dụng
6. Sau khi kết nối thành công, bạn sẽ thấy:
   - ✅ Avatar và tên tài khoản của bạn
   - ✅ Trạng thái "Đã kết nối"
   - ✅ Các nút điều khiển sync xuất hiện

### Bước 2: Dữ liệu được lưu ở đâu?

Tất cả dữ liệu được lưu trong:
```
Google Drive
└── ProductManagerData/          (Folder tự động tạo)
    └── products.json            (File chứa toàn bộ sản phẩm)
```

**Cấu trúc file products.json:**
```json
{
  "products": [
    {
      "id": "1",
      "sku": "IP15PM-256",
      "name": "iPhone 15 Pro Max 256GB",
      "price": 29990000,
      ...
    }
  ],
  "version": 1699299480123,
  "lastModified": "2024-11-07T10:30:00.000Z"
}
```

---

## 💾 Quy Trình Lưu Dữ Liệu Thủ Công

### Cách 1: Lưu Thủ Công (Manual Save)

**Khi nào cần dùng:**
- Trước khi đóng trình duyệt
- Sau khi thực hiện nhiều thay đổi quan trọng
- Khi muốn đảm bảo dữ liệu đã được lưu lên cloud
- Khi tắt auto-save

**Các bước thực hiện:**

1. **Kiểm tra trạng thái kết nối**
   - Đảm bảo có hiển thị nút "↑ Lưu lên Cloud" (màu xanh dương)
   - Nếu không thấy → Chưa kết nối Google Drive → Quay lại Bước 1

2. **Nhấn nút "↑ Lưu lên Cloud"**
   - Desktop: Hiển thị "Lưu lên Cloud"
   - Mobile: Hiển thị "↑"

3. **Đợi quá trình lưu**
   - Nút sẽ hiển thị icon quay (spinner) và chữ "Đang lưu..."
   - Indicator ở góc phải sẽ hiển thị: 🔄 Đang lưu...

4. **Xác nhận lưu thành công**
   - Thông báo: ✅ "Đã lưu lên Cloud thành công!"
   - Indicator hiển thị: ✅ "Đã lưu vừa xong"

**Lưu ý:**
- ⚠️ Không refresh trang trong khi đang lưu
- ⚠️ Đảm bảo kết nối internet ổn định
- ⚠️ Nếu có lỗi, hãy thử lại sau vài giây

### Cách 2: Tải Dữ Liệu từ Cloud (Manual Download)

**Khi nào cần dùng:**
- Khi chuyển sang thiết bị/trình duyệt mới
- Sau khi xóa cache trình duyệt
- Muốn khôi phục dữ liệu từ cloud
- Phát hiện dữ liệu local bị lỗi

**Các bước thực hiện:**

1. **Nhấn nút "↓ Tải từ Cloud"** (màu xanh lá)

2. **Đọc cảnh báo quan trọng**
   ```
   ⚠️ Tải dữ liệu từ Cloud sẽ ghi đè dữ liệu local hiện tại.

   Bạn có chắc chắn muốn tiếp tục?
   ```

3. **Xác nhận hành động**
   - Nhấn **Cancel** nếu muốn hủy
   - Nhấn **OK** để tiếp tục

4. **Đợi quá trình tải**
   - Nút sẽ hiển thị icon quay (spinner)
   - Status hiển thị: 🔄 Đang đồng bộ...

5. **Xác nhận tải thành công**
   - Thông báo: ✅ "Đã tải dữ liệu từ Cloud thành công!"
   - Bảng sản phẩm tự động cập nhật
   - Status hiển thị: ✅ "Đã lưu vừa xong"

**Lưu ý quan trọng:**
- ⚠️ **Dữ liệu local sẽ bị GHI ĐÈ hoàn toàn**
- ⚠️ Nếu có thay đổi chưa lưu, hãy lưu lên cloud trước
- ⚠️ Backup dữ liệu quan trọng bằng Export Excel trước khi tải

---

## 🔄 Quy Trình Tự Động (Auto-Save)

### Cách bật Auto-Save

1. **Bật toggle switch "Auto-save"**
   - Desktop: Toggle + chữ "Auto-save"
   - Mobile: Toggle + icon ☁️

2. **Auto-save đã được bật khi:**
   - Toggle chuyển sang màu xanh dương
   - Icon ☁️ màu xanh dương (mobile)

### Cách hoạt động của Auto-Save

```
Người dùng thực hiện thay đổi
         ↓
Lưu ngay vào localStorage (tức thì)
         ↓
Đánh dấu: ⚠️ Chưa lưu (màu cam)
         ↓
Đợi 2 giây không có thay đổi mới
         ↓
Tự động lưu lên Google Drive
         ↓
Hiển thị: ✅ Đã lưu (màu xanh)
```

**Ví dụ thực tế:**

```
10:00:00 - Thêm sản phẩm A → ⚠️ Chưa lưu
10:00:01 - Sửa giá sản phẩm A → ⚠️ Chưa lưu
10:00:02 - Thêm sản phẩm B → ⚠️ Chưa lưu
10:00:04 - (Không có thay đổi nào sau 2 giây)
10:00:04 - 🔄 Đang lưu...
10:00:05 - ✅ Đã lưu (cả A và B được lưu 1 lần)
```

### Ưu điểm của Auto-Save

- ✅ Không cần nhớ phải lưu thủ công
- ✅ Giảm số lượng request lên Google Drive (debounce 2s)
- ✅ Giống cách Google Docs hoạt động
- ✅ Dữ liệu luôn được backup định kỳ

### Khi nào nên TẮT Auto-Save?

- ❌ Khi đang test hoặc thử nghiệm
- ❌ Khi làm việc offline không có internet
- ❌ Khi muốn kiểm soát hoàn toàn thời điểm lưu
- ❌ Khi lo ngại về giới hạn API quota

---

## 📊 Hiểu Các Trạng Thái Đồng Bộ

### Save Status Indicator (Góc trên bên phải)

| Icon | Trạng thái | Ý nghĩa | Hành động |
|------|-----------|---------|-----------|
| ✅ | Đã lưu X giây/phút trước | Tất cả thay đổi đã được đồng bộ | Không cần làm gì |
| 🔄 | Đang lưu... | Đang upload lên Google Drive | Đợi hoàn thành |
| ⚠️ | Chưa lưu | Có thay đổi chưa được đồng bộ | Đợi auto-save hoặc lưu thủ công |
| ❌ | Lỗi khi lưu | Có lỗi xảy ra | Kiểm tra kết nối và thử lại |

### Trạng thái kết nối

| Hiển thị | Ý nghĩa | Hành động |
|----------|---------|-----------|
| [Avatar] [Name] ✅ Đã kết nối | Đã kết nối Google Drive | Có thể sync |
| ☁️ Chưa kết nối Cloud | Chưa đăng nhập Google | Nhấn để kết nối |
| Không hiển thị controls | Không có quyền truy cập | Kiểm tra setup |

---

## 🔥 Các Tình Huống Thực Tế

### Tình huống 1: Làm việc trên 2 thiết bị

**Thiết bị A (Máy tính văn phòng):**
```
1. Kết nối Google Drive
2. Bật Auto-save
3. Thêm/sửa 50 sản phẩm
4. Đợi Auto-save hoặc nhấn "Lưu lên Cloud"
5. Kiểm tra: ✅ Đã lưu
6. Đóng trình duyệt
```

**Thiết bị B (Laptop ở nhà):**
```
1. Mở ứng dụng (dữ liệu local cũ)
2. Kết nối Google Drive (cùng tài khoản)
3. Nhấn "↓ Tải từ Cloud"
4. Xác nhận ghi đè
5. ✅ 50 sản phẩm từ Thiết bị A xuất hiện
6. Tiếp tục làm việc
```

### Tình huống 2: Mất dữ liệu do xóa cache

**Vấn đề:**
- Vô tình xóa cache trình duyệt
- Tất cả dữ liệu local bị mất
- Chỉ còn 0 sản phẩm

**Giải pháp:**
```
1. Không panic! Dữ liệu vẫn còn trên cloud
2. Kết nối lại Google Drive
3. Nhấn "↓ Tải từ Cloud"
4. Xác nhận
5. ✅ Tất cả sản phẩm được khôi phục
```

### Tình huống 3: Lỗi khi lưu

**Nguyên nhân thường gặp:**
- ❌ Mất kết nối internet
- ❌ Token Google hết hạn
- ❌ Đạt giới hạn API quota
- ❌ Lỗi Google Drive API

**Cách xử lý:**
```
1. Kiểm tra kết nối internet
2. Refresh trang và đăng nhập lại Google
3. Đợi 1-2 phút (nếu lỗi quota)
4. Thử lưu lại bằng nút "↑ Lưu lên Cloud"
5. Nếu vẫn lỗi → Export Excel để backup
```

### Tình huống 4: Xung đột dữ liệu

**Kịch bản:**
- Thiết bị A: Thêm sản phẩm X, chưa lưu
- Thiết bị B: Thêm sản phẩm Y, lưu lên cloud
- Thiết bị A: Bật auto-save → ghi đè dữ liệu

**Cách tránh:**
```
1. Luôn "Tải từ Cloud" khi bắt đầu làm việc
2. Bật Auto-save trên tất cả thiết bị
3. Không làm việc đồng thời trên nhiều thiết bị
4. Kiểm tra timestamp "Đã lưu X phút trước"
```

---

## 🛠️ Best Practices (Thực hành tốt nhất)

### ✅ NÊN

1. **Bật Auto-save khi làm việc thường xuyên**
   - Tránh quên lưu
   - Đảm bảo backup liên tục

2. **Lưu thủ công trước khi đóng trình duyệt**
   - Nhấn "↑ Lưu lên Cloud"
   - Đợi ✅ "Đã lưu"

3. **Tải từ Cloud khi bắt đầu ngày làm việc mới**
   - Đảm bảo có dữ liệu mới nhất
   - Tránh xung đột

4. **Export Excel định kỳ (1 tuần/tháng)**
   - Backup bổ sung
   - Dễ dàng khôi phục

5. **Kiểm tra indicator thường xuyên**
   - Đảm bảo luôn thấy ✅ "Đã lưu"
   - Xử lý ngay nếu thấy ❌ "Lỗi"

### ❌ KHÔNG NÊN

1. **Không làm việc trên nhiều thiết bị cùng lúc**
   - Dễ gây xung đột dữ liệu
   - Một thiết bị sẽ ghi đè thiết bị khác

2. **Không tắt Auto-save nếu không cần thiết**
   - Dễ quên lưu thủ công
   - Mất dữ liệu nếu trình duyệt crash

3. **Không refresh trang khi đang "Đang lưu..."**
   - Upload có thể bị gián đoạn
   - Dữ liệu không đồng bộ hoàn toàn

4. **Không xóa folder ProductManagerData trên Drive**
   - Sẽ mất tất cả backup
   - Phải tạo lại từ đầu

5. **Không chia sẻ tài khoản Google với người khác**
   - Bảo mật dữ liệu
   - Tránh xung đột

---

## 🔐 Bảo Mật & Quyền Riêng Tư

### Dữ liệu được bảo vệ như thế nào?

1. **OAuth 2.0 Authentication**
   - Không lưu password
   - Chỉ sử dụng access token tạm thời

2. **Quyền truy cập hạn chế**
   - Chỉ truy cập folder riêng của app
   - Không truy cập files khác trong Drive

3. **HTTPS/SSL Encryption**
   - Tất cả dữ liệu được mã hóa khi truyền
   - Google Drive mã hóa dữ liệu lưu trữ

4. **Không có Backend Server**
   - Không có server trung gian
   - Dữ liệu chỉ đi từ browser → Google Drive

### Cách thu hồi quyền truy cập

Nếu muốn ngắt kết nối hoàn toàn:

1. **Trong ứng dụng:**
   - Nhấn nút "❌ Ngắt kết nối"

2. **Trong tài khoản Google:**
   - Truy cập: https://myaccount.google.com/permissions
   - Tìm "Product Manager"
   - Nhấn "Remove Access"

---

## 📱 Responsive Mobile

### Trên điện thoại/tablet

**UI khác biệt:**
- "↑ Lưu lên Cloud" → "↑"
- "↓ Tải từ Cloud" → "↓"
- "Auto-save" → ☁️ icon
- Status rút gọn: "Đang lưu..." → "Lưu..."

**Lưu ý khi dùng mobile:**
- Đảm bảo có WiFi/4G ổn định
- Không khóa màn hình khi đang lưu
- Kiểm tra battery đủ (upload tốn pin)

---

## 🆘 Troubleshooting (Xử lý sự cố)

### Lỗi: "Not authenticated with Google Drive"

**Nguyên nhân:** Token hết hạn hoặc chưa đăng nhập

**Giải pháp:**
1. Refresh trang
2. Nhấn "Kết nối Google Drive" lại
3. Cho phép quyền truy cập

### Lỗi: "Failed to access Google Drive folder"

**Nguyên nhân:** Lỗi tạo/truy cập folder

**Giải pháp:**
1. Kiểm tra Google Drive có đủ dung lượng
2. Kiểm tra quyền truy cập Drive API
3. Thử tạo folder "ProductManagerData" thủ công

### Lỗi: "Sync already in progress"

**Nguyên nhân:** Đang có 1 sync đang chạy

**Giải pháp:**
1. Đợi sync hiện tại hoàn thành
2. Nếu bị stuck > 30s → Refresh trang

### Không thấy nút Sync Controls

**Nguyên nhân:** Chưa kết nối Google Drive

**Giải pháp:**
1. Kiểm tra góc trên phải có "☁️ Chưa kết nối Cloud"
2. Nhấn ⚙️ Settings
3. Kết nối Google Drive

---

## 📈 Giới Hạn & Performance

### Google Drive API Quotas

- **Queries per 100 seconds**: 1,000 requests
- **Queries per user per 100 seconds**: 10 requests
- **File size limit**: Không giới hạn (thực tế < 5TB)

**Đối với app này:**
- Mỗi lần lưu = 1-2 requests
- Auto-save debounce 2s → Tối đa 30 requests/phút
- Không lo vượt quota với sử dụng thông thường

### Performance Tips

1. **Không lưu quá thường xuyên**
   - Auto-save đã tối ưu (2s debounce)
   - Không cần lưu thủ công liên tục

2. **Số lượng sản phẩm**
   - < 1,000 sản phẩm: Rất nhanh
   - 1,000 - 10,000: Vẫn tốt
   - > 10,000: Cân nhắc phân trang

3. **Kích thước file**
   - 100 sản phẩm ≈ 50KB
   - 1,000 sản phẩm ≈ 500KB
   - Upload/Download < 1s với kết nối tốt

---

## 📞 Hỗ Trợ

Nếu gặp vấn đề không được liệt kê ở trên:

1. Kiểm tra Console (F12) để xem lỗi chi tiết
2. Thử Export Excel để backup trước
3. Liên hệ developer với thông tin:
   - Trạng thái lỗi hiển thị
   - Console logs
   - Các bước tái hiện lỗi

---

**Chúc bạn sử dụng hiệu quả! 🎉**
