import { useState, useEffect } from 'react';
import { X, Plus, Trash2, ExternalLink } from 'lucide-react';
import type { Product, ProductStatus, ProductFormData, ProductLink } from '../types/product';
import { storageService } from '../services/storage';

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

  const handleAddLink = () => {
    if (!newLink.url || !newLink.label) {
      alert('Vui lòng nhập đầy đủ URL và Label');
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
  };

  const handleRemoveLink = (linkId: string) => {
    setLinks(links.filter(l => l.id !== linkId));
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">
            {product ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-md transition-colors"
          >
            <X size={24} className="text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="px-6 py-4 space-y-4">
            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tên sản phẩm *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="VD: iPhone 15 Pro Max"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  SKU *
                </label>
                <input
                  type="text"
                  required
                  value={formData.sku}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="VD: IP15PM-256"
                />
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Danh mục
              </label>
              <select
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mô tả ngắn
              </label>
              <input
                type="text"
                value={formData.shortDescription}
                onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Mô tả ngắn gọn về sản phẩm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mô tả chi tiết
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Mô tả đầy đủ về sản phẩm"
              />
            </div>

            {/* Price & Stock */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Giá (đ) *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Giá sale (đ)
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.salePrice || ''}
                  onChange={(e) => setFormData({ ...formData, salePrice: e.target.value ? Number(e.target.value) : undefined })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Số lượng *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  value={formData.stockQuantity}
                  onChange={(e) => setFormData({ ...formData, stockQuantity: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Trạng thái
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as ProductStatus })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="draft">Nháp</option>
                <option value="published">Đã public</option>
                <option value="archived">Đã lưu trữ</option>
                <option value="scheduled">Đã lên lịch</option>
                <option value="private">Riêng tư</option>
              </select>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tags (phân cách bằng dấu phẩy)
              </label>
              <input
                type="text"
                value={formData.tags.join(', ')}
                onChange={(e) => setFormData({
                  ...formData,
                  tags: e.target.value.split(',').map(t => t.trim()).filter(t => t)
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              {product ? 'Cập nhật' : 'Thêm mới'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
