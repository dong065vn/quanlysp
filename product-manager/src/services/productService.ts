import type { Product } from '../types/product';

/**
 * ProductService - Handles all product CRUD operations
 * Separated from storage to follow Single Responsibility Principle
 */
class ProductService {
  /**
   * Filter products by status
   */
  filterByStatus(products: Product[], status: string): Product[] {
    if (status === 'all') {
      return products;
    }
    return products.filter(p => p.status === status);
  }

  /**
   * Search products by query
   * Searches in: name, category, sku
   */
  searchProducts(products: Product[], query: string): Product[] {
    if (!query || query.trim() === '') {
      return products;
    }

    const lowerQuery = query.toLowerCase().trim();

    return products.filter(product => {
      return (
        product.name.toLowerCase().includes(lowerQuery) ||
        product.category.toLowerCase().includes(lowerQuery) ||
        product.sku.toLowerCase().includes(lowerQuery)
      );
    });
  }

  /**
   * Filter and search products
   */
  filterAndSearch(
    products: Product[],
    statusFilter: string,
    searchQuery: string
  ): Product[] {
    let filtered = this.filterByStatus(products, statusFilter);
    filtered = this.searchProducts(filtered, searchQuery);
    return filtered;
  }

  /**
   * Get product by ID
   */
  getById(products: Product[], id: string): Product | undefined {
    return products.find(p => p.id === id);
  }

  /**
   * Get products by category
   */
  getByCategory(products: Product[], category: string): Product[] {
    return products.filter(p => p.category === category);
  }

  /**
   * Get products by status
   */
  getByStatus(products: Product[], status: Product['status']): Product[] {
    return products.filter(p => p.status === status);
  }

  /**
   * Get low stock products
   */
  getLowStockProducts(products: Product[], threshold: number = 10): Product[] {
    return products.filter(p => p.quantity <= threshold);
  }

  /**
   * Get product statistics
   */
  getStats(products: Product[]) {
    return {
      total: products.length,
      published: products.filter(p => p.status === 'published').length,
      draft: products.filter(p => p.status === 'draft').length,
      archived: products.filter(p => p.status === 'archived').length,
      lowStock: this.getLowStockProducts(products).length,
      categories: [...new Set(products.map(p => p.category))].length,
    };
  }

  /**
   * Sort products by field
   */
  sortBy(
    products: Product[],
    field: keyof Product,
    direction: 'asc' | 'desc' = 'asc'
  ): Product[] {
    return [...products].sort((a, b) => {
      const aVal = a[field];
      const bVal = b[field];

      if (aVal === undefined || bVal === undefined) return 0;

      let comparison = 0;
      if (aVal < bVal) comparison = -1;
      if (aVal > bVal) comparison = 1;

      return direction === 'asc' ? comparison : -comparison;
    });
  }

  /**
   * Validate product data
   */
  validate(product: Partial<Product>): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!product.name || product.name.trim() === '') {
      errors.push('Tên sản phẩm không được để trống');
    }

    if (!product.category || product.category.trim() === '') {
      errors.push('Danh mục không được để trống');
    }

    if (!product.sku || product.sku.trim() === '') {
      errors.push('Mã SKU không được để trống');
    }

    if (product.price !== undefined && product.price < 0) {
      errors.push('Giá không được âm');
    }

    if (product.quantity !== undefined && product.quantity < 0) {
      errors.push('Số lượng không được âm');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Create a new product with defaults
   */
  createProduct(data: Partial<Product>): Product {
    const now = new Date().toISOString();

    return {
      id: `product-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: data.name || '',
      category: data.category || '',
      sku: data.sku || '',
      price: data.price || 0,
      quantity: data.quantity || 0,
      status: data.status || 'draft',
      createdAt: now,
      updatedAt: now,
      description: data.description || '',
      image: data.image,
      links: data.links || [],
    };
  }

  /**
   * Update a product
   */
  updateProduct(product: Product, updates: Partial<Product>): Product {
    return {
      ...product,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
  }

  /**
   * Check if SKU is unique
   */
  isSkuUnique(products: Product[], sku: string, excludeId?: string): boolean {
    return !products.some(p => p.sku === sku && p.id !== excludeId);
  }

  /**
   * Get all unique categories
   */
  getCategories(products: Product[]): string[] {
    return [...new Set(products.map(p => p.category))].sort();
  }

  /**
   * Calculate total inventory value
   */
  getTotalValue(products: Product[]): number {
    return products.reduce((sum, p) => sum + (p.price * p.quantity), 0);
  }
}

export const productService = new ProductService();
