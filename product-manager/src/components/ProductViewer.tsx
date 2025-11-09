import { ExternalLink, Package, Tag, DollarSign, Box, ArrowLeft } from 'lucide-react';
import type { Product, ShareableLink } from '../types/product';

interface ProductViewerProps {
  product: Product;
  shareableLink: ShareableLink;
  onClose?: () => void;
}

export function ProductViewer({ product, shareableLink, onClose }: ProductViewerProps) {
  const { settings } = shareableLink;

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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white/80 backdrop-blur-lg sticky top-0 z-10 shadow-sm">
        <div className="px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {onClose && (
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-xl transition-all duration-200"
                  title="Quay về"
                >
                  <ArrowLeft size={20} className="text-gray-600" />
                </button>
              )}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center">
                  <span className="text-xl">👁️</span>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Xem sản phẩm</h1>
                  <p className="text-xs text-gray-500">Chế độ chỉ xem</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs font-medium">
                🔗 Shared Link
              </span>
              <span className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-xs font-medium">
                👁️ {shareableLink.viewCount} views
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 sm:px-6 lg:px-8 py-8 max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          {/* Product Header */}
          <div className="p-8 border-b border-gray-200">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h2>
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-lg font-mono">
                    SKU: {product.sku}
                  </span>
                  {getStatusBadge(product.status)}
                  {product.categoryName && (
                    <span className="text-sm text-gray-600 bg-purple-50 text-purple-600 px-3 py-1 rounded-lg">
                      📁 {product.categoryName}
                    </span>
                  )}
                </div>
              </div>
              {settings.showImages && (
                <div className="w-32 h-32 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl border-2 border-gray-300 flex items-center justify-center text-5xl shadow-lg ml-6">
                  📦
                </div>
              )}
            </div>

            {product.shortDescription && settings.showDescription && (
              <p className="text-gray-600 text-lg mt-4">{product.shortDescription}</p>
            )}
          </div>

          {/* Product Details */}
          <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Price Section */}
            {settings.showPrice && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <DollarSign size={20} className="text-green-600" />
                  Giá sản phẩm
                </h3>
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
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
              </div>
            )}

            {/* Stock Section */}
            {settings.showStock && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Box size={20} className="text-blue-600" />
                  Tồn kho
                </h3>
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6 border border-blue-200">
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
              </div>
            )}
          </div>

          {/* Description */}
          {settings.showDescription && product.description && (
            <div className="p-8 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Package size={20} className="text-purple-600" />
                Mô tả sản phẩm
              </h3>
              <div className="prose max-w-none text-gray-700">
                <p className="whitespace-pre-wrap">{product.description}</p>
              </div>
            </div>
          )}

          {/* Tags */}
          {settings.showTags && product.tags && product.tags.length > 0 && (
            <div className="p-8 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Tag size={20} className="text-orange-600" />
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

          {/* Product Links - CLICKABLE if allowProductLinks is enabled */}
          {settings.allowProductLinks && product.links && product.links.length > 0 && (
            <div className="p-8 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <ExternalLink size={20} className="text-blue-600" />
                Liên kết sản phẩm
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {product.links
                  .filter(link => link.isActive)
                  .map((link) => {
                    const linkTypeConfig: Record<string, { icon: string; color: string; label: string }> = {
                      marketplace: {
                        icon: '🛒',
                        color: 'from-blue-50 to-cyan-50 border-blue-200 hover:border-blue-300',
                        label: 'Marketplace',
                      },
                      affiliate: {
                        icon: '💰',
                        color: 'from-green-50 to-emerald-50 border-green-200 hover:border-green-300',
                        label: 'Affiliate',
                      },
                      social: {
                        icon: '📱',
                        color: 'from-purple-50 to-pink-50 border-purple-200 hover:border-purple-300',
                        label: 'Social',
                      },
                      internal: {
                        icon: '🔗',
                        color: 'from-gray-50 to-slate-50 border-gray-200 hover:border-gray-300',
                        label: 'Internal',
                      },
                    };

                    const config = linkTypeConfig[link.type] || linkTypeConfig.internal;

                    return (
                      <a
                        key={link.id}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`flex items-center gap-3 p-4 bg-gradient-to-br ${config.color} border rounded-xl transition-all duration-200 hover:shadow-md group`}
                      >
                        <span className="text-2xl">{config.icon}</span>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-semibold text-gray-900 truncate group-hover:text-primary-600 transition-colors">
                            {link.label}
                          </div>
                          <div className="text-xs text-gray-500">{config.label}</div>
                        </div>
                        <ExternalLink size={16} className="text-gray-400 group-hover:text-primary-600 transition-colors flex-shrink-0" />
                      </a>
                    );
                  })}
              </div>
            </div>
          )}

          {/* Footer Note */}
          <div className="p-6 bg-gray-50 border-t border-gray-200">
            <p className="text-center text-sm text-gray-500">
              🔒 Bạn đang xem sản phẩm này ở chế độ chỉ đọc thông qua link chia sẻ
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
