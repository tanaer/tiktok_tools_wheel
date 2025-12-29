export {};

declare global {
  interface Window {
    electronAPI?: {
      onTraySpin: (callback: () => void) => () => void;
      readConfig: () => Promise<any>;
      writeConfig: (config: any) => Promise<void>;
      quitApp?: () => void;
    };
  }
}
