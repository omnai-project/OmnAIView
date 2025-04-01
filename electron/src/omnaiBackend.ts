import {spawn, ChildProcess } from "child_process"; 
import {join} from "path"; 
import { existsSync } from "fs-extra";
import {app} from "electron"; 
import * as net from 'net';

export const omnaiscopeBackendManager = (()=> { // singelton for only one possible encapsulated instance of the backend 
    let backendProcess : ChildProcess | null = null; 

    function testPort(port: number): Promise<boolean>{
        return new Promise(resolve => {
            const server = net.createServer(); 
            server.unref(); //allows the programm to exit if this is the only server running 
            server.once("error", () => resolve(false)); //first handle errors then listen to skip an internal error
            server.listen(port, () => { 
                server.close(() => resolve(true));
            });
        });
    }

    async function getFreePort() : Promise<number>{
        let start : number = 3000; 
        let end : number = 10000; 

        for(let port : number = start; port <= end; port ++){
            const isFree = await testPort(port); 
            if (isFree) return port; 
        }
        throw new Error("No port available"); 
    }

    function getBackendPath(): string {
        const exePath: string = app.isPackaged 
        ? join(process.resourcesPath, "MiniOmni.exe") // production mode 
        : join(__dirname, "..", "res", "omnai_BE", "MiniOmni.exe") // dev mode 

        return exePath; 
    }

    async function startBackend(): Promise<void> {
        const exePath : string = getBackendPath(); 

        const port : number = await getFreePort(); 

        if(existsSync(exePath)){
            backendProcess = spawn(exePath, ["-w", "-p", port.toString()]); 
            console.log(`Backend process started on port ${port}`);
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