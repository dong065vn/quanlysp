import { useState, useEffect } from 'react';
import { ArrowLeft, Lock, Eye, Edit3, Package } from 'lucide-react';
import type { Product, ShareAccess } from '../types/product';
import { storageService } from '../services/storage';
import { formatPrice } from '../utils/format';

interface SharedProductViewProps {
  shareId: string;
  onBack: () => void;
  userEmail?: string;
}

export function SharedProductView({ shareId, onBack, userEmail }: SharedProductViewProps) {
  const [product, setProduct] = useState<Product | null>(null);
  const [access, setAccess] = useState<ShareAccess | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [editedProduct, setEditedProduct] = useState<Partial<Product>>({});

  useEffect(() => {
    loadSharedProduct();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shareId, userEmail]);

  const loadSharedProduct = () => {
    setLoading(true);
    const products = storageService.getProducts();
    const found = products.find(p => p.shareSettings?.shareId === shareId);

    if (!found) {
      setError('Không tìm thấy sản phẩm hoặc link đã hết hạn');
      setLoading(false);
      return;
    }

    const settings = found.shareSettings;
    if (!settings) {
      setError('Sản phẩm này chưa được chia sẻ');
      setLoading(false);
      return;
    }

    // Check access
    let userAccess: ShareAccess | null = null;

    // Check if user is in shared users list
    if (userEmail) {
      const sharedUser = settings.sharedUsers.find(
        u => u.email.toLowerCase() === userEmail.toLowerCase()
      );
      if (sharedUser) {
        userAccess = sharedUser.access;
      }
    }

    // Check link access
    if (!userAccess && settings.linkAccess !== 'off') {
      userAccess = settings.linkAccess as ShareAccess;
    }

    if (!userAccess) {
      setError('Bạn không có quyền truy cập sản phẩm này');
      setLoading(false);
      return;
    }

    setProduct(found);
    setAccess(userAccess);
    setEditedProduct(found);
    setLoading(false);
  };

  const handleSave = () => {
    if (!product || (access !== 'edit' && access !== 'admin')) return;

    const updatedProduct = {
      ...product,
      ...editedProduct,
      updatedAt: new Date().toISOString(),
    };

    storageService.updateProduct(product.id, updatedProduct);
    setProduct(updatedProduct as Product);
    setEditMode(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <Lock className="mx-auto text-gray-300 mb-4" size={64} />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Không thể truy cập</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={onBack}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  if (!product) return null;

  const canEdit = access === 'edit' || access === 'admin';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft size={20} />
            Quay lại
          </button>
          <div className="flex items-center gap-3">
            <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-sm ${
              canEdit ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
            }`}>
              {canEdit ? <Edit3 size={14} /> : <Eye size={14} />}
              {canEdit ? 'Có thể chỉnh sửa' : 'Chỉ xem'}
            </span>
            {canEdit && !editMode && (
              <button
                onClick={() => setEditMode(true)}
                className="px-4 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
              >
                Chỉnh sửa
              </button>
            )}
            {editMode && (
              <>
                <button
                  onClick={() => setEditMode(false)}
                  className="px-4 py-1.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 text-sm"
                >
                  Hủy
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                >
                  Lưu
                </button>
              </>
            )}
          </div>
        </div>
      </header>


      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {/* Product Image */}
          <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
            <Package className="text-gray-300" size={120} />
          </div>

          {/* Product Info */}
          <div className="p-6 space-y-6">
            {/* Name & SKU */}
            <div>
              {editMode ? (
                <input
                  type="text"
                  value={editedProduct.name || ''}
                  onChange={(e) => setEditedProduct({ ...editedProduct, name: e.target.value })}
                  className="text-2xl font-bold text-gray-900 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>
              )}
              <p className="text-sm text-gray-500 mt-1">SKU: {product.sku}</p>
            </div>

            {/* Price */}
            <div className="flex items-end gap-4">
              {editMode ? (
                <div className="flex gap-4">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Giá</label>
                    <input
                      type="number"
                      value={editedProduct.price || 0}
                      onChange={(e) => setEditedProduct({ ...editedProduct, price: Number(e.target.value) })}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Giá sale</label>
                    <input
                      type="number"
                      value={editedProduct.salePrice || ''}
                      onChange={(e) => setEditedProduct({ ...editedProduct, salePrice: e.target.value ? Number(e.target.value) : undefined })}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              ) : (
                <>
                  {product.salePrice ? (
                    <>
                      <span className="text-3xl font-bold text-red-600">{formatPrice(product.salePrice)}</span>
                      <span className="text-xl text-gray-400 line-through">{formatPrice(product.price)}</span>
                    </>
                  ) : (
                    <span className="text-3xl font-bold text-gray-900">{formatPrice(product.price)}</span>
                  )}
                </>
              )}
            </div>

            {/* Category & Stock */}
            <div className="flex gap-6">
              <div>
                <p className="text-sm text-gray-500">Danh mục</p>
                <p className="font-medium">{product.categoryName || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Tồn kho</p>
                {editMode ? (
                  <input
                    type="number"
                    value={editedProduct.stockQuantity || 0}
                    onChange={(e) => setEditedProduct({ ...editedProduct, stockQuantity: Number(e.target.value) })}
                    className="w-24 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className={`font-medium ${product.stockQuantity === 0 ? 'text-red-600' : ''}`}>
                    {product.stockQuantity} sản phẩm
                  </p>
                )}
              </div>
              <div>
                <p className="text-sm text-gray-500">Trạng thái</p>
                <span className={`inline-block px-2 py-0.5 rounded text-sm ${
                  product.status === 'published' ? 'bg-green-100 text-green-700' :
                  product.status === 'draft' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {product.status}
                </span>
              </div>
            </div>

            {/* Description */}
            <div>
              <p className="text-sm text-gray-500 mb-2">Mô tả</p>
              {editMode ? (
                <textarea
                  value={editedProduct.description || ''}
                  onChange={(e) => setEditedProduct({ ...editedProduct, description: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <p className="text-gray-700 whitespace-pre-wrap">
                  {product.description || 'Chưa có mô tả'}
                </p>
              )}
            </div>

            {/* Tags */}
            {product.tags.length > 0 && (
              <div>
                <p className="text-sm text-gray-500 mb-2">Tags</p>
                <div className="flex flex-wrap gap-2">
                  {product.tags.map((tag) => (
                    <span key={tag} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Timestamps */}
            <div className="pt-4 border-t text-sm text-gray-500">
              <p>Tạo: {new Date(product.createdAt).toLocaleString('vi-VN')}</p>
              <p>Cập nhật: {new Date(product.updatedAt).toLocaleString('vi-VN')}</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
