export interface ElectronAPI {
  getOmnAIScopeBackendPort: () => Promise<number>;
  downloadFile(serverpath: string, dir: string, fileName: string): Promise<void>;
  getAbsolutePath(file: File): string;
  saveFile: (data: string, folderPath: string, fileName: string) => Promise<{ success: boolean; error?: string }>;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}
