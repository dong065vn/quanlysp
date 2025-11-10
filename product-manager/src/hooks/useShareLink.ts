/**
 * Custom Hook cho Share Link Business Logic
 * Tách biệt business logic khỏi UI components
 */

import { useState, useCallback, useEffect } from 'react';
import type { ShareableLink, ShareableLinkSettings, Product } from '../types/product';
import { shareLinkAPI } from '../api/shareLink.api';

/**
 * Hook để quản lý share links
 */
export function useShareLinks() {
  const [shareLinks, setShareLinks] = useState<ShareableLink[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load tất cả share links
  const loadShareLinks = useCallback(async () => {
    setLoading(true);
    setError(null);

    const response = await shareLinkAPI.getAllShareLinks();

    if (response.success && response.data) {
      setShareLinks(response.data);
    } else {
      setError(response.error || 'Failed to load share links');
    }

    setLoading(false);
  }, []);

  // Tạo share link cho sản phẩm
  const createProductShareLink = useCallback(async (
    productId: string,
    settings?: Partial<ShareableLinkSettings>
  ) => {
    setLoading(true);
    setError(null);

    const response = await shareLinkAPI.createProductShareLink(productId, settings);

    if (response.success && response.data) {
      setShareLinks(prev => [...prev, response.data!]);
      setLoading(false);
      return response.data;
    } else {
      setError(response.error || 'Failed to create share link');
      setLoading(false);
      return null;
    }
  }, []);

  // Tạo share link cho sheet
  const createSheetShareLink = useCallback(async (
    settings?: Partial<ShareableLinkSettings>
  ) => {
    setLoading(true);
    setError(null);

    const response = await shareLinkAPI.createSheetShareLink(settings);

    if (response.success && response.data) {
      setShareLinks(prev => [...prev, response.data!]);
      setLoading(false);
      return response.data;
    } else {
      setError(response.error || 'Failed to create sheet share link');
      setLoading(false);
      return null;
    }
  }, []);

  // Xóa share link
  const deleteShareLink = useCallback(async (linkId: string) => {
    setLoading(true);
    setError(null);

    const response = await shareLinkAPI.deleteShareLink(linkId);

    if (response.success) {
      setShareLinks(prev => prev.filter(link => link.id !== linkId));
      setLoading(false);
      return true;
    } else {
      setError(response.error || 'Failed to delete share link');
      setLoading(false);
      return false;
    }
  }, []);

  // Get share URL
  const getShareURL = useCallback((token: string) => {
    return shareLinkAPI.getShareURL(token);
  }, []);

  return {
    shareLinks,
    loading,
    error,
    loadShareLinks,
    createProductShareLink,
    createSheetShareLink,
    deleteShareLink,
    getShareURL,
  };
}

/**
 * Hook để xử lý share link từ URL
 */
export function useShareLinkFromURL() {
  const [shareLink, setShareLink] = useState<ShareableLink | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadShareLink = async () => {
      const token = shareLinkAPI.getTokenFromURL();

      if (!token) {
        setLoading(false);
        return;
      }

      const response = await shareLinkAPI.getShareLinkByToken(token);

      if (response.success && response.data) {
        setShareLink(response.data);
      } else {
        setError(response.error || 'Share link not found or expired');
      }

      setLoading(false);
    };

    loadShareLink();
  }, []);

  const isViewOnlyMode = shareLinkAPI.isViewOnlyMode();

  return {
    shareLink,
    loading,
    error,
    isViewOnlyMode,
  };
}

/**
 * Hook để lấy sản phẩm từ share link
 */
export function useProductFromShareLink(token: string | null, allProducts: Product[]) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setProduct(null);
      return;
    }

    const loadProduct = async () => {
      setLoading(true);
      setError(null);

      const response = await shareLinkAPI.getProductFromShareLink(token, allProducts);

      if (response.success && response.data) {
        setProduct(response.data);
      } else {
        setError(response.error || 'Product not found');
      }

      setLoading(false);
    };

    loadProduct();
  }, [token, allProducts]);

  return {
    product,
    loading,
    error,
  };
}

/**
 * Hook để copy share link vào clipboard
 */
export function useCopyShareLink() {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = useCallback(async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      return true;
    } catch (error) {
      console.error('Failed to copy:', error);
      return false;
    }
  }, []);

  return {
    copied,
    copyToClipboard,
  };
}
