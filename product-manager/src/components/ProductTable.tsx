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
import { Eye, Pencil, Trash2, Package } from 'lucide-react';
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
        size: 140,
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
          <div className="flex gap-2">
            <button
              onClick={() => onView(row.original)}
              className="p-2 hover:bg-gray-100 rounded-md transition-colors"
              title="Xem"
            >
              <Eye size={16} className="text-gray-600" />
            </button>
            <button
              onClick={() => onEdit(row.original)}
              className="p-2 hover:bg-gray-100 rounded-md transition-colors"
              title="Sửa"
            >
              <Pencil size={16} className="text-gray-600" />
            </button>
            <button
              onClick={() => onDelete(row.original.id)}
              className="p-2 hover:bg-red-50 rounded-md transition-colors"
              title="Xóa"
            >
              <Trash2 size={16} className="text-red-600" />
            </button>
          </div>
        ),
        size: 120,
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
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
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
          <tbody className="divide-y divide-gray-100">
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-4 py-4 text-sm">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {products.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <Package size={48} className="mx-auto mb-4 text-gray-300" />
            <p>Chưa có sản phẩm nào</p>
            <p className="text-sm mt-2">Nhấn "Thêm sản phẩm" để bắt đầu</p>
          </div>
        )}
      </div>
    </div>
  );
}
