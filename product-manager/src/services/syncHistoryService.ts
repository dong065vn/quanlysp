import { STORAGE_KEYS } from '../constants/config';

export interface SyncHistoryEntry {
  id: string;
  type: 'upload' | 'download' | 'auto-save';
  status: 'success' | 'error';
  timestamp: Date;
  message: string;
  productCount?: number;
  errorDetails?: string;
}

/**
 * Singleton service to manage sync history
 * Keeps track of all sync operations (upload, download, auto-save)
 */
class SyncHistoryService {
  private history: SyncHistoryEntry[] = [];
  private maxEntries = 50;
  private listeners: Set<(history: SyncHistoryEntry[]) => void> = new Set();

  /**
   * Add a new entry to the sync history
   */
  addEntry(entry: Omit<SyncHistoryEntry, 'id' | 'timestamp'>) {
    const newEntry: SyncHistoryEntry = {
      ...entry,
      id: `sync-${Date.now()}-${Math.random()}`,
      timestamp: new Date(),
    };

    this.history.unshift(newEntry);

    // Keep only last maxEntries
    if (this.history.length > this.maxEntries) {
      this.history = this.history.slice(0, this.maxEntries);
    }

    // Save to localStorage
    this.saveToStorage();

    // Notify listeners
    this.notifyListeners();
  }

  /**
   * Get all sync history entries
   */
  getHistory(): SyncHistoryEntry[] {
    return [...this.history];
  }

  /**
   * Clear all sync history
   */
  clearHistory() {
    this.history = [];
    this.saveToStorage();
    this.notifyListeners();
  }

  /**
   * Subscribe to sync history changes
   * @returns Unsubscribe function
   */
  subscribe(listener: (history: SyncHistoryEntry[]) => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Notify all listeners of history changes
   */
  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.getHistory()));
  }

  /**
   * Save history to localStorage
   */
  private saveToStorage() {
    try {
      localStorage.setItem(STORAGE_KEYS.SYNC_HISTORY, JSON.stringify(this.history));
    } catch (error) {
      console.error('Failed to save sync history:', error);
    }
  }

  /**
   * Load history from localStorage
   */
  loadFromStorage() {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.SYNC_HISTORY);
      if (stored) {
        this.history = JSON.parse(stored).map((entry: any) => ({
          ...entry,
          timestamp: new Date(entry.timestamp),
        }));
        this.notifyListeners();
      }
    } catch (error) {
      console.error('Failed to load sync history:', error);
    }
  }
}

export const syncHistoryService = new SyncHistoryService();
