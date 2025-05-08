import { Injectable, signal } from "@angular/core";

@Injectable({
    providedIn: 'root',
  })
  export class BackendPortService {
    port = signal<number | null>(null); 

    async init():Promise<void>{
        if (typeof window !== 'undefined' && window.electronAPI) {
            const port = await window.electronAPI.getOmnAIScopeBackendPort(); 
            this.port.set(port);
          } else {
            console.warn('Electron API not available (probably SSR)');
          }
    }
  }
  