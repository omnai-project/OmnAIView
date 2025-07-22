export interface ElectronAPI {
  getOmnAIScopeBackendPort: () => Promise<number>;
  downloadFile(serverpath: string): Promise<void>;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}
