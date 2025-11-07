import { useState, useEffect } from 'react';
import { X, Plus, Trash2, ExternalLink, Upload as UploadIcon, Image as ImageIcon, Cloud } from 'lucide-react';
import type { Product, ProductStatus, ProductFormData, ProductLink } from '../types/product';
import { storageService } from '../services/storage';
import { googleAuthService } from '../services/googleAuth';
import { toast } from './Toast';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (product: Product) => void;
  product?: Product | null;
}

export function ProductModal({ isOpen, onClose, onSave, product }: ProductModalProps) {
  const categories = storageService.getCategories();

  const [formData, setFormData] = useState<ProductFormData>({
    sku: '',
    name: '',
    description: '',
    shortDescription: '',
    categoryId: '',
    price: 0,
    salePrice: undefined,
    stockQuantity: 0,
    status: 'draft',
    tags: [],
  });

  const [links, setLinks] = useState<ProductLink[]>([]);
  const [newLink, setNewLink] = useState({
    type: 'marketplace' as ProductLink['type'],
    url: '',
    label: '',
  });
  const [imagePreview, setImagePreview] = useState<string>('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [savingToDrive, setSavingToDrive] = useState(false);
  const [isConnectedToDrive, setIsConnectedToDrive] = useState(false);

  useEffect(() => {
    if (product) {
      setFormData({
        sku: product.sku,
        name: product.name,
        description: product.description,
        shortDescription: product.shortDescription,
        categoryId: product.categoryId,
        price: product.price,
        salePrice: product.salePrice,
        stockQuantity: product.stockQuantity,
        status: product.status,
        tags: product.tags,
        metaTitle: product.metaTitle,
        metaDescription: product.metaDescription,
      });
      setLinks(product.links || []);
    } else {
      setFormData({
        sku: '',
        name: '',
        description: '',
        shortDescription: '',
        categoryId: '',
        price: 0,
        salePrice: undefined,
        stockQuantity: 0,
        status: 'draft',
        tags: [],
      });
      setLinks([]);
    }
  }, [product]);

  // Check Drive connection status
  useEffect(() => {
    const checkConnection = () => {
      setIsConnectedToDrive(googleAuthService.isAuthenticated());
    };

    checkConnection();
    const interval = setInterval(checkConnection, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleAddLink = () => {
    if (!newLink.url || !newLink.label) {
      toast.warning('Vui lòng nhập đầy đủ URL và Label');
      return;
    }

    const link: ProductLink = {
      id: Date.now().toString(),
      type: newLink.type,
      url: newLink.url,
      label: newLink.label,
      isActive: true,
    };

    setLinks([...links, link]);
    setNewLink({
      type: 'marketplace',
      url: '',
      label: '',
    });
    toast.success('Đã thêm link thành công!');
  };

  const handleRemoveLink = (linkId: string) => {
    setLinks(links.filter(l => l.id !== linkId));
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Vui lòng chọn file hình ảnh');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Kích thước ảnh không được vượt quá 5MB');
      return;
    }

    setUploadingImage(true);

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setImagePreview(result);
      setUploadingImage(false);
      toast.success('Tải ảnh lên thành công!');
    };
    reader.onerror = () => {
      setUploadingImage(false);
      toast.error('Lỗi khi tải ảnh lên');
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setImagePreview('');
    toast.info('Đã xóa ảnh');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const category = categories.find(c => c.id === formData.categoryId);

    const productData: Product = {
      id: product?.id || Date.now().toString(),
      ...formData,
      slug: formData.name.toLowerCase().replace(/\s+/g, '-'),
      categoryName: category?.name,
      images: product?.images || [],
      links: links,
      createdAt: product?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSave(productData);
    onClose();
  };

  const handleSaveAndSyncToDrive = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isConnectedToDrive) {
      toast.warning(
        'Chưa kết nối Google Drive',
        'Vui lòng kết nối Google Drive trước khi sử dụng tính năng này.'
      );
      return;
    }

    const category = categories.find(c => c.id === formData.categoryId);

    const productData: Product = {
      id: product?.id || Date.now().toString(),
      ...formData,
      slug: formData.name.toLowerCase().replace(/\s+/g, '-'),
      categoryName: category?.name,
      images: product?.images || [],
      links: links,
      createdAt: product?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Save to localStorage first
    onSave(productData);

    // Then sync to Drive
    setSavingToDrive(true);
    try {
      // Get all products including the new one
      const allProducts = storageService.getProducts();
      await storageService.saveToCloud(allProducts);

      toast.success(
        'Lưu & Sync thành công!',
        `Đã lưu "${productData.name}" và đồng bộ lên Google Drive.`
      );
      onClose();
    } catch (error) {
      console.error('Failed to sync to Drive:', error);
      toast.error(
        'Lỗi đồng bộ',
        'Đã lưu local nhưng không thể đồng bộ lên Drive. Vui lòng thử lại sau.'
      );
    } finally {
      setSavingToDrive(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden animate-scale-in">
        {/* Header */}
        <div className="flex justify-between items-center px-6 sm:px-8 py-5 border-b border-gray-200 bg-gradient-to-r from-primary-50 to-transparent">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-1">
              {product ? '✏️ Chỉnh sửa sản phẩm' : '➕ Thêm sản phẩm mới'}
            </h2>
            <p className="text-sm text-gray-500">
              {product ? 'Cập nhật thông tin sản phẩm của bạn' : 'Điền thông tin để tạo sản phẩm mới'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-xl transition-all duration-200 active:scale-95"
          >
            <X size={24} className="text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="px-6 sm:px-8 py-6 space-y-6">
            {/* Image Upload Section */}
            <div className="bg-gradient-to-br from-gray-50 to-white border-2 border-dashed border-gray-300 rounded-2xl p-6 hover:border-primary-400 transition-all duration-300">
              <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                <ImageIcon size={18} className="text-primary-600" />
                Hình ảnh sản phẩm
              </label>

              {imagePreview ? (
                <div className="relative group">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-64 object-cover rounded-xl border-2 border-gray-200 shadow-lg"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-all duration-300 rounded-xl flex items-center justify-center gap-3">
                    <label className="px-4 py-2 bg-white text-gray-900 rounded-lg font-medium cursor-pointer hover:bg-gray-100 transition-colors active:scale-95 flex items-center gap-2">
                      <UploadIcon size={16} />
                      Thay đổi
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        disabled={uploadingImage}
                      />
                    </label>
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="px-4 py-2 bg-danger-600 text-white rounded-lg font-medium hover:bg-danger-700 transition-colors active:scale-95 flex items-center gap-2"
                    >
                      <Trash2 size={16} />
                      Xóa
                    </button>
                  </div>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center h-48 cursor-pointer hover:bg-gray-100/50 rounded-xl transition-all duration-200 group">
                  <div className="text-center">
                    <div className="mb-4 inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-2xl group-hover:bg-primary-200 transition-colors">
                      {uploadingImage ? (
                        <div className="animate-spin">⏳</div>
                      ) : (
                        <UploadIcon size={32} className="text-primary-600" />
                      )}
                    </div>
                    <p className="text-sm font-medium text-gray-700 mb-1">
                      {uploadingImage ? 'Đang tải lên...' : 'Nhấn để tải ảnh lên'}
                    </p>
                    <p className="text-xs text-gray-500">
                      PNG, JPG, GIF tới 5MB
                    </p>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={uploadingImage}
                  />
                </label>
              )}
            </div>

            {/* Basic Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Tên sản phẩm *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input hover:border-primary-300 transition-all"
                  placeholder="VD: iPhone 15 Pro Max"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  SKU *
                </label>
                <input
                  type="text"
                  required
                  value={formData.sku}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                  className="input font-mono hover:border-primary-300 transition-all"
                  placeholder="VD: IP15PM-256"
                />
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Danh mục
              </label>
              <select
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                className="input hover:border-primary-300 transition-all cursor-pointer"
              >
                <option value="">-- Chọn danh mục --</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Mô tả ngắn
              </label>
              <input
                type="text"
                value={formData.shortDescription}
                onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                className="input hover:border-primary-300 transition-all"
                placeholder="Mô tả ngắn gọn về sản phẩm"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Mô tả chi tiết
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className="input hover:border-primary-300 transition-all"
                placeholder="Mô tả đầy đủ về sản phẩm"
              />
            </div>

            {/* Price & Stock */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Giá (đ) *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                  className="input hover:border-primary-300 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Giá sale (đ)
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.salePrice || ''}
                  onChange={(e) => setFormData({ ...formData, salePrice: e.target.value ? Number(e.target.value) : undefined })}
                  className="input hover:border-primary-300 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Số lượng *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  value={formData.stockQuantity}
                  onChange={(e) => setFormData({ ...formData, stockQuantity: Number(e.target.value) })}
                  className="input hover:border-primary-300 transition-all"
                />
              </div>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Trạng thái
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as ProductStatus })}
                className="input hover:border-primary-300 transition-all cursor-pointer"
              >
                <option value="draft">✏️ Nháp</option>
                <option value="published">✅ Đã public</option>
                <option value="archived">📦 Đã lưu trữ</option>
                <option value="scheduled">⏰ Đã lên lịch</option>
                <option value="private">🔒 Riêng tư</option>
              </select>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Tags (phân cách bằng dấu phẩy)
              </label>
              <input
                type="text"
                value={formData.tags.join(', ')}
                onChange={(e) => setFormData({
                  ...formData,
                  tags: e.target.value.split(',').map(t => t.trim()).filter(t => t)
                })}
                className="input hover:border-primary-300 transition-all"
                placeholder="VD: iPhone, Apple, Premium"
              />
            </div>

            {/* Links Management */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Links (Marketplace, Affiliate, Social...)
              </label>

              {/* Existing Links */}
              {links.length > 0 && (
                <div className="mb-3 space-y-2">
                  {links.map((link) => (
                    <div
                      key={link.id}
                      className="flex items-center gap-2 p-2 bg-gray-50 rounded-md border border-gray-200"
                    >
                      <div className="text-lg">
                        {link.type === 'marketplace' && '🛒'}
                        {link.type === 'affiliate' && '💰'}
                        {link.type === 'social' && '📱'}
                        {link.type === 'internal' && '🔗'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm text-gray-900 truncate">
                          {link.label}
                        </div>
                        <a
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 hover:underline truncate flex items-center gap-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <ExternalLink size={10} />
                          {link.url}
                        </a>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveLink(link.id)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Xóa link"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Add New Link */}
              <div className="border border-gray-300 rounded-md p-3 bg-gray-50">
                <div className="grid grid-cols-3 gap-2 mb-2">
                  <select
                    value={newLink.type}
                    onChange={(e) => setNewLink({ ...newLink, type: e.target.value as ProductLink['type'] })}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="marketplace">🛒 Marketplace</option>
                    <option value="affiliate">💰 Affiliate</option>
                    <option value="social">📱 Social</option>
                    <option value="internal">🔗 Internal</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Label (VD: Shopee)"
                    value={newLink.label}
                    onChange={(e) => setNewLink({ ...newLink, label: e.target.value })}
                    className="col-span-2 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder="URL (https://...)"
                    value={newLink.url}
                    onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddLink}
                    className="flex items-center gap-1.5 px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm"
                  >
                    <Plus size={16} />
                    Thêm
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 sm:px-8 py-5 bg-gradient-to-r from-gray-50 to-white border-t border-gray-200 flex justify-between items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 border-2 border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 active:scale-95"
            >
              Hủy
            </button>

            <div className="flex gap-3">
              {/* Save & Sync to Drive button - only show if connected */}
              {isConnectedToDrive && (
                <button
                  type="button"
                  onClick={handleSaveAndSyncToDrive}
                  disabled={savingToDrive}
                  className="px-4 sm:px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-medium hover:from-blue-700 hover:to-blue-800 shadow-elegant hover:shadow-hover transition-all duration-200 active:scale-95 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Lưu và đồng bộ lên Google Drive ngay lập tức"
                >
                  {savingToDrive ? (
                    <>
                      <div className="animate-spin">⏳</div>
                      <span className="hidden sm:inline">Đang sync...</span>
                    </>
                  ) : (
                    <>
                      <Cloud size={18} />
                      <span className="hidden sm:inline">Lưu & Sync</span>
                      <span className="sm:hidden">☁️</span>
                    </>
                  )}
                </button>
              )}

              {/* Regular save button */}
              <button
                type="submit"
                className="px-6 py-2.5 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl font-medium hover:from-primary-700 hover:to-primary-800 shadow-elegant hover:shadow-hover transition-all duration-200 active:scale-95 flex items-center gap-2"
              >
                {product ? (
                  <>
                    <span>✅</span>
                    <span>Cập nhật</span>
                  </>
                ) : (
                  <>
                    <Plus size={18} />
                    <span>Thêm mới</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
