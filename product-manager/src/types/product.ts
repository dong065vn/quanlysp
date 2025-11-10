export type ProductStatus = 'published' | 'draft' | 'archived' | 'scheduled' | 'private';

export interface ProductImage {
  id: string;
  url: string;
  altText: string;
  isPrimary: boolean;
  sortOrder: number;
}

export interface ProductLink {
  id: string;
  type: 'internal' | 'marketplace' | 'affiliate' | 'social';
  url: string;
  label: string;
  isActive: boolean;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  categoryId?: string;
  categoryName?: string;
  price: number;
  salePrice?: number;
  stockQuantity: number;
  status: ProductStatus;
  publishDate?: string;
  metaTitle?: string;
  metaDescription?: string;
  tags: string[];
  images: ProductImage[];
  links: ProductLink[];
  customFields?: Record<string, string | number | boolean>;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parentId?: string;
}

export interface ProductFormData {
  sku: string;
  name: string;
  description: string;
  shortDescription: string;
  categoryId?: string;
  price: number;
  salePrice?: number;
  stockQuantity: number;
  status: ProductStatus;
  publishDate?: string;
  metaTitle?: string;
  metaDescription?: string;
  tags: string[];
}

export type ShareType = 'product' | 'sheet';

export interface ShareableLink {
  id: string;
  type: ShareType; // 'product' = share 1 sản phẩm, 'sheet' = share toàn bộ danh sách
  productId?: string; // Chỉ có khi type = 'product'
  token: string;
  expiresAt?: string;
  viewCount: number;
  createdAt: string;
  createdBy?: string;
  settings: ShareableLinkSettings;
}

export type SharePermission = 'view' | 'comment' | 'edit';

export interface ShareableLinkSettings {
  permission: SharePermission; // Quyền truy cập: view, comment, edit
  allowProductLinks: boolean; // Cho phép click vào ProductLink
  showPrice: boolean;
  showStock: boolean;
  showDescription: boolean;
  showImages: boolean;
  showTags: boolean;
}

export interface ProductComment {
  id: string;
  productId: string;
  shareToken: string; // Token của link share để phân biệt người comment
  author: string; // Tên người comment
  content: string;
  createdAt: string;
  updatedAt?: string;
  parentId?: string; // Cho phép reply comment
}
