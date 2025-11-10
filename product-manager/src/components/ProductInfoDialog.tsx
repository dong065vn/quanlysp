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
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden animate-scale-in">
          {/* Header */}
          <div className="flex justify-between items-center px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-primary-50 to-transparent">
            <div className="flex-1 min-w-0 pr-4">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1 truncate">{product.name}</h2>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs sm:text-sm text-gray-500 bg-gray-100 px-2 sm:px-3 py-1 rounded-lg font-mono">
                  SKU: {product.sku}
                </span>
                {getStatusBadge(product.status)}
                {product.categoryName && (
                  <span className="text-xs sm:text-sm text-gray-600 bg-purple-50 text-purple-600 px-2 sm:px-3 py-1 rounded-lg">
                    📁 {product.categoryName}
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-xl transition-all duration-200 active:scale-95 flex-shrink-0"
              title="Đóng"
            >
              <X size={24} className="text-gray-600" />
            </button>
          </div>

          {/* Content */}
          <div className="overflow-y-auto max-h-[calc(90vh-200px)]">
            <div className="p-6 space-y-6">
              {/* Image */}
              {settings.showImages && (
                <div className="flex justify-center">
                  <div className="w-full max-w-md h-64 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl border-2 border-gray-300 flex items-center justify-center text-6xl shadow-lg">
                    📦
                  </div>
                </div>
              )}

              {/* Short Description */}
              {settings.showDescription && product.shortDescription && (
                <div className="text-center">
                  <p className="text-gray-600 text-base sm:text-lg">{product.shortDescription}</p>
                </div>
              )}

              {/* Price & Stock */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Price */}
                {settings.showPrice && (
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-5 border-2 border-green-200">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                      <DollarSign size={18} className="text-green-600" />
                      Giá sản phẩm
                    </h3>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold text-green-700">
                        {product.price.toLocaleString('vi-VN')}
                      </span>
                      <span className="text-lg text-green-600">đ</span>
                    </div>
                    {product.salePrice && product.salePrice < product.price && (
                      <div className="mt-2">
                        <span className="text-sm text-gray-500 line-through">
                          {product.salePrice.toLocaleString('vi-VN')}đ
                        </span>
                        <span className="ml-2 text-sm text-red-600 font-semibold">
                          Giảm {Math.round((1 - product.salePrice / product.price) * 100)}%
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Stock */}
                {settings.showStock && (
                  <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-5 border-2 border-blue-200">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                      <Box size={18} className="text-blue-600" />
                      Tồn kho
                    </h3>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold text-blue-700">
                        {product.stockQuantity}
                      </span>
                      <span className="text-lg text-blue-600">sản phẩm</span>
                    </div>
                    {product.stockQuantity === 0 && (
                      <span className="inline-block mt-2 text-sm bg-red-100 text-red-700 px-3 py-1 rounded-full font-medium">
                        Hết hàng
                      </span>
                    )}
                    {product.stockQuantity > 0 && product.stockQuantity <= 10 && (
                      <span className="inline-block mt-2 text-sm bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full font-medium">
                        Sắp hết hàng
                      </span>
                    )}
                    {product.stockQuantity > 10 && (
                      <span className="inline-block mt-2 text-sm bg-green-100 text-green-700 px-3 py-1 rounded-full font-medium">
                        Còn hàng
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Description */}
              {settings.showDescription && product.description && (
                <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                  <h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Package size={18} className="text-purple-600" />
                    Mô tả sản phẩm
                  </h3>
                  <div className="prose max-w-none text-gray-700">
                    <p className="whitespace-pre-wrap text-sm sm:text-base">{product.description}</p>
                  </div>
                </div>
              )}

              {/* Tags */}
              {settings.showTags && product.tags && product.tags.length > 0 && (
                <div>
                  <h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Tag size={18} className="text-orange-600" />
                    Tags
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {product.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-3 py-1.5 bg-gradient-to-r from-orange-50 to-amber-50 text-orange-700 rounded-lg text-sm font-medium border border-orange-200"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer with Contact Button */}
          <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-white border-t border-gray-200">
            <button
              onClick={() => setShowContactModal(true)}
              className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl font-bold text-lg hover:from-primary-700 hover:to-primary-800 shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95"
            >
              <Phone size={24} className="animate-pulse" />
              <span>LIÊN HỆ</span>
            </button>
            <p className="text-center text-xs text-gray-500 mt-3">
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
