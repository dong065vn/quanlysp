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
import { Eye, Pencil, Trash2, Package, ExternalLink, Globe, EyeOff, Lock, Share2 } from 'lucide-react';
import type { Product, ProductStatus, ProductVisibility } from '../types/product';

interface ProductTableProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
  onView: (product: Product) => void;
  onShare?: (product: Product) => void;
}

const columnHelper = createColumnHelper<Product>();

function StatusBadge({ status }: { status: ProductStatus }) {
  const config = {
    published: {
      bg: 'bg-green-100',
      text: 'text-green-800',
      dot: 'bg-green-500',
      label: 'Đã public',
    },
    draft: {
      bg: 'bg-yellow-100',
      text: 'text-yellow-800',
      dot: 'bg-yellow-500',
      label: 'Nháp',
    },
    archived: {
      bg: 'bg-red-100',
      text: 'text-red-800',
      dot: 'bg-red-500',
      label: 'Đã lưu trữ',
    },
    scheduled: {
      bg: 'bg-blue-100',
      text: 'text-blue-800',
      dot: 'bg-blue-500',
      label: 'Đã lên lịch',
    },
    private: {
      bg: 'bg-gray-100',
      text: 'text-gray-800',
      dot: 'bg-gray-500',
      label: 'Riêng tư',
    },
  };

  const style = config[status] || config.draft;

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${style.bg} ${style.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`}></span>
      {style.label}
    </span>
  );
}

function VisibilityBadge({ visibility, viewerCount }: { visibility: ProductVisibility; viewerCount?: number }) {
  const config = {
    public: {
      icon: Globe,
      bg: 'bg-green-50',
      text: 'text-green-700',
      label: 'Công khai',
    },
    hidden: {
      icon: EyeOff,
      bg: 'bg-gray-100',
      text: 'text-gray-600',
      label: 'Ẩn',
    },
    restricted: {
      icon: Lock,
      bg: 'bg-amber-50',
      text: 'text-amber-700',
      label: 'Giới hạn',
    },
  };

  const style = config[visibility] || config.public;
  const Icon = style.icon;

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${style.bg} ${style.text}`}>
      <Icon size={12} />
      {style.label}
      {visibility === 'restricted' && viewerCount !== undefined && (
        <span className="ml-1 bg-amber-200 px-1 rounded">{viewerCount}</span>
      )}
    </span>
  );
}

export function ProductTable({ products, onEdit, onDelete, onView, onShare }: ProductTableProps) {
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
            className="w-4 h-4 cursor-pointer"
          />
        ),
        cell: ({ row }) => (
          <input
            type="checkbox"
            checked={row.getIsSelected()}
            onChange={row.getToggleSelectedHandler()}
            className="w-4 h-4 cursor-pointer"
          />
        ),
        size: 40,
      }),
      columnHelper.display({
        id: 'image',
        header: 'Hình ảnh',
        cell: () => (
          <div className="w-12 h-12 bg-gray-200 rounded-md border border-gray-300 flex items-center justify-center text-gray-400">
            📦
          </div>
        ),
        size: 80,
      }),
      columnHelper.accessor('name', {
        header: 'Tên sản phẩm',
        cell: (info) => (
          <div>
            <div className="font-medium text-gray-900">{info.getValue()}</div>
            <div className="text-xs text-gray-500">SKU: {info.row.original.sku}</div>
          </div>
        ),
        size: 300,
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
          return value ? `${value.toLocaleString('vi-VN')}đ` : '-';
        },
        size: 120,
      }),
      columnHelper.accessor('stockQuantity', {
        header: 'Kho',
        cell: (info) => {
          const value = info.getValue();
          return (
            <span className={value === 0 ? 'text-red-600 font-medium' : ''}>
              {value}
            </span>
          );
        },
        size: 80,
      }),
      columnHelper.accessor('status', {
        header: 'Trạng thái',
        cell: (info) => <StatusBadge status={info.getValue()} />,
        size: 120,
      }),
      columnHelper.accessor('visibility', {
        header: 'Hiển thị',
        cell: (info) => (
          <VisibilityBadge 
            visibility={info.getValue() || 'public'} 
            viewerCount={info.row.original.allowedViewers?.length}
          />
        ),
        size: 100,
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
          <div className="flex gap-1">
            <button
              onClick={() => onView(row.original)}
              className="p-1.5 hover:bg-gray-100 rounded-md transition-colors"
              title="Xem"
            >
              <Eye size={15} className="text-gray-600" />
            </button>
            <button
              onClick={() => onEdit(row.original)}
              className="p-1.5 hover:bg-gray-100 rounded-md transition-colors"
              title="Sửa"
            >
              <Pencil size={15} className="text-gray-600" />
            </button>
            {onShare && (
              <button
                onClick={() => onShare(row.original)}
                className="p-1.5 hover:bg-blue-50 rounded-md transition-colors"
                title="Chia sẻ"
              >
                <Share2 size={15} className="text-blue-600" />
              </button>
            )}
            <button
              onClick={() => onDelete(row.original.id)}
              className="p-1.5 hover:bg-red-50 rounded-md transition-colors"
              title="Xóa"
            >
              <Trash2 size={15} className="text-red-600" />
            </button>
          </div>
        ),
        size: 140,
      }),
    ],
    [onEdit, onDelete, onView, onShare]
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
    <div className="w-full h-full">
      <div className="overflow-auto h-full">
        <table className="w-full border-collapse">
          <thead className="bg-gray-50 sticky top-0 z-10 border-b-2 border-gray-300">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-4 py-2 text-left text-xs font-medium text-gray-700 border-r border-gray-200 bg-gray-50"
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
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="hover:bg-blue-50 transition-colors border-b border-gray-200">
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-4 py-3 text-sm border-r border-gray-200">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {products.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-white">
          <div className="text-center text-gray-500">
            <Package size={64} className="mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium">Chưa có sản phẩm nào</p>
            <p className="text-sm mt-2">Nhấn nút "Thêm" ở thanh công cụ để bắt đầu</p>
          </div>
        </div>
      )}
    </div>
  );
}
