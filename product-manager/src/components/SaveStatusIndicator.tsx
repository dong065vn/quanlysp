import { useState, useEffect } from 'react';
import { Cloud, Check, AlertCircle, Loader2 } from 'lucide-react';
import { syncService, type SaveStatus, type SyncEvent } from '../services/syncService';
import { googleAuthService } from '../services/googleAuth';

export function SaveStatusIndicator() {
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('saved');
  const [lastSaveTime, setLastSaveTime] = useState<Date | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Check connection status
    setIsConnected(googleAuthService.isAuthenticated());

    // Listen for auth state changes
    const unsubscribeAuth = googleAuthService.addAuthListener((event) => {
      console.log('Auth state changed in SaveStatusIndicator:', event.type, event.isAuthenticated);
      setIsConnected(event.isAuthenticated);
    });

    // Listen for sync events
    const unsubscribeSync = syncService.addListener((event: SyncEvent) => {
      if (event.type === 'save_start') {
        setSaveStatus('saving');
      } else if (event.type === 'save_success') {
        setSaveStatus('saved');
        setLastSaveTime(event.timestamp);
      } else if (event.type === 'save_error') {
        setSaveStatus('error');
      } else if (event.type === 'changes_detected') {
        setSaveStatus('unsaved');
      }
    });

    // Initial status
    setSaveStatus(syncService.getSaveStatus());
    setLastSaveTime(syncService.getLastSaveTime());

    return () => {
      unsubscribeAuth();
      unsubscribeSync();
    };
  }, []);

  const formatLastSaveTime = (date: Date | null) => {
    if (!date) return '';

    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);

    if (diffSeconds < 5) return 'vừa xong';
    if (diffSeconds < 60) return `${diffSeconds} giây trước`;
    if (diffMinutes < 60) return `${diffMinutes} phút trước`;
    return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  };

  // Don't show if not connected to cloud
  if (!isConnected) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 text-sm">
      {saveStatus === 'saved' && (
        <>
          <Check size={16} className="text-green-600" />
          <span className="text-gray-600 hidden sm:inline">
            {lastSaveTime ? `Đã lưu ${formatLastSaveTime(lastSaveTime)}` : 'Đã lưu'}
          </span>
          <span className="text-gray-600 sm:hidden">Đã lưu</span>
        </>
      )}

      {saveStatus === 'saving' && (
        <>
          <Loader2 size={16} className="text-blue-600 animate-spin" />
          <span className="text-gray-600 hidden sm:inline">Đang lưu...</span>
          <span className="text-gray-600 sm:hidden">Lưu...</span>
        </>
      )}

      {saveStatus === 'unsaved' && (
        <>
          <Cloud size={16} className="text-orange-500" />
          <span className="text-orange-600 hidden sm:inline">Chưa lưu</span>
          <span className="text-orange-600 sm:hidden">Chưa lưu</span>
        </>
      )}

      {saveStatus === 'error' && (
        <>
          <AlertCircle size={16} className="text-red-600" />
          <span className="text-red-600 hidden sm:inline">Lỗi khi lưu</span>
          <span className="text-red-600 sm:hidden">Lỗi</span>
        </>
      )}
    </div>
  );
}
