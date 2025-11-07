import { useState } from 'react';
import { AlertTriangle, Calendar, User, FileText, X } from 'lucide-react';
import type { Product } from '../types/product';

interface ConflictInfo {
  localProducts: Product[];
  remoteProducts: Product[];
  localModified: string;
  remoteModified: string;
}

interface ConflictDialogProps {
  isOpen: boolean;
  conflictInfo: ConflictInfo | null;
  onUseLocal: () => void;
  onUseRemote: () => void;
  onCancel: () => void;
}

export function ConflictDialog({
  isOpen,
  conflictInfo,
  onUseLocal,
  onUseRemote,
  onCancel,
}: ConflictDialogProps) {
  if (!isOpen || !conflictInfo) return null;

  const { localProducts, remoteProducts, localModified, remoteModified } = conflictInfo;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 animate-fade-in">
      <div className="bg-white rounded-lg shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden animate-scale-in">
        {/* Header */}
        <div className="bg-orange-50 border-b border-orange-200 px-6 py-4">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-8 h-8 text-orange-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-1">
                  Phát hiện xung đột dữ liệu
                </h3>
                <p className="text-sm text-gray-600">
                  Dữ liệu trên Google Drive đã được cập nhật bởi thiết bị khác.
                  Vui lòng chọn phiên bản muốn giữ lại.
                </p>
              </div>
            </div>
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          <div className="grid md:grid-cols-2 gap-4">
            {/* Local Version */}
            <div className="border-2 border-blue-200 rounded-lg overflow-hidden">
              <div className="bg-blue-50 px-4 py-3 border-b border-blue-200">
                <h4 className="font-semibold text-blue-900 flex items-center gap-2">
                  <User size={18} />
                  Phiên bản Local (Thiết bị này)
                </h4>
              </div>
              <div className="p-4 space-y-3">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar size={16} />
                  <span>Cập nhật: {formatDate(localModified)}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <FileText size={16} />
                  <span className="font-medium text-blue-700">
                    {localProducts.length} sản phẩm
                  </span>
                </div>
                <div className="mt-4">
                  <p className="text-xs text-gray-500 mb-2">Sản phẩm mới nhất:</p>
                  <div className="space-y-1 max-h-40 overflow-y-auto bg-gray-50 rounded p-2">
                    {localProducts.slice(0, 5).map((p) => (
                      <div key={p.id} className="text-xs text-gray-700 truncate">
                        • {p.name}
                      </div>
                    ))}
                    {localProducts.length > 5 && (
                      <div className="text-xs text-gray-500 italic">
                        ...và {localProducts.length - 5} sản phẩm khác
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Remote Version */}
            <div className="border-2 border-green-200 rounded-lg overflow-hidden">
              <div className="bg-green-50 px-4 py-3 border-b border-green-200">
                <h4 className="font-semibold text-green-900 flex items-center gap-2">
                  <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
                  </svg>
                  Phiên bản Cloud (Google Drive)
                </h4>
              </div>
              <div className="p-4 space-y-3">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar size={16} />
                  <span>Cập nhật: {formatDate(remoteModified)}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <FileText size={16} />
                  <span className="font-medium text-green-700">
                    {remoteProducts.length} sản phẩm
                  </span>
                </div>
                <div className="mt-4">
                  <p className="text-xs text-gray-500 mb-2">Sản phẩm mới nhất:</p>
                  <div className="space-y-1 max-h-40 overflow-y-auto bg-gray-50 rounded p-2">
                    {remoteProducts.slice(0, 5).map((p) => (
                      <div key={p.id} className="text-xs text-gray-700 truncate">
                        • {p.name}
                      </div>
                    ))}
                    {remoteProducts.length > 5 && (
                      <div className="text-xs text-gray-500 italic">
                        ...và {remoteProducts.length - 5} sản phẩm khác
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Warning Box */}
          <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-gray-700">
                <p className="font-medium text-yellow-900 mb-1">Lưu ý quan trọng:</p>
                <ul className="space-y-1 text-gray-600">
                  <li>• Phiên bản bạn chọn sẽ GHI ĐÈ phiên bản còn lại</li>
                  <li>• Dữ liệu bị ghi đè sẽ không thể khôi phục</li>
                  <li>• Khuyến nghị: Export Excel để backup trước khi quyết định</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={onCancel}
              className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-white transition-colors"
            >
              Hủy bỏ
            </button>
            <button
              onClick={onUseRemote}
              className="flex-1 px-4 py-2.5 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
            >
              Dùng Cloud ({remoteProducts.length})
            </button>
            <button
              onClick={onUseLocal}
              className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Dùng Local ({localProducts.length})
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
