import { useMemo, useState } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  createColumnHelper,
  type SortingState,
  type ColumnFiltersState,
} from '@tanstack/react-table';
import { Eye, Pencil, Trash2, Package, ExternalLink } from 'lucide-react';
import type { Product, ProductStatus } from '../types/product';

interface ProductTableProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
  onView: (product: Product) => void;
}

const columnHelper = createColumnHelper<Product>();

function StatusBadge({ status }: { status: ProductStatus }) {
  const config = {
    published: {
      bg: 'bg-success-50',
      text: 'text-success-700',
      dot: 'bg-success-500',
      border: 'border-success-200',
      label: 'Đã public',
      icon: '✅',
    },
    draft: {
      bg: 'bg-warning-50',
      text: 'text-warning-700',
      dot: 'bg-warning-500',
      border: 'border-warning-200',
      label: 'Nháp',
      icon: '✏️',
    },
    archived: {
      bg: 'bg-danger-50',
      text: 'text-danger-700',
      dot: 'bg-danger-500',
      border: 'border-danger-200',
      label: 'Đã lưu trữ',
      icon: '📦',
    },
    scheduled: {
      bg: 'bg-info-50',
      text: 'text-info-700',
      dot: 'bg-info-500',
      border: 'border-info-200',
      label: 'Đã lên lịch',
      icon: '⏰',
    },
    private: {
      bg: 'bg-gray-50',
      text: 'text-gray-700',
      dot: 'bg-gray-500',
      border: 'border-gray-200',
      label: 'Riêng tư',
      icon: '🔒',
    },
  };

  const style = config[status] || config.draft;

  return (
    <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border ${style.bg} ${style.text} ${style.border} transition-all duration-200 hover:shadow-sm`}>
      <span className={`w-2 h-2 rounded-full ${style.dot} animate-pulse`}></span>
      <span>{style.label}</span>
    </span>
  );
}

export function ProductTable({ products, onEdit, onDelete, onView }: ProductTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [rowSelection, setRowSelection] = useState({});

  const columns = useMemo(
    () => [
      columnHelper.display({
        id: 'select',
        header: ({ table }) => (
          <input
            type="checkbox"
            checked={table.getIsAllRowsSelected()}
            onChange={table.getToggleAllRowsSelectedHandler()}
            className="w-4 h-4 cursor-pointer accent-primary-600 rounded transition-all duration-200"
          />
        ),
        cell: ({ row }) => (
          <input
            type="checkbox"
            checked={row.getIsSelected()}
            onChange={row.getToggleSelectedHandler()}
            className="w-4 h-4 cursor-pointer accent-primary-600 rounded transition-all duration-200"
          />
        ),
        size: 40,
      }),
      columnHelper.display({
        id: 'image',
        header: 'Hình ảnh',
        cell: () => (
          <div className="w-14 h-14 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl border border-gray-300 flex items-center justify-center text-2xl shadow-sm hover:shadow transition-all duration-200 hover-lift">
            📦
          </div>
        ),
        size: 90,
      }),
      columnHelper.accessor('name', {
        header: 'Tên sản phẩm',
        cell: (info) => (
          <div className="py-1">
            <div className="font-semibold text-gray-900 mb-1 hover:text-primary-600 transition-colors cursor-pointer">
              {info.getValue()}
            </div>
            <div className="inline-flex items-center gap-1.5 text-xs text-gray-500 bg-gray-50 px-2 py-0.5 rounded-md border border-gray-200">
              <span className="font-medium">SKU:</span>
              <span className="font-mono">{info.row.original.sku}</span>
            </div>
          </div>
        ),
        size: 320,
      }),
      columnHelper.accessor('categoryName', {
        header: 'Danh mục',
        cell: (info) => info.getValue() || '-',
        size: 120,
      }),
      columnHelper.accessor('price', {
        header: 'Giá',
        cell: (info) => {
          const value = info.getValue();
          return value ? (
            <div className="font-semibold text-gray-900">
              {value.toLocaleString('vi-VN')}
              <span className="text-gray-500 ml-0.5">đ</span>
            </div>
          ) : (
            <span className="text-gray-400">-</span>
          );
        },
        size: 130,
      }),
      columnHelper.accessor('stockQuantity', {
        header: 'Kho',
        cell: (info) => {
          const value = info.getValue();
          const isLow = value > 0 && value <= 10;
          const isEmpty = value === 0;
          return (
            <div className="flex items-center gap-2">
              <span className={`font-semibold ${isEmpty ? 'text-danger-600' : isLow ? 'text-warning-600' : 'text-success-600'}`}>
                {value}
              </span>
              {isEmpty && <span className="text-xs bg-danger-100 text-danger-700 px-2 py-0.5 rounded-full font-medium">Hết</span>}
              {isLow && <span className="text-xs bg-warning-100 text-warning-700 px-2 py-0.5 rounded-full font-medium">Thấp</span>}
            </div>
          );
        },
        size: 120,
      }),
      columnHelper.accessor('status', {
        header: 'Trạng thái',
        cell: (info) => <StatusBadge status={info.getValue()} />,
        size: 140,
      }),
      columnHelper.accessor('links', {
        header: 'Links',
        cell: (info) => {
          const links = info.getValue();
          if (!links || links.length === 0) {
            return <span className="text-gray-400 text-xs">-</span>;
          }
          return (
            <div className="flex gap-1 flex-wrap">
              {links.slice(0, 3).map((link) => (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-600 rounded text-xs hover:bg-blue-100 transition-colors"
                  title={link.label}
                  onClick={(e) => e.stopPropagation()}
                >
                  <ExternalLink size={12} />
                  {link.type === 'marketplace' && '🛒'}
                  {link.type === 'affiliate' && '💰'}
                  {link.type === 'social' && '📱'}
                  {link.type === 'internal' && '🔗'}
                </a>
              ))}
              {links.length > 3 && (
                <span className="text-xs text-gray-500">+{links.length - 3}</span>
              )}
            </div>
          );
        },
        size: 150,
      }),
      columnHelper.accessor('updatedAt', {
        header: 'Cập nhật',
        cell: (info) => new Date(info.getValue()).toLocaleDateString('vi-VN'),
        size: 100,
      }),
      columnHelper.display({
        id: 'actions',
        header: 'Thao tác',
        cell: ({ row }) => (
          <div className="flex gap-1.5">
            <button
              onClick={() => onView(row.original)}
              className="p-2 hover:bg-primary-50 rounded-lg transition-all duration-200 group active:scale-95"
              title="Xem"
            >
              <Eye size={16} className="text-gray-500 group-hover:text-primary-600 transition-colors" />
            </button>
            <button
              onClick={() => onEdit(row.original)}
              className="p-2 hover:bg-info-50 rounded-lg transition-all duration-200 group active:scale-95"
              title="Sửa"
            >
              <Pencil size={16} className="text-gray-500 group-hover:text-info-600 transition-colors" />
            </button>
            <button
              onClick={() => onDelete(row.original.id)}
              className="p-2 hover:bg-danger-50 rounded-lg transition-all duration-200 group active:scale-95"
              title="Xóa"
            >
              <Trash2 size={16} className="text-gray-500 group-hover:text-danger-600 transition-colors" />
            </button>
          </div>
        ),
        size: 130,
      }),
    ],
    [onEdit, onDelete, onView]
  );

  const table = useReactTable({
    data: products,
    columns,
    state: {
      sorting,
      columnFilters,
      rowSelection,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  return (
    <div className="w-full h-full relative">
      <div className="overflow-auto h-full">
        <table className="w-full border-collapse">
          <thead className="bg-gradient-to-b from-gray-50 to-gray-100/50 sticky top-0 z-10 border-b-2 border-gray-200">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-4 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-r border-gray-200/50 bg-gradient-to-b from-gray-50 to-gray-100/50"
                    style={{ width: header.getSize() }}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {table.getRowModel().rows.map((row, index) => (
              <tr
                key={row.id}
                className="hover:bg-gradient-to-r hover:from-primary-50/50 hover:to-transparent transition-all duration-200 group animate-slide-up"
                style={{ animationDelay: `${index * 30}ms` }}
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-4 py-4 text-sm border-r border-gray-100 group-hover:border-primary-100 transition-colors">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {products.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-50 to-white">
          <div className="text-center text-gray-500 p-8 animate-fade-in">
            <div className="mb-6 inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl shadow-lg">
              <Package size={48} className="text-gray-400" />
            </div>
            <p className="text-xl font-bold text-gray-700 mb-2">Chưa có sản phẩm nào</p>
            <p className="text-sm text-gray-500 mb-6">Bắt đầu thêm sản phẩm đầu tiên của bạn</p>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-100 text-primary-700 rounded-lg text-sm font-medium">
              <span>💡</span>
              <span>Nhấn nút "Thêm sản phẩm" ở thanh công cụ</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
