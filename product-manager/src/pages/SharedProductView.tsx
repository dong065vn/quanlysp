import { useState, useEffect } from 'react';
import { ArrowLeft, Lock, Eye, Edit3, Package, Phone, MessageCircle, Mail, MapPin, Clock, ExternalLink, ShoppingCart, Share2, Check } from 'lucide-react';
import type { Product, ShareAccess, StoreContactInfo } from '../types/product';
import { storageService } from '../services/storage';
import { formatPrice } from '../utils/format';

interface SharedProductViewProps {
  shareId: string;
  onBack: () => void;
  userEmail?: string;
}

export function SharedProductView({ shareId, onBack, userEmail }: SharedProductViewProps) {
  const [product, setProduct] = useState<Product | null>(null);
  const [storeContact, setStoreContact] = useState<StoreContactInfo | null>(null);
  const [access, setAccess] = useState<ShareAccess | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [editedProduct, setEditedProduct] = useState<Partial<Product>>({});
  const [selectedImage, setSelectedImage] = useState(0);
  const [copied, setCopied] = useState(false);

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

    if (userEmail) {
      const sharedUser = settings.sharedUsers.find(
        u => u.email.toLowerCase() === userEmail.toLowerCase()
      );
      if (sharedUser) {
        userAccess = sharedUser.access;
      }
    }

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
    setStoreContact(storageService.getStoreContact());
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

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
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
  const hasImages = product.images && product.images.length > 0;
  const discount = product.salePrice ? Math.round((1 - product.salePrice / product.price) * 100) : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft size={20} />
            <span className="hidden sm:inline">Quay lại</span>
          </button>
          
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLink}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                copied ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {copied ? <Check size={16} /> : <Share2 size={16} />}
              {copied ? 'Đã copy!' : 'Chia sẻ'}
            </button>
            
            <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-sm ${
              canEdit ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
            }`}>
              {canEdit ? <Edit3 size={14} /> : <Eye size={14} />}
              {canEdit ? 'Chỉnh sửa' : 'Xem'}
            </span>
            
            {canEdit && !editMode && (
              <button
                onClick={() => setEditMode(true)}
                className="px-4 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
              >
                Sửa
              </button>
            )}
            {editMode && (
              <>
                <button
                  onClick={() => setEditMode(false)}
                  className="px-3 py-1.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 text-sm"
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

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left: Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="aspect-square bg-white rounded-2xl shadow-sm overflow-hidden">
              {hasImages ? (
                <img
                  src={product.images[selectedImage]?.url}
                  alt={product.images[selectedImage]?.altText || product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                  <Package className="text-gray-300" size={120} />
                </div>
              )}
            </div>
            
            {/* Thumbnail Gallery */}
            {hasImages && product.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {product.images.map((img, idx) => (
                  <button
                    key={img.id}
                    onClick={() => setSelectedImage(idx)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                      selectedImage === idx ? 'border-blue-500' : 'border-transparent'
                    }`}
                  >
                    <img src={img.url} alt={img.altText} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Product Info */}
          <div className="space-y-6">
            {/* Category & Status */}
            <div className="flex items-center gap-2 flex-wrap">
              {product.categoryName && (
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                  {product.categoryName}
                </span>
              )}
              <span className={`px-3 py-1 rounded-full text-sm ${
                product.stockQuantity > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}>
                {product.stockQuantity > 0 ? `Còn ${product.stockQuantity} sản phẩm` : 'Hết hàng'}
              </span>
              {product.salePrice && (
                <span className="px-3 py-1 bg-red-500 text-white rounded-full text-sm font-medium">
                  -{discount}%
                </span>
              )}
            </div>

            {/* Name */}
            {editMode ? (
              <input
                type="text"
                value={editedProduct.name || ''}
                onChange={(e) => setEditedProduct({ ...editedProduct, name: e.target.value })}
                className="text-2xl sm:text-3xl font-bold text-gray-900 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            ) : (
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{product.name}</h1>
            )}

            {/* SKU */}
            <p className="text-sm text-gray-500">Mã SP: {product.sku}</p>

            {/* Price */}
            <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-4">
              {editMode ? (
                <div className="flex gap-4">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Giá gốc</label>
                    <input
                      type="number"
                      value={editedProduct.price || 0}
                      onChange={(e) => setEditedProduct({ ...editedProduct, price: Number(e.target.value) })}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-40"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Giá sale</label>
                    <input
                      type="number"
                      value={editedProduct.salePrice || ''}
                      onChange={(e) => setEditedProduct({ ...editedProduct, salePrice: e.target.value ? Number(e.target.value) : undefined })}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-40"
                    />
                  </div>
                </div>
              ) : (
                <div className="flex items-end gap-3">
                  {product.salePrice ? (
                    <>
                      <span className="text-3xl sm:text-4xl font-bold text-red-600">{formatPrice(product.salePrice)}</span>
                      <span className="text-xl text-gray-400 line-through">{formatPrice(product.price)}</span>
                    </>
                  ) : (
                    <span className="text-3xl sm:text-4xl font-bold text-gray-900">{formatPrice(product.price)}</span>
                  )}
                </div>
              )}
            </div>

            {/* Short Description */}
            {product.shortDescription && (
              <p className="text-gray-600 text-lg">{product.shortDescription}</p>
            )}

            {/* Tags */}
            {product.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {product.tags.map((tag) => (
                  <span key={tag} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Contact Section */}
            {storeContact && (
              <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <ShoppingCart size={18} />
                  Liên hệ mua hàng
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {storeContact.phone && (
                    <a
                      href={`tel:${storeContact.phone}`}
                      className="flex items-center gap-3 p-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
                    >
                      <Phone className="text-green-600" size={20} />
                      <div>
                        <p className="text-xs text-gray-500">Điện thoại</p>
                        <p className="font-medium text-green-700">{storeContact.phone}</p>
                      </div>
                    </a>
                  )}
                  
                  {storeContact.zalo && (
                    <a
                      href={`https://zalo.me/${storeContact.zalo.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                    >
                      <MessageCircle className="text-blue-600" size={20} />
                      <div>
                        <p className="text-xs text-gray-500">Zalo</p>
                        <p className="font-medium text-blue-700">{storeContact.zalo}</p>
                      </div>
                    </a>
                  )}
                  
                  {storeContact.facebook && (
                    <a
                      href={storeContact.facebook.startsWith('http') ? storeContact.facebook : `https://facebook.com/${storeContact.facebook}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
                    >
                      <ExternalLink className="text-indigo-600" size={20} />
                      <div>
                        <p className="text-xs text-gray-500">Facebook</p>
                        <p className="font-medium text-indigo-700">Nhắn tin</p>
                      </div>
                    </a>
                  )}
                  
                  {storeContact.email && (
                    <a
                      href={`mailto:${storeContact.email}`}
                      className="flex items-center gap-3 p-3 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors"
                    >
                      <Mail className="text-orange-600" size={20} />
                      <div>
                        <p className="text-xs text-gray-500">Email</p>
                        <p className="font-medium text-orange-700">{storeContact.email}</p>
                      </div>
                    </a>
                  )}
                </div>

                {(storeContact.address || storeContact.workingHours) && (
                  <div className="pt-3 border-t border-gray-100 space-y-2">
                    {storeContact.address && (
                      <p className="flex items-start gap-2 text-sm text-gray-600">
                        <MapPin size={16} className="mt-0.5 flex-shrink-0" />
                        {storeContact.address}
                      </p>
                    )}
                    {storeContact.workingHours && (
                      <p className="flex items-center gap-2 text-sm text-gray-600">
                        <Clock size={16} />
                        Giờ làm việc: {storeContact.workingHours}
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Product Links */}
            {product.links && product.links.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-semibold text-gray-900">Mua tại</h3>
                <div className="flex flex-wrap gap-2">
                  {product.links.filter(l => l.isActive).map((link) => (
                    <a
                      key={link.id}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm transition-colors"
                    >
                      <ExternalLink size={14} />
                      {link.label}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Full Description */}
        <div className="mt-8 bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Mô tả sản phẩm</h2>
          {editMode ? (
            <textarea
              value={editedProduct.description || ''}
              onChange={(e) => setEditedProduct({ ...editedProduct, description: e.target.value })}
              rows={8}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          ) : (
            <div className="prose max-w-none text-gray-700 whitespace-pre-wrap">
              {product.description || 'Chưa có mô tả chi tiết'}
            </div>
          )}
        </div>

        {/* Store Info Footer */}
        {storeContact?.storeName && (
          <div className="mt-8 text-center py-6 border-t">
            <p className="text-gray-500">
              Sản phẩm được chia sẻ bởi <span className="font-medium text-gray-700">{storeContact.storeName}</span>
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
