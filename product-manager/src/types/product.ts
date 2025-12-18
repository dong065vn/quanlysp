export type ProductStatus = 'published' | 'draft' | 'archived' | 'scheduled' | 'private';

// Visibility control for storefront
export type ProductVisibility = 'public' | 'hidden' | 'restricted';

export interface AllowedViewer {
  id: string;
  email: string;
  name?: string;
}

// Share settings like Google Docs/Sheets
export type ShareAccess = 'view' | 'edit' | 'admin';
export type LinkShareAccess = 'off' | 'view' | 'edit';

export interface SharedUser {
  id: string;
  email: string;
  name?: string;
  access: ShareAccess;
  addedAt: string;
}

export interface ShareSettings {
  linkAccess: LinkShareAccess; // Anyone with link
  shareId: string; // Unique share ID for URL
  sharedUsers: SharedUser[]; // Specific users
  isPubliclyAccessible: boolean;
}

// Store-level share settings (share entire store like Google Sheets)
export interface StoreShareSettings {
  storeName: string;
  storeId: string;
  linkAccess: LinkShareAccess;
  sharedUsers: SharedUser[];
  createdAt: string;
  updatedAt: string;
}

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
  visibility: ProductVisibility;
  allowedViewers?: AllowedViewer[];
  shareSettings?: ShareSettings;
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

// Store contact info for shared product pages
export interface StoreContactInfo {
  storeName: string;
  phone?: string;
  zalo?: string;
  facebook?: string;
  email?: string;
  address?: string;
  workingHours?: string;
  logo?: string;
}
