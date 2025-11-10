/**
 * Read-Only Guard Hook
 * Đảm bảo không có bất kỳ API call nào khi ở chế độ view-only
 */

import { useCallback } from 'react';
import type { SharePermission } from '../types/product';

interface UseReadOnlyGuardOptions {
  permission: SharePermission;
  onViolation?: () => void;
}

/**
 * Hook để guard tất cả operations khi ở chế độ view-only
 */
export function useReadOnlyGuard({ permission, onViolation }: UseReadOnlyGuardOptions) {
  const isReadOnly = permission === 'view';
  const canComment = permission === 'comment' || permission === 'edit';
  const canEdit = permission === 'edit';

  /**
   * Wrap một function để guard chống write operations
   */
  const guardWrite = useCallback(
    <T extends (...args: any[]) => any>(fn: T, requiredPermission: 'comment' | 'edit' = 'edit'): T => {
      return ((...args: any[]) => {
        if (requiredPermission === 'edit' && !canEdit) {
          console.warn('⚠️ Attempted to perform edit operation in view-only mode');
          onViolation?.();
          return;
        }

        if (requiredPermission === 'comment' && !canComment) {
          console.warn('⚠️ Attempted to perform comment operation without permission');
          onViolation?.();
          return;
        }

        return fn(...args);
      }) as T;
    },
    [canEdit, canComment, onViolation]
  );

  /**
   * Kiểm tra xem có được phép thực hiện action không
   */
  const canPerform = useCallback(
    (action: 'view' | 'comment' | 'edit'): boolean => {
      switch (action) {
        case 'view':
          return true;
        case 'comment':
          return canComment;
        case 'edit':
          return canEdit;
        default:
          return false;
      }
    },
    [canComment, canEdit]
  );

  /**
   * Chặn tất cả localStorage writes khi ở read-only mode
   */
  const guardedLocalStorage = {
    setItem: guardWrite((key: string, value: string) => {
      localStorage.setItem(key, value);
    }),
    removeItem: guardWrite((key: string) => {
      localStorage.removeItem(key);
    }),
    clear: guardWrite(() => {
      localStorage.clear();
    }),
    getItem: (key: string) => localStorage.getItem(key),
    key: (index: number) => localStorage.key(index),
    get length() {
      return localStorage.length;
    },
  };

  return {
    isReadOnly,
    canComment,
    canEdit,
    canPerform,
    guardWrite,
    guardedLocalStorage,
  };
}

/**
 * Hook để hiển thị permission badge
 */
export function usePermissionBadge(permission: SharePermission) {
  const badges = {
    view: {
      label: 'Chỉ xem',
      color: 'bg-blue-50 text-blue-600 border-blue-200',
      icon: '👁️',
      description: 'Bạn đang xem sản phẩm này ở chế độ chỉ đọc',
    },
    comment: {
      label: 'Nhận xét',
      color: 'bg-green-50 text-green-600 border-green-200',
      icon: '💬',
      description: 'Bạn có thể xem và thêm nhận xét cho sản phẩm này',
    },
    edit: {
      label: 'Chỉnh sửa',
      color: 'bg-orange-50 text-orange-600 border-orange-200',
      icon: '✏️',
      description: 'Bạn có thể chỉnh sửa thông tin sản phẩm này',
    },
  };

  return badges[permission];
}
