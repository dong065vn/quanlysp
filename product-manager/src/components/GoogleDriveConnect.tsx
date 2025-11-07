import { useState, useEffect } from 'react';
import { Cloud, CloudOff, RefreshCw, AlertCircle } from 'lucide-react';
import { googleAuthService } from '../services/googleAuth';
import { syncService, type SyncEvent } from '../services/syncService';
import { realtimeSyncService } from '../services/realtimeSyncService';
import { storageService } from '../services/storage';
import { GoogleDrivePermissionsModal } from './GoogleDrivePermissionsModal';

interface GoogleDriveConnectProps {
  onSyncComplete?: () => void;
}

export function GoogleDriveConnect({ onSyncComplete }: GoogleDriveConnectProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [user, setUser] = useState<{ name: string; email: string; picture?: string } | null>(null);
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);

  useEffect(() => {
    // Initialize Google API
    const initGoogle = async () => {
      try {
        // Load Google API script
        const script = document.createElement('script');
        script.src = 'https://apis.google.com/js/api.js';
        script.async = true;
        script.defer = true;
        document.body.appendChild(script);

        await new Promise((resolve) => {
          script.onload = resolve;
        });

        // Load Google Identity Services script
        const gisScript = document.createElement('script');
        gisScript.src = 'https://accounts.google.com/gsi/client';
        gisScript.async = true;
        gisScript.defer = true;
        document.body.appendChild(gisScript);

        await new Promise((resolve) => {
          gisScript.onload = resolve;
        });

        // Initialize services
        await googleAuthService.initialize();

        // Check if already connected
        if (googleAuthService.isAuthenticated()) {
          setIsConnected(true);
          setUser(googleAuthService.getCurrentUser());

          // Enable sync service if it was enabled
          if (storageService.isDriveSyncEnabled()) {
            syncService.enableSync();
          }
        }
      } catch (error) {
        console.error('Failed to initialize Google API:', error);
      }
    };

    initGoogle();
  }, []);

  const handleConnectClick = () => {
    setShowPermissionsModal(true);
  };

  const handleConnect = async () => {
    setIsLoading(true);
    setErrorMessage('');

    try {
      await googleAuthService.requestAccessToken();
      setIsConnected(true);
      setUser(googleAuthService.getCurrentUser());
      setShowPermissionsModal(false);
    } catch (error) {
      console.error('Failed to connect to Google Drive:', error);

      // Provide more specific error messages
      let errorMsg = 'Không thể kết nối. Vui lòng thử lại.';

      if (error instanceof Error) {
        if (error.message.includes('Client ID not configured')) {
          errorMsg = 'Chưa cấu hình Google Client ID. Vui lòng xem hướng dẫn trong GOOGLE_DRIVE_SETUP.md';
        } else if (error.message.includes('API Key not configured')) {
          errorMsg = 'Chưa cấu hình Google API Key. Vui lòng xem hướng dẫn trong GOOGLE_DRIVE_SETUP.md';
        } else if (error.message.includes('Failed to initialize')) {
          errorMsg = 'Không thể khởi tạo Google Services. Vui lòng kiểm tra kết nối internet và thử lại.';
        } else if (error.message.includes('access_denied')) {
          errorMsg = 'Bạn đã từ chối quyền truy cập. Vui lòng chấp nhận để tiếp tục.';
        } else if (error.message) {
          errorMsg = `Lỗi: ${error.message}`;
        }
      }

      setErrorMessage(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnect = () => {
    if (!confirm('Bạn có chắc chắn muốn ngắt kết nối với Google Drive?\n\nĐiều này sẽ:\n- Ngắt kết nối với tài khoản Google\n- Tắt tự động lưu\n- Tắt đồng bộ realtime\n- Dữ liệu local vẫn được giữ nguyên')) {
      return;
    }

    googleAuthService.signOut();
    syncService.disableSync();
    realtimeSyncService.disable();
    storageService.disableDriveSync();
    setIsConnected(false);
    setUser(null);
  };

  if (!isConnected) {
    return (
      <>
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <button
              onClick={handleConnectClick}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <RefreshCw size={18} className="animate-spin text-blue-600" />
              ) : (
                <Cloud size={18} className="text-gray-600" />
              )}
              <span className="text-sm font-medium text-gray-700">
                {isLoading ? 'Đang kết nối...' : 'Kết nối Google Drive'}
              </span>
            </button>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg max-w-2xl">
              <AlertCircle size={18} className="text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-red-800 font-medium mb-1">Lỗi kết nối</p>
                <p className="text-sm text-red-700">{errorMessage}</p>
                {(errorMessage.includes('Client ID') || errorMessage.includes('API Key')) && (
                  <a
                    href="https://github.com/dong065vn/quanlysp/blob/main/GOOGLE_DRIVE_SETUP.md"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:text-blue-800 underline mt-2 inline-block"
                  >
                    Xem hướng dẫn cấu hình →
                  </a>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Permissions Modal */}
        <GoogleDrivePermissionsModal
          isOpen={showPermissionsModal}
          onClose={() => {
            setShowPermissionsModal(false);
            setErrorMessage('');
          }}
          onConfirm={handleConnect}
          isLoading={isLoading}
        />
      </>
    );
  }

  return (
    <div className="flex items-center gap-3">
      {/* User Info */}
      <div className="flex items-center gap-2">
        {user?.picture && (
          <img
            src={user.picture}
            alt={user.name}
            className="w-8 h-8 rounded-full"
          />
        )}
        <div className="flex flex-col">
          <span className="text-sm font-medium text-gray-700">{user?.name}</span>
          <span className="text-xs text-gray-500">{user?.email}</span>
        </div>
      </div>

      {/* Connected Status Badge */}
      <div className="flex items-center gap-1.5 px-2 py-1 bg-green-50 border border-green-200 rounded">
        <Cloud size={14} className="text-green-600" />
        <span className="text-xs text-green-700 font-medium">Đã kết nối</span>
      </div>

      {/* Disconnect Button */}
      <button
        onClick={handleDisconnect}
        className="p-1.5 hover:bg-red-50 rounded transition-colors"
        title="Ngắt kết nối"
      >
        <CloudOff size={16} className="text-red-600" />
      </button>
    </div>
  );
}
