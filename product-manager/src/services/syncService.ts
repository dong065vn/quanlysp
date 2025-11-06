import { googleDriveService } from './googleDrive';
import { googleAuthService } from './googleAuth';
import type { Product } from '../types/product';

export type SyncStatus = 'idle' | 'syncing' | 'error' | 'success';
export type SyncMode = 'auto' | 'manual';

export interface SyncConfig {
  enabled: boolean;
  mode: SyncMode;
  intervalSeconds: number;
}

export interface SyncEvent {
  type: 'sync_start' | 'sync_success' | 'sync_error' | 'conflict_detected';
  timestamp: Date;
  message?: string;
  data?: any;
}

type SyncListener = (event: SyncEvent) => void;

class SyncService {
  private syncInterval: number | null = null;
  private listeners: Set<SyncListener> = new Set();
  private status: SyncStatus = 'idle';
  private config: SyncConfig = {
    enabled: false,
    mode: 'auto',
    intervalSeconds: 30, // Check every 30 seconds
  };

  // Start auto-sync
  startAutoSync(intervalSeconds?: number): void {
    if (this.syncInterval) {
      this.stopAutoSync();
    }

    if (intervalSeconds) {
      this.config.intervalSeconds = intervalSeconds;
    }

    this.config.enabled = true;
    this.config.mode = 'auto';

    // Initial sync
    this.performSync();

    // Set up interval
    this.syncInterval = window.setInterval(() => {
      this.performSync();
    }, this.config.intervalSeconds * 1000);

    console.log(`Auto-sync started with ${this.config.intervalSeconds}s interval`);
  }

  // Stop auto-sync
  stopAutoSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
    this.config.enabled = false;
    console.log('Auto-sync stopped');
  }

  // Perform sync operation
  private async performSync(): Promise<void> {
    // Don't sync if not authenticated
    if (!googleAuthService.isAuthenticated()) {
      return;
    }

    // Don't sync if already syncing
    if (this.status === 'syncing') {
      return;
    }

    try {
      this.setStatus('syncing');
      this.notifyListeners({
        type: 'sync_start',
        timestamp: new Date(),
      });

      // Check for remote changes
      const hasRemoteChanges = await googleDriveService.checkForRemoteChanges();

      if (hasRemoteChanges) {
        // Pull changes from Google Drive
        const remoteProducts = await googleDriveService.loadProducts();

        // Get local products
        const localProducts = this.getLocalProducts();

        // Detect conflicts (simplified - in production you'd want more sophisticated merge)
        const conflicts = this.detectConflicts(localProducts, remoteProducts);

        if (conflicts.length > 0) {
          this.notifyListeners({
            type: 'conflict_detected',
            timestamp: new Date(),
            message: `Found ${conflicts.length} conflicts`,
            data: conflicts,
          });
          // For now, remote wins (you could implement conflict resolution UI)
        }

        // Save remote data to local storage
        this.saveLocalProducts(remoteProducts);

        // Trigger update in the app
        window.dispatchEvent(new CustomEvent('products-updated', {
          detail: { products: remoteProducts },
        }));
      }

      this.setStatus('success');
      this.notifyListeners({
        type: 'sync_success',
        timestamp: new Date(),
      });
    } catch (error) {
      console.error('Sync error:', error);
      this.setStatus('error');
      this.notifyListeners({
        type: 'sync_error',
        timestamp: new Date(),
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Manual sync - push local changes to Drive
  async syncToCloud(products: Product[]): Promise<void> {
    if (!googleAuthService.isAuthenticated()) {
      throw new Error('Not authenticated with Google Drive');
    }

    try {
      this.setStatus('syncing');
      this.notifyListeners({
        type: 'sync_start',
        timestamp: new Date(),
      });

      await googleDriveService.saveProducts(products);

      this.setStatus('success');
      this.notifyListeners({
        type: 'sync_success',
        timestamp: new Date(),
      });
    } catch (error) {
      this.setStatus('error');
      this.notifyListeners({
        type: 'sync_error',
        timestamp: new Date(),
        message: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  // Manual sync - pull from Drive
  async syncFromCloud(): Promise<Product[]> {
    if (!googleAuthService.isAuthenticated()) {
      throw new Error('Not authenticated with Google Drive');
    }

    try {
      this.setStatus('syncing');
      this.notifyListeners({
        type: 'sync_start',
        timestamp: new Date(),
      });

      const products = await googleDriveService.loadProducts();

      this.setStatus('success');
      this.notifyListeners({
        type: 'sync_success',
        timestamp: new Date(),
      });

      return products;
    } catch (error) {
      this.setStatus('error');
      this.notifyListeners({
        type: 'sync_error',
        timestamp: new Date(),
        message: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  // Detect conflicts between local and remote data
  private detectConflicts(local: Product[], remote: Product[]): Array<{ local: Product; remote: Product }> {
    const conflicts: Array<{ local: Product; remote: Product }> = [];

    const remoteMap = new Map(remote.map(p => [p.id, p]));

    for (const localProduct of local) {
      const remoteProduct = remoteMap.get(localProduct.id);
      if (remoteProduct) {
        // Check if both were modified
        if (localProduct.updatedAt !== remoteProduct.updatedAt) {
          conflicts.push({ local: localProduct, remote: remoteProduct });
        }
      }
    }

    return conflicts;
  }

  // Get local products from localStorage
  private getLocalProducts(): Product[] {
    try {
      const data = localStorage.getItem('products');
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  // Save products to localStorage
  private saveLocalProducts(products: Product[]): void {
    try {
      localStorage.setItem('products', JSON.stringify(products));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }

  // Set sync status
  private setStatus(status: SyncStatus): void {
    this.status = status;
  }

  // Get current sync status
  getStatus(): SyncStatus {
    return this.status;
  }

  // Get sync config
  getConfig(): SyncConfig {
    return { ...this.config };
  }

  // Add listener for sync events
  addListener(listener: SyncListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  // Notify all listeners
  private notifyListeners(event: SyncEvent): void {
    this.listeners.forEach(listener => {
      try {
        listener(event);
      } catch (error) {
        console.error('Error in sync listener:', error);
      }
    });
  }

  // Force sync now
  async forceSyncNow(): Promise<void> {
    await this.performSync();
  }

  // Clean up
  destroy(): void {
    this.stopAutoSync();
    this.listeners.clear();
  }
}

export const syncService = new SyncService();
