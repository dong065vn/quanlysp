import { useState, useEffect } from 'react';
import { Plus, Download, Upload } from 'lucide-react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { StatsCards } from './components/StatsCards';
import { ProductTable } from './components/ProductTable';
import { ProductModal } from './components/ProductModal';
import type { Product } from './types/product';
import { storageService } from './services/storage';
import * as XLSX from 'xlsx';

function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Load products on mount
  useEffect(() => {
    storageService.initializeSampleData();
    loadProducts();
  }, []);

  // Apply filters
  useEffect(() => {
    let filtered = products;
    if (statusFilter !== 'all') {
      filtered = products.filter(p => p.status === statusFilter);
    }
    setFilteredProducts(filtered);
  }, [products, statusFilter]);

  const loadProducts = () => {
    const loadedProducts = storageService.getProducts();
    setProducts(loadedProducts);
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
    alert(`Xem chi tiết sản phẩm: ${product.name}\n\nTính năng này sẽ được phát triển tiếp.`);
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="flex">
        <Sidebar />

        <main className="flex-1 p-8">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Quản lý sản phẩm</h1>
            <p className="text-gray-600 text-sm">
              Quản lý tất cả sản phẩm, hình ảnh và trạng thái public
            </p>
          </div>

          {/* Stats */}
          <StatsCards products={products} />

          {/* Action Bar */}
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-4 flex justify-between items-center">
            <div className="flex gap-2">
              <button
                onClick={handleNewProduct}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                <Plus size={18} />
                Thêm sản phẩm
              </button>

              <label className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors text-sm font-medium cursor-pointer">
                <Upload size={18} />
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
                className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors text-sm font-medium"
              >
                <Download size={18} />
                Export
              </button>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">Lọc:</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="published">Đã public</option>
                <option value="draft">Nháp</option>
                <option value="archived">Đã lưu trữ</option>
                <option value="scheduled">Đã lên lịch</option>
                <option value="private">Riêng tư</option>
              </select>
            </div>
          </div>

          {/* Products Table */}
          <ProductTable
            products={filteredProducts}
            onEdit={handleEditProduct}
            onDelete={handleDeleteProduct}
            onView={handleViewProduct}
          />
        </main>
      </div>

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
    </div>
  );
}

export default App;
