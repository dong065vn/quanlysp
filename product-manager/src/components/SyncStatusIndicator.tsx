import { useState, useEffect } from 'react';
import { Cloud, CloudOff, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';
import { googleAuthService } from '../services/googleAuth';
import { syncService, type SyncEvent } from '../services/syncService';

export function SyncStatusIndicator() {
  const [isConnected, setIsConnected] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Check connection status
    setIsConnected(googleAuthService.isAuthenticated());

    // Listen for sync events
    const unsubscribe = syncService.addListener((event: SyncEvent) => {
      if (event.type === 'sync_start') {
        setSyncStatus('syncing');
        setMessage('Đang đồng bộ...');
      } else if (event.type === 'sync_success') {
        setSyncStatus('success');
        setMessage('Đã đồng bộ');
        setTimeout(() => {
          setSyncStatus('idle');
          setMessage('');
        }, 3000);
      } else if (event.type === 'sync_error') {
        setSyncStatus('error');
        setMessage(event.message || 'Lỗi đồng bộ');
        setTimeout(() => {
          setSyncStatus('idle');
          setMessage('');
        }, 5000);
      } else if (event.type === 'conflict_detected') {
        setSyncStatus('error');
        setMessage(`Phát hiện xung đột dữ liệu`);
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  if (!isConnected) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-md">
        <CloudOff size={16} className="text-gray-400" />
        <span className="text-xs text-gray-500">Offline</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-md">
      {syncStatus === 'idle' && (
        <>
          <Cloud size={16} className="text-green-600" />
          <span className="text-xs text-gray-700">Đã kết nối</span>
        </>
      )}

      {syncStatus === 'syncing' && (
        <>
          <RefreshCw size={16} className="animate-spin text-blue-600" />
          <span className="text-xs text-blue-700">{message}</span>
        </>
      )}

      {syncStatus === 'success' && (
        <>
          <CheckCircle size={16} className="text-green-600" />
          <span className="text-xs text-green-700">{message}</span>
        </>
      )}

      {syncStatus === 'error' && (
        <>
          <AlertCircle size={16} className="text-red-600" />
          <span className="text-xs text-red-700">{message}</span>
        </>
      )}
    </div>
  );
}
