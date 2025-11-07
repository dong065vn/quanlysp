// Google Drive Authentication Service
export interface GoogleAuthConfig {
  clientId: string;
  apiKey: string;
  scopes: string[];
}

export interface GoogleUser {
  email: string;
  name: string;
  picture?: string;
}

interface TokenClient {
  callback: (response: TokenResponse) => void | Promise<void>;
  requestAccessToken: (options: { prompt: string }) => void;
}

interface TokenResponse {
  access_token: string;
  error?: string;
  error_description?: string;
}

class GoogleAuthService {
  private tokenClient: TokenClient | null = null;
  private gapiInitialized = false;
  private gisInitialized = false;
  private accessToken: string | null = null;
  private currentUser: GoogleUser | null = null;

  private config: GoogleAuthConfig = {
    clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
    apiKey: import.meta.env.VITE_GOOGLE_API_KEY || '',
    scopes: [
      'https://www.googleapis.com/auth/drive.file',
      'https://www.googleapis.com/auth/drive.appdata',
    ],
  };

  // Validate credentials format
  private validateCredentials(): { valid: boolean; error?: string } {
    // Check if API Key is actually a Client Secret (common mistake)
    if (this.config.apiKey.startsWith('GOCSPX-')) {
      return {
        valid: false,
        error: 'VITE_GOOGLE_API_KEY không đúng! Bạn đang dùng OAuth Client Secret (GOCSPX-...) thay vì API Key. API Key thường bắt đầu với "AIzaSy..." hoặc chuỗi ngẫu nhiên khác. Vui lòng tạo API Key mới trong Google Cloud Console > Credentials > Create Credentials > API Key.'
      };
    }

    // Check if Client ID looks correct
    if (this.config.clientId && !this.config.clientId.includes('.apps.googleusercontent.com')) {
      return {
        valid: false,
        error: 'VITE_GOOGLE_CLIENT_ID không đúng định dạng. Client ID phải có dạng: xxxxx.apps.googleusercontent.com'
      };
    }

    return { valid: true };
  }

  // Initialize Google API
  async initializeGapi(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.gapiInitialized) {
        resolve();
        return;
      }

      if (typeof window === 'undefined' || !window.gapi) {
        reject(new Error('Google API not loaded'));
        return;
      }

      // Validate credentials before initializing
      const validation = this.validateCredentials();
      if (!validation.valid) {
        reject(new Error(validation.error));
        return;
      }

      window.gapi.load('client', async () => {
        try {
          await window.gapi.client.init({
            apiKey: this.config.apiKey,
            discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'],
          });
          this.gapiInitialized = true;
          console.log('Google API initialized successfully');
          resolve();
        } catch (error) {
          console.error('Failed to initialize Google API client:', error);
          reject(new Error('Không thể kết nối Google Drive API. Vui lòng kiểm tra API Key và thử lại.'));
        }
      });
    });
  }

  // Initialize Google Identity Services
  initializeGis(): void {
    if (this.gisInitialized) {
      return;
    }

    if (!window.google?.accounts?.oauth2) {
      console.error('Google Identity Services not loaded');
      return;
    }

    if (!this.config.clientId) {
      console.error('Google Client ID not configured. Please set VITE_GOOGLE_CLIENT_ID in .env file');
      return;
    }

    try {
      this.tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: this.config.clientId,
        scope: this.config.scopes.join(' '),
        callback: '', // Will be set in requestAccessToken
      });

      this.gisInitialized = true;
      console.log('Google Identity Services initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Google Identity Services:', error);
    }
  }

  // Request access token
  async requestAccessToken(): Promise<string> {
    return new Promise((resolve, reject) => {
      try {
        // Validate configuration
        if (!this.config.clientId) {
          const errorMsg = 'Google Client ID not configured. Please set VITE_GOOGLE_CLIENT_ID in .env file';
          console.error(errorMsg);
          reject(new Error(errorMsg));
          return;
        }

        if (!this.config.apiKey) {
          const errorMsg = 'Google API Key not configured. Please set VITE_GOOGLE_API_KEY in .env file';
          console.error(errorMsg);
          reject(new Error(errorMsg));
          return;
        }

        // Ensure GIS is initialized
        if (!this.tokenClient) {
          this.initializeGis();
        }

        // Check if GIS initialization succeeded
        if (!this.tokenClient) {
          const errorMsg = 'Failed to initialize Google Identity Services. Please check your configuration.';
          console.error(errorMsg);
          reject(new Error(errorMsg));
          return;
        }

        // Set up callback for token response
        this.tokenClient.callback = async (response: TokenResponse) => {
          if (response.error) {
            console.error('OAuth error:', response.error);
            reject(new Error(response.error));
            return;
          }

          console.log('Access token received successfully');
          this.accessToken = response.access_token;

          // Set token in gapi client
          if (window.gapi?.client) {
            window.gapi.client.setToken({
              access_token: response.access_token,
            });
          }

          await this.loadUserInfo();
          resolve(response.access_token);
        };

        // Check if token already exists
        if (this.accessToken && window.gapi?.client?.getToken()) {
          console.log('Using existing access token');
          resolve(this.accessToken);
        } else {
          // Request new token
          console.log('Requesting new access token...');
          this.tokenClient.requestAccessToken({ prompt: 'consent' });
        }
      } catch (error) {
        console.error('Error in requestAccessToken:', error);
        reject(error);
      }
    });
  }

  // Load user information
  private async loadUserInfo(): Promise<void> {
    if (!this.accessToken) return;

    try {
      const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        this.currentUser = {
          email: data.email,
          name: data.name,
          picture: data.picture,
        };
      }
    } catch (error) {
      console.error('Failed to load user info:', error);
    }
  }

  // Get current user
  getCurrentUser(): GoogleUser | null {
    return this.currentUser;
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!this.accessToken && !!window.gapi?.client?.getToken();
  }

  // Get access token
  getAccessToken(): string | null {
    return this.accessToken;
  }

  // Sign out
  signOut(): void {
    const token = window.gapi?.client?.getToken();
    if (token) {
      window.google?.accounts?.oauth2?.revoke(token.access_token);
      window.gapi.client.setToken(null);
    }
    this.accessToken = null;
    this.currentUser = null;
  }

  // Initialize everything
  async initialize(): Promise<void> {
    await this.initializeGapi();
    this.initializeGis();
  }
}

export const googleAuthService = new GoogleAuthService();

// Type declarations for window
interface GapiClient {
  init: (config: { apiKey: string; discoveryDocs: string[] }) => Promise<void>;
  drive: {
    files: {
      list: (params: Record<string, unknown>) => Promise<{ result: { files?: Array<{ id?: string; name?: string; modifiedTime?: string }> } }>;
      create: (params: Record<string, unknown>) => Promise<{ result: { id?: string } }>;
      get: (params: Record<string, unknown>) => Promise<{ result: { modifiedTime?: string; [key: string]: unknown } }>;
    };
  };
  setToken: (token: { access_token: string } | null) => void;
  getToken: () => { access_token: string } | null;
}

interface Gapi {
  load: (api: string, callback: () => void) => void;
  client: GapiClient;
}

interface GoogleAccounts {
  oauth2: {
    initTokenClient: (config: {
      client_id: string;
      scope: string;
      callback: string | ((response: TokenResponse) => void | Promise<void>);
    }) => TokenClient;
    revoke: (accessToken: string) => void;
  };
}

interface Google {
  accounts: GoogleAccounts;
}

declare global {
  interface Window {
    gapi: Gapi;
    google: Google;
  }
}
