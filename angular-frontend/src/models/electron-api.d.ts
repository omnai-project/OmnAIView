export interface ElectronAPI {
  getOmnAIScopeBackendPort: () => Promise<number>;
  downloadFile(serverpath: string, dir: string, fileName: string): Promise<void>;
  getAbsolutePath(file: File): string;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}
