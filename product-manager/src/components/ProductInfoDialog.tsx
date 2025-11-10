import { useState } from 'react';
import { X, Package, Tag, DollarSign, Box, Phone } from 'lucide-react';
import type { Product, ShareableLinkSettings, ContactInfo } from '../types/product';
import { ContactModal } from './ContactButtons';
import { storageService } from '../services/storage';

interface ProductInfoDialogProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
  settings: ShareableLinkSettings;
}

export function ProductInfoDialog({ isOpen, onClose, product, settings }: ProductInfoDialogProps) {
  const [showContactModal, setShowContactModal] = useState(false);
  const contactInfo = storageService.getContactInfo();

  if (!isOpen) return null;

  const getStatusBadge = (status: string) => {
    const config: Record<string, { bg: string; text: string; label: string; icon: string }> = {
      published: {
        bg: 'bg-success-50',
        text: 'text-success-700',
        label: 'Đã public',
        icon: '✅',
      },
      draft: {
        bg: 'bg-warning-50',
        text: 'text-warning-700',
        label: 'Nháp',
        icon: '✏️',
      },
      archived: {
        bg: 'bg-danger-50',
        text: 'text-danger-700',
        label: 'Đã lưu trữ',
        icon: '📦',
      },
      scheduled: {
        bg: 'bg-info-50',
        text: 'text-info-700',
        label: 'Đã lên lịch',
        icon: '⏰',
      },
      private: {
        bg: 'bg-gray-50',
        text: 'text-gray-700',
        label: 'Riêng tư',
        icon: '🔒',
      },
    };

    const style = config[status] || config.draft;

    return (
      <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium ${style.bg} ${style.text}`}>
        <span>{style.icon}</span>
        <span>{style.label}</span>
      </span>
    );
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4 animate-fade-in overflow-y-auto">
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-4xl my-4 overflow-hidden animate-scale-in">
          {/* Header - Mobile Optimized */}
          <div className="flex justify-between items-start sm:items-center px-4 sm:px-6 py-4 sm:py-5 border-b border-gray-200 bg-gradient-to-r from-primary-50 to-transparent">
            <div className="flex-1 min-w-0 pr-3 sm:pr-4">
              <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-2 line-clamp-2 leading-tight">
                {product.name}
              </h2>
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                <span className="text-[10px] xs:text-xs sm:text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-md font-mono whitespace-nowrap">
                  {product.sku}
                </span>
                {getStatusBadge(product.status)}
                {product.categoryName && (
                  <span className="text-[10px] xs:text-xs sm:text-sm text-purple-600 bg-purple-50 px-2 py-1 rounded-md whitespace-nowrap">
                    📁 {product.categoryName}
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 active:bg-gray-200 rounded-xl transition-all duration-200 flex-shrink-0 touch-manipulation"
              title="Đóng"
              aria-label="Đóng"
            >
              <X size={20} className="sm:w-6 sm:h-6 text-gray-600" />
            </button>
          </div>

          {/* Content - Mobile Optimized Scroll */}
          <div className="overflow-y-auto overscroll-contain" style={{ maxHeight: 'calc(100vh - 220px)' }}>
            <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 pb-safe">
              {/* Image - Mobile optimized */}
              {settings.showImages && (
                <div className="flex justify-center -mx-4 sm:mx-0">
                  <div className="w-full sm:max-w-md h-52 sm:h-64 bg-gradient-to-br from-gray-100 to-gray-200 sm:rounded-2xl border-y sm:border-2 border-gray-300 flex items-center justify-center text-5xl sm:text-6xl">
                    📦
                  </div>
                </div>
              )}

              {/* Short Description */}
              {settings.showDescription && product.shortDescription && (
                <div className="text-center px-2">
                  <p className="text-gray-600 text-sm sm:text-base lg:text-lg leading-relaxed">
                    {product.shortDescription}
                  </p>
                </div>
              )}

              {/* Price & Stock - Mobile friendly */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {/* Price */}
                {settings.showPrice && (
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 sm:p-5 border-2 border-green-200">
                    <h3 className="text-xs sm:text-sm font-semibold text-gray-700 mb-2 sm:mb-3 flex items-center gap-2">
                      <DollarSign size={16} className="sm:w-[18px] sm:h-[18px] text-green-600" />
                      Giá sản phẩm
                    </h3>
                    <div className="flex items-baseline gap-1.5 sm:gap-2">
                      <span className="text-2xl sm:text-3xl font-bold text-green-700">
                        {product.price.toLocaleString('vi-VN')}
                      </span>
                      <span className="text-base sm:text-lg text-green-600">đ</span>
                    </div>
                    {product.salePrice && product.salePrice < product.price && (
                      <div className="mt-2">
                        <span className="text-xs sm:text-sm text-gray-500 line-through">
                          {product.salePrice.toLocaleString('vi-VN')}đ
                        </span>
                        <span className="ml-2 text-xs sm:text-sm text-red-600 font-semibold">
                          Giảm {Math.round((1 - product.salePrice / product.price) * 100)}%
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Stock */}
                {settings.showStock && (
                  <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4 sm:p-5 border-2 border-blue-200">
                    <h3 className="text-xs sm:text-sm font-semibold text-gray-700 mb-2 sm:mb-3 flex items-center gap-2">
                      <Box size={16} className="sm:w-[18px] sm:h-[18px] text-blue-600" />
                      Tồn kho
                    </h3>
                    <div className="flex items-baseline gap-1.5 sm:gap-2">
                      <span className="text-2xl sm:text-3xl font-bold text-blue-700">
                        {product.stockQuantity}
                      </span>
                      <span className="text-base sm:text-lg text-blue-600">sản phẩm</span>
                    </div>
                    {product.stockQuantity === 0 && (
                      <span className="inline-block mt-2 text-xs sm:text-sm bg-red-100 text-red-700 px-2 sm:px-3 py-1 rounded-full font-medium">
                        Hết hàng
                      </span>
                    )}
                    {product.stockQuantity > 0 && product.stockQuantity <= 10 && (
                      <span className="inline-block mt-2 text-xs sm:text-sm bg-yellow-100 text-yellow-700 px-2 sm:px-3 py-1 rounded-full font-medium">
                        Sắp hết hàng
                      </span>
                    )}
                    {product.stockQuantity > 10 && (
                      <span className="inline-block mt-2 text-xs sm:text-sm bg-green-100 text-green-700 px-2 sm:px-3 py-1 rounded-full font-medium">
                        Còn hàng
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Description */}
              {settings.showDescription && product.description && (
                <div className="bg-gray-50 rounded-xl p-4 sm:p-5 border border-gray-200">
                  <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-2 sm:mb-3 flex items-center gap-2">
                    <Package size={16} className="sm:w-[18px] sm:h-[18px] text-purple-600" />
                    Mô tả sản phẩm
                  </h3>
                  <div className="prose prose-sm sm:prose-base max-w-none text-gray-700">
                    <p className="whitespace-pre-wrap text-sm sm:text-base leading-relaxed">
                      {product.description}
                    </p>
                  </div>
                </div>
              )}

              {/* Tags - Mobile optimized */}
              {settings.showTags && product.tags && product.tags.length > 0 && (
                <div>
                  <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-2 sm:mb-3 flex items-center gap-2">
                    <Tag size={16} className="sm:w-[18px] sm:h-[18px] text-orange-600" />
                    Tags
                  </h3>
                  <div className="flex flex-wrap gap-1.5 sm:gap-2">
                    {product.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-2.5 sm:px-3 py-1 sm:py-1.5 bg-gradient-to-r from-orange-50 to-amber-50 text-orange-700 rounded-lg text-xs sm:text-sm font-medium border border-orange-200"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer with Contact Button - Touch Optimized */}
          <div className="px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-gray-50 to-white border-t border-gray-200 pb-safe">
            <button
              onClick={() => setShowContactModal(true)}
              className="w-full flex items-center justify-center gap-2 sm:gap-3 px-4 sm:px-6 py-3.5 sm:py-4 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl font-bold text-base sm:text-lg hover:from-primary-700 hover:to-primary-800 active:from-primary-800 active:to-primary-900 shadow-lg hover:shadow-xl active:shadow-md transition-all duration-200 touch-manipulation"
              aria-label="Liên hệ"
            >
              <Phone size={20} className="sm:w-6 sm:h-6 animate-pulse" />
              <span>LIÊN HỆ</span>
            </button>
            <p className="text-center text-[10px] xs:text-xs sm:text-xs text-gray-500 mt-2 sm:mt-3">
              {settings.permission === 'view' && '👁️ Chế độ xem'}
              {settings.permission === 'comment' && '💬 Chế độ nhận xét'}
            </p>
          </div>
        </div>
      </div>

      {/* Contact Modal */}
      <ContactModal
        isOpen={showContactModal}
        onClose={() => setShowContactModal(false)}
        contactInfo={contactInfo}
      />
    </>
  );
}
