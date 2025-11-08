import * as XLSX from 'xlsx';
import type { Product } from '../types/product';
import { MESSAGES } from '../constants/config';

/**
 * ImportExportService - Handles Excel import/export operations
 * Separated from App.tsx to follow Single Responsibility Principle
 */
class ImportExportService {
  /**
   * Export products to Excel file
   */
  exportToExcel(products: Product[], filename?: string): void {
    try {
      const exportData = products.map(p => ({
        'SKU': p.sku,
        'Tên sản phẩm': p.name,
        'Danh mục': p.categoryName || p.category || '',
        'Giá': p.price,
        'Giá sale': p.salePrice || '',
        'Số lượng': p.stockQuantity || p.quantity || 0,
        'Trạng thái': p.status,
        'Mô tả ngắn': p.shortDescription || p.description || '',
        'Tags': Array.isArray(p.tags) ? p.tags.join(', ') : '',
        'Ngày tạo': new Date(p.createdAt).toLocaleDateString('vi-VN'),
        'Cập nhật': new Date(p.updatedAt).toLocaleDateString('vi-VN'),
      }));

      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Products');

      const exportFilename = filename || `products-${Date.now()}.xlsx`;
      XLSX.writeFile(wb, exportFilename);

      return;
    } catch (error) {
      console.error('Export error:', error);
      throw new Error(MESSAGES.EXPORT_ERROR);
    }
  }

  /**
   * Import products from Excel file
   * @param file - The Excel file to import
   * @param categories - Available categories for mapping
   * @returns Promise with imported products
   */
  async importFromExcel(
    file: File,
    categories: any[]
  ): Promise<Product[]> {
    return new Promise((resolve, reject) => {
      if (!file) {
        reject(new Error('Không có file để import'));
        return;
      }

      // Validate file type
      const validTypes = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel',
      ];

      if (!validTypes.includes(file.type) && !file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
        reject(new Error(MESSAGES.INVALID_FILE_TYPE));
        return;
      }

      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: 'binary' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet) as any[];

          if (jsonData.length === 0) {
            reject(new Error('File Excel không có dữ liệu'));
            return;
          }

          // Map imported data to Product format
          const importedProducts: Product[] = jsonData.map((row, index) => {
            const category = categories.find(c => c.name === row['Danh mục']) || categories[0];

            return {
              id: `import-${Date.now()}-${index}`,
              sku: row['SKU'] || `IMPORT-${Date.now()}-${index}`,
              name: row['Tên sản phẩm'] || 'Sản phẩm chưa có tên',
              slug: (row['Tên sản phẩm'] || '').toLowerCase().replace(/\s+/g, '-') || `product-${index}`,
              description: row['Mô tả'] || '',
              shortDescription: row['Mô tả ngắn'] || '',
              categoryId: category?.id || '',
              categoryName: category?.name || '',
              category: category?.name || '',
              price: Number(row['Giá']) || 0,
              salePrice: row['Giá sale'] ? Number(row['Giá sale']) : undefined,
              stockQuantity: Number(row['Số lượng']) || 0,
              quantity: Number(row['Số lượng']) || 0,
              status: (row['Trạng thái'] as Product['status']) || 'draft',
              images: [],
              links: [],
              tags: row['Tags']
                ? row['Tags'].split(',').map((t: string) => t.trim()).filter((t: string) => t)
                : [],
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
          });

          resolve(importedProducts);
        } catch (error) {
          console.error('Import parsing error:', error);
          reject(new Error(MESSAGES.IMPORT_ERROR));
        }
      };

      reader.onerror = () => {
        reject(new Error('Lỗi đọc file'));
      };

      reader.readAsBinaryString(file);
    });
  }

  /**
   * Validate import data
   */
  validateImportData(data: any[]): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!Array.isArray(data) || data.length === 0) {
      errors.push('Dữ liệu import trống');
      return { valid: false, errors };
    }

    // Check required fields
    const requiredFields = ['SKU', 'Tên sản phẩm'];

    data.forEach((row, index) => {
      requiredFields.forEach(field => {
        if (!row[field]) {
          errors.push(`Dòng ${index + 1}: Thiếu trường "${field}"`);
        }
      });

      // Validate price
      if (row['Giá'] && isNaN(Number(row['Giá']))) {
        errors.push(`Dòng ${index + 1}: Giá không hợp lệ`);
      }

      // Validate quantity
      if (row['Số lượng'] && isNaN(Number(row['Số lượng']))) {
        errors.push(`Dòng ${index + 1}: Số lượng không hợp lệ`);
      }
    });

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Create Excel template for import
   */
  downloadTemplate(): void {
    const templateData = [
      {
        'SKU': 'SAMPLE-001',
        'Tên sản phẩm': 'Sản phẩm mẫu',
        'Danh mục': 'Danh mục mẫu',
        'Giá': 100000,
        'Giá sale': 80000,
        'Số lượng': 100,
        'Trạng thái': 'published',
        'Mô tả ngắn': 'Mô tả ngắn sản phẩm',
        'Tags': 'tag1, tag2, tag3',
      },
    ];

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Products');
    XLSX.writeFile(wb, 'product-import-template.xlsx');
  }
}

export const importExportService = new ImportExportService();
