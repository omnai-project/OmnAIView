import { HttpClient } from "@angular/common/http";
import { effect, inject, Injectable } from "@angular/core";
import { signal, computed } from "@angular/core";
import { BackendPortService } from "../omnai-datasource/omnai-scope-server/backend-port.service";

type ServerType = 'random' | 'omnaiscope' | string;

export interface Server {
    ip: string,
    port: number,
    name: string,
    type: ServerType
}

interface ServerConfigFile {
    servers: Server[];
}

@Injectable({
    providedIn: 'root'
})
export class ServerService {
    private readonly httpClient = inject(HttpClient);
    readonly serverlist = signal<Server[]>([]);

    // get port of local backend 
    readonly port = inject(BackendPortService).port;
    readonly serverUrlLocal = computed(() => {
        const port = this.port();
        if (port === null) throw new Error('Port not initialized');
        return `127.0.0.1:${port}`;
    });
    private readonly localName = 'Local OmnAIScope';
    private readonly localType = 'omnaiscope';

    constructor() {
        effect(() => {
            const port = this.port();
            if (port == null) return;
            this.serverlist.update(list => {
                const exists = list.some(server => server.ip === '127.0.0.1' && server.port === port);
                if (exists) return list;
                const localServer: Server = { ip: '127.0.0.1', port: port, name: this.localName, type: this.localType };
                return [localServer, ...list];
            })
        }, { allowSignalWrites: true });
    }

    // parse server-config.json into an array of server objects 
    parseServerList(path = 'server-config.json'): void {
        this.httpClient.get<ServerConfigFile>(path, { observe: 'response' }).subscribe({
            next: (res) => {
                console.log('config GET:', res.status, res.url);
                const cfg = res.body ?? { servers: [] };
                this.serverlist.update(current => {
                    const currentKeys = new Set(current.map(server => `${server.ip}:${server.port}`));
                    const mergedList = [...current];
                    for (const server of (cfg.servers ?? [])) {
                        const key = `${server.ip}:${server.port}`;
                        if (!currentKeys.has(key)) {
                            currentKeys.add(key);
                            mergedList.push(server);
                        }
                    }
                    return mergedList;
                });
                console.log('servers loaded:', cfg.servers);
            },
            error: (err) => {
                console.error('config GET failed:', err.status, err.url, err.message);
            }
        });
    }


    keyOf(server: Server) { return `${server.ip}:${server.port}`; } // returns server:port
    urlOf(server: Server) { return `http://${server.ip}:${server.port}`; } // return http url with server:port 
}