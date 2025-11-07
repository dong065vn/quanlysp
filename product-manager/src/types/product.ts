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
