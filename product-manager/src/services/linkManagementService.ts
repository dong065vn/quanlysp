import type { ProductLink } from '../types/product';

/**
 * LinkManagementService - Handles product links management
 * Separated from components to follow Single Responsibility Principle
 */
class LinkManagementService {
  /**
   * Validate URL format
   */
  validateUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      // Try adding https:// if missing
      try {
        new URL(`https://${url}`);
        return true;
      } catch {
        return false;
      }
    }
  }

  /**
   * Normalize URL (add https:// if missing)
   */
  normalizeUrl(url: string): string {
    if (!url) return '';

    // If URL already has protocol, return as is
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }

    // Add https:// by default
    return `https://${url}`;
  }

  /**
   * Create a new product link
   */
  createLink(data: {
    type: ProductLink['type'];
    url: string;
    label: string;
    isActive?: boolean;
  }): ProductLink {
    return {
      id: `link-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: data.type,
      url: this.normalizeUrl(data.url),
      label: data.label,
      isActive: data.isActive !== undefined ? data.isActive : true,
    };
  }

  /**
   * Add link to collection
   */
  addLink(links: ProductLink[], newLink: ProductLink): ProductLink[] {
    return [...links, newLink];
  }

  /**
   * Update a link
   */
  updateLink(
    links: ProductLink[],
    linkId: string,
    updates: Partial<Omit<ProductLink, 'id'>>
  ): ProductLink[] {
    return links.map(link => {
      if (link.id !== linkId) return link;

      return {
        ...link,
        ...updates,
        // Normalize URL if it's being updated
        url: updates.url ? this.normalizeUrl(updates.url) : link.url,
      };
    });
  }

  /**
   * Remove link from collection
   */
  removeLink(links: ProductLink[], linkId: string): ProductLink[] {
    return links.filter(link => link.id !== linkId);
  }

  /**
   * Toggle link active status
   */
  toggleLinkStatus(links: ProductLink[], linkId: string): ProductLink[] {
    return links.map(link =>
      link.id === linkId ? { ...link, isActive: !link.isActive } : link
    );
  }

  /**
   * Get active links only
   */
  getActiveLinks(links: ProductLink[]): ProductLink[] {
    return links.filter(link => link.isActive);
  }

  /**
   * Get links by type
   */
  getLinksByType(links: ProductLink[], type: ProductLink['type']): ProductLink[] {
    return links.filter(link => link.type === type);
  }

  /**
   * Validate link data
   */
  validateLink(link: Partial<ProductLink>): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!link.url || link.url.trim() === '') {
      errors.push('URL không được để trống');
    } else if (!this.validateUrl(link.url)) {
      errors.push('URL không hợp lệ');
    }

    if (!link.label || link.label.trim() === '') {
      errors.push('Nhãn không được để trống');
    }

    if (!link.type) {
      errors.push('Loại link không được để trống');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Get link type label (Vietnamese)
   */
  getLinkTypeLabel(type: ProductLink['type']): string {
    const labels: Record<ProductLink['type'], string> = {
      internal: 'Nội bộ',
      marketplace: 'Sàn TMĐT',
      affiliate: 'Liên kết',
      social: 'Mạng xã hội',
    };

    return labels[type] || type;
  }

  /**
   * Get link type icon
   */
  getLinkTypeIcon(type: ProductLink['type']): string {
    const icons: Record<ProductLink['type'], string> = {
      internal: '🔗',
      marketplace: '🛒',
      affiliate: '💰',
      social: '📱',
    };

    return icons[type] || '🔗';
  }

  /**
   * Sort links by type and label
   */
  sortLinks(links: ProductLink[]): ProductLink[] {
    const typeOrder: ProductLink['type'][] = [
      'internal',
      'marketplace',
      'affiliate',
      'social',
    ];

    return [...links].sort((a, b) => {
      // First sort by type
      const typeComparison =
        typeOrder.indexOf(a.type) - typeOrder.indexOf(b.type);
      if (typeComparison !== 0) return typeComparison;

      // Then sort by label
      return a.label.localeCompare(b.label, 'vi');
    });
  }

  /**
   * Extract domain from URL
   */
  extractDomain(url: string): string {
    try {
      const normalizedUrl = this.normalizeUrl(url);
      const urlObj = new URL(normalizedUrl);
      return urlObj.hostname.replace('www.', '');
    } catch {
      return '';
    }
  }

  /**
   * Check if URL is external
   */
  isExternalUrl(url: string, currentDomain: string): boolean {
    const domain = this.extractDomain(url);
    return domain !== '' && domain !== currentDomain;
  }
}

export const linkManagementService = new LinkManagementService();
