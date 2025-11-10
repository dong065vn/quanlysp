# Share Link & Comment Architecture

## Tổng quan

Kiến trúc này được thiết kế theo nguyên tắc **Separation of Concerns** và **Clean Architecture**, tách biệt hoàn toàn:
- **Web Service Layer** (API + Services)
- **Business Logic Layer** (Custom Hooks)
- **Presentation Layer** (UI Components)

## Cấu trúc thư mục

```
src/
├── api/                          # API Layer - Giao tiếp với services
│   ├── shareLink.api.ts         # Share Link API
│   ├── comment.api.ts           # Comment API
│   └── index.ts                 # Export tất cả APIs
│
├── hooks/                        # Business Logic Layer
│   ├── useShareLink.ts          # Share Link hooks
│   ├── useComment.ts            # Comment hooks
│   └── index.ts                 # Export tất cả hooks
│
├── features/                     # Feature Modules
│   ├── shareLink/               # Share Link Feature
│   │   ├── components/          # UI Components
│   │   │   ├── ShareDialog.tsx
│   │   │   ├── SheetShareDialog.tsx
│   │   │   ├── ProductViewer.tsx
│   │   │   └── SheetViewer.tsx
│   │   └── index.ts             # Feature exports
│   │
│   └── comment/                 # Comment Feature (Module độc lập)
│       ├── components/          # UI Components
│       │   └── CommentSection.tsx
│       └── index.ts             # Feature exports
│
├── services/                     # Core Services (Data Layer)
│   ├── shareableLinkService.ts  # Share Link Service
│   └── commentService.ts        # Comment Service
│
└── types/                        # TypeScript Types
    └── product.ts               # Shared types
```

## Các Layer và Trách nhiệm

### 1. **Service Layer** (`src/services/`)

**Trách nhiệm:**
- Quản lý lưu trữ dữ liệu (localStorage)
- CRUD operations cơ bản
- Business rules cơ bản (validation, token generation)

**Không được:**
- Giao tiếp trực tiếp với UI components
- Chứa UI logic

**Files:**
- `shareableLinkService.ts` - Quản lý share links
- `commentService.ts` - Quản lý comments

---

### 2. **API Layer** (`src/api/`)

**Trách nhiệm:**
- Wrap service calls với error handling
- Cung cấp consistent API interface
- Return standardized responses (`ApiResponse<T>`)
- Có thể mở rộng cho HTTP API calls trong tương lai

**Pattern:**
```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
```

**Files:**
- `shareLink.api.ts` - Share Link API
- `comment.api.ts` - Comment API

**Ví dụ sử dụng:**
```typescript
const response = await shareLinkAPI.createProductShareLink(productId, settings);
if (response.success && response.data) {
  // Handle success
} else {
  // Handle error: response.error
}
```

---

### 3. **Hooks Layer** (`src/hooks/`)

**Trách nhiệm:**
- Quản lý state của features
- Business logic phức tạp
- Side effects (useEffect, async operations)
- Cung cấp clean interface cho components

**Files:**
- `useShareLink.ts` - Share link hooks
  - `useShareLinks()` - Quản lý danh sách share links
  - `useShareLinkFromURL()` - Load share link từ URL
  - `useProductFromShareLink()` - Load sản phẩm từ share link
  - `useCopyShareLink()` - Copy link vào clipboard

- `useComment.ts` - Comment hooks
  - `useComments()` - Quản lý comments
  - `useCommentEdit()` - Quản lý edit state
  - `useCommentTime()` - Format thời gian
  - `useCommentAuthor()` - Quản lý tên tác giả

**Ví dụ sử dụng:**
```typescript
function MyComponent() {
  const {
    shareLinks,
    loading,
    createProductShareLink
  } = useShareLinks();

  // Component logic...
}
```

---

### 4. **Feature Modules** (`src/features/`)

**Trách nhiệm:**
- Nhóm tất cả code liên quan đến một feature
- Tự chứa (self-contained)
- Export clean public API

**Cấu trúc một Feature Module:**
```
features/shareLink/
├── components/      # UI Components
├── types/          # Feature-specific types (optional)
└── index.ts        # Public API exports
```

**Import từ Feature:**
```typescript
// ✅ Good - Import từ feature module
import { ShareDialog, useShareLinks } from '@/features/shareLink';

// ❌ Bad - Import trực tiếp từ file
import ShareDialog from '@/features/shareLink/components/ShareDialog';
```

---

### 5. **Components Layer** (`src/features/*/components/`)

**Trách nhiệm:**
- Render UI
- Handle user interactions
- Sử dụng hooks cho business logic

**KHÔNG được:**
- Gọi trực tiếp services
- Chứa business logic phức tạp
- Trực tiếp thao tác với localStorage

**Pattern:**
```typescript
function ShareDialog() {
  // ✅ Good - Sử dụng hooks
  const { createProductShareLink } = useShareLinks();
  const { copyToClipboard } = useCopyShareLink();

  // ❌ Bad - Gọi trực tiếp service
  // const link = shareableLinkService.createShareableLink(...);

  // Component logic...
}
```

---

## Luồng dữ liệu (Data Flow)

```
┌─────────────────────────────────────────────────────────────┐
│                        UI Component                          │
│  (ShareDialog, CommentSection, ProductViewer, etc.)         │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ Sử dụng
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                     Custom Hooks                             │
│         (useShareLinks, useComments, etc.)                  │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ Gọi
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                       API Layer                              │
│            (shareLinkAPI, commentAPI)                       │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ Gọi
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                     Service Layer                            │
│     (shareableLinkService, commentService)                  │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ Lưu trữ
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                     localStorage                             │
└─────────────────────────────────────────────────────────────┘
```

## Nguyên tắc thiết kế

### 1. **Single Responsibility Principle**
Mỗi layer chỉ có một trách nhiệm duy nhất:
- Services: Data storage
- API: Communication interface
- Hooks: Business logic
- Components: UI rendering

### 2. **Dependency Rule**
Dependencies chỉ đi theo một chiều:
```
Components → Hooks → API → Services
```
Không được phụ thuộc ngược lại!

### 3. **Separation of Concerns**
- **Web Service** (API + Services) hoàn toàn tách biệt với UI
- **Business Logic** (Hooks) tách biệt với presentation
- **UI Components** chỉ lo render và user interaction

### 4. **Feature-based Organization**
- Code được tổ chức theo features, không theo types
- Mỗi feature là một module độc lập
- Dễ dàng tìm kiếm và bảo trì

## Lợi ích của kiến trúc này

### 1. **Maintainability** (Dễ bảo trì)
- Code được tổ chức rõ ràng theo layers
- Dễ tìm và sửa bugs
- Thay đổi một layer không ảnh hưởng đến layer khác

### 2. **Testability** (Dễ test)
- Mỗi layer có thể test riêng
- Mock dependencies dễ dàng
- Unit test đơn giản hơn

### 3. **Reusability** (Tái sử dụng)
- Hooks có thể sử dụng ở nhiều components
- API layer có thể thay đổi implementation dễ dàng
- Features độc lập, có thể di chuyển sang project khác

### 4. **Scalability** (Mở rộng)
- Dễ dàng thêm features mới
- Có thể migrate sang backend API thật
- Thay đổi storage mechanism (localStorage → IndexedDB → API)

### 5. **Team Collaboration**
- Nhiều người có thể làm việc đồng thời trên các layers khác nhau
- Code conflicts ít hơn
- Onboarding developers mới dễ dàng hơn

## Migration Path (Nâng cấp trong tương lai)

### Phase 1: ✅ Hiện tại - localStorage
```typescript
// API Layer
class ShareLinkAPI {
  async createProductShareLink(...) {
    const link = shareableLinkService.createShareableLink(...);
    return { success: true, data: link };
  }
}
```

### Phase 2: 🔜 Backend API
```typescript
// API Layer (chỉ cần thay đổi layer này!)
class ShareLinkAPI {
  async createProductShareLink(...) {
    const response = await fetch('/api/share-links', {
      method: 'POST',
      body: JSON.stringify({...}),
    });
    const data = await response.json();
    return { success: true, data };
  }
}

// Hooks và Components KHÔNG CẦN THAY ĐỔI!
```

### Phase 3: 🚀 Advanced Features
- Caching layer
- Optimistic updates
- Real-time synchronization
- Offline support

## Best Practices

### ✅ DO

```typescript
// Import từ feature modules
import { ShareDialog, useShareLinks } from '@/features/shareLink';

// Sử dụng hooks trong components
function MyComponent() {
  const { createProductShareLink } = useShareLinks();
  // ...
}

// Centralized error handling trong API layer
async createComment(...) {
  try {
    // ...
  } catch (error) {
    return { success: false, error: error.message };
  }
}
```

### ❌ DON'T

```typescript
// ❌ Import trực tiếp từ components folder
import ShareDialog from '@/features/shareLink/components/ShareDialog';

// ❌ Gọi service trực tiếp từ component
function MyComponent() {
  const link = shareableLinkService.createShareableLink(...);
}

// ❌ Business logic trong component
function MyComponent() {
  const [data, setData] = useState([]);
  useEffect(() => {
    const data = localStorage.getItem('key');
    setData(JSON.parse(data));
  }, []);
}
```

## Ví dụ Complete Flow

### Tạo Share Link

```typescript
// 1. Component gọi hook
function ShareDialog({ product }) {
  const { createProductShareLink } = useShareLinks();
  const { copyToClipboard } = useCopyShareLink();

  const handleShare = async () => {
    const link = await createProductShareLink(product.id, settings);
    if (link) {
      const url = getShareURL(link.token);
      await copyToClipboard(url);
    }
  };
}

// 2. Hook gọi API
function useShareLinks() {
  const createProductShareLink = async (productId, settings) => {
    const response = await shareLinkAPI.createProductShareLink(productId, settings);
    if (response.success) {
      return response.data;
    }
    return null;
  };
}

// 3. API gọi Service
class ShareLinkAPI {
  async createProductShareLink(productId, settings) {
    try {
      const link = shareableLinkService.createShareableLink(productId, settings);
      return { success: true, data: link };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

// 4. Service lưu data
class ShareableLinkService {
  createShareableLink(productId, settings) {
    const link = { /* ... */ };
    const links = this.getAllShareableLinks();
    links.push(link);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(links));
    return link;
  }
}
```

## Kết luận

Kiến trúc này đảm bảo:
- ✅ **Cách ly hoàn toàn** giữa Web Service và Web View
- ✅ **Comment system độc lập** có thể tái sử dụng
- ✅ **Business logic tách biệt** khỏi UI
- ✅ **Dễ dàng bảo trì và mở rộng**
- ✅ **Sẵn sàng migrate sang backend API**
