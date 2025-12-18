import { useState, useEffect } from 'react';
import { ArrowLeft, Lock, Eye, Edit3, Search, ShoppingBag } from 'lucide-react';
import type { Product, StoreShareSettings, ShareAccess } from '../types/product';
import { storageService } from '../services/storage';
import { formatPrice } from '../utils/format';

interface SharedStoreViewProps {
  storeId: string;
  onBack: () => void;
  userEmail?: string;
}

export function SharedStoreView({ storeId, onBack, userEmail }: SharedStoreViewProps) {
  const [storeSettings, setStoreSettings] = useState<StoreShareSettings | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [access, setAccess] = useState<ShareAccess | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  useEffect(() => {
    loadStore();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storeId, userEmail]);

  useEffect(() => {
    filterProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [products, searchQuery, categoryFilter]);

  const loadStore = () => {
    setLoading(true);
    const settings = storageService.getStoreShare();

    if (!settings || settings.storeId !== storeId) {
      setError('Không tìm thấy store hoặc link đã hết hạn');
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
      setError('Bạn không có quyền truy cập store này');
      setLoading(false);
      return;
    }

    setStoreSettings(settings);
    setAccess(userAccess);
    
    // Load products - only published and public/restricted for viewers
    const allProducts = storageService.getProducts();
    const visibleProducts = allProducts.filter(p => {
      if (userAccess === 'admin' || userAccess === 'edit') return true;
      return p.status === 'published' && p.visibility !== 'hidden';
    });
    setProducts(visibleProducts);
    setLoading(false);
  };

  const filterProducts = () => {
    let filtered = products;

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(p => p.categoryId === categoryFilter);
    }

    if (searchQuery) {
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.shortDescription.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredProducts(filtered);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải store...</p>
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
          <button onClick={onBack} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  const categories = storageService.getCategories();
  const canEdit = access === 'edit' || access === 'admin';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full">
                <ArrowLeft size={20} className="text-gray-600" />
              </button>
              <div className="flex items-center gap-3">
                <ShoppingBag className="text-green-600" size={28} />
                <div>
                  <h1 className="text-xl font-bold text-gray-900">{storeSettings?.storeName}</h1>
                  <p className="text-xs text-gray-500">{filteredProducts.length} sản phẩm</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-sm ${
                canEdit ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
              }`}>
                {canEdit ? <Edit3 size={14} /> : <Eye size={14} />}
                {canEdit ? 'Có thể chỉnh sửa' : 'Chỉ xem'}
              </span>
            </div>
          </div>

          {/* Search & Filter */}
          <div className="flex items-center gap-4 mt-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Tìm sản phẩm..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto">
              <button
                onClick={() => setCategoryFilter('all')}
                className={`px-4 py-1.5 rounded-full text-sm whitespace-nowrap ${
                  categoryFilter === 'all' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Tất cả
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setCategoryFilter(cat.id)}
                  className={`px-4 py-1.5 rounded-full text-sm whitespace-nowrap ${
                    categoryFilter === cat.id ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>


      {/* Product Grid */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-16">
            <ShoppingBag className="mx-auto text-gray-300 mb-4" size={64} />
            <h2 className="text-xl font-medium text-gray-600 mb-2">Không có sản phẩm</h2>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden group"
              >
                {/* Product Image */}
                <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 relative flex items-center justify-center">
                  <span className="text-6xl opacity-50">📦</span>
                  {product.salePrice && (
                    <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                      SALE
                    </div>
                  )}
                  {product.status !== 'published' && (
                    <div className="absolute top-2 right-2 bg-gray-800 text-white text-xs px-2 py-1 rounded-full">
                      {product.status}
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="p-4">
                  <p className="text-xs text-gray-500 mb-1">{product.categoryName}</p>
                  <h3 className="font-medium text-gray-900 mb-1 line-clamp-2 group-hover:text-green-600 transition-colors">
                    {product.name}
                  </h3>
                  <p className="text-sm text-gray-500 mb-3 line-clamp-2">{product.shortDescription}</p>

                  <div className="flex items-end justify-between">
                    <div>
                      {product.salePrice ? (
                        <>
                          <p className="text-lg font-bold text-red-600">{formatPrice(product.salePrice)}</p>
                          <p className="text-sm text-gray-400 line-through">{formatPrice(product.price)}</p>
                        </>
                      ) : (
                        <p className="text-lg font-bold text-gray-900">{formatPrice(product.price)}</p>
                      )}
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      product.stockQuantity > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {product.stockQuantity > 0 ? `Còn ${product.stockQuantity}` : 'Hết hàng'}
                    </span>
                  </div>

                  {product.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                      {product.tags.slice(0, 3).map((tag) => (
                        <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
