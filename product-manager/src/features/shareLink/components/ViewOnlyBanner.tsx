/**
 * View-Only Banner Component
 * Hiển thị banner cảnh báo khi ở chế độ view-only
 */

import { Eye, Lock, Info } from 'lucide-react';
import type { SharePermission } from '../../../types/product';

interface ViewOnlyBannerProps {
  permission: SharePermission;
  className?: string;
}

export function ViewOnlyBanner({ permission, className = '' }: ViewOnlyBannerProps) {
  if (permission !== 'view') {
    return null;
  }

  return (
    <div className={`bg-gradient-to-r from-blue-50 via-cyan-50 to-blue-50 border-2 border-blue-200 rounded-xl p-3 sm:p-4 ${className}`}>
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
          <Lock size={20} className="text-blue-600" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Eye size={16} className="text-blue-600" />
            <h3 className="text-sm sm:text-base font-bold text-blue-900">
              Chế độ Chỉ Xem
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-blue-700 leading-relaxed">
            Bạn đang xem nội dung này qua link chia sẻ.
            <span className="font-semibold"> Bạn không thể chỉnh sửa, thêm hoặc xóa bất kỳ thông tin nào.</span>
            {' '}Tất cả dữ liệu được hiển thị ở chế độ chỉ đọc.
          </p>

          {/* Features */}
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs font-medium">
              <Info size={12} />
              <span>Không thể chỉnh sửa</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs font-medium">
              <Lock size={12} />
              <span>Dữ liệu được bảo vệ</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs font-medium">
              <Eye size={12} />
              <span>Chỉ xem được</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Inline View-Only Badge (nhỏ gọn hơn)
 */
export function ViewOnlyBadge() {
  return (
    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg text-xs sm:text-sm font-medium">
      <Lock size={14} />
      <span>Chế độ chỉ xem - Không thể chỉnh sửa</span>
    </div>
  );
}

/**
 * Mobile-friendly View-Only Notice
 */
export function MobileViewOnlyNotice({ permission }: { permission: SharePermission }) {
  if (permission !== 'view') {
    return null;
  }

  return (
    <div className="sticky bottom-0 left-0 right-0 bg-blue-600 text-white p-2 text-center text-xs sm:text-sm font-medium shadow-lg z-50 md:hidden">
      <div className="flex items-center justify-center gap-2">
        <Lock size={14} />
        <span>Chế độ chỉ xem - Không thể chỉnh sửa</span>
      </div>
    </div>
  );
}
