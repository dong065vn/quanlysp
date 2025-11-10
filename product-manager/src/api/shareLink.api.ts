/**
 * API Layer cho Share Link
 * Cung cấp interface để giao tiếp với ShareLink Service
 * Tách biệt business logic khỏi UI components
 */

import type { ShareableLink, ShareableLinkSettings, Product } from '../types/product';
import { shareableLinkService } from '../services/shareableLinkService';

/**
 * Response wrapper cho API calls
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Share Link API Class
 * Tất cả giao tiếp với share link service phải thông qua API này
 */
class ShareLinkAPI {
  /**
   * Tạo share link cho sản phẩm
   */
  async createProductShareLink(
    productId: string,
    settings?: Partial<ShareableLinkSettings>
  ): Promise<ApiResponse<ShareableLink>> {
    try {
      const link = shareableLinkService.createShareableLink(productId, settings);
      return {
        success: true,
        data: link,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create share link',
      };
    }
  }

  /**
   * Tạo share link cho sheet
   */
  async createSheetShareLink(
    settings?: Partial<ShareableLinkSettings>
  ): Promise<ApiResponse<ShareableLink>> {
    try {
      const link = shareableLinkService.createSheetShareableLink(settings);
      return {
        success: true,
        data: link,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create sheet share link',
      };
    }
  }

  /**
   * Lấy tất cả share links
   */
  async getAllShareLinks(): Promise<ApiResponse<ShareableLink[]>> {
    try {
      const links = shareableLinkService.getAllShareableLinks();
      return {
        success: true,
        data: links,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch share links',
      };
    }
  }

  /**
   * Lấy share link theo token
   */
  async getShareLinkByToken(token: string): Promise<ApiResponse<ShareableLink | null>> {
    try {
      const link = shareableLinkService.getShareableLinkByToken(token);
      return {
        success: true,
        data: link,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch share link',
      };
    }
  }

  /**
   * Lấy share links của một sản phẩm
   */
  async getShareLinksByProductId(productId: string): Promise<ApiResponse<ShareableLink[]>> {
    try {
      const links = shareableLinkService.getShareableLinksByProductId(productId);
      return {
        success: true,
        data: links,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch product share links',
      };
    }
  }

  /**
   * Cập nhật share link
   */
  async updateShareLink(
    linkId: string,
    updates: Partial<ShareableLink>
  ): Promise<ApiResponse<ShareableLink | null>> {
    try {
      const link = shareableLinkService.updateShareableLink(linkId, updates);
      return {
        success: true,
        data: link,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update share link',
      };
    }
  }

  /**
   * Xóa share link
   */
  async deleteShareLink(linkId: string): Promise<ApiResponse<boolean>> {
    try {
      const success = shareableLinkService.deleteShareableLink(linkId);
      return {
        success,
        data: success,
        error: success ? undefined : 'Share link not found',
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete share link',
      };
    }
  }

  /**
   * Xóa tất cả share links của sản phẩm
   */
  async deleteShareLinksByProductId(productId: string): Promise<ApiResponse<void>> {
    try {
      shareableLinkService.deleteShareableLinksByProductId(productId);
      return {
        success: true,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete product share links',
      };
    }
  }

  /**
   * Tạo URL đầy đủ cho share link
   */
  getShareURL(token: string): string {
    return shareableLinkService.getShareableURL(token);
  }

  /**
   * Lấy token từ URL hiện tại
   */
  getTokenFromURL(): string | null {
    return shareableLinkService.getTokenFromURL();
  }

  /**
   * Kiểm tra xem có đang ở chế độ view-only không
   */
  isViewOnlyMode(): boolean {
    return shareableLinkService.isViewOnlyMode();
  }

  /**
   * Lấy sản phẩm từ share link
   */
  async getProductFromShareLink(
    token: string,
    allProducts: Product[]
  ): Promise<ApiResponse<Product | null>> {
    try {
      const product = shareableLinkService.getProductFromShareableLink(token, allProducts);
      return {
        success: true,
        data: product,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch product from share link',
      };
    }
  }
}

// Export singleton instance
export const shareLinkAPI = new ShareLinkAPI();
