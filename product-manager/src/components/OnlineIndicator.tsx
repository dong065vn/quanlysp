import { useState, useEffect } from 'react';
import { Wifi, WifiOff } from 'lucide-react';

export function OnlineIndicator() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showOfflineToast, setShowOfflineToast] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowOfflineToast(false);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowOfflineToast(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Hide toast after 5 seconds when back online
  useEffect(() => {
    if (isOnline && showOfflineToast) {
      const timer = setTimeout(() => {
        setShowOfflineToast(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isOnline, showOfflineToast]);

  // Only show when offline or just came back online
  if (!showOfflineToast && isOnline) return null;

  return (
    <div className={`
      fixed bottom-4 left-4 z-40 flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg
      transition-all duration-300 animate-scale-in
      ${isOnline
        ? 'bg-green-50 border-2 border-green-200'
        : 'bg-red-50 border-2 border-red-200'
      }
    `}>
      {isOnline ? (
        <>
          <Wifi className="w-5 h-5 text-green-600" />
          <div>
            <p className="text-sm font-medium text-green-900">
              Đã kết nối lại
            </p>
            <p className="text-xs text-green-600">
              Bạn có thể đồng bộ dữ liệu trở lại
            </p>
          </div>
        </>
      ) : (
        <>
          <WifiOff className="w-5 h-5 text-red-600" />
          <div>
            <p className="text-sm font-medium text-red-900">
              Mất kết nối Internet
            </p>
            <p className="text-xs text-red-600">
              Dữ liệu sẽ chỉ lưu local cho đến khi kết nối lại
            </p>
          </div>
        </>
      )}
    </div>
  );
}
