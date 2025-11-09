import type { ShareableLink, ShareableLinkSettings, Product } from '../types/product';

const STORAGE_KEY = 'shareable_links';

/**
 * Service quản lý các shareable links cho sản phẩm
 */
class ShareableLinkService {
  /**
   * Tạo token ngẫu nhiên cho shareable link
   */
  private generateToken(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const length = 16;
    let token = '';
    for (let i = 0; i < length; i++) {
      token += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return token;
  }

  /**
   * Tạo shareable link cho sản phẩm
   */
  createShareableLink(
    productId: string,
    settings?: Partial<ShareableLinkSettings>
  ): ShareableLink {
    const defaultSettings: ShareableLinkSettings = {
      allowProductLinks: true, // Mặc định cho phép click vào ProductLink
      showPrice: true,
      showStock: true,
      showDescription: true,
      showImages: true,
      showTags: true,
    };

    const shareableLink: ShareableLink = {
      id: `share_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      productId,
      token: this.generateToken(),
      viewCount: 0,
      createdAt: new Date().toISOString(),
      settings: { ...defaultSettings, ...settings },
    };

    // Lưu vào storage
    const links = this.getAllShareableLinks();
    links.push(shareableLink);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(links));

    return shareableLink;
  }

  /**
   * Lấy tất cả shareable links
   */
  getAllShareableLinks(): ShareableLink[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error loading shareable links:', error);
      return [];
    }
  }

  /**
   * Lấy shareable link theo token
   */
  getShareableLinkByToken(token: string): ShareableLink | null {
    const links = this.getAllShareableLinks();
    const link = links.find(l => l.token === token);

    if (!link) return null;

    // Kiểm tra expired
    if (link.expiresAt && new Date(link.expiresAt) < new Date()) {
      return null;
    }

    // Tăng view count
    link.viewCount++;
    this.updateShareableLink(link.id, { viewCount: link.viewCount });

    return link;
  }

  /**
   * Lấy shareable links của một sản phẩm
   */
  getShareableLinksByProductId(productId: string): ShareableLink[] {
    const links = this.getAllShareableLinks();
    return links.filter(l => l.productId === productId);
  }

  /**
   * Cập nhật shareable link
   */
  updateShareableLink(
    linkId: string,
    updates: Partial<ShareableLink>
  ): ShareableLink | null {
    const links = this.getAllShareableLinks();
    const index = links.findIndex(l => l.id === linkId);

    if (index === -1) return null;

    links[index] = { ...links[index], ...updates };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(links));

    return links[index];
  }

  /**
   * Xóa shareable link
   */
  deleteShareableLink(linkId: string): boolean {
    const links = this.getAllShareableLinks();
    const filtered = links.filter(l => l.id !== linkId);

    if (filtered.length === links.length) return false;

    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    return true;
  }

  /**
   * Tạo URL đầy đủ cho shareable link
   */
  getShareableURL(token: string): string {
    const baseURL = window.location.origin;
    return `${baseURL}?share=${token}`;
  }

  /**
   * Parse token từ URL
   */
  getTokenFromURL(): string | null {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('share');
  }

  /**
   * Kiểm tra xem có phải đang ở chế độ view-only không
   */
  isViewOnlyMode(): boolean {
    return this.getTokenFromURL() !== null;
  }

  /**
   * Lấy sản phẩm từ shareable link
   */
  getProductFromShareableLink(token: string, allProducts: Product[]): Product | null {
    const link = this.getShareableLinkByToken(token);
    if (!link) return null;

    const product = allProducts.find(p => p.id === link.productId);
    return product || null;
  }

  /**
   * Xóa tất cả shareable links của một sản phẩm
   */
  deleteShareableLinksByProductId(productId: string): void {
    const links = this.getAllShareableLinks();
    const filtered = links.filter(l => l.productId !== productId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  }
}

export const shareableLinkService = new ShareableLinkService();
