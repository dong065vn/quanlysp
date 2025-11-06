import type { Product, Category } from '../types/product';
import { googleAuthService } from './googleAuth';
import { syncService } from './syncService';

const STORAGE_KEYS = {
  PRODUCTS: 'products',
  CATEGORIES: 'categories',
  DRIVE_SYNC_ENABLED: 'driveSyncEnabled',
};

class StorageService {
  private autoSyncEnabled = false;

  constructor() {
    // Load sync preference
    this.autoSyncEnabled = localStorage.getItem(STORAGE_KEYS.DRIVE_SYNC_ENABLED) === 'true';
  }

  // Products
  getProducts(): Product[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error loading products:', error);
      return [];
    }
  }

  saveProducts(products: Product[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));

      // Auto-sync to cloud if enabled
      if (this.autoSyncEnabled && googleAuthService.isAuthenticated()) {
        syncService.syncToCloud(products).catch(error => {
          console.error('Auto-sync to cloud failed:', error);
        });
      }
    } catch (error) {
      console.error('Error saving products:', error);
    }
  }

  getProduct(id: string): Product | undefined {
    const products = this.getProducts();
    return products.find(p => p.id === id);
  }

  addProduct(product: Product): void {
    const products = this.getProducts();
    products.push(product);
    this.saveProducts(products);
  }

  updateProduct(id: string, updatedProduct: Partial<Product>): void {
    const products = this.getProducts();
    const index = products.findIndex(p => p.id === id);
    if (index !== -1) {
      products[index] = { ...products[index], ...updatedProduct, updatedAt: new Date().toISOString() };
      this.saveProducts(products);
    }
  }

  deleteProduct(id: string): void {
    const products = this.getProducts();
    const filtered = products.filter(p => p.id !== id);
    this.saveProducts(filtered);
  }

  deleteProducts(ids: string[]): void {
    const products = this.getProducts();
    const filtered = products.filter(p => !ids.includes(p.id));
    this.saveProducts(filtered);
  }

  // Categories
  getCategories(): Category[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
      return data ? JSON.parse(data) : this.getDefaultCategories();
    } catch (error) {
      console.error('Error loading categories:', error);
      return this.getDefaultCategories();
    }
  }

  saveCategories(categories: Category[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
    } catch (error) {
      console.error('Error saving categories:', error);
    }
  }

  addCategory(category: Category): void {
    const categories = this.getCategories();
    categories.push(category);
    this.saveCategories(categories);
  }

  updateCategory(id: string, updatedCategory: Partial<Category>): void {
    const categories = this.getCategories();
    const index = categories.findIndex(c => c.id === id);
    if (index !== -1) {
      categories[index] = { ...categories[index], ...updatedCategory };
      this.saveCategories(categories);
    }
  }

  deleteCategory(id: string): void {
    const categories = this.getCategories();
    const filtered = categories.filter(c => c.id !== id);
    this.saveCategories(filtered);
  }

  // Helper methods
  private getDefaultCategories(): Category[] {
    return [
      { id: '1', name: 'Điện thoại', slug: 'dien-thoai' },
      { id: '2', name: 'Laptop', slug: 'laptop' },
      { id: '3', name: 'Tablet', slug: 'tablet' },
      { id: '4', name: 'Phụ kiện', slug: 'phu-kien' },
    ];
  }

  // Clear all data
  clearAll(): void {
    localStorage.removeItem(STORAGE_KEYS.PRODUCTS);
    localStorage.removeItem(STORAGE_KEYS.CATEGORIES);
  }

  // Google Drive Sync Settings
  enableDriveSync(): void {
    this.autoSyncEnabled = true;
    localStorage.setItem(STORAGE_KEYS.DRIVE_SYNC_ENABLED, 'true');
  }

  disableDriveSync(): void {
    this.autoSyncEnabled = false;
    localStorage.setItem(STORAGE_KEYS.DRIVE_SYNC_ENABLED, 'false');
  }

  isDriveSyncEnabled(): boolean {
    return this.autoSyncEnabled;
  }

  // Initialize with sample data
  initializeSampleData(): void {
    const existingProducts = this.getProducts();
    if (existingProducts.length === 0) {
      const sampleProducts: Product[] = [
        {
          id: '1',
          sku: 'IP15PM-256',
          name: 'iPhone 15 Pro Max 256GB',
          slug: 'iphone-15-pro-max-256gb',
          description: 'iPhone 15 Pro Max với chip A17 Pro mạnh mẽ, camera 48MP, màn hình Super Retina XDR 6.7 inch',
          shortDescription: 'iPhone 15 Pro Max 256GB - Titanium Blue',
          categoryId: '1',
          categoryName: 'Điện thoại',
          price: 29990000,
          salePrice: 28990000,
          stockQuantity: 45,
          status: 'published',
          tags: ['iPhone', 'Apple', 'Premium'],
          images: [],
          links: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: '2',
          sku: 'SGS24U-512',
          name: 'Samsung Galaxy S24 Ultra',
          slug: 'samsung-galaxy-s24-ultra',
          description: 'Samsung Galaxy S24 Ultra với S Pen tích hợp, camera 200MP, màn hình Dynamic AMOLED 2X',
          shortDescription: 'Samsung S24 Ultra 512GB - Titanium Gray',
          categoryId: '1',
          categoryName: 'Điện thoại',
          price: 27990000,
          stockQuantity: 32,
          status: 'published',
          tags: ['Samsung', 'Android', 'Flagship'],
          images: [],
          links: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: '3',
          sku: 'MBP-M3-14',
          name: 'MacBook Pro M3 14 inch',
          slug: 'macbook-pro-m3-14',
          description: 'MacBook Pro 14" với chip M3, màn hình Liquid Retina XDR, hiệu năng vượt trội',
          shortDescription: 'MacBook Pro M3 14" - Space Gray',
          categoryId: '2',
          categoryName: 'Laptop',
          price: 45990000,
          stockQuantity: 8,
          status: 'draft',
          tags: ['MacBook', 'Apple', 'M3'],
          images: [],
          links: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: '4',
          sku: 'APP-G2',
          name: 'AirPods Pro Gen 2',
          slug: 'airpods-pro-gen-2',
          description: 'AirPods Pro thế hệ 2 với chip H2, chống ồn chủ động, âm thanh không gian',
          shortDescription: 'AirPods Pro 2 - USB-C',
          categoryId: '4',
          categoryName: 'Phụ kiện',
          price: 5990000,
          stockQuantity: 125,
          status: 'published',
          tags: ['AirPods', 'Apple', 'Audio'],
          images: [],
          links: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: '5',
          sku: 'IPA-M2-24',
          name: 'iPad Air M2 2024',
          slug: 'ipad-air-m2-2024',
          description: 'iPad Air với chip M2, màn hình Liquid Retina 10.9 inch, hỗ trợ Apple Pencil Pro',
          shortDescription: 'iPad Air M2 - 11" - Blue',
          categoryId: '3',
          categoryName: 'Tablet',
          price: 16990000,
          stockQuantity: 0,
          status: 'archived',
          tags: ['iPad', 'Apple', 'M2'],
          images: [],
          links: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];
      this.saveProducts(sampleProducts);
    }
  }
}

export const storageService = new StorageService();
