export interface TokenResponse {
  access_token: string;
  expires_in?: number;
  hd?: string;
  prompt?: string;
  token_type?: string;
  scope?: string;
  state?: string;
  error?: string;
  error_description?: string;
  error_uri?: string;
}

export interface TokenClientConfig {
  client_id: string;
  scope: string;
  callback?: (tokenResponse: TokenResponse) => void;
  prompt?: string;
  error_callback?: (nonOAuthError: any) => void;
  state?: string;
  enable_serial_consent?: boolean;
  hint?: string;
  hosted_domain?: string;
}

export interface TokenClient {
  requestAccessToken: (overrideConfig?: { prompt?: string }) => void;
}

declare global {
  interface Window {
    google?: {
      accounts?: {
        oauth2?: {
          initTokenClient: (config: TokenClientConfig) => TokenClient;
          revoke?: (accessToken: string, done?: () => void) => void;
        };
        id?: {
          initialize: (config: any) => void;
          renderButton: (parent: HTMLElement, options: any) => void;
          prompt: (notification?: any) => void;
        };
      };
    };
  }
}
