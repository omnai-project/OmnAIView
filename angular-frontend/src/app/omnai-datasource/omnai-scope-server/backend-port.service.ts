import { Injectable, signal } from "@angular/core";

/**
 * Initialize and save the port of the local started OmnAIScope Backend. 
 * 
 * The port is saved as a signal and can be used throughout the whole application. 
 * 
 * If no electron environment is used a warning is printed. 
 */
@Injectable({
    providedIn: 'root',
  })
export class BackendPortService {
  port = signal<number | null>(null); 
  /**
   * Init function: Async receiving of Backend Port via IPC from the electron app 
   * @usage Init function should only be used once in the app initializer context (app.config.ts)
   */
  async init():Promise<void>{
      if (typeof window !== 'undefined' && window.electronAPI) {
          const port = await window.electronAPI.getOmnAIScopeBackendPort(); 
          this.port.set(port);
        } else {
          console.warn('Electron API not available (probably SSR)');
        }
  }
}
  