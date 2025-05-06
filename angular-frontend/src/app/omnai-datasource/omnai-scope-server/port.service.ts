import { Injectable } from "@angular/core";

@Injectable({
    providedIn: 'root'
})
export class OmnAIScopePortService {
    async loadOmnAIScopeBackendPort(): Promise<number> {
        if (window.electronAPI) { // only works with angular combined with the correct electron app 
            try {
                const backendPort = await window.electronAPI.getOmnAIScopeBackendPort();
                console.log("Current OmnAIScope Datatserver Backend Port (Angular):", backendPort);
                return backendPort;
            } catch (error) {
                console.error("Error: Trying to get local OmnAIScope Dataserver Backend Port from Angular app")
                throw error;
            }
        }
        else {
            const errorMsg = "electronAPI is not available. Do you run the app in an electron context ? ";
            console.error(errorMsg);
            throw new Error(errorMsg);
        }
    }
}