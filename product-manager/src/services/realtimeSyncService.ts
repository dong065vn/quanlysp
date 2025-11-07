import { googleDriveService } from './googleDrive';
import { googleAuthService } from './googleAuth';
import { storageService } from './storage';
import type { Product } from '../types/product';

export type RealtimeSyncStatus = 'idle' | 'checking' | 'syncing' | 'synced' | 'error' | 'conflict';

export interface RealtimeSyncEvent {
  type: 'remote_changes_detected' | 'sync_started' | 'sync_completed' | 'sync_error' | 'conflict_detected';
  timestamp: Date;
  message?: string;
  data?: {
    remoteProducts?: Product[];
    localProducts?: Product[];
  };
}

type RealtimeSyncListener = (event: RealtimeSyncEvent) => void;

class RealtimeSyncService {
  private listeners: Set<RealtimeSyncListener> = new Set();
  private status: RealtimeSyncStatus = 'idle';
  private enabled: boolean = false;
  private pollInterval: number | null = null;
  private readonly POLL_INTERVAL_MS = 30000; // Check every 30 seconds
  private lastCheckTime: Date | null = null;
  private autoSyncOnChange: boolean = true; // Auto download when changes detected

  // Enable realtime sync
  enable(autoSyncOnChange: boolean = true): void {
    if (this.enabled) {
      console.log('Realtime sync already enabled');
      return;
    }

    if (!googleAuthService.isAuthenticated()) {
      console.warn('Cannot enable realtime sync: not authenticated');
      return;
    }

    this.enabled = true;
    this.autoSyncOnChange = autoSyncOnChange;
    this.startPolling();
    console.log('Realtime sync enabled', { autoSyncOnChange });
  }

  // Disable realtime sync
  disable(): void {
    if (!this.enabled) {
      return;
    }

    this.enabled = false;
    this.stopPolling();
    this.status = 'idle';
    console.log('Realtime sync disabled');
  }

  // Start polling for changes
  private startPolling(): void {
    if (this.pollInterval) {
      return;
    }

    // Initial check
    this.checkForRemoteChanges();

    // Set up interval
    this.pollInterval = window.setInterval(() => {
      this.checkForRemoteChanges();
    }, this.POLL_INTERVAL_MS);

    console.log(`Polling started: checking every ${this.POLL_INTERVAL_MS / 1000}s`);
  }

  // Stop polling
  private stopPolling(): void {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
      console.log('Polling stopped');
    }
  }

  // Check for remote changes
  private async checkForRemoteChanges(): Promise<void> {
    if (!this.enabled || !googleAuthService.isAuthenticated()) {
      return;
    }

    // Don't check if already checking or syncing
    if (this.status === 'checking' || this.status === 'syncing') {
      return;
    }

    this.status = 'checking';
    this.lastCheckTime = new Date();

    try {
      const hasChanges = await googleDriveService.checkForRemoteChanges();

      if (hasChanges) {
        console.log('Remote changes detected!');
        this.status = 'conflict';

        // Notify listeners
        this.notifyListeners({
          type: 'remote_changes_detected',
          timestamp: new Date(),
          message: 'Phát hiện thay đổi trên Google Drive',
        });

        // Auto-sync if enabled
        if (this.autoSyncOnChange) {
          await this.syncFromRemote();
        }
      } else {
        this.status = 'synced';
      }
    } catch (error) {
      console.error('Error checking for remote changes:', error);
      this.status = 'error';

      this.notifyListeners({
        type: 'sync_error',
        timestamp: new Date(),
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Sync from remote (pull changes)
  async syncFromRemote(): Promise<void> {
    if (!googleAuthService.isAuthenticated()) {
      throw new Error('Not authenticated');
    }

    this.status = 'syncing';

    this.notifyListeners({
      type: 'sync_started',
      timestamp: new Date(),
      message: 'Đang đồng bộ từ Google Drive...',
    });

    try {
      // Load from Drive
      const remoteProducts = await googleDriveService.loadProducts();

      // Get local products
      const localProducts = storageService.getProducts();

      // Check if there are conflicts (different data)
      const hasConflicts = this.detectConflicts(localProducts, remoteProducts);

      if (hasConflicts) {
        console.log('Conflicts detected between local and remote data');

        this.notifyListeners({
          type: 'conflict_detected',
          timestamp: new Date(),
          message: 'Phát hiện xung đột giữa dữ liệu local và remote',
          data: {
            localProducts,
            remoteProducts,
          },
        });

        // For now, remote wins (overwrites local)
        // In production, you might want to show a conflict resolution dialog
        storageService.saveProducts(remoteProducts);
      } else {
        // No conflicts, just update
        storageService.saveProducts(remoteProducts);
      }

      // Dispatch event to update UI
      window.dispatchEvent(new CustomEvent('products-updated', {
        detail: { products: remoteProducts },
      }));

      this.status = 'synced';

      this.notifyListeners({
        type: 'sync_completed',
        timestamp: new Date(),
        message: `Đã đồng bộ ${remoteProducts.length} sản phẩm từ Google Drive`,
      });

      console.log('Sync from remote completed');
    } catch (error) {
      console.error('Error syncing from remote:', error);
      this.status = 'error';

      this.notifyListeners({
        type: 'sync_error',
        timestamp: new Date(),
        message: error instanceof Error ? error.message : 'Lỗi đồng bộ',
      });

      throw error;
    }
  }

  // Detect conflicts between local and remote data
  private detectConflicts(local: Product[], remote: Product[]): boolean {
    // Simple conflict detection: check if arrays are different
    if (local.length !== remote.length) {
      return true;
    }

    // Check if any product is different
    const localMap = new Map(local.map(p => [p.id, p]));
    const remoteMap = new Map(remote.map(p => [p.id, p]));

    // Check for products in local but not in remote
    for (const [id, localProduct] of localMap) {
      const remoteProduct = remoteMap.get(id);
      if (!remoteProduct) {
        return true;
      }

      // Check if updatedAt is different
      if (localProduct.updatedAt !== remoteProduct.updatedAt) {
        return true;
      }
    }

    // Check for products in remote but not in local
    for (const id of remoteMap.keys()) {
      if (!localMap.has(id)) {
        return true;
      }
    }

    return false;
  }

  // Manual trigger check
  async checkNow(): Promise<void> {
    await this.checkForRemoteChanges();
  }

  // Get current status
  getStatus(): RealtimeSyncStatus {
    return this.status;
  }

  // Check if enabled
  isEnabled(): boolean {
    return this.enabled;
  }

  // Get last check time
  getLastCheckTime(): Date | null {
    return this.lastCheckTime;
  }

  // Set auto-sync on change
  setAutoSyncOnChange(enabled: boolean): void {
    this.autoSyncOnChange = enabled;
  }

  // Add listener
  addListener(listener: RealtimeSyncListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  // Notify listeners
  private notifyListeners(event: RealtimeSyncEvent): void {
    this.listeners.forEach(listener => {
      try {
        listener(event);
      } catch (error) {
        console.error('Error in realtime sync listener:', error);
      }
    });
  }

  // Clean up
  destroy(): void {
    this.disable();
    this.listeners.clear();
  }
}

export const realtimeSyncService = new RealtimeSyncService();
