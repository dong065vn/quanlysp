import { useState, useEffect } from 'react';
import { Cloud, CloudOff, RefreshCw, Check, X, AlertCircle } from 'lucide-react';
import { googleAuthService } from '../services/googleAuth';
import { syncService, type SyncEvent } from '../services/syncService';
import { storageService } from '../services/storage';
import { GoogleDrivePermissionsModal } from './GoogleDrivePermissionsModal';

interface GoogleDriveConnectProps {
  onSyncComplete?: () => void;
}

export function GoogleDriveConnect({ onSyncComplete }: GoogleDriveConnectProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [syncEnabled, setSyncEnabled] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');
  const [lastSync, setLastSync] = useState<Date | null>(null);
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
          setSyncEnabled(storageService.isDriveSyncEnabled());

          // Start auto-sync if enabled
          if (storageService.isDriveSyncEnabled()) {
            syncService.startAutoSync();
          }
        }
      } catch (error) {
        console.error('Failed to initialize Google API:', error);
      }
    };

    initGoogle();

    // Listen for sync events
    const unsubscribe = syncService.addListener((event: SyncEvent) => {
      if (event.type === 'sync_start') {
        setSyncStatus('syncing');
      } else if (event.type === 'sync_success') {
        setSyncStatus('success');
        setLastSync(event.timestamp);
        setErrorMessage('');
        setTimeout(() => setSyncStatus('idle'), 2000);
        onSyncComplete?.();
      } else if (event.type === 'sync_error') {
        setSyncStatus('error');
        setErrorMessage(event.message || 'Sync failed');
        setTimeout(() => setSyncStatus('idle'), 3000);
      }
    });

    return () => {
      unsubscribe();
      syncService.stopAutoSync();
    };
  }, [onSyncComplete]);

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
      setErrorMessage('Failed to connect. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnect = () => {
    googleAuthService.signOut();
    syncService.stopAutoSync();
    storageService.disableDriveSync();
    setIsConnected(false);
    setUser(null);
    setSyncEnabled(false);
  };

  const handleToggleSync = () => {
    if (syncEnabled) {
      syncService.stopAutoSync();
      storageService.disableDriveSync();
      setSyncEnabled(false);
    } else {
      syncService.startAutoSync();
      storageService.enableDriveSync();
      setSyncEnabled(true);
    }
  };

  const handleManualSync = async () => {
    if (!isConnected) return;

    try {
      await syncService.forceSyncNow();
    } catch (error) {
      console.error('Manual sync failed:', error);
    }
  };

  const formatLastSync = (date: Date | null) => {
    if (!date) return 'Chưa đồng bộ';

    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);

    if (diffSeconds < 60) return `${diffSeconds} giây trước`;
    if (diffMinutes < 60) return `${diffMinutes} phút trước`;
    return date.toLocaleTimeString('vi-VN');
  };

  if (!isConnected) {
    return (
      <>
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
          {errorMessage && (
            <div className="flex items-center gap-1 text-red-600 text-sm">
              <AlertCircle size={16} />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>

        {/* Permissions Modal */}
        <GoogleDrivePermissionsModal
          isOpen={showPermissionsModal}
          onClose={() => setShowPermissionsModal(false)}
          onConfirm={handleConnect}
          isLoading={isLoading}
        />
      </>
    );
  }

  return (
    <div className="flex items-center gap-4">
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

      {/* Sync Toggle */}
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={syncEnabled}
          onChange={handleToggleSync}
          className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
        />
        <span className="text-sm text-gray-700">Auto-sync</span>
      </label>

      {/* Sync Status */}
      <div className="flex items-center gap-2">
        {syncStatus === 'syncing' && (
          <RefreshCw size={16} className="animate-spin text-blue-600" />
        )}
        {syncStatus === 'success' && (
          <Check size={16} className="text-green-600" />
        )}
        {syncStatus === 'error' && (
          <X size={16} className="text-red-600" />
        )}
        <span className="text-xs text-gray-500">
          {formatLastSync(lastSync)}
        </span>
      </div>

      {/* Manual Sync Button */}
      <button
        onClick={handleManualSync}
        disabled={syncStatus === 'syncing'}
        className="p-2 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        title="Đồng bộ ngay"
      >
        <RefreshCw size={18} className="text-gray-600" />
      </button>

      {/* Disconnect Button */}
      <button
        onClick={handleDisconnect}
        className="p-2 hover:bg-red-50 rounded-full transition-colors"
        title="Ngắt kết nối"
      >
        <CloudOff size={18} className="text-red-600" />
      </button>

      {/* Error Message */}
      {errorMessage && (
        <div className="flex items-center gap-1 text-red-600 text-xs">
          <AlertCircle size={14} />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
}
