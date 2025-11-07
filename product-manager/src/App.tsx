import { useState, useEffect } from 'react';
import { Plus, Download, Upload, Search, Settings, Menu, X } from 'lucide-react';
import { ProductTable } from './components/ProductTable';
import { ProductModal } from './components/ProductModal';
import { SaveStatusIndicator } from './components/SaveStatusIndicator';
import { CloudSyncControls } from './components/CloudSyncControls';
import { ToastContainer, toast, type ToastMessage } from './components/Toast';
import { DriveSettingsPanel } from './components/DriveSettingsPanel';
import { SyncHistory } from './components/SyncHistory';
import { OnlineIndicator } from './components/OnlineIndicator';
import { useConfirmDialog } from './components/ConfirmDialog';
import type { Product } from './types/product';
import { storageService } from './services/storage';
import * as XLSX from 'xlsx';

function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showDriveSettings, setShowDriveSettings] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [toastMessages, setToastMessages] = useState<ToastMessage[]>([]);
  const [showSyncHistory, setShowSyncHistory] = useState(false);
  const { confirm: confirmDelete, DialogComponent: DeleteConfirmDialog } = useConfirmDialog();

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

    // Subscribe to toast notifications
    const unsubscribe = toast.subscribe((messages) => {
      setToastMessages(messages);
    });

    return () => {
      window.removeEventListener('products-updated', handleProductsUpdate as EventListener);
      unsubscribe();
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

  const handleDeleteProduct = async (id: string) => {
    const product = products.find(p => p.id === id);
    const confirmed = await confirmDelete({
      type: 'danger',
      title: 'Xác nhận xóa sản phẩm',
      message: `Bạn có chắc muốn xóa sản phẩm "${product?.name || ''}"?`,
      confirmText: 'Xóa',
      cancelText: 'Hủy',
    });

    if (confirmed) {
      storageService.deleteProduct(id);
      loadProducts();
      toast.success('Đã xóa sản phẩm thành công!');
    }
  };

  const handleViewProduct = (product: Product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
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
        const jsonData = XLSX.utils.sheet_to_json(worksheet) as any[];

        console.log('Imported data:', jsonData);

        // Map imported data to Product format
        const importedProducts: Product[] = jsonData.map((row, index) => {
          const categories = storageService.getCategories();
          const category = categories.find(c => c.name === row['Danh mục']) || categories[0];

          return {
            id: Date.now().toString() + index,
            sku: row['SKU'] || `IMPORT-${Date.now()}-${index}`,
            name: row['Tên sản phẩm'] || 'Sản phẩm chưa có tên',
            slug: (row['Tên sản phẩm'] || '').toLowerCase().replace(/\s+/g, '-') || `product-${index}`,
            description: row['Mô tả'] || '',
            shortDescription: row['Mô tả ngắn'] || '',
            categoryId: category.id,
            categoryName: category.name,
            price: Number(row['Giá']) || 0,
            salePrice: row['Giá sale'] ? Number(row['Giá sale']) : undefined,
            stockQuantity: Number(row['Số lượng']) || 0,
            status: (row['Trạng thái'] as Product['status']) || 'draft',
            images: [],
            links: [],
            tags: row['Tags'] ? row['Tags'].split(',').map((t: string) => t.trim()).filter((t: string) => t) : [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
        });

        // Save imported products
        importedProducts.forEach(product => {
          storageService.addProduct(product);
        });

        // Reload products
        loadProducts();

        // Show success toast
        toast.success(`Import thành công ${importedProducts.length} sản phẩm!`);
      } catch (error) {
        console.error('Import error:', error);
        toast.error('Lỗi khi import file. Vui lòng kiểm tra lại định dạng file.');
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

  const handleCloseToast = (id: string) => {
    toast.remove(id);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex flex-col">
      {/* Header - Modern Figma Style - Responsive */}
      <header className="border-b border-gray-200 bg-white/80 backdrop-blur-lg sticky top-0 z-10 shadow-sm">
        {/* Top Bar */}
        <div className="px-4 sm:px-6 lg:px-8 py-3 sm:py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 sm:gap-6 min-w-0 flex-1">
            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="p-2 hover:bg-primary-50 text-gray-600 hover:text-primary-600 rounded-xl transition-all duration-200 lg:hidden active:scale-95"
              aria-label="Menu"
            >
              {showMobileMenu ? <X size={20} /> : <Menu size={20} />}
            </button>

            <div className="flex items-center gap-3 sm:gap-4 min-w-0">
              <div className="hidden sm:flex items-center justify-center w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl shadow-lg">
                <span className="text-2xl">📦</span>
              </div>
              <span className="text-2xl sm:hidden">📦</span>
              <div className="min-w-0">
                <h1 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent truncate">
                  Product Manager
                </h1>
                <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                  <div className="hidden sm:flex items-center gap-4">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 bg-primary-500 rounded-full animate-pulse"></span>
                      <span className="font-medium text-gray-700">{stats.total}</span> sản phẩm
                    </span>
                    <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 bg-success-500 rounded-full"></span>
                      {stats.published} published
                    </span>
                    <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 bg-warning-500 rounded-full"></span>
                      {stats.draft} draft
                    </span>
                  </div>
                  <p className="sm:hidden font-medium text-gray-700">
                    {stats.total} sản phẩm
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Cloud Sync Controls */}
            <CloudSyncControls
              products={products}
              onSyncComplete={handleSyncComplete}
            />

            {/* Save Status Indicator */}
            <SaveStatusIndicator />

            {/* Google Drive Settings Toggle */}
            <button
              onClick={() => setShowDriveSettings(!showDriveSettings)}
              className="p-2.5 hover:bg-primary-50 text-gray-600 hover:text-primary-600 rounded-xl transition-all duration-200 hover:shadow-md active:scale-95"
              title="Google Drive Settings"
            >
              <Settings size={20} />
            </button>
          </div>
        </div>

        {/* Toolbar - Modern Figma Style - Responsive */}
        <div className={`px-4 sm:px-6 lg:px-8 py-3 bg-white/50 border-t border-gray-200/80 ${showMobileMenu ? 'block' : 'hidden lg:block'}`}>
          <div className="flex flex-col lg:flex-row lg:items-center gap-3 lg:gap-4">
            {/* Left Actions */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={handleNewProduct}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl hover:from-primary-700 hover:to-primary-800 transition-all duration-200 text-sm font-medium shadow-elegant hover:shadow-hover active:scale-95"
              >
                <Plus size={18} strokeWidth={2.5} />
                <span>Thêm sản phẩm</span>
              </button>

              <div className="w-px h-6 bg-gray-300 mx-1 hidden sm:block"></div>

              <label className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-50 border border-gray-200 rounded-xl transition-all duration-200 text-sm cursor-pointer text-gray-700 font-medium shadow-sm hover:shadow active:scale-95">
                <Upload size={16} />
                <span className="hidden sm:inline">Import</span>
                <span className="sm:hidden">📥</span>
                <input
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleImport}
                  className="hidden"
                />
              </label>

              <button
                onClick={handleExport}
                className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-50 border border-gray-200 rounded-xl transition-all duration-200 text-sm text-gray-700 font-medium shadow-sm hover:shadow active:scale-95"
              >
                <Download size={16} />
                <span className="hidden sm:inline">Export</span>
                <span className="sm:hidden">📤</span>
              </button>
            </div>

            {/* Spacer */}
            <div className="flex-1 hidden lg:block"></div>

            {/* Right Actions */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              {/* Search */}
              <div className="relative flex-1 sm:flex-none group">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-primary-500 transition-colors" size={18} />
                <input
                  type="text"
                  placeholder="Tìm kiếm sản phẩm..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full sm:w-56 lg:w-72 pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 shadow-sm"
                />
              </div>

              {/* Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-700 font-medium shadow-sm transition-all duration-200 cursor-pointer"
              >
                <option value="all">📋 Tất cả trạng thái</option>
                <option value="published">✅ Đã public</option>
                <option value="draft">✏️ Nháp</option>
                <option value="archived">📦 Đã lưu trữ</option>
                <option value="scheduled">⏰ Đã lên lịch</option>
                <option value="private">🔒 Riêng tư</option>
              </select>
            </div>
          </div>
        </div>

        {/* Google Drive Settings Panel - New Enhanced Version */}
        <DriveSettingsPanel
          isOpen={showDriveSettings}
          onClose={() => setShowDriveSettings(false)}
          onSyncComplete={handleSyncComplete}
          onOpenSyncHistory={() => setShowSyncHistory(true)}
        />
      </header>

      {/* Main Content - Modern Spreadsheet */}
      <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
        <div className="bg-white rounded-2xl shadow-elegant overflow-hidden border border-gray-200">
          <ProductTable
            products={filteredProducts}
            onEdit={handleEditProduct}
            onDelete={handleDeleteProduct}
            onView={handleViewProduct}
          />
        </div>
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

      {/* Toast Notifications */}
      <ToastContainer messages={toastMessages} onClose={handleCloseToast} />

      {/* Sync History Modal */}
      <SyncHistory
        isOpen={showSyncHistory}
        onClose={() => setShowSyncHistory(false)}
      />

      {/* Online/Offline Indicator */}
      <OnlineIndicator />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog />
    </div>
  );
}

export default App;
