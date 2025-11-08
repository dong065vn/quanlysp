import { useState, useEffect } from 'react';
import { Upload, Download, RefreshCw, Cloud, CloudOff } from 'lucide-react';
import { googleAuthService } from '../services/googleAuth';
import { syncService, type SyncEvent } from '../services/syncService';
import { storageService } from '../services/storage';
import { toast } from './Toast';
import { syncHistoryService } from '../services/syncHistoryService';
import { ConfirmDialog } from './ConfirmDialog';

interface CloudSyncControlsProps {
  products: any[];
  onSyncComplete?: () => void;
}

export function CloudSyncControls({ products, onSyncComplete }: CloudSyncControlsProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');
  const [showDownloadConfirm, setShowDownloadConfirm] = useState(false);

  useEffect(() => {
    // Check connection status
    setIsConnected(googleAuthService.isAuthenticated());
    setAutoSaveEnabled(storageService.isDriveSyncEnabled());

    // Listen for sync events
    const unsubscribe = syncService.addListener((event: SyncEvent) => {
      if (event.type === 'save_start') {
        setSyncStatus('syncing');
        setIsSaving(true);
      } else if (event.type === 'save_success') {
        setSyncStatus('success');
        setIsSaving(false);
        setTimeout(() => setSyncStatus('idle'), 2000);
        onSyncComplete?.();
      } else if (event.type === 'save_error') {
        setSyncStatus('error');
        setIsSaving(false);
        setTimeout(() => setSyncStatus('idle'), 3000);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [onSyncComplete]);

  // Update connection status when auth changes
  useEffect(() => {
    const checkAuth = () => {
      setIsConnected(googleAuthService.isAuthenticated());
    };

    // Check periodically
    const interval = setInterval(checkAuth, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleUploadToCloud = async () => {
    if (!isConnected) {
      toast.warning(
        'Chưa kết nối Google Drive',
        'Vui lòng kết nối Google Drive trước khi lưu dữ liệu lên cloud.'
      );
      return;
    }

    setIsSaving(true);
    try {
      await storageService.saveToCloud(products);

      // Log to sync history
      syncHistoryService.addEntry({
        type: 'upload',
        status: 'success',
        message: 'Đã lưu dữ liệu lên Google Drive thành công',
        productCount: products.length,
      });

      toast.success(
        'Lưu thành công!',
        `Đã lưu ${products.length} sản phẩm lên Google Drive.`
      );
    } catch (error) {
      console.error('Upload failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Lỗi không xác định';

      // Log error to sync history
      syncHistoryService.addEntry({
        type: 'upload',
        status: 'error',
        message: 'Không thể lưu lên Cloud',
        productCount: products.length,
        errorDetails: errorMessage,
      });

      toast.error(
        'Không thể lưu lên Cloud',
        `Lỗi: ${errorMessage}. Vui lòng kiểm tra kết nối và thử lại.`
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleDownloadFromCloud = async () => {
    if (!isConnected) {
      toast.warning(
        'Chưa kết nối Google Drive',
        'Vui lòng kết nối Google Drive trước khi tải dữ liệu từ cloud.'
      );
      return;
    }

    setShowDownloadConfirm(true);
  };

  const handleConfirmDownload = async () => {
    setShowDownloadConfirm(false);
    setIsLoading(true);

    try {
      setSyncStatus('syncing');
      const cloudProducts = await storageService.loadFromCloud();

      // Trigger update in the app
      window.dispatchEvent(new CustomEvent('products-updated', {
        detail: { products: cloudProducts },
      }));

      setSyncStatus('success');
      setTimeout(() => setSyncStatus('idle'), 2000);
      onSyncComplete?.();

      // Log to sync history
      syncHistoryService.addEntry({
        type: 'download',
        status: 'success',
        message: 'Đã tải dữ liệu từ Google Drive thành công',
        productCount: cloudProducts.length,
      });

      toast.success(
        'Tải thành công!',
        `Đã tải ${cloudProducts.length} sản phẩm từ Google Drive.`
      );
    } catch (error) {
      console.error('Download failed:', error);
      setSyncStatus('error');
      setTimeout(() => setSyncStatus('idle'), 3000);

      const errorMessage = error instanceof Error ? error.message : 'Lỗi không xác định';

      // Log error to sync history
      syncHistoryService.addEntry({
        type: 'download',
        status: 'error',
        message: 'Không thể tải từ Cloud',
        errorDetails: errorMessage,
      });

      toast.error(
        'Không thể tải từ Cloud',
        `Lỗi: ${errorMessage}. Vui lòng kiểm tra kết nối và thử lại.`
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleAutoSave = () => {
    if (autoSaveEnabled) {
      // Disable auto-save
      syncService.disableSync();
      storageService.disableDriveSync();
      setAutoSaveEnabled(false);
      toast.info('Đã tắt Auto-save', 'Dữ liệu sẽ không tự động lưu lên Google Drive.');
    } else {
      // Enable auto-save
      syncService.enableSync();
      storageService.enableDriveSync();
      setAutoSaveEnabled(true);
      toast.success('Đã bật Auto-save', 'Dữ liệu sẽ tự động lưu lên Google Drive khi có thay đổi.');
    }
  };

  if (!isConnected) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-lg">
        <CloudOff size={16} className="text-gray-400" />
        <span className="text-xs text-gray-500 hidden sm:inline">
          Chưa kết nối Cloud
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1 sm:gap-2">
      {/* Upload to Cloud Button */}
      <button
        onClick={handleUploadToCloud}
        disabled={isSaving || syncStatus === 'syncing'}
        className="flex items-center gap-1.5 px-2 sm:px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        title="Lưu lên Google Drive"
      >
        {isSaving ? (
          <RefreshCw size={16} className="animate-spin" />
        ) : (
          <Upload size={16} />
        )}
        <span className="hidden sm:inline">Lưu lên Cloud</span>
        <span className="sm:hidden">↑</span>
      </button>

      {/* Download from Cloud Button */}
      <button
        onClick={handleDownloadFromCloud}
        disabled={isLoading || syncStatus === 'syncing'}
        className="flex items-center gap-1.5 px-2 sm:px-3 py-1.5 bg-green-600 text-white rounded hover:bg-green-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        title="Tải từ Google Drive"
      >
        {isLoading ? (
          <RefreshCw size={16} className="animate-spin" />
        ) : (
          <Download size={16} />
        )}
        <span className="hidden sm:inline">Tải từ Cloud</span>
        <span className="sm:hidden">↓</span>
      </button>

      {/* Divider */}
      <div className="w-px h-6 bg-gray-300 mx-1 hidden sm:block"></div>

      {/* Auto-save Toggle */}
      <label className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 hover:bg-gray-100 rounded transition-colors cursor-pointer">
        <div className="relative">
          <input
            type="checkbox"
            checked={autoSaveEnabled}
            onChange={handleToggleAutoSave}
            className="sr-only peer"
          />
          <div className="w-9 h-5 bg-gray-300 rounded-full peer peer-checked:bg-blue-600 transition-colors"></div>
          <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-4"></div>
        </div>
        <span className="text-xs sm:text-sm text-gray-700 hidden sm:inline">Auto-save</span>
        <Cloud size={14} className={`sm:hidden ${autoSaveEnabled ? 'text-blue-600' : 'text-gray-400'}`} />
      </label>

      {/* Status Indicator (optional - can show sync status) */}
      {syncStatus === 'success' && (
        <div className="flex items-center gap-1 text-green-600 text-xs hidden sm:flex">
          <span>✓</span>
        </div>
      )}
      {syncStatus === 'error' && (
        <div className="flex items-center gap-1 text-red-600 text-xs hidden sm:flex">
          <span>✗</span>
        </div>
      )}

      {/* Download Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDownloadConfirm}
        type="warning"
        title="Tải dữ liệu từ Cloud"
        message="Tải dữ liệu từ Cloud sẽ GHI ĐÈ toàn bộ dữ liệu local hiện tại."
        details={[
          'Mọi thay đổi chưa lưu sẽ bị mất vĩnh viễn',
          'Dữ liệu local sẽ được thay thế bằng dữ liệu từ Google Drive',
          'Khuyến nghị: Export Excel để backup trước khi tiếp tục',
        ]}
        confirmText="Tiếp tục tải"
        cancelText="Hủy bỏ"
        onConfirm={handleConfirmDownload}
        onCancel={() => {
          setShowDownloadConfirm(false);
          toast.info('Đã hủy', 'Không tải dữ liệu từ cloud.');
        }}
      />
    </div>
  );
}
