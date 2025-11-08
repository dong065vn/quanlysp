import { useState, useEffect } from 'react';
import { RefreshCw, CheckCircle, AlertCircle, Cloud, CloudOff, Activity } from 'lucide-react';
import { realtimeSyncService, type RealtimeSyncEvent, type RealtimeSyncStatus } from '../services/realtimeSyncService';
import { googleAuthService } from '../services/googleAuth';
import { toast } from './Toast';

export function RealtimeSyncIndicator() {
  const [isConnected, setIsConnected] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);
  const [status, setStatus] = useState<RealtimeSyncStatus>('idle');
  const [lastCheckTime, setLastCheckTime] = useState<Date | null>(null);

  useEffect(() => {
    // Check connection status
    setIsConnected(googleAuthService.isAuthenticated());

    // Listen for auth state changes
    const unsubscribeAuth = googleAuthService.addAuthListener((event) => {
      console.log('Auth state changed in RealtimeSyncIndicator:', event.type, event.isAuthenticated);
      setIsConnected(event.isAuthenticated);

      // Disable realtime sync if disconnected
      if (!event.isAuthenticated && isEnabled) {
        realtimeSyncService.disable();
      }
    });

    return () => {
      unsubscribeAuth();
    };
  }, [isEnabled]);

  useEffect(() => {
    // Update status
    const updateStatus = () => {
      setIsEnabled(realtimeSyncService.isEnabled());
      setStatus(realtimeSyncService.getStatus());
      setLastCheckTime(realtimeSyncService.getLastCheckTime());
    };

    updateStatus();

    // Listen to sync events
    const unsubscribe = realtimeSyncService.addListener((event: RealtimeSyncEvent) => {
      updateStatus();

      // Show toasts for important events
      if (event.type === 'remote_changes_detected') {
        toast.info(
          'Phát hiện thay đổi',
          'Dữ liệu trên Google Drive đã được cập nhật.'
        );
      } else if (event.type === 'sync_completed') {
        toast.success(
          'Đồng bộ thành công',
          event.message || 'Đã tải dữ liệu mới nhất từ Google Drive.'
        );
      } else if (event.type === 'sync_error') {
        toast.error(
          'Lỗi đồng bộ',
          event.message || 'Không thể đồng bộ với Google Drive.'
        );
      } else if (event.type === 'conflict_detected') {
        toast.warning(
          'Phát hiện xung đột',
          'Dữ liệu local và remote khác nhau. Đang sử dụng dữ liệu từ Drive.'
        );
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const handleToggleRealtime = () => {
    if (!isConnected) {
      toast.warning(
        'Chưa kết nối Google Drive',
        'Vui lòng kết nối Google Drive trước.'
      );
      return;
    }

    if (isEnabled) {
      realtimeSyncService.disable();
      toast.info('Tắt đồng bộ realtime', 'Dữ liệu sẽ không tự động đồng bộ.');
    } else {
      realtimeSyncService.enable(true); // Enable with auto-sync
      toast.success('Bật đồng bộ realtime', 'Dữ liệu sẽ tự động đồng bộ mỗi 30 giây.');
    }
  };

  if (!isConnected) {
    return null; // Don't show if not connected
  }

  const getStatusIcon = () => {
    switch (status) {
      case 'checking':
        return <RefreshCw size={14} className="animate-spin text-blue-500" />;
      case 'syncing':
        return <RefreshCw size={14} className="animate-spin text-green-500" />;
      case 'synced':
        return <CheckCircle size={14} className="text-green-500" />;
      case 'error':
        return <AlertCircle size={14} className="text-red-500" />;
      case 'conflict':
        return <AlertCircle size={14} className="text-orange-500" />;
      case 'idle':
      default:
        return <Cloud size={14} className="text-gray-400" />;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'checking':
        return 'Đang kiểm tra...';
      case 'syncing':
        return 'Đang đồng bộ...';
      case 'synced':
        return 'Đã đồng bộ';
      case 'error':
        return 'Lỗi';
      case 'conflict':
        return 'Xung đột';
      case 'idle':
      default:
        return 'Chờ';
    }
  };

  const getLastCheckText = () => {
    if (!lastCheckTime) return '';

    const now = Date.now();
    const diffMs = now - lastCheckTime.getTime();
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);

    if (diffSeconds < 60) {
      return `${diffSeconds}s trước`;
    } else if (diffMinutes < 60) {
      return `${diffMinutes}m trước`;
    } else {
      return lastCheckTime.toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
      });
    }
  };

  return (
    <div className="flex items-center gap-2">
      {/* Realtime Sync Toggle */}
      <button
        onClick={handleToggleRealtime}
        className={`flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded transition-all ${
          isEnabled
            ? 'bg-green-50 text-green-700 hover:bg-green-100'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        }`}
        title={isEnabled ? 'Tắt đồng bộ realtime' : 'Bật đồng bộ realtime'}
      >
        <Activity size={14} className={isEnabled ? 'animate-pulse' : ''} />
        <span className="text-xs font-medium hidden sm:inline">
          {isEnabled ? 'Realtime ON' : 'Realtime OFF'}
        </span>
      </button>

      {/* Status Indicator */}
      {isEnabled && (
        <div
          className="flex items-center gap-1.5 px-2 sm:px-3 py-1.5 bg-white border border-gray-200 rounded"
          title={`Trạng thái: ${getStatusText()}`}
        >
          {getStatusIcon()}
          <span className="text-xs text-gray-600 hidden sm:inline">
            {getStatusText()}
          </span>
          {lastCheckTime && (
            <span className="text-[10px] text-gray-400 hidden md:inline">
              ({getLastCheckText()})
            </span>
          )}
        </div>
      )}
    </div>
  );
}
