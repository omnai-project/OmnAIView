export interface ElectronAPI {
    getOmnAIScopeBackendPort: () => Promise<number>;
}
  
declare global {
    interface Window {
      electronAPI?: ElectronAPI;
    }
}
  