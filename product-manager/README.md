# 📦 Product Management System

Hệ thống quản lý sản phẩm chuyên nghiệp với giao diện spreadsheet-like, giúp quản lý thông tin sản phẩm, hình ảnh, liên kết và trạng thái công khai một cách hiệu quả.

![Product Manager](https://img.shields.io/badge/React-18-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38B2AC)
![Vite](https://img.shields.io/badge/Vite-7-646CFF)

## ✨ Tính năng

### Quản lý sản phẩm
- ✅ **CRUD Operations**: Thêm, sửa, xóa sản phẩm
- ✅ **Spreadsheet View**: Giao diện bảng biểu giống Excel/Google Sheets
- ✅ **Inline Editing**: Click để chỉnh sửa trực tiếp
- ✅ **Multi-select**: Chọn nhiều sản phẩm để xử lý hàng loạt
- ✅ **Search & Filter**: Tìm kiếm và lọc nhanh theo trạng thái

### Quản lý trạng thái
- 🟢 **Published**: Đã public
- 🟡 **Draft**: Nháp, chưa sẵn sàng
- 🔴 **Archived**: Đã lưu trữ
- 🔵 **Scheduled**: Đã lên lịch
- ⚪ **Private**: Riêng tư

### Import/Export
- 📥 **Import Excel**: Nhập dữ liệu từ file Excel/CSV
- 📤 **Export Excel**: Xuất dữ liệu ra file Excel

### Thông tin sản phẩm
- Thông tin cơ bản: Tên, SKU, Danh mục
- Giá: Giá bán, giá sale
- Kho: Số lượng tồn kho
- Mô tả: Mô tả ngắn, mô tả chi tiết
- Tags: Phân loại sản phẩm
- Metadata: Meta title, meta description

### Dashboard & Analytics
- 📊 Tổng quan số lượng sản phẩm
- 📊 Thống kê theo trạng thái
- 📊 Biểu đồ trực quan

## 🚀 Bắt đầu

### Yêu cầu
- Node.js 18+
- npm hoặc yarn

### Cài đặt

```bash
# Clone repository (nếu cần)
git clone <repository-url>

# Di chuyển vào thư mục project
cd product-manager

# Cài đặt dependencies
npm install

# Chạy development server
npm run dev

# Mở trình duyệt tại http://localhost:5173
```

### Build production

```bash
# Build ứng dụng
npm run build

# Preview build
npm run preview
```

## 📂 Cấu trúc thư mục

```
product-manager/
├── src/
│   ├── components/          # React components
│   │   ├── Header.tsx       # Header với search
│   │   ├── Sidebar.tsx      # Sidebar navigation
│   │   ├── StatsCards.tsx   # Dashboard stats
│   │   ├── ProductTable.tsx # Bảng sản phẩm chính
│   │   └── ProductModal.tsx # Form thêm/sửa sản phẩm
│   ├── services/            # Business logic
│   │   └── storage.ts       # LocalStorage service
│   ├── types/               # TypeScript types
│   │   └── product.ts       # Product types & interfaces
│   ├── App.tsx              # Main app component
│   ├── main.tsx             # Entry point
│   └── index.css            # Global styles (Tailwind)
├── public/                  # Static assets
├── package.json
└── README.md
```

## 🛠️ Tech Stack

### Frontend
- **React 18**: UI library
- **TypeScript**: Type safety
- **Vite**: Build tool & dev server
- **Tailwind CSS**: Utility-first CSS framework

### Libraries
- **@tanstack/react-table**: Powerful table library cho spreadsheet view
- **lucide-react**: Icon library
- **xlsx**: Excel import/export

### Storage
- **LocalStorage**: Lưu trữ dữ liệu local (không cần backend)

## 💾 Lưu trữ dữ liệu

Ứng dụng sử dụng **LocalStorage** để lưu trữ dữ liệu trên trình duyệt:

- ✅ **Offline-first**: Hoạt động hoàn toàn offline
- ✅ **No backend required**: Không cần server
- ✅ **Auto-save**: Tự động lưu khi có thay đổi
- ✅ **Sample data**: Tự động tạo dữ liệu mẫu lần đầu sử dụng

**Lưu ý**: Dữ liệu lưu trên browser, không sync giữa các máy/browsers khác nhau.

## 📖 Hướng dẫn sử dụng

### Thêm sản phẩm mới
1. Click nút **"Thêm sản phẩm"**
2. Điền thông tin sản phẩm
3. Chọn trạng thái (Published/Draft/etc.)
4. Click **"Thêm mới"**

### Chỉnh sửa sản phẩm
1. Click icon **✏️** ở cột "Thao tác"
2. Cập nhật thông tin
3. Click **"Cập nhật"**

### Xóa sản phẩm
1. Click icon **🗑️** ở cột "Thao tác"
2. Xác nhận xóa

### Lọc theo trạng thái
1. Chọn trạng thái trong dropdown **"Lọc"**
2. Bảng tự động cập nhật

### Export Excel
1. Click nút **"Export"**
2. File Excel tự động download

### Import Excel
1. Click nút **"Import"**
2. Chọn file Excel/CSV
3. Dữ liệu được import vào hệ thống

## 🎨 Customization

### Thêm danh mục mới
Sửa file `src/services/storage.ts`:

```typescript
private getDefaultCategories(): Category[] {
  return [
    { id: '1', name: 'Danh mục 1', slug: 'danh-muc-1' },
    { id: '2', name: 'Danh mục 2', slug: 'danh-muc-2' },
    // Thêm danh mục mới ở đây
  ];
}
```

### Thay đổi màu sắc
Sửa file `tailwind.config.js`:

```javascript
theme: {
  extend: {
    colors: {
      primary: '#3B82F6',  // Màu chính
      success: '#10B981',  // Published
      warning: '#F59E0B',  // Draft
      danger: '#EF4444',   // Archived
      info: '#6366F1',     // Scheduled
    },
  },
}
```

## 🔮 Tính năng sắp tới

- [ ] Upload và quản lý hình ảnh sản phẩm
- [ ] Quản lý links (marketplace, affiliate, social)
- [ ] Advanced search với nhiều filters
- [ ] Bulk actions (cập nhật hàng loạt)
- [ ] History tracking (lịch sử thay đổi)
- [ ] Dark mode
- [ ] Mobile responsive optimization
- [ ] PDF export
- [ ] Cloud storage integration

## 🤝 Contributing

Contributions are welcome! Vui lòng tạo issue hoặc pull request.

## 📄 License

MIT License - xem file LICENSE để biết thêm chi tiết.

## 👨‍💻 Author

Developed with ❤️ by Claude Code

---

**Note**: Đây là phiên bản MVP (Minimum Viable Product). Các tính năng nâng cao sẽ được phát triển tiếp theo yêu cầu.
