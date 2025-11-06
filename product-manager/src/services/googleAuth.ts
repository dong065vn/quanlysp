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

class GoogleAuthService {
  private tokenClient: any = null;
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

      window.gapi.load('client', async () => {
        try {
          await window.gapi.client.init({
            apiKey: this.config.apiKey,
            discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'],
          });
          this.gapiInitialized = true;
          resolve();
        } catch (error) {
          reject(error);
        }
      });
    });
  }

  // Initialize Google Identity Services
  initializeGis(): void {
    if (this.gisInitialized || !window.google?.accounts?.oauth2) {
      return;
    }

    this.tokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: this.config.clientId,
      scope: this.config.scopes.join(' '),
      callback: '', // Will be set in requestAccessToken
    });

    this.gisInitialized = true;
  }

  // Request access token
  async requestAccessToken(): Promise<string> {
    return new Promise((resolve, reject) => {
      try {
        if (!this.tokenClient) {
          this.initializeGis();
        }

        this.tokenClient.callback = (response: any) => {
          if (response.error) {
            reject(new Error(response.error));
            return;
          }
          this.accessToken = response.access_token;
          this.loadUserInfo();
          resolve(response.access_token);
        };

        if (this.accessToken && window.gapi?.client?.getToken()) {
          // Token already exists
          resolve(this.accessToken);
        } else {
          // Request new token
          this.tokenClient.requestAccessToken({ prompt: 'consent' });
        }
      } catch (error) {
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
declare global {
  interface Window {
    gapi: any;
    google: any;
  }
}
