import { useState, useEffect } from 'react';
import { Plus, Download, Upload, Search, Settings, Store, LayoutDashboard, Share2, Contact } from 'lucide-react';
import { ProductTable } from './components/ProductTable';
import { ProductModal } from './components/ProductModal';
import { ShareModal } from './components/ShareModal';
import { ShareStoreModal } from './components/ShareStoreModal';
import { StoreContactSettings } from './components/StoreContactSettings';
import { GoogleDriveConnect } from './components/GoogleDriveConnect';
import { SyncStatusIndicator } from './components/SyncStatusIndicator';
import { Storefront } from './pages/Storefront';
import { SharedProductView } from './pages/SharedProductView';
import { SharedStoreView } from './pages/SharedStoreView';
import type { Product, ShareSettings } from './types/product';
import { storageService } from './services/storage';
import * as XLSX from 'xlsx';

type ViewType = 'admin' | 'storefront' | 'shared' | 'sharedStore';

function App() {
  const [currentView, setCurrentView] = useState<ViewType>('admin');
  const [shareId, setShareId] = useState<string | null>(null);
  const [storeShareId, setStoreShareId] = useState<string | null>(null);
  const [showShareStoreModal, setShowShareStoreModal] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showDriveSettings, setShowDriveSettings] = useState(false);
  const [showContactSettings, setShowContactSettings] = useState(false);
  const [shareModalProduct, setShareModalProduct] = useState<Product | null>(null);

  // Check URL for share link on mount
  useEffect(() => {
    const path = window.location.pathname;
    // Check for product share link
    const productMatch = path.match(/\/share\/([a-z0-9]+)/i);
    if (productMatch) {
      setShareId(productMatch[1]);
      setCurrentView('shared');
      return;
    }
    // Check for store share link
    const storeMatch = path.match(/\/store\/([a-z0-9]+)/i);
    if (storeMatch) {
      setStoreShareId(storeMatch[1]);
      setCurrentView('sharedStore');
    }
  }, []);

  // Load products on mount
  useEffect(() => {
    storageService.initializeSampleData();
    loadProducts();

    // Listen for product updates from sync
    const handleProductsUpdate = (event: CustomEvent) => {
      if (event.detail?.products) {
        setProducts(event.detail.products);
      }
    };

    window.addEventListener('products-updated', handleProductsUpdate as EventListener);

    return () => {
      window.removeEventListener('products-updated', handleProductsUpdate as EventListener);
    };
  }, []);

  // Apply filters and search
  useEffect(() => {
    let filtered = products;

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(p => p.status === statusFilter);
    }

    // Search
    if (searchQuery) {
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.categoryName?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredProducts(filtered);
  }, [products, statusFilter, searchQuery]);

  const loadProducts = () => {
    const loadedProducts = storageService.getProducts();
    setProducts(loadedProducts);
  };

  const handleSyncComplete = () => {
    // Reload products after sync
    loadProducts();
  };

  const handleSaveProduct = (product: Product) => {
    if (editingProduct) {
      storageService.updateProduct(product.id, product);
    } else {
      storageService.addProduct(product);
    }
    loadProducts();
    setEditingProduct(null);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleDeleteProduct = (id: string) => {
    if (confirm('Bạn có chắc muốn xóa sản phẩm này?')) {
      storageService.deleteProduct(id);
      loadProducts();
    }
  };

  const handleViewProduct = (product: Product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleShareProduct = (product: Product) => {
    setShareModalProduct(product);
  };

  const handleSaveShareSettings = (shareSettings: ShareSettings) => {
    if (!shareModalProduct) return;
    storageService.updateProduct(shareModalProduct.id, { shareSettings });
    loadProducts();
    setShareModalProduct(null);
  };

  const handleNewProduct = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const handleExport = () => {
    const exportData = products.map(p => ({
      'SKU': p.sku,
      'Tên sản phẩm': p.name,
      'Danh mục': p.categoryName || '',
      'Giá': p.price,
      'Giá sale': p.salePrice || '',
      'Số lượng': p.stockQuantity,
      'Trạng thái': p.status,
      'Mô tả ngắn': p.shortDescription,
      'Tags': p.tags.join(', '),
      'Ngày tạo': new Date(p.createdAt).toLocaleDateString('vi-VN'),
      'Cập nhật': new Date(p.updatedAt).toLocaleDateString('vi-VN'),
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Products');
    XLSX.writeFile(wb, `products-${Date.now()}.xlsx`);
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        console.log('Imported data:', jsonData);
        alert(`Import thành công ${jsonData.length} sản phẩm!\n\nTính năng này sẽ được hoàn thiện để map data và lưu vào storage.`);
      } catch (error) {
        console.error('Import error:', error);
        alert('Lỗi khi import file. Vui lòng kiểm tra lại định dạng file.');
      }
    };
    reader.readAsBinaryString(file);
    event.target.value = '';
  };

  // Calculate stats
  const stats = {
    total: products.length,
    published: products.filter(p => p.status === 'published').length,
    draft: products.filter(p => p.status === 'draft').length,
    archived: products.filter(p => p.status === 'archived').length,
  };

  // Show Shared Store view
  if (currentView === 'sharedStore' && storeShareId) {
    return (
      <SharedStoreView
        storeId={storeShareId}
        onBack={() => {
          setCurrentView('admin');
          setStoreShareId(null);
          window.history.pushState({}, '', '/');
        }}
        userEmail={localStorage.getItem('storefront_viewer_email') || undefined}
      />
    );
  }

  // Show Shared Product view
  if (currentView === 'shared' && shareId) {
    return (
      <SharedProductView
        shareId={shareId}
        onBack={() => {
          setCurrentView('admin');
          setShareId(null);
          window.history.pushState({}, '', '/');
        }}
        userEmail={localStorage.getItem('storefront_viewer_email') || undefined}
      />
    );
  }

  // Show Storefront view
  if (currentView === 'storefront') {
    return (
      <div>
        {/* Floating Admin Button */}
        <button
          onClick={() => setCurrentView('admin')}
          className="fixed bottom-4 right-4 z-50 flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-full shadow-lg hover:bg-gray-800 transition-colors"
        >
          <LayoutDashboard size={18} />
          Admin
        </button>
        <Storefront />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header - Google Sheets Style */}
      <header className="border-b border-gray-300 bg-white">
        {/* Top Bar */}
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl">📦</span>
              <div>
                <h1 className="text-xl font-normal text-gray-800">Product Manager</h1>
                <p className="text-xs text-gray-500">
                  {stats.total} sản phẩm • {stats.published} published • {stats.draft} draft • {stats.archived} archived
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Sync Status Indicator */}
            <SyncStatusIndicator />

            {/* Store Contact Settings */}
            <button
              onClick={() => setShowContactSettings(true)}
              className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors text-sm"
              title="Cài đặt thông tin liên hệ"
            >
              <Contact size={16} />
              Liên hệ
            </button>

            {/* Share Store Button */}
            <button
              onClick={() => setShowShareStoreModal(true)}
              className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm"
              title="Chia sẻ Store"
            >
              <Share2 size={16} />
              Share Store
            </button>

            {/* View Storefront Button */}
            <button
              onClick={() => setCurrentView('storefront')}
              className="flex items-center gap-2 px-3 py-1.5 bg-green-600 text-white rounded hover:bg-green-700 transition-colors text-sm"
              title="Xem Storefront"
            >
              <Store size={16} />
              Xem Store
            </button>

            {/* Google Drive Settings Toggle */}
            <button
              onClick={() => setShowDriveSettings(!showDriveSettings)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              title="Google Drive Settings"
            >
              <Settings size={20} className="text-gray-600" />
            </button>
          </div>
        </div>

        {/* Toolbar - Google Sheets Style */}
        <div className="px-4 py-2 flex items-center gap-2 bg-gray-50 border-t border-gray-200">
          {/* Left Actions */}
          <div className="flex items-center gap-1">
            <button
              onClick={handleNewProduct}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              <Plus size={16} />
              Thêm
            </button>

            <div className="w-px h-6 bg-gray-300 mx-1"></div>

            <label className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-gray-200 rounded transition-colors text-sm cursor-pointer text-gray-700">
              <Upload size={16} />
              Import
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleImport}
                className="hidden"
              />
            </label>

            <button
              onClick={handleExport}
              className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-gray-200 rounded transition-colors text-sm text-gray-700"
            >
              <Download size={16} />
              Export
            </button>
          </div>

          {/* Spacer */}
          <div className="flex-1"></div>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Tìm kiếm sản phẩm..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
              />
            </div>

            {/* Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="published">✓ Đã public</option>
              <option value="draft">✎ Nháp</option>
              <option value="archived">⊗ Đã lưu trữ</option>
              <option value="scheduled">⏰ Đã lên lịch</option>
              <option value="private">🔒 Riêng tư</option>
            </select>
          </div>
        </div>

        {/* Google Drive Settings Panel */}
        {showDriveSettings && (
          <div className="px-4 py-3 bg-blue-50 border-t border-blue-200">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="text-sm font-medium text-gray-800 mb-1">
                  Google Drive Sync
                </h3>
                <p className="text-xs text-gray-600 mb-3">
                  Kết nối với Google Drive để tự động đồng bộ dữ liệu của bạn trên cloud
                </p>
                <GoogleDriveConnect onSyncComplete={handleSyncComplete} />
              </div>
              <button
                onClick={() => setShowDriveSettings(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                ✕
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Main Content - Full Width Spreadsheet */}
      <main className="flex-1 overflow-auto">
        <ProductTable
          products={filteredProducts}
          onEdit={handleEditProduct}
          onDelete={handleDeleteProduct}
          onView={handleViewProduct}
          onShare={handleShareProduct}
        />
      </main>

      {/* Product Modal */}
      <ProductModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingProduct(null);
        }}
        onSave={handleSaveProduct}
        product={editingProduct}
      />

      {/* Share Modal */}
      {shareModalProduct && (
        <ShareModal
          isOpen={true}
          onClose={() => setShareModalProduct(null)}
          product={shareModalProduct}
          onSave={handleSaveShareSettings}
        />
      )}

      {/* Share Store Modal */}
      <ShareStoreModal
        isOpen={showShareStoreModal}
        onClose={() => setShowShareStoreModal(false)}
      />

      {/* Store Contact Settings Modal */}
      <StoreContactSettings
        isOpen={showContactSettings}
        onClose={() => setShowContactSettings(false)}
      />
    </div>
  );
}

export default App;
