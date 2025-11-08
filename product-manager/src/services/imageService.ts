import { MAX_IMAGE_SIZE_BYTES, MESSAGES } from '../constants/config';
import type { ProductImage } from '../types/product';

/**
 * ImageService - Handles all image-related operations
 * Separated from components to follow Single Responsibility Principle
 */
class ImageService {
  /**
   * Validate image file
   */
  validateImage(file: File): { valid: boolean; error?: string } {
    // Check if file exists
    if (!file) {
      return { valid: false, error: 'Không có file ảnh' };
    }

    // Check file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      return {
        valid: false,
        error: 'Chỉ chấp nhận file ảnh (JPG, PNG, GIF, WEBP)',
      };
    }

    // Check file size (max 5MB)
    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      return {
        valid: false,
        error: MESSAGES.IMAGE_TOO_LARGE,
      };
    }

    return { valid: true };
  }

  /**
   * Read image as Data URL
   */
  async readImageAsDataURL(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const validation = this.validateImage(file);
      if (!validation.valid) {
        reject(new Error(validation.error));
        return;
      }

      const reader = new FileReader();

      reader.onload = (e) => {
        const result = e.target?.result;
        if (typeof result === 'string') {
          resolve(result);
        } else {
          reject(new Error('Không thể đọc file ảnh'));
        }
      };

      reader.onerror = () => {
        reject(new Error('Lỗi đọc file ảnh'));
      };

      reader.readAsDataURL(file);
    });
  }

  /**
   * Create ProductImage from file
   */
  async createImageFromFile(
    file: File,
    isPrimary: boolean = false,
    sortOrder: number = 0
  ): Promise<ProductImage> {
    const url = await this.readImageAsDataURL(file);

    return {
      id: `img-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      url,
      altText: file.name.replace(/\.[^/.]+$/, ''), // Remove extension
      isPrimary,
      sortOrder,
    };
  }

  /**
   * Set primary image
   */
  setPrimaryImage(images: ProductImage[], imageId: string): ProductImage[] {
    return images.map(img => ({
      ...img,
      isPrimary: img.id === imageId,
    }));
  }

  /**
   * Add image to collection
   */
  addImage(images: ProductImage[], newImage: ProductImage): ProductImage[] {
    // If this is the first image, make it primary
    if (images.length === 0) {
      newImage.isPrimary = true;
    }

    return [...images, newImage];
  }

  /**
   * Remove image from collection
   */
  removeImage(images: ProductImage[], imageId: string): ProductImage[] {
    const filtered = images.filter(img => img.id !== imageId);

    // If we removed the primary image, set the first image as primary
    const hadPrimary = images.find(img => img.id === imageId)?.isPrimary;
    if (hadPrimary && filtered.length > 0) {
      filtered[0].isPrimary = true;
    }

    return filtered;
  }

  /**
   * Update image alt text
   */
  updateAltText(
    images: ProductImage[],
    imageId: string,
    altText: string
  ): ProductImage[] {
    return images.map(img =>
      img.id === imageId ? { ...img, altText } : img
    );
  }

  /**
   * Reorder images
   */
  reorderImages(images: ProductImage[], from: number, to: number): ProductImage[] {
    const result = [...images];
    const [removed] = result.splice(from, 1);
    result.splice(to, 0, removed);

    // Update sortOrder
    return result.map((img, index) => ({
      ...img,
      sortOrder: index,
    }));
  }

  /**
   * Get primary image
   */
  getPrimaryImage(images: ProductImage[]): ProductImage | undefined {
    return images.find(img => img.isPrimary) || images[0];
  }

  /**
   * Format file size
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }

  /**
   * Compress image (basic implementation)
   * For production, consider using a library like browser-image-compression
   */
  async compressImage(file: File, quality: number = 0.8): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Canvas context not available'));
            return;
          }

          ctx.drawImage(img, 0, 0);

          canvas.toBlob(
            (blob) => {
              if (blob) {
                resolve(blob);
              } else {
                reject(new Error('Failed to compress image'));
              }
            },
            file.type,
            quality
          );
        };

        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = e.target?.result as string;
      };

      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  }
}

export const imageService = new ImageService();
