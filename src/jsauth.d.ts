declare module '@tanaer/jsauth/ui' {
  export interface AuthOptions {
    title?: string;
    subtitle?: string;
    buttonText?: string;
    placeholder?: string;
    saveToken?: boolean;
    serverUrl?: string;
    [key: string]: any;
  }

  export function requireAuth(options?: AuthOptions): Promise<any>;
  
  export function createAuthUI(options: any): any;
}
