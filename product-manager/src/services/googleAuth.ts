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

// Event types for auth state changes
export type AuthEventType = 'auth_changed' | 'sign_in' | 'sign_out';
export interface AuthEvent {
  type: AuthEventType;
  isAuthenticated: boolean;
  user: GoogleUser | null;
}

type AuthEventListener = (event: AuthEvent) => void;

class GoogleAuthService {
  private tokenClient: TokenClient | null = null;
  private gapiInitialized = false;
  private gisInitialized = false;
  private accessToken: string | null = null;
  private currentUser: GoogleUser | null = null;
  private tokenExpiry: number | null = null;

  // Event listeners for auth state changes
  private listeners: Set<AuthEventListener> = new Set();

  // LocalStorage keys for persistence
  private readonly STORAGE_KEYS = {
    ACCESS_TOKEN: 'google_access_token',
    USER_INFO: 'google_user_info',
    TOKEN_EXPIRY: 'google_token_expiry',
  };

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

  // Save token to localStorage
  private saveTokenToStorage(token: string, expiresIn: number = 3600): void {
    try {
      const expiry = Date.now() + (expiresIn * 1000); // Convert to milliseconds
      localStorage.setItem(this.STORAGE_KEYS.ACCESS_TOKEN, token);
      localStorage.setItem(this.STORAGE_KEYS.TOKEN_EXPIRY, expiry.toString());
      this.tokenExpiry = expiry;
      console.log('Token saved to localStorage');
    } catch (error) {
      console.error('Failed to save token to localStorage:', error);
    }
  }

  // Load token from localStorage
  private loadTokenFromStorage(): string | null {
    try {
      const token = localStorage.getItem(this.STORAGE_KEYS.ACCESS_TOKEN);
      const expiryStr = localStorage.getItem(this.STORAGE_KEYS.TOKEN_EXPIRY);

      if (!token || !expiryStr) {
        return null;
      }

      const expiry = parseInt(expiryStr, 10);
      this.tokenExpiry = expiry;

      // Check if token is expired
      if (Date.now() >= expiry) {
        console.log('Token expired, clearing storage');
        this.clearTokenStorage();
        return null;
      }

      console.log('Token loaded from localStorage');
      return token;
    } catch (error) {
      console.error('Failed to load token from localStorage:', error);
      return null;
    }
  }

  // Save user info to localStorage
  private saveUserToStorage(user: GoogleUser): void {
    try {
      localStorage.setItem(this.STORAGE_KEYS.USER_INFO, JSON.stringify(user));
      console.log('User info saved to localStorage');
    } catch (error) {
      console.error('Failed to save user info to localStorage:', error);
    }
  }

  // Load user info from localStorage
  private loadUserFromStorage(): GoogleUser | null {
    try {
      const userStr = localStorage.getItem(this.STORAGE_KEYS.USER_INFO);
      if (!userStr) return null;

      return JSON.parse(userStr);
    } catch (error) {
      console.error('Failed to load user info from localStorage:', error);
      return null;
    }
  }

  // Clear token from localStorage
  private clearTokenStorage(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEYS.ACCESS_TOKEN);
      localStorage.removeItem(this.STORAGE_KEYS.USER_INFO);
      localStorage.removeItem(this.STORAGE_KEYS.TOKEN_EXPIRY);
      this.tokenExpiry = null;
      console.log('Token storage cleared');
    } catch (error) {
      console.error('Failed to clear token storage:', error);
    }
  }

  // Check if token is valid
  private isTokenValid(): boolean {
    if (!this.accessToken || !this.tokenExpiry) {
      return false;
    }

    // Check if token is not expired (with 5 minute buffer)
    return Date.now() < (this.tokenExpiry - 5 * 60 * 1000);
  }

  // Restore session from localStorage
  async restoreSession(): Promise<boolean> {
    try {
      const token = this.loadTokenFromStorage();
      if (!token) {
        console.log('No saved token found');
        return false;
      }

      this.accessToken = token;

      // Set token in gapi client
      if (window.gapi?.client) {
        window.gapi.client.setToken({
          access_token: token,
        });
      }

      // Load user info from storage or fetch fresh
      const savedUser = this.loadUserFromStorage();
      if (savedUser) {
        this.currentUser = savedUser;
        console.log('Session restored successfully');
        return true;
      } else {
        // Fetch user info if not in storage
        await this.loadUserInfo();
        console.log('Session restored with fresh user info');
        return true;
      }
    } catch (error) {
      console.error('Failed to restore session:', error);
      this.clearTokenStorage();
      return false;
    }
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

          // Save token to localStorage (expires in 1 hour by default)
          this.saveTokenToStorage(response.access_token, 3600);

          // Set token in gapi client
          if (window.gapi?.client) {
            window.gapi.client.setToken({
              access_token: response.access_token,
            });
          }

          await this.loadUserInfo();

          // Notify all listeners that user signed in
          this.notifyAuthChanged('sign_in');

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
        // Save user info to localStorage
        this.saveUserToStorage(this.currentUser);
      }
    } catch (error) {
      console.error('Failed to load user info:', error);
    }
  }

  // Get current user
  getCurrentUser(): GoogleUser | null {
    return this.currentUser;
  }

  // Add event listener
  addAuthListener(listener: AuthEventListener): () => void {
    this.listeners.add(listener);

    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener);
    };
  }

  // Notify all listeners of auth state change
  private notifyAuthChanged(type: AuthEventType): void {
    const event: AuthEvent = {
      type,
      isAuthenticated: this.isAuthenticated(),
      user: this.currentUser,
    };

    this.listeners.forEach(listener => {
      try {
        listener(event);
      } catch (error) {
        console.error('Error in auth listener:', error);
      }
    });
  }

  // Check if user is authenticated
  // Fixed: More reliable check without depending on window.gapi.client.getToken()
  isAuthenticated(): boolean {
    // Check if we have a valid token
    if (!this.accessToken) {
      return false;
    }

    // Check if token is not expired
    if (!this.isTokenValid()) {
      // Token expired, clear it
      this.clearTokenStorage();
      this.accessToken = null;
      this.currentUser = null;
      this.tokenExpiry = null;
      return false;
    }

    // Additional check: ensure gapi client has token set
    if (window.gapi?.client) {
      const gapiToken = window.gapi.client.getToken();
      if (!gapiToken) {
        // Try to set token again if we have it
        window.gapi.client.setToken({
          access_token: this.accessToken,
        });
      }
    }

    return true;
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
    this.tokenExpiry = null;

    // Clear token from localStorage
    this.clearTokenStorage();
    console.log('Signed out and cleared session');

    // Notify listeners
    this.notifyAuthChanged('sign_out');
  }

  // Initialize everything
  async initialize(): Promise<void> {
    await this.initializeGapi();
    this.initializeGis();

    // Try to restore previous session
    const restored = await this.restoreSession();

    // Notify listeners if session was restored
    if (restored) {
      this.notifyAuthChanged('sign_in');
    }
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
