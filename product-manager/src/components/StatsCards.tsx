import { Package, CheckCircle, FileText, Archive } from 'lucide-react';
import type { Product } from '../types/product';

interface StatsCardsProps {
  products: Product[];
}

export function StatsCards({ products }: StatsCardsProps) {
  const stats = {
    total: products.length,
    published: products.filter(p => p.status === 'published').length,
    draft: products.filter(p => p.status === 'draft').length,
    archived: products.filter(p => p.status === 'archived').length,
  };

  const cards = [
    {
      label: 'Tổng sản phẩm',
      value: stats.total,
      icon: <Package className="text-gray-400" size={32} />,
      color: 'text-gray-900',
    },
    {
      label: 'Đã public',
      value: stats.published,
      icon: <CheckCircle className="text-green-400" size={32} />,
      color: 'text-green-600',
    },
    {
      label: 'Nháp',
      value: stats.draft,
      icon: <FileText className="text-yellow-400" size={32} />,
      color: 'text-yellow-600',
    },
    {
      label: 'Đã lưu trữ',
      value: stats.archived,
      icon: <Archive className="text-red-400" size={32} />,
      color: 'text-red-600',
    },
  ];

  return (
    <div className="grid grid-cols-4 gap-4 mb-6">
      {cards.map((card, index) => (
        <div key={index} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex justify-between items-start">
            <div>
              <div className="text-sm text-gray-600 mb-2">{card.label}</div>
              <div className={`text-3xl font-bold ${card.color}`}>{card.value}</div>
            </div>
            <div className="opacity-20">{card.icon}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
