import { useState } from 'react';
import { ArrowLeft, Eye, MessageSquare, Edit as EditIcon, Save, X, Table, Search, DollarSign, Box } from 'lucide-react';
import type { Product, ShareableLink } from '../../../types/product';
import { ProductModal } from '../../../components/ProductModal';
import { ProductInfoDialog } from '../../../components/ProductInfoDialog';
import { CommentSection } from '../../comment';
import { storageService } from '../../../services/storage';
import { toast } from '../../../components/Toast';
import { useReadOnlyGuard } from '../../../hooks/useReadOnlyGuard';
import { ViewOnlyBanner, MobileViewOnlyNotice } from './ViewOnlyBanner';

interface SheetViewerProps {
  products: Product[];
  shareableLink: ShareableLink;
  onClose?: () => void;
}

export function SheetViewer({ products, shareableLink, onClose }: SheetViewerProps) {
  const { settings } = shareableLink;
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [editedProduct, setEditedProduct] = useState<Product | null>(null);

  // Read-Only Guard: Đảm bảo không có write operations khi ở view/comment mode
  const { canEdit, guardWrite } = useReadOnlyGuard({
    permission: settings.permission,
    onViolation: () => {
      toast.error('⚠️ Bạn không có quyền thực hiện thao tác này');
    },
  });

  const filteredProducts = products.filter(product => {
    const searchLower = searchTerm.toLowerCase();
    return (
      product.name.toLowerCase().includes(searchLower) ||
      product.sku.toLowerCase().includes(searchLower) ||
      product.description.toLowerCase().includes(searchLower)
    );
  });

  const handleEditProduct = (product: Product) => {
    setEditingProductId(product.id);
    setEditedProduct(product);
  };

  // Guard save operation - chỉ cho phép khi có quyền edit
  const handleSaveProduct = guardWrite(() => {
    if (!editedProduct) return;

    try {
      const allProducts = storageService.getProducts();
      const index = allProducts.findIndex(p => p.id === editedProduct.id);
      if (index !== -1) {
        allProducts[index] = { ...editedProduct, updatedAt: new Date().toISOString() };
        storageService.saveProducts(allProducts);
        toast.success('✅ Đã lưu thay đổi!');
        setEditingProductId(null);
        setEditedProduct(null);
        window.location.reload();
      }
    } catch (error) {
      toast.error('❌ Không thể lưu thay đổi');
    }
  });

  const handleCancelEdit = () => {
    setEditingProductId(null);
    setEditedProduct(null);
  };

  const handleOpenModal = (product: Product) => {
    setSelectedProduct(product);
    if (canEdit) {
      setIsEditing(true);
    } else {
      setIsEditing(false);
    }
  };

  // Guard modal save operation
  const handleSaveModal = guardWrite((updatedProduct: Product) => {
    try {
      const allProducts = storageService.getProducts();
      const index = allProducts.findIndex(p => p.id === updatedProduct.id);
      if (index !== -1) {
        allProducts[index] = { ...updatedProduct, updatedAt: new Date().toISOString() };
        storageService.saveProducts(allProducts);
        toast.success('✅ Đã lưu thay đổi!');
        setSelectedProduct(null);
        window.location.reload();
      }
    } catch (error) {
      toast.error('❌ Không thể lưu thay đổi');
    }
  });

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Header - Mobile Optimized */}
      <header className="border-b border-gray-200 bg-white/95 backdrop-blur-lg sticky top-0 z-20 shadow-sm">
        <div className="px-3 sm:px-4 lg:px-8 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
              {onClose && (
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 active:bg-gray-200 rounded-xl transition-all duration-200 flex-shrink-0 touch-manipulation"
                  title="Quay về"
                  aria-label="Quay về"
                >
                  <ArrowLeft size={18} className="sm:w-5 sm:h-5 text-gray-600" />
                </button>
              )}
              <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
                  <Table size={16} className="sm:w-5 sm:h-5 text-white" />
                </div>
                <div className="min-w-0">
                  <h1 className="text-base sm:text-xl font-bold text-gray-900 truncate">Danh sách sản phẩm</h1>
                  <p className="text-xs text-gray-500">
                    <span className="hidden xs:inline">{filteredProducts.length} / </span>
                    {products.length} sản phẩm
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
              {getPermissionBadge()}
              <span className="px-2 sm:px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-xs font-medium whitespace-nowrap">
                <span className="hidden sm:inline">👁️ {shareableLink.viewCount} views</span>
                <span className="sm:hidden">{shareableLink.viewCount}</span>
              </span>
            </div>
          </div>

          {/* Search - Mobile Optimized */}
          <div className="mt-3 sm:mt-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
              <input
                type="search"
                placeholder="Tìm kiếm sản phẩm..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 sm:py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 text-base sm:text-sm bg-white touch-manipulation"
                autoComplete="off"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors touch-manipulation"
                  aria-label="Xóa tìm kiếm"
                >
                  <X size={16} className="text-gray-400" />
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - Mobile Optimized */}
      <main className="px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8 max-w-7xl mx-auto pb-safe">
        {/* View-Only Banner */}
        <ViewOnlyBanner permission={settings.permission} className="mb-4 sm:mb-6" />

        {/* Products Grid - Responsive & Touch-Friendly */}
        <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden hover:shadow-xl active:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 cursor-pointer touch-manipulation group"
              onClick={() => handleOpenModal(product)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleOpenModal(product);
                }
              }}
              aria-label={`Xem chi tiết ${product.name}`}
            >
              {/* Product Image - Touch Optimized */}
              {settings.showImages && (
                <div className="bg-gradient-to-br from-gray-100 to-gray-200 h-40 sm:h-48 flex items-center justify-center text-5xl sm:text-6xl group-hover:scale-105 transition-transform duration-300">
                  📦
                </div>
              )}

              <div className="p-3 sm:p-4">
                {/* Product Name - Better line clamp */}
                <h3 className="font-bold text-gray-900 text-base sm:text-lg mb-2 line-clamp-2 min-h-[2.5rem] sm:min-h-[3rem]">
                  {product.name}
                </h3>

                {/* SKU - More readable */}
                <p className="text-xs text-gray-500 font-mono mb-2 sm:mb-3 bg-gray-50 px-2 py-1 rounded inline-block">
                  {product.sku}
                </p>

                {/* Price - Larger touch target */}
                {settings.showPrice && (
                  <div className="flex items-baseline gap-1.5 sm:gap-2 mb-2 sm:mb-3 bg-green-50 p-2 rounded-lg">
                    <DollarSign size={14} className="sm:w-4 sm:h-4 text-green-600 flex-shrink-0" />
                    <span className="text-lg sm:text-xl font-bold text-green-700">
                      {product.price.toLocaleString('vi-VN')}
                    </span>
                    <span className="text-xs sm:text-sm text-green-600">đ</span>
                  </div>
                )}

                {/* Stock - Better visibility */}
                {settings.showStock && (
                  <div className="flex items-center gap-2 mb-2 sm:mb-3 bg-blue-50 p-2 rounded-lg">
                    <Box size={14} className="sm:w-4 sm:h-4 text-blue-600 flex-shrink-0" />
                    <span className="text-xs sm:text-sm text-gray-700">
                      <span className="font-semibold">{product.stockQuantity}</span> sản phẩm
                    </span>
                  </div>
                )}

                {/* Description - Mobile optimized */}
                {settings.showDescription && product.shortDescription && (
                  <p className="text-xs sm:text-sm text-gray-600 line-clamp-2 mb-2 sm:mb-3 leading-relaxed">
                    {product.shortDescription}
                  </p>
                )}

                {/* Tags - Better mobile layout */}
                {settings.showTags && product.tags && product.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 sm:gap-1.5 mt-2 sm:mt-3">
                    {product.tags.slice(0, 2).map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-0.5 sm:py-1 bg-orange-50 text-orange-700 rounded-md text-[10px] sm:text-xs font-medium whitespace-nowrap"
                      >
                        #{tag}
                      </span>
                    ))}
                    {product.tags.length > 2 && (
                      <span className="px-2 py-0.5 sm:py-1 bg-gray-100 text-gray-600 rounded-md text-[10px] sm:text-xs whitespace-nowrap">
                        +{product.tags.length - 2}
                      </span>
                    )}
                  </div>
                )}

                {/* Edit Button - Touch-friendly */}
                {settings.permission === 'edit' && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenModal(product);
                    }}
                    className="mt-3 w-full flex items-center justify-center gap-2 px-3 py-2.5 sm:py-2 bg-orange-50 text-orange-600 hover:bg-orange-100 active:bg-orange-200 rounded-lg text-sm font-medium transition-all duration-200 touch-manipulation"
                    aria-label={`Chỉnh sửa ${product.name}`}
                  >
                    <EditIcon size={14} />
                    <span>Chỉnh sửa</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Empty State - Better design */}
        {filteredProducts.length === 0 && (
          <div className="text-center py-12 sm:py-16">
            <div className="mb-4 inline-flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 bg-gray-100 rounded-full">
              {searchTerm ? (
                <Search size={40} className="sm:w-12 sm:h-12 text-gray-300" />
              ) : (
                <Table size={40} className="sm:w-12 sm:h-12 text-gray-300" />
              )}
            </div>
            <p className="text-gray-500 text-base sm:text-lg font-medium mb-2">
              {searchTerm ? 'Không tìm thấy sản phẩm nào' : 'Chưa có sản phẩm nào'}
            </p>
            {searchTerm && (
              <p className="text-gray-400 text-sm mb-4">
                Thử tìm kiếm với từ khóa khác
              </p>
            )}
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 active:bg-primary-800 transition-colors touch-manipulation"
              >
                Xóa bộ lọc
              </button>
            )}
          </div>
        )}

        {/* Comment Section for Sheet */}
        {(settings.permission === 'comment' || settings.permission === 'edit') && (
          <div className="mt-8">
            <CommentSection
              productId="sheet" // Special ID for sheet comments
              shareToken={shareableLink.token}
              readOnly={false}
            />
          </div>
        )}

        {/* Footer Note - Mobile optimized */}
        <div className="mt-6 sm:mt-8 p-4 bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-200 shadow-sm">
          <p className="text-center text-xs sm:text-sm text-gray-500 leading-relaxed">
            {settings.permission === 'view' && '🔒 Bạn đang xem danh sách này ở chế độ chỉ đọc'}
            {settings.permission === 'comment' && '💬 Bạn có thể xem và thêm nhận xét cho danh sách'}
            {settings.permission === 'edit' && '✏️ Bạn có thể chỉnh sửa các sản phẩm trong danh sách'}
          </p>
        </div>
      </main>

      {/* Product Modal/Dialog */}
      {selectedProduct && (
        canEdit ? (
          <ProductModal
            isOpen={true}
            onClose={() => setSelectedProduct(null)}
            onSave={handleSaveModal}
            product={selectedProduct}
          />
        ) : (
          <ProductInfoDialog
            isOpen={true}
            onClose={() => setSelectedProduct(null)}
            product={selectedProduct}
            settings={settings}
          />
        )
      )}

      {/* Mobile View-Only Notice - Sticky bottom on mobile */}
      <MobileViewOnlyNotice permission={settings.permission} />
    </div>
  );
}
