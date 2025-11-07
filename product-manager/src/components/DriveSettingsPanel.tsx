import { useState, useEffect } from 'react';
import { Cloud, Database, Clock, HardDrive, Settings, ChevronRight, History } from 'lucide-react';
import { GoogleDriveConnect } from './GoogleDriveConnect';
import { googleAuthService } from '../services/googleAuth';
import { googleDriveService } from '../services/googleDrive';
import { storageService } from '../services/storage';

interface DriveSettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onSyncComplete?: () => void;
  onOpenSyncHistory?: () => void;
}

export function DriveSettingsPanel({
  isOpen,
  onClose,
  onSyncComplete,
  onOpenSyncHistory,
}: DriveSettingsPanelProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [syncStatus, setSyncStatus] = useState<any>(null);
  const [localProductCount, setLocalProductCount] = useState(0);
  const [localStorageSize, setLocalStorageSize] = useState(0);

  useEffect(() => {
    if (isOpen) {
      updateStats();
      const interval = setInterval(updateStats, 2000);
      return () => clearInterval(interval);
    }
  }, [isOpen]);

  const updateStats = () => {
    setIsConnected(googleAuthService.isAuthenticated());

    if (googleAuthService.isAuthenticated()) {
      const status = googleDriveService.getSyncStatus();
      setSyncStatus(status);
    }

    const products = storageService.getProducts();
    setLocalProductCount(products.length);

    // Calculate localStorage size
    try {
      const allStorage = JSON.stringify(localStorage);
      const sizeInBytes = new Blob([allStorage]).size;
      setLocalStorageSize(sizeInBytes);
    } catch (error) {
      console.error('Failed to calculate storage size:', error);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (date: Date | null) => {
    if (!date) return 'Chưa đồng bộ';
    return date.toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!isOpen) return null;

  return (
    <div className="bg-gradient-to-b from-blue-50 to-white border-t border-blue-200 shadow-inner">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1 flex items-center gap-2">
              <Settings size={20} />
              Cài đặt Google Drive
            </h3>
            <p className="text-sm text-gray-600">
              Quản lý kết nối và đồng bộ dữ liệu với Google Drive
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors text-2xl leading-none"
          >
            ×
          </button>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Connection Section */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
              <h4 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
                <Cloud size={18} className="text-blue-600" />
                Kết nối tài khoản
              </h4>
              <GoogleDriveConnect onSyncComplete={onSyncComplete} />
            </div>

            {isConnected && syncStatus && (
              <>
                {/* Sync Status */}
                <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
                  <h4 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
                    <Clock size={18} className="text-purple-600" />
                    Trạng thái đồng bộ
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-sm text-gray-600">Trạng thái kết nối</span>
                      <span className={`text-sm font-medium flex items-center gap-2 ${
                        syncStatus.isConnected ? 'text-green-600' : 'text-red-600'
                      }`}>
                        <span className={`w-2 h-2 rounded-full ${
                          syncStatus.isConnected ? 'bg-green-600' : 'bg-red-600'
                        }`}></span>
                        {syncStatus.isConnected ? 'Đã kết nối' : 'Chưa kết nối'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-sm text-gray-600">Lần đồng bộ cuối</span>
                      <span className="text-sm font-medium text-gray-900">
                        {formatDate(syncStatus.lastSync)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-sm text-gray-600">Đang đồng bộ</span>
                      <span className={`text-sm font-medium ${
                        syncStatus.isSyncing ? 'text-blue-600' : 'text-gray-500'
                      }`}>
                        {syncStatus.isSyncing ? 'Có' : 'Không'}
                      </span>
                    </div>
                  </div>

                  {/* Sync History Button */}
                  {onOpenSyncHistory && (
                    <button
                      onClick={onOpenSyncHistory}
                      className="mt-4 w-full flex items-center justify-between px-4 py-2.5 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-sm font-medium text-gray-700"
                    >
                      <span className="flex items-center gap-2">
                        <History size={16} />
                        Xem lịch sử đồng bộ
                      </span>
                      <ChevronRight size={16} />
                    </button>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Statistics Section */}
          <div className="space-y-4">
            <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
              <h4 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
                <Database size={18} className="text-green-600" />
                Thống kê dữ liệu
              </h4>
              <div className="space-y-4">
                {/* Local Storage */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-500 uppercase tracking-wide">
                      Local Storage
                    </span>
                    <HardDrive size={14} className="text-gray-400" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-baseline">
                      <span className="text-sm text-gray-600">Sản phẩm</span>
                      <span className="text-2xl font-bold text-gray-900">
                        {localProductCount}
                      </span>
                    </div>
                    <div className="flex justify-between items-baseline">
                      <span className="text-sm text-gray-600">Dung lượng</span>
                      <span className="text-sm font-medium text-gray-700">
                        {formatBytes(localStorageSize)}
                      </span>
                    </div>
                    <div className="mt-2 bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-blue-600 h-full rounded-full transition-all duration-300"
                        style={{
                          width: `${Math.min((localStorageSize / (5 * 1024 * 1024)) * 100, 100)}%`
                        }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatBytes(5 * 1024 * 1024 - localStorageSize)} còn lại
                    </p>
                  </div>
                </div>

                {/* Tips */}
                <div className="pt-4 border-t border-gray-100">
                  <p className="text-xs text-gray-500 mb-2 font-medium">
                    💡 Mẹo sử dụng:
                  </p>
                  <ul className="space-y-1 text-xs text-gray-600">
                    <li>• Bật Auto-save để tự động backup</li>
                    <li>• Export Excel định kỳ</li>
                    <li>• Đồng bộ trước khi đóng trình duyệt</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-xs text-blue-900 font-medium mb-2">
                📋 Dữ liệu lưu trữ
              </p>
              <p className="text-xs text-blue-700 leading-relaxed">
                Dữ liệu được lưu trong thư mục <code className="bg-blue-100 px-1 py-0.5 rounded">ProductManagerData/products.json</code> trên Google Drive của bạn.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
