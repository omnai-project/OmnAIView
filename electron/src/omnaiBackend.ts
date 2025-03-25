import {spawn, ChildProcess } from "child_process"; 
import {join} from "path"; 
import { existsSync } from "fs-extra";
import {app} from "electron"; 

export const omnaiscopeBackendManager = (()=> { // singelton for only one possible encapsulated instance of the backend 
    let backendProcess : ChildProcess | null = null; 

    function getBackendPath(): string {
        const exePath: string = app.isPackaged 
        ? join(process.resourcesPath, "MiniOmni.exe") // production mode 
        : join(__dirname, "..", "res", "omnai_BE", "MiniOmni.exe") // dev mode 

        return exePath; 
    }

    function startBackend(): void {
        const exePath : string = getBackendPath(); 

        if(existsSync(exePath)){
            backendProcess = spawn(exePath, ["-w"]); 
            console.log("Backend process started"); 
        }
    }

    function stopBackend(): void {
        if(backendProcess) {
            backendProcess.kill(); 
            console.log("Backend process stopped");
        }
    }

    return {
        startBackend, 
        stopBackend
    }; 
})(); 