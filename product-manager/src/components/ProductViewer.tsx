import { useState } from 'react';
import { ExternalLink, Package, Tag, DollarSign, Box, ArrowLeft, Eye, MessageSquare, Edit as EditIcon, Save, X } from 'lucide-react';
import type { Product, ShareableLink } from '../types/product';
import { CommentSection } from './CommentSection';
import { storageService } from '../services/storage';
import { toast } from './Toast';

interface ProductViewerProps {
  product: Product;
  shareableLink: ShareableLink;
  onClose?: () => void;
}

export function ProductViewer({ product, shareableLink, onClose }: ProductViewerProps) {
  const { settings } = shareableLink;
  const [isEditing, setIsEditing] = useState(false);
  const [editedProduct, setEditedProduct] = useState<Product>(product);

  const handleSaveEdit = () => {
    try {
      const products = storageService.getProducts();
      const index = products.findIndex(p => p.id === editedProduct.id);
      if (index !== -1) {
        products[index] = { ...editedProduct, updatedAt: new Date().toISOString() };
        storageService.saveProducts(products);
        toast.success('✅ Đã lưu thay đổi!');
        setIsEditing(false);
        // Reload page to show updated data
        window.location.reload();
      }
    } catch (error) {
      toast.error('❌ Không thể lưu thay đổi');
    }
  };

  const handleCancelEdit = () => {
    setEditedProduct(product);
    setIsEditing(false);
  };

  const getPermissionBadge = () => {
    const permissionConfig = {
      view: {
        icon: <Eye size={14} />,
        label: 'Chỉ xem',
        color: 'bg-blue-50 text-blue-600',
        emoji: '👁️',
      },
      comment: {
        icon: <MessageSquare size={14} />,
        label: 'Nhận xét',
        color: 'bg-green-50 text-green-600',
        emoji: '💬',
      },
      edit: {
        icon: <EditIcon size={14} />,
        label: 'Chỉnh sửa',
        color: 'bg-orange-50 text-orange-600',
        emoji: '✏️',
      },
    };

    const config = permissionConfig[settings.permission];

    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium ${config.color}`}>
        <span className="hidden sm:inline">{config.emoji}</span>
        {config.icon}
        <span>{config.label}</span>
      </span>
    );
  };

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
        <div className="px-3 sm:px-4 lg:px-8 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
              {onClose && (
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-xl transition-all duration-200 flex-shrink-0"
                  title="Quay về"
                >
                  <ArrowLeft size={18} className="sm:w-5 sm:h-5 text-gray-600" />
                </button>
              )}
              <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-base sm:text-xl">📦</span>
                </div>
                <div className="min-w-0">
                  <h1 className="text-base sm:text-xl font-bold text-gray-900 truncate">Xem sản phẩm</h1>
                  <p className="text-xs text-gray-500 hidden sm:block">Link chia sẻ</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
              {getPermissionBadge()}
              {settings.permission === 'edit' && !isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 bg-orange-50 text-orange-600 hover:bg-orange-100 rounded-lg text-xs font-medium transition-all duration-200"
                >
                  <EditIcon size={14} />
                  <span className="hidden xs:inline sm:inline">Chỉnh sửa</span>
                </button>
              )}
              {isEditing && (
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={handleSaveEdit}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-600 hover:bg-green-100 rounded-lg text-xs font-medium transition-all duration-200"
                  >
                    <Save size={14} />
                    <span className="hidden sm:inline">Lưu</span>
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-600 hover:bg-gray-200 rounded-lg text-xs font-medium transition-all duration-200"
                  >
                    <X size={14} />
                    <span className="hidden sm:inline">Hủy</span>
                  </button>
                </div>
              )}
              <span className="px-2 sm:px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-xs font-medium">
                <span className="hidden sm:inline">👁️ {shareableLink.viewCount} views</span>
                <span className="sm:hidden">👁️ {shareableLink.viewCount}</span>
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8 max-w-6xl mx-auto">
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          {/* Product Header */}
          <div className="p-4 sm:p-6 lg:p-8 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row items-start gap-4 mb-4">
              <div className="flex-1 w-full min-w-0">
                {isEditing ? (
                  <input
                    type="text"
                    value={editedProduct.name}
                    onChange={(e) => setEditedProduct({ ...editedProduct, name: e.target.value })}
                    className="w-full text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-3 px-3 py-2 border-2 border-orange-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                ) : (
                  <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-3 break-words">{product.name}</h2>
                )}
                <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
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
              {settings.showImages && (
                <div className="w-24 h-24 sm:w-28 sm:h-28 lg:w-32 lg:h-32 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl sm:rounded-2xl border-2 border-gray-300 flex items-center justify-center text-4xl sm:text-5xl shadow-lg flex-shrink-0">
                  📦
                </div>
              )}
            </div>

            {settings.showDescription && (
              isEditing ? (
                <textarea
                  value={editedProduct.shortDescription}
                  onChange={(e) => setEditedProduct({ ...editedProduct, shortDescription: e.target.value })}
                  className="w-full text-gray-600 text-sm sm:text-base lg:text-lg mt-3 sm:mt-4 px-3 py-2 border-2 border-orange-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                  rows={2}
                />
              ) : product.shortDescription ? (
                <p className="text-gray-600 text-sm sm:text-base lg:text-lg mt-3 sm:mt-4">{product.shortDescription}</p>
              ) : null
            )}
          </div>

          {/* Product Details */}
          <div className="p-4 sm:p-6 lg:p-8 grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
            {/* Price Section */}
            {settings.showPrice && (
              <div className="space-y-3 sm:space-y-4">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <DollarSign size={18} className="sm:w-5 sm:h-5 text-green-600" />
                  Giá sản phẩm
                </h3>
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 sm:p-6 border border-green-200">
                  {isEditing ? (
                    <div className="space-y-2">
                      <label className="text-xs text-gray-600">Giá gốc (VNĐ)</label>
                      <input
                        type="number"
                        value={editedProduct.price}
                        onChange={(e) => setEditedProduct({ ...editedProduct, price: parseFloat(e.target.value) || 0 })}
                        className="w-full px-3 py-2 border-2 border-orange-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      />
                    </div>
                  ) : (
                    <>
                      <div className="flex items-baseline gap-2">
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
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Stock Section */}
            {settings.showStock && (
              <div className="space-y-3 sm:space-y-4">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Box size={18} className="sm:w-5 sm:h-5 text-blue-600" />
                  Tồn kho
                </h3>
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4 sm:p-6 border border-blue-200">
                  {isEditing ? (
                    <div className="space-y-2">
                      <label className="text-xs text-gray-600">Số lượng tồn kho</label>
                      <input
                        type="number"
                        value={editedProduct.stockQuantity}
                        onChange={(e) => setEditedProduct({ ...editedProduct, stockQuantity: parseInt(e.target.value) || 0 })}
                        className="w-full px-3 py-2 border-2 border-orange-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        min="0"
                      />
                    </div>
                  ) : (
                    <>
                      <div className="flex items-baseline gap-2">
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
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Description */}
          {settings.showDescription && (
            <div className="p-4 sm:p-6 lg:p-8 border-t border-gray-200">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
                <Package size={18} className="sm:w-5 sm:h-5 text-purple-600" />
                Mô tả sản phẩm
              </h3>
              {isEditing ? (
                <textarea
                  value={editedProduct.description}
                  onChange={(e) => setEditedProduct({ ...editedProduct, description: e.target.value })}
                  className="w-full px-3 py-2 border-2 border-orange-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none text-sm sm:text-base"
                  rows={6}
                />
              ) : product.description ? (
                <div className="prose max-w-none text-gray-700">
                  <p className="whitespace-pre-wrap text-sm sm:text-base">{product.description}</p>
                </div>
              ) : (
                <p className="text-gray-400 text-sm">Chưa có mô tả</p>
              )}
            </div>
          )}

          {/* Tags */}
          {settings.showTags && product.tags && product.tags.length > 0 && (
            <div className="p-4 sm:p-6 lg:p-8 border-t border-gray-200">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
                <Tag size={18} className="sm:w-5 sm:h-5 text-orange-600" />
                Tags
              </h3>
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {product.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-2 sm:px-3 py-1 sm:py-1.5 bg-gradient-to-r from-orange-50 to-amber-50 text-orange-700 rounded-lg text-xs sm:text-sm font-medium border border-orange-200"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Product Links - CLICKABLE if allowProductLinks is enabled */}
          {settings.allowProductLinks && product.links && product.links.length > 0 && (
            <div className="p-4 sm:p-6 lg:p-8 border-t border-gray-200">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
                <ExternalLink size={18} className="sm:w-5 sm:h-5 text-blue-600" />
                Liên kết sản phẩm
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
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
                        className={`flex items-center gap-2 sm:gap-3 p-3 sm:p-4 bg-gradient-to-br ${config.color} border rounded-xl transition-all duration-200 hover:shadow-md group active:scale-95`}
                      >
                        <span className="text-xl sm:text-2xl flex-shrink-0">{config.icon}</span>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs sm:text-sm font-semibold text-gray-900 truncate group-hover:text-primary-600 transition-colors">
                            {link.label}
                          </div>
                          <div className="text-xs text-gray-500">{config.label}</div>
                        </div>
                        <ExternalLink size={14} className="sm:w-4 sm:h-4 text-gray-400 group-hover:text-primary-600 transition-colors flex-shrink-0" />
                      </a>
                    );
                  })}
              </div>
            </div>
          )}

          {/* Footer Note */}
          <div className="p-4 sm:p-6 bg-gray-50 border-t border-gray-200">
            <p className="text-center text-xs sm:text-sm text-gray-500">
              {settings.permission === 'view' && '🔒 Bạn đang xem sản phẩm này ở chế độ chỉ đọc thông qua link chia sẻ'}
              {settings.permission === 'comment' && '💬 Bạn có thể xem và thêm nhận xét cho sản phẩm này'}
              {settings.permission === 'edit' && '✏️ Bạn có thể chỉnh sửa thông tin sản phẩm này'}
            </p>
          </div>
        </div>

        {/* Comment Section - Show for comment and edit permissions */}
        {(settings.permission === 'comment' || settings.permission === 'edit') && (
          <div className="mt-6">
            <CommentSection
              productId={product.id}
              shareToken={shareableLink.token}
              readOnly={false}
            />
          </div>
        )}
      </main>
    </div>
  );
}
