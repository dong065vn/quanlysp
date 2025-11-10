# Read-Only Mode Implementation

## Tổng quan

Khi người dùng truy cập share link với permission `view`, họ sẽ ở chế độ **chỉ đọc** (read-only). Trong chế độ này:

- ✅ **Có thể:** Xem tất cả thông tin sản phẩm
- ❌ **Không thể:** Chỉnh sửa, thêm, xóa bất kỳ dữ liệu nào
- ❌ **Không thể:** Tương tác với web service (localStorage, API calls)
- ✅ **Responsive:** Hoạt động tốt trên cả mobile và desktop

## Kiến trúc Read-Only Guard

### 1. Read-Only Guard Hook (`useReadOnlyGuard`)

Hook này cung cấp cơ chế bảo vệ để ngăn chặn tất cả write operations:

```typescript
const { canEdit, guardWrite } = useReadOnlyGuard({
  permission: settings.permission,
  onViolation: () => {
    toast.error('⚠️ Bạn không có quyền thực hiện thao tác này');
  },
});
```

**Chức năng:**
- `canEdit`: Boolean cho biết có quyền edit không
- `canComment`: Boolean cho biết có quyền comment không
- `guardWrite()`: Wrapper function chặn write operations khi không có quyền

### 2. Guard Write Operations

Tất cả các operations thay đổi dữ liệu phải được wrap bằng `guardWrite()`:

```typescript
// ❌ Trước đây - Không có guard
const handleSave = () => {
  storageService.saveProducts(products);
};

// ✅ Bây giờ - Có guard
const handleSave = guardWrite(() => {
  storageService.saveProducts(products);
});
```

**Kết quả:**
- Nếu `canEdit = true` → function được thực thi bình thường
- Nếu `canEdit = false` → function bị chặn, hiển thị warning

### 3. View-Only UI Components

#### ViewOnlyBanner
Banner thông báo lớn hiển thị ở đầu trang (desktop + mobile):

```typescript
<ViewOnlyBanner permission={settings.permission} className="mb-4 sm:mb-6" />
```

**Hiển thị khi:** `permission === 'view'`

**Nội dung:**
- 🔒 Biểu tượng khóa
- Thông báo: "Chế độ Chỉ Xem"
- Mô tả: Không thể chỉnh sửa
- Badge: Các tính năng bị hạn chế

#### MobileViewOnlyNotice
Sticky banner nhỏ gọn ở bottom của màn hình (chỉ mobile):

```typescript
<MobileViewOnlyNotice permission={settings.permission} />
```

**Hiển thị khi:**
- `permission === 'view'`
- Màn hình < 768px (md breakpoint)

**Vị trí:** `position: sticky; bottom: 0`

## Các Components được bảo vệ

### ProductViewer
```typescript
// Guard save operation
const handleSaveEdit = guardWrite(() => {
  const products = storageService.getProducts();
  // ... save logic
  storageService.saveProducts(products);
});

// UI - Chỉ hiển thị nút edit khi có quyền
{canEdit && !isEditing && (
  <button onClick={() => setIsEditing(true)}>
    Chỉnh sửa
  </button>
)}
```

### SheetViewer
```typescript
// Guard 2 operations
const handleSaveProduct = guardWrite(() => { /* ... */ });
const handleSaveModal = guardWrite((product) => { /* ... */ });

// UI - Conditional rendering
{canEdit && (
  <button>Edit</button>
)}
```

## Permissions và Behaviors

| Permission | Xem | Comment | Chỉnh sửa | Web Service Access |
|-----------|-----|---------|-----------|-------------------|
| **view** | ✅ | ❌ | ❌ | ❌ |
| **comment** | ✅ | ✅ | ❌ | ❌ (chỉ comments) |
| **edit** | ✅ | ✅ | ✅ | ✅ |

## Responsive Design

### Desktop (≥ 768px)
- ViewOnlyBanner: Hiển thị full width với tất cả thông tin
- Layout: Sử dụng grid/flex với spacing lớn
- Typography: Text size lớn hơn
- Padding: Padding lớn hơn

### Mobile (< 768px)
- ViewOnlyBanner: Compact layout, text nhỏ hơn
- MobileViewOnlyNotice: Sticky bottom bar
- Layout: Single column, touch-friendly
- Typography: Text size nhỏ hơn
- Padding: Padding nhỏ hơn, tối ưu cho touch

### Tailwind Breakpoints
```css
/* Mobile first */
px-3 py-2        /* Default (mobile) */
sm:px-4 sm:py-3  /* ≥ 640px */
md:px-6 md:py-4  /* ≥ 768px */
lg:px-8 lg:py-6  /* ≥ 1024px */
```

## Testing Read-Only Mode

### Test Case 1: View Permission
1. Tạo share link với `permission: 'view'`
2. Truy cập link
3. **Expected:**
   - ViewOnlyBanner hiển thị
   - Không có nút "Chỉnh sửa"
   - Không thể click để edit
   - MobileViewOnlyNotice hiển thị (mobile)

### Test Case 2: Attempt to Edit
1. Ở chế độ view-only
2. Try to programmatically call `handleSave()`
3. **Expected:**
   - Function bị chặn
   - Toast error: "⚠️ Bạn không có quyền..."
   - Không có thay đổi trong localStorage

### Test Case 3: Mobile Responsiveness
1. Truy cập link trên mobile
2. Scroll trang
3. **Expected:**
   - MobileViewOnlyNotice sticky ở bottom
   - ViewOnlyBanner compact, dễ đọc
   - Touch-friendly UI

### Test Case 4: Comment Permission
1. Tạo link với `permission: 'comment'`
2. Truy cập link
3. **Expected:**
   - Có thể add/edit comments
   - KHÔNG thể edit product info
   - CommentSection hiển thị

## Security

### Layer 1: UI Layer
- Hide edit buttons khi `canEdit = false`
- Disable input fields
- Conditional rendering

### Layer 2: Logic Layer
- `guardWrite()` wrapper chặn all write operations
- Hook-based permission checks
- Violation callbacks

### Layer 3: Service Layer (Future)
- API-level authentication
- Backend validation
- Rate limiting

## Best Practices

### 1. Luôn sử dụng guardWrite cho Write Operations
```typescript
// ✅ Good
const handleSave = guardWrite(() => {
  service.saveData(data);
});

// ❌ Bad - Không có guard
const handleSave = () => {
  service.saveData(data);
};
```

### 2. Sử dụng canEdit cho Conditional Rendering
```typescript
// ✅ Good
{canEdit && <EditButton />}

// ❌ Bad - Hard-code permission check
{settings.permission === 'edit' && <EditButton />}
```

### 3. Hiển thị Clear Feedback
```typescript
// ✅ Good - Có toast notification
const { guardWrite } = useReadOnlyGuard({
  permission,
  onViolation: () => toast.error('Không có quyền'),
});

// ❌ Bad - Silent failure
const { guardWrite } = useReadOnlyGuard({ permission });
```

## Files Changed

### New Files
- `src/hooks/useReadOnlyGuard.ts` - Read-only guard hook
- `src/features/shareLink/components/ViewOnlyBanner.tsx` - UI components
- `READ_ONLY_MODE.md` - Documentation

### Modified Files
- `src/features/shareLink/components/ProductViewer.tsx`
  - Added useReadOnlyGuard
  - Wrapped save operations with guardWrite
  - Added ViewOnlyBanner và MobileViewOnlyNotice

- `src/features/shareLink/components/SheetViewer.tsx`
  - Added useReadOnlyGuard
  - Wrapped save operations with guardWrite
  - Added ViewOnlyBanner và MobileViewOnlyNotice

- `src/features/shareLink/index.ts` - Export new components
- `src/hooks/index.ts` - Export new hooks

## Migration từ Old Code

### Before
```typescript
// ProductViewer.tsx (old)
const handleSave = () => {
  storageService.saveProducts(products);
};

return (
  <>
    {settings.permission === 'edit' && (
      <button onClick={handleSave}>Save</button>
    )}
  </>
);
```

### After
```typescript
// ProductViewer.tsx (new)
const { canEdit, guardWrite } = useReadOnlyGuard({
  permission: settings.permission,
});

const handleSave = guardWrite(() => {
  storageService.saveProducts(products);
});

return (
  <>
    <ViewOnlyBanner permission={settings.permission} />

    {canEdit && (
      <button onClick={handleSave}>Save</button>
    )}

    <MobileViewOnlyNotice permission={settings.permission} />
  </>
);
```

## Future Enhancements

1. **Offline Detection**: Disable all operations khi offline
2. **Network Error Handling**: Retry logic với exponential backoff
3. **Optimistic Updates**: Update UI trước, sync sau
4. **Conflict Resolution**: Handle concurrent edits
5. **Audit Logging**: Track all write operations
6. **Real-time Sync**: WebSocket cho real-time updates

## Troubleshooting

### Issue: Nút Edit vẫn hiển thị ở view mode
**Solution:** Đảm bảo sử dụng `canEdit` thay vì `settings.permission === 'edit'`

### Issue: Toast không hiển thị khi violate
**Solution:** Check `onViolation` callback có được truyền vào `useReadOnlyGuard`

### Issue: MobileViewOnlyNotice không sticky
**Solution:** Đảm bảo parent container không có `overflow: hidden`

### Issue: Build error về missing dependencies
**Solution:** Run `npm install` và check imports
