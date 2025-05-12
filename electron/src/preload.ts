import { contextBridge, ipcRenderer } from "electron";

// this adds a new object to the window object. Only the set functions are available instead of random node functions 
// secure bridge between renderer and main process 
contextBridge.exposeInMainWorld('electronAPI', {
    getOmnAIScopeBackendPort: (): Promise<number> => ipcRenderer.invoke('get-omnaiscope-backend-port')
});
