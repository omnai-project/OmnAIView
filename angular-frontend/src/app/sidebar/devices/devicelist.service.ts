import { computed, inject, Injectable } from "@angular/core";
import { ServerService } from "../../server/server.service";
import { OmnAIScopeDataService } from "../../omnai-datasource/omnai-scope-server/live-data.service";
import { DummyDataService } from "../../omnai-datasource/dummy-data-server/dummy-data.service";
import { effect } from "@angular/core";
import { Subscription } from "rxjs";
import { Server } from "../../server/server.service";
import { Device } from "./devicecard.component";
import { signal } from "@angular/core";
import { timer, switchMap, of } from "rxjs";

const POLL_MS = 15000;

/**
 * Injection will start to 
 * 1. Load servers from server service from public/server-config.json 
 * 2. Start calling getDevices():Device[] from servertype service for every loaded server 
 * 3. Update the servercard computed signal with new server and device information 
 * --> All this happends automatically, it is expected that the server-config.json always has the right format and that all servertype services provide a getDevices() function 
 */
@Injectable({
    providedIn: 'root'
})
export class DeviceListService {
    private readonly serverService = inject(ServerService);
    private readonly omnaiscopeService = inject(OmnAIScopeDataService);
    private readonly randomService = inject(DummyDataService);

    private polling = new Map<string, Subscription>();
    private readonly _devicesByServer = signal<Record<string, Device[]>>({});

    constructor() {
        this.onInit();
        const eff = effect(() => { // trigger when serverlist changes 
            const servers = this.serverService.serverlist();
            const desiredKeys = new Set(servers.map(server => this.serverService.urlOf(server)));

            for (const server of servers) { // connects server if not already connected 
                const key = this.serverService.urlOf(server);
                if (!this.polling.has(key)) { // start polling server endpoint for each new server
                    this.polling.set(key, this.startPollingFor(server));
                }
            }
        })
    }

    onInit() {
        this.serverService.parseServerList(); // load initial list of servers 
    }

    /**
     * computed signal holding all servercards
     * servercard: server, serverUrl, list of devices connected to server 
     */
    readonly servercards = computed(() => {
        const servers = this.serverService.serverlist();
        const devices = this._devicesByServer();
        return servers.map(server => {
            const serverUrl = this.serverService.urlOf(server);
            return {
                server: server,
                key: serverUrl,
                devices: devices[serverUrl] ?? []
            }
        })
    })

    /**
     * Starts fetching devices from given Server.
     * It is expected that the server has a type which corresponding service contains a getDevices() function that returns a Device[]
     * @param server server to which should be connected 
     */
    private startPollingFor(server: Server): Subscription {
        const key = this.serverService.urlOf(server);
        return timer(0, POLL_MS).pipe(switchMap(() => this.fetchDevicesFor(server))) // fetch devices every 15 seconds 
            .subscribe(deviceList => {
                this.patchDevices(key, deviceList); // update devicesByServer with new device list 
            });
    }

    /**
     * Fetch devices from given server via the getDevices function of the servers type service 
     * @param server server to fetch devices from 
     * @returns List of Devices
     */
    private fetchDevicesFor(server: Server) { // return devicelist 
        const base = this.serverService.urlOf(server);
        switch (server.type) {
            case 'omnaiscope': return this.omnaiscopeService.getDevices(base);
            case 'random': return this.randomService.getDevices(base);
            default: return of([] as Device[]);
        }
    }

    /**
     * Update devicesByServer signal to update UI 
     */
    private patchDevices(key: string, deviceList: Device[]) {
        this._devicesByServer.update(prev => ({ ...prev, [key]: deviceList }));
    }
}