import { useState } from 'react';
import { ArrowLeft, Eye, MessageSquare, Edit as EditIcon, Save, X, Table, Search, DollarSign, Box } from 'lucide-react';
import type { Product, ShareableLink } from '../types/product';
import { ProductModal } from './ProductModal';
import { CommentSection } from './CommentSection';
import { storageService } from '../services/storage';
import { toast } from './Toast';

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

  const handleSaveProduct = () => {
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
  };

  const handleCancelEdit = () => {
    setEditingProductId(null);
    setEditedProduct(null);
  };

  const handleOpenModal = (product: Product) => {
    if (settings.permission === 'edit') {
      setSelectedProduct(product);
      setIsEditing(true);
    } else {
      setSelectedProduct(product);
      setIsEditing(false);
    }
  };

  const handleSaveModal = (updatedProduct: Product) => {
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
                  <Table size={18} className="sm:w-5 sm:h-5 text-white" />
                </div>
                <div className="min-w-0">
                  <h1 className="text-base sm:text-xl font-bold text-gray-900 truncate">Danh sách sản phẩm</h1>
                  <p className="text-xs text-gray-500 hidden sm:block">{products.length} sản phẩm</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
              {getPermissionBadge()}
              <span className="px-2 sm:px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-xs font-medium">
                <span className="hidden sm:inline">👁️ {shareableLink.viewCount} views</span>
                <span className="sm:hidden">👁️ {shareableLink.viewCount}</span>
              </span>
            </div>
          </div>

          {/* Search */}
          <div className="mt-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Tìm kiếm sản phẩm..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8 max-w-7xl mx-auto">
        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-200 cursor-pointer"
              onClick={() => handleOpenModal(product)}
            >
              {/* Product Image */}
              {settings.showImages && (
                <div className="bg-gradient-to-br from-gray-100 to-gray-200 h-48 flex items-center justify-center text-6xl">
                  📦
                </div>
              )}

              <div className="p-4">
                {/* Product Name */}
                <h3 className="font-bold text-gray-900 text-lg mb-2 line-clamp-2">{product.name}</h3>

                {/* SKU */}
                <p className="text-xs text-gray-500 font-mono mb-3">SKU: {product.sku}</p>

                {/* Price */}
                {settings.showPrice && (
                  <div className="flex items-baseline gap-2 mb-3">
                    <DollarSign size={16} className="text-green-600" />
                    <span className="text-xl font-bold text-green-700">
                      {product.price.toLocaleString('vi-VN')}
                    </span>
                    <span className="text-sm text-green-600">đ</span>
                  </div>
                )}

                {/* Stock */}
                {settings.showStock && (
                  <div className="flex items-center gap-2 mb-3">
                    <Box size={16} className="text-blue-600" />
                    <span className="text-sm text-gray-700">
                      <span className="font-semibold">{product.stockQuantity}</span> sản phẩm
                    </span>
                  </div>
                )}

                {/* Description */}
                {settings.showDescription && product.shortDescription && (
                  <p className="text-sm text-gray-600 line-clamp-2 mb-3">{product.shortDescription}</p>
                )}

                {/* Tags */}
                {settings.showTags && product.tags && product.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {product.tags.slice(0, 3).map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-orange-50 text-orange-700 rounded-lg text-xs font-medium"
                      >
                        #{tag}
                      </span>
                    ))}
                    {product.tags.length > 3 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs">
                        +{product.tags.length - 3}
                      </span>
                    )}
                  </div>
                )}

                {/* Edit Button for Edit Permission */}
                {settings.permission === 'edit' && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenModal(product);
                    }}
                    className="mt-3 w-full flex items-center justify-center gap-2 px-3 py-2 bg-orange-50 text-orange-600 hover:bg-orange-100 rounded-lg text-sm font-medium transition-all duration-200"
                  >
                    <EditIcon size={14} />
                    <span>Chỉnh sửa</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <Table size={64} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 text-lg">Không tìm thấy sản phẩm nào</p>
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

        {/* Footer Note */}
        <div className="mt-8 p-4 bg-gray-50 rounded-xl border border-gray-200">
          <p className="text-center text-xs sm:text-sm text-gray-500">
            {settings.permission === 'view' && '🔒 Bạn đang xem danh sách này ở chế độ chỉ đọc thông qua link chia sẻ'}
            {settings.permission === 'comment' && '💬 Bạn có thể xem và thêm nhận xét cho danh sách này'}
            {settings.permission === 'edit' && '✏️ Bạn có thể chỉnh sửa các sản phẩm trong danh sách này'}
          </p>
        </div>
      </main>

      {/* Product Modal */}
      {selectedProduct && (
        <ProductModal
          isOpen={true}
          onClose={() => setSelectedProduct(null)}
          onSave={handleSaveModal}
          product={selectedProduct}
          mode={settings.permission === 'edit' ? 'edit' : 'view'}
        />
      )}
    </div>
  );
}
