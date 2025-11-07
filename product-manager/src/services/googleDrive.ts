import { googleAuthService } from './googleAuth';
import type { Product } from '../types/product';

export interface DriveFile {
  id: string;
  name: string;
  modifiedTime: string;
  version: number;
}

class GoogleDriveService {
  private readonly APP_FOLDER_NAME = 'ProductManagerData';
  private readonly DATA_FILE_NAME = 'products.json';
  private appFolderId: string | null = null;
  private dataFileId: string | null = null;
  private syncInProgress = false;
  private lastSyncTime: Date | null = null;

  // Get or create app folder in Google Drive
  private async getOrCreateAppFolder(): Promise<string> {
    if (this.appFolderId) {
      return this.appFolderId;
    }

    try {
      // Search for existing folder
      const response = await window.gapi.client.drive.files.list({
        q: `name='${this.APP_FOLDER_NAME}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
        spaces: 'drive',
        fields: 'files(id, name)',
      });

      if (response.result.files && response.result.files.length > 0) {
        const folderId = response.result.files[0].id;
        if (!folderId) {
          throw new Error('Failed to get folder ID');
        }
        this.appFolderId = folderId;
        return folderId;
      }

      // Create new folder if not exists
      const createResponse = await window.gapi.client.drive.files.create({
        resource: {
          name: this.APP_FOLDER_NAME,
          mimeType: 'application/vnd.google-apps.folder',
        },
        fields: 'id',
      });

      const folderId = createResponse.result.id;
      if (!folderId) {
        throw new Error('Failed to create folder');
      }
      this.appFolderId = folderId;
      return folderId;
    } catch (error) {
      console.error('Error getting/creating app folder:', error);
      throw new Error('Failed to access Google Drive folder');
    }
  }

  // Get or create data file
  private async getOrCreateDataFile(): Promise<string> {
    if (this.dataFileId) {
      return this.dataFileId;
    }

    const folderId = await this.getOrCreateAppFolder();

    try {
      // Search for existing file
      const response = await window.gapi.client.drive.files.list({
        q: `name='${this.DATA_FILE_NAME}' and '${folderId}' in parents and trashed=false`,
        spaces: 'drive',
        fields: 'files(id, name, modifiedTime)',
      });

      if (response.result.files && response.result.files.length > 0) {
        const fileId = response.result.files[0].id;
        if (!fileId) {
          throw new Error('Failed to get file ID');
        }
        this.dataFileId = fileId;
        return fileId;
      }

      // Create new file with empty data
      const initialData = {
        products: [],
        version: 1,
        lastModified: new Date().toISOString(),
      };

      const createResponse = await window.gapi.client.drive.files.create({
        resource: {
          name: this.DATA_FILE_NAME,
          mimeType: 'application/json',
          parents: [folderId],
        },
        fields: 'id',
      });

      const fileId = createResponse.result.id;
      if (!fileId) {
        throw new Error('Failed to create file');
      }
      this.dataFileId = fileId;

      // Upload initial data
      await this.updateFileContent(fileId, initialData);

      return fileId;
    } catch (error) {
      console.error('Error getting/creating data file:', error);
      throw new Error('Failed to access data file in Google Drive');
    }
  }

  // Read file content from Google Drive
  async readFileContent(): Promise<{ products: Product[]; version: number; lastModified: string }> {
    try {
      const fileId = await this.getOrCreateDataFile();

      const response = await window.gapi.client.drive.files.get({
        fileId: fileId,
        alt: 'media',
      });

      return response.result as { products: Product[]; version: number; lastModified: string };
    } catch (error) {
      console.error('Error reading file from Google Drive:', error);
      return {
        products: [],
        version: 1,
        lastModified: new Date().toISOString(),
      };
    }
  }

  // Update file content in Google Drive with retry mechanism
  private async updateFileContent(
    fileId: string,
    data: { products: Product[]; version: number; lastModified: string },
    retries = 3
  ): Promise<void> {
    const boundary = '-------314159265358979323846';
    const delimiter = `\r\n--${boundary}\r\n`;
    const closeDelimiter = `\r\n--${boundary}--`;

    const contentType = 'application/json';
    const metadata = {
      mimeType: contentType,
    };

    const multipartRequestBody =
      delimiter +
      'Content-Type: application/json\r\n\r\n' +
      JSON.stringify(metadata) +
      delimiter +
      `Content-Type: ${contentType}\r\n\r\n` +
      JSON.stringify(data) +
      closeDelimiter;

    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        const response = await fetch(`https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=multipart`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${googleAuthService.getAccessToken()}`,
            'Content-Type': `multipart/related; boundary=${boundary}`,
          },
          body: multipartRequestBody,
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Drive API error: ${response.status} - ${errorText}`);
        }

        return; // Success
      } catch (error) {
        const isLastAttempt = attempt === retries - 1;

        if (isLastAttempt) {
          throw error;
        }

        // Exponential backoff: 1s, 2s, 4s
        const delay = Math.pow(2, attempt) * 1000;
        console.warn(`Upload attempt ${attempt + 1} failed, retrying in ${delay}ms...`, error);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  // Save products to Google Drive with conflict detection
  async saveProducts(products: Product[], options?: { forceOverwrite?: boolean }): Promise<void> {
    if (this.syncInProgress) {
      console.warn('Sync already in progress');
      return;
    }

    this.syncInProgress = true;

    try {
      const fileId = await this.getOrCreateDataFile();

      // Check for remote changes before saving (conflict detection)
      if (!options?.forceOverwrite && this.lastSyncTime) {
        const hasRemoteChanges = await this.checkForRemoteChanges();
        if (hasRemoteChanges) {
          console.warn('Remote changes detected. Consider pulling latest data first.');
          // Note: In a production app, you might want to:
          // 1. Show a conflict dialog
          // 2. Merge changes automatically
          // 3. Create a backup before overwriting
          // For now, we'll log a warning but continue
        }
      }

      const data = {
        products,
        version: Date.now(),
        lastModified: new Date().toISOString(),
      };

      await this.updateFileContent(fileId, data);
      this.lastSyncTime = new Date();
    } catch (error) {
      console.error('Error saving to Google Drive:', error);
      throw error;
    } finally {
      this.syncInProgress = false;
    }
  }

  // Load products from Google Drive
  async loadProducts(): Promise<Product[]> {
    try {
      const data = await this.readFileContent();
      this.lastSyncTime = new Date();
      return data.products || [];
    } catch (error) {
      console.error('Error loading from Google Drive:', error);
      return [];
    }
  }

  // Check if file was modified remotely
  async checkForRemoteChanges(): Promise<boolean> {
    try {
      if (!this.dataFileId) {
        await this.getOrCreateDataFile();
      }

      const response = await window.gapi.client.drive.files.get({
        fileId: this.dataFileId,
        fields: 'modifiedTime',
      });

      const modifiedTime = response.result.modifiedTime;
      if (!modifiedTime) {
        return false;
      }

      const remoteModifiedTime = new Date(modifiedTime);

      if (!this.lastSyncTime) {
        return true;
      }

      return remoteModifiedTime > this.lastSyncTime;
    } catch (error) {
      console.error('Error checking for remote changes:', error);
      return false;
    }
  }

  // Get sync status
  getSyncStatus(): {
    isConnected: boolean;
    lastSync: Date | null;
    isSyncing: boolean;
  } {
    return {
      isConnected: googleAuthService.isAuthenticated(),
      lastSync: this.lastSyncTime,
      isSyncing: this.syncInProgress,
    };
  }

  // Reset cache
  reset(): void {
    this.appFolderId = null;
    this.dataFileId = null;
    this.lastSyncTime = null;
  }
}

export const googleDriveService = new GoogleDriveService();
