# Features Module

Thư mục này chứa các feature modules được tổ chức theo kiến trúc **Feature-based Architecture**.

## Cấu trúc

```
features/
├── shareLink/          # Share Link Feature Module
│   ├── components/     # UI Components
│   └── index.ts        # Public API
│
└── comment/            # Comment Feature Module
    ├── components/     # UI Components
    └── index.ts        # Public API
```

## Các Feature Modules

### 1. Share Link (`shareLink/`)

Module quản lý tính năng chia sẻ sản phẩm và sheet.

**Components:**
- `ShareDialog` - Dialog tạo share link cho sản phẩm đơn lẻ
- `SheetShareDialog` - Dialog tạo share link cho toàn bộ sheet
- `ProductViewer` - Hiển thị sản phẩm khi truy cập qua share link
- `SheetViewer` - Hiển thị danh sách sản phẩm khi share sheet

**Hooks:**
- `useShareLinks()` - Quản lý danh sách share links
- `useShareLinkFromURL()` - Load share link từ URL
- `useProductFromShareLink()` - Load sản phẩm từ share link
- `useCopyShareLink()` - Copy link vào clipboard

**Usage:**
```typescript
import { ShareDialog, useShareLinks } from '@/features/shareLink';

function MyComponent() {
  const { createProductShareLink, getShareURL } = useShareLinks();

  // Use components and hooks...
}
```

---

### 2. Comment (`comment/`)

Module độc lập quản lý hệ thống comment cho sản phẩm.

**Components:**
- `CommentSection` - Component hiển thị và quản lý comments

**Hooks:**
- `useComments()` - Quản lý comments của sản phẩm
- `useCommentEdit()` - Quản lý trạng thái edit comment
- `useCommentTime()` - Format thời gian hiển thị
- `useCommentAuthor()` - Quản lý tên tác giả

**Usage:**
```typescript
import { CommentSection, useComments } from '@/features/comment';

function MyComponent() {
  const {
    comments,
    loading,
    createComment,
    deleteComment
  } = useComments(productId, shareToken);

  // Use components and hooks...
}
```

---

## Nguyên tắc sử dụng

### ✅ DO - Nên làm

```typescript
// Import từ feature module
import { ShareDialog, useShareLinks } from '@/features/shareLink';
import { CommentSection, useComments } from '@/features/comment';

// Sử dụng hooks trong components
function MyComponent() {
  const { createProductShareLink } = useShareLinks();
  const { comments, createComment } = useComments(productId);

  return (
    <>
      <ShareDialog {...props} />
      <CommentSection {...props} />
    </>
  );
}
```

### ❌ DON'T - Không nên làm

```typescript
// ❌ Import trực tiếp từ components folder
import { ShareDialog } from '@/features/shareLink/components/ShareDialog';

// ❌ Gọi service trực tiếp
import { shareableLinkService } from '@/services/shareableLinkService';
const link = shareableLinkService.createShareableLink(...);

// ❌ Business logic trong component
function MyComponent() {
  const [data, setData] = useState([]);
  useEffect(() => {
    const stored = localStorage.getItem('key');
    setData(JSON.parse(stored));
  }, []);
}
```

---

## Kiến trúc Layer

Mỗi feature được tổ chức theo 3 layers:

```
┌─────────────────────────────────┐
│     Components (View Layer)     │  ← UI Components
└────────────┬────────────────────┘
             │
             ▼
┌─────────────────────────────────┐
│      Hooks (Business Logic)     │  ← Custom Hooks
└────────────┬────────────────────┘
             │
             ▼
┌─────────────────────────────────┐
│        API (Data Access)        │  ← API Layer
└────────────┬────────────────────┘
             │
             ▼
┌─────────────────────────────────┐
│      Services (Core Logic)      │  ← Service Layer
└─────────────────────────────────┘
```

## Lợi ích

1. **Tách biệt rõ ràng**: Web Service hoàn toàn tách biệt với Web View
2. **Dễ bảo trì**: Code được tổ chức theo features, dễ tìm và sửa
3. **Tái sử dụng**: Features có thể sử dụng ở nhiều nơi hoặc di chuyển sang project khác
4. **Mở rộng dễ dàng**: Thêm features mới không ảnh hưởng đến code cũ
5. **Test đơn giản**: Mỗi layer có thể test riêng biệt

## Thêm Feature Mới

Để thêm feature mới, tạo cấu trúc sau:

```
features/
└── myNewFeature/
    ├── components/
    │   └── MyComponent.tsx
    ├── types/              # (Optional) Feature-specific types
    │   └── index.ts
    └── index.ts            # Public API exports
```

**Template index.ts:**
```typescript
/**
 * My New Feature Module
 */

// Components
export { MyComponent } from './components/MyComponent';

// Hooks (nếu có)
export { useMyFeature } from '../../hooks/useMyFeature';

// API (nếu có)
export { myFeatureAPI } from '../../api/myFeature.api';
```

---

Xem thêm chi tiết trong [ARCHITECTURE.md](/ARCHITECTURE.md)
