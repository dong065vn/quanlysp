import { useState, useEffect } from 'react';
import { Clock, XCircle, Upload, Download, RefreshCw, X } from 'lucide-react';
import { syncHistoryService, SyncHistoryEntry } from '../services/syncHistoryService';

interface SyncHistoryProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SyncHistory({ isOpen, onClose }: SyncHistoryProps) {
  const [history, setHistory] = useState<SyncHistoryEntry[]>([]);

  useEffect(() => {
    syncHistoryService.loadFromStorage();
    setHistory(syncHistoryService.getHistory());

    const unsubscribe = syncHistoryService.subscribe((newHistory) => {
      setHistory(newHistory);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  if (!isOpen) return null;

  const getIcon = (entry: SyncHistoryEntry) => {
    if (entry.status === 'error') {
      return <XCircle className="w-5 h-5 text-red-600" />;
    }

    switch (entry.type) {
      case 'upload':
        return <Upload className="w-5 h-5 text-blue-600" />;
      case 'download':
        return <Download className="w-5 h-5 text-green-600" />;
      case 'auto-save':
        return <RefreshCw className="w-5 h-5 text-purple-600" />;
    }
  };

  const getTypeLabel = (type: SyncHistoryEntry['type']) => {
    switch (type) {
      case 'upload':
        return 'Lưu lên Cloud';
      case 'download':
        return 'Tải từ Cloud';
      case 'auto-save':
        return 'Tự động lưu';
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (seconds < 60) return 'Vừa xong';
    if (minutes < 60) return `${minutes} phút trước`;
    if (hours < 24) return `${hours} giờ trước`;
    if (days < 7) return `${days} ngày trước`;

    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleClearHistory = () => {
    if (confirm('Bạn có chắc muốn xóa toàn bộ lịch sử đồng bộ?')) {
      syncHistoryService.clearHistory();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 animate-fade-in">
      <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Clock className="w-6 h-6 text-blue-600" />
            <div>
              <h3 className="text-xl font-semibold text-gray-900">
                Lịch sử đồng bộ
              </h3>
              <p className="text-sm text-gray-500">
                {history.length} hoạt động gần đây
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {history.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg mb-2">Chưa có lịch sử đồng bộ</p>
              <p className="text-gray-400 text-sm">
                Các hoạt động đồng bộ sẽ được ghi lại tại đây
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {history.map((entry) => (
                <div
                  key={entry.id}
                  className={`
                    border rounded-lg p-4 transition-colors
                    ${entry.status === 'error'
                      ? 'border-red-200 bg-red-50'
                      : 'border-gray-200 bg-white hover:bg-gray-50'
                    }
                  `}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                      {getIcon(entry)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`
                              text-sm font-medium
                              ${entry.status === 'error' ? 'text-red-700' : 'text-gray-900'}
                            `}>
                              {getTypeLabel(entry.type)}
                            </span>
                            {entry.productCount !== undefined && (
                              <span className="text-xs text-gray-500">
                                ({entry.productCount} sản phẩm)
                              </span>
                            )}
                          </div>
                          <p className={`
                            text-sm
                            ${entry.status === 'error' ? 'text-red-600' : 'text-gray-600'}
                          `}>
                            {entry.message}
                          </p>
                          {entry.errorDetails && (
                            <p className="text-xs text-red-500 mt-1 font-mono bg-red-100 p-2 rounded">
                              {entry.errorDetails}
                            </p>
                          )}
                        </div>
                        <span className="text-xs text-gray-500 whitespace-nowrap flex-shrink-0">
                          {formatTime(entry.timestamp)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {history.length > 0 && (
          <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
            <button
              onClick={handleClearHistory}
              className="text-sm text-red-600 hover:text-red-700 font-medium transition-colors"
            >
              Xóa lịch sử
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
