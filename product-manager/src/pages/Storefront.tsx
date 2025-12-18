import { useState, useEffect } from 'react';
import { Search, ShoppingBag, Lock, Eye } from 'lucide-react';
import type { Product } from '../types/product';
import { storageService } from '../services/storage';
import { formatPrice } from '../utils/format';

export function Storefront() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [viewerEmail, setViewerEmail] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  useEffect(() => {
    // Load saved viewer email
    const savedEmail = localStorage.getItem('storefront_viewer_email');
    if (savedEmail) {
      setViewerEmail(savedEmail);
      setIsLoggedIn(true);
    }
    loadProducts();
  }, []);

  useEffect(() => {
    filterProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [products, searchQuery, categoryFilter, viewerEmail]);

  const loadProducts = () => {
    const allProducts = storageService.getProducts();
    // Only show published products
    const publishedProducts = allProducts.filter(p => p.status === 'published');
    setProducts(publishedProducts);
  };

  const filterProducts = () => {
    let filtered = products.filter(p => {
      // Filter by visibility
      if (p.visibility === 'hidden') return false;
      if (p.visibility === 'restricted') {
        if (!viewerEmail) return false;
        const isAllowed = p.allowedViewers?.some(v => v.email.toLowerCase() === viewerEmail.toLowerCase());
        if (!isAllowed) return false;
      }
      return true;
    });

    // Filter by category
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(p => p.categoryId === categoryFilter);
    }

    // Search
    if (searchQuery) {
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.shortDescription.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredProducts(filtered);
  };

  const handleLogin = (email: string) => {
    localStorage.setItem('storefront_viewer_email', email);
    setViewerEmail(email);
    setIsLoggedIn(true);
    setShowLoginModal(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('storefront_viewer_email');
    setViewerEmail('');
    setIsLoggedIn(false);
  };

  const categories = storageService.getCategories();

  // Count restricted products user can see
  const restrictedCount = products.filter(p => 
    p.visibility === 'restricted' && 
    p.allowedViewers?.some(v => v.email.toLowerCase() === viewerEmail.toLowerCase())
  ).length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ShoppingBag className="text-blue-600" size={32} />
              <div>
                <h1 className="text-xl font-bold text-gray-900">Product Store</h1>
                <p className="text-xs text-gray-500">{filteredProducts.length} sản phẩm</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Tìm sản phẩm..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Login/Logout */}
              {isLoggedIn ? (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">{viewerEmail}</span>
                  {restrictedCount > 0 && (
                    <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                      +{restrictedCount} VIP
                    </span>
                  )}
                  <button
                    onClick={handleLogout}
                    className="text-sm text-red-600 hover:underline"
                  >
                    Đăng xuất
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowLoginModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Lock size={16} />
                  Đăng nhập xem thêm
                </button>
              )}
            </div>
          </div>

          {/* Category Filter */}
          <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
            <button
              onClick={() => setCategoryFilter('all')}
              className={`px-4 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors ${
                categoryFilter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Tất cả
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCategoryFilter(cat.id)}
                className={`px-4 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors ${
                  categoryFilter === cat.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </header>


      {/* Product Grid */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-16">
            <Eye className="mx-auto text-gray-300 mb-4" size={64} />
            <h2 className="text-xl font-medium text-gray-600 mb-2">Không có sản phẩm</h2>
            <p className="text-gray-500">
              {!isLoggedIn && 'Đăng nhập để xem thêm sản phẩm dành riêng cho bạn'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden group"
              >
                {/* Product Image Placeholder */}
                <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 relative">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-6xl opacity-50">📦</span>
                  </div>
                  {product.visibility === 'restricted' && (
                    <div className="absolute top-2 right-2 bg-amber-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                      <Lock size={12} />
                      VIP
                    </div>
                  )}
                  {product.salePrice && (
                    <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                      SALE
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="p-4">
                  <p className="text-xs text-gray-500 mb-1">{product.categoryName}</p>
                  <h3 className="font-medium text-gray-900 mb-1 line-clamp-2 group-hover:text-blue-600 transition-colors">
                    {product.name}
                  </h3>
                  <p className="text-sm text-gray-500 mb-3 line-clamp-2">
                    {product.shortDescription}
                  </p>

                  <div className="flex items-end justify-between">
                    <div>
                      {product.salePrice ? (
                        <>
                          <p className="text-lg font-bold text-red-600">
                            {formatPrice(product.salePrice)}
                          </p>
                          <p className="text-sm text-gray-400 line-through">
                            {formatPrice(product.price)}
                          </p>
                        </>
                      ) : (
                        <p className="text-lg font-bold text-gray-900">
                          {formatPrice(product.price)}
                        </p>
                      )}
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      product.stockQuantity > 0
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {product.stockQuantity > 0 ? `Còn ${product.stockQuantity}` : 'Hết hàng'}
                    </span>
                  </div>

                  {/* Tags */}
                  {product.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                      {product.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded"
                        >
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

      {/* Login Modal */}
      {showLoginModal && (
        <LoginModal
          onLogin={handleLogin}
          onClose={() => setShowLoginModal(false)}
        />
      )}
    </div>
  );
}

// Simple Login Modal
function LoginModal({ onLogin, onClose }: { onLogin: (email: string) => void; onClose: () => void }) {
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && email.includes('@')) {
      onLogin(email);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Đăng nhập</h2>
        <p className="text-gray-600 mb-4">
          Nhập email để xem các sản phẩm dành riêng cho bạn
        </p>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="email@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
          />
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Đăng nhập
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
