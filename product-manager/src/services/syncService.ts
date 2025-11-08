import { googleDriveService } from './googleDrive';
import { googleAuthService } from './googleAuth';
import type { Product } from '../types/product';
import { syncHistoryService } from './syncHistoryService';

export type SyncStatus = 'idle' | 'syncing' | 'error' | 'success' | 'unsaved';
export type SaveStatus = 'saved' | 'saving' | 'unsaved' | 'error';

export interface SyncConfig {
  enabled: boolean;
  lastSaveTime: Date | null;
  hasUnsavedChanges: boolean;
}

export interface SyncEvent {
  type: 'save_start' | 'save_success' | 'save_error' | 'changes_detected' | 'conflict_detected';
  timestamp: Date;
  message?: string;
  data?: Array<{ local: Product; remote: Product }>;
}

type SyncListener = (event: SyncEvent) => void;

class SyncService {
  private listeners: Set<SyncListener> = new Set();
  private status: SyncStatus = 'idle';
  private saveStatus: SaveStatus = 'saved';
  private config: SyncConfig = {
    enabled: false,
    lastSaveTime: null,
    hasUnsavedChanges: false,
  };
  private autoSaveTimeout: number | null = null;
  private autoSaveDelay = 2000; // Auto-save after 2 seconds of inactivity (like Google Docs)

  // Mark changes as detected (like Google Docs)
  markUnsavedChanges(): void {
    if (!this.config.hasUnsavedChanges) {
      this.config.hasUnsavedChanges = true;
      this.saveStatus = 'unsaved';
      this.notifyListeners({
        type: 'changes_detected',
        timestamp: new Date(),
      });
    }

    // Auto-save after delay (like Google Docs)
    if (this.config.enabled && googleAuthService.isAuthenticated()) {
      this.scheduleAutoSave();
    }
  }

  // Schedule auto-save after inactivity
  private scheduleAutoSave(): void {
    if (this.autoSaveTimeout) {
      clearTimeout(this.autoSaveTimeout);
    }

    this.autoSaveTimeout = window.setTimeout(() => {
      this.saveToCloud().catch(error => {
        console.error('Auto-save failed:', error);
      });
    }, this.autoSaveDelay);
  }

  // Cancel auto-save
  private cancelAutoSave(): void {
    if (this.autoSaveTimeout) {
      clearTimeout(this.autoSaveTimeout);
      this.autoSaveTimeout = null;
    }
  }
  // Manual save to cloud (user clicks Save button)
  async saveToCloud(products?: Product[]): Promise<void> {
    if (!googleAuthService.isAuthenticated()) {
      throw new Error('Not authenticated with Google Drive');
    }

    this.cancelAutoSave();
    this.saveStatus = 'saving';
    this.setStatus('syncing');

    this.notifyListeners({
      type: 'save_start',
      timestamp: new Date(),
    });

    try {
      if (products) {
        await googleDriveService.saveProducts(products);

        // Log auto-save to sync history
        syncHistoryService.addEntry({
          type: 'auto-save',
          status: 'success',
          message: 'Tự động lưu dữ liệu thành công',
          productCount: products.length,
        });
      }

      this.config.hasUnsavedChanges = false;
      this.config.lastSaveTime = new Date();
      this.saveStatus = 'saved';
      this.setStatus('success');

      this.notifyListeners({
        type: 'save_success',
        timestamp: new Date(),
      });

      // Reset status after a delay
      setTimeout(() => {
        if (this.status === 'success') {
          this.setStatus('idle');
        }
      }, 2000);
    } catch (error) {
      this.saveStatus = 'error';
      this.setStatus('error');

      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      // Log error to sync history
      syncHistoryService.addEntry({
        type: 'auto-save',
        status: 'error',
        message: 'Tự động lưu thất bại',
        errorDetails: errorMessage,
      });

      this.notifyListeners({
        type: 'save_error',
        timestamp: new Date(),
        message: errorMessage,
      });

      throw error;
    }
  }

  // Load from cloud
  async loadFromCloud(): Promise<Product[]> {
    if (!googleAuthService.isAuthenticated()) {
      throw new Error('Not authenticated with Google Drive');
    }

    try {
      this.setStatus('syncing');
      const products = await googleDriveService.loadProducts();

      this.config.hasUnsavedChanges = false;
      this.config.lastSaveTime = new Date();
      this.saveStatus = 'saved';
      this.setStatus('success');

      setTimeout(() => {
        if (this.status === 'success') {
          this.setStatus('idle');
        }
      }, 2000);

      return products;
    } catch (error) {
      this.setStatus('error');
      throw error;
    }
  }

  // Enable cloud sync
  enableSync(): void {
    this.config.enabled = true;
  }

  // Disable cloud sync
  disableSync(): void {
    this.config.enabled = false;
    this.cancelAutoSave();
  }

  // Get save status
  getSaveStatus(): SaveStatus {
    return this.saveStatus;
  }

  // Check if has unsaved changes
  hasUnsavedChanges(): boolean {
    return this.config.hasUnsavedChanges;
  }

  // Get last save time
  getLastSaveTime(): Date | null {
    return this.config.lastSaveTime;
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

  // Set sync status
  private setStatus(status: SyncStatus): void {
    this.status = status;
  }

  // Clean up
  destroy(): void {
    this.cancelAutoSave();
    this.listeners.clear();
  }
}

export const syncService = new SyncService();
