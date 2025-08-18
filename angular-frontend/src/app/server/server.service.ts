import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { signal } from "@angular/core";

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

    // parse server-config.json into an array of server objects 
    parseServerList(path = 'server-config.json'): void {
        this.httpClient.get<ServerConfigFile>(path, { observe: 'response' }).subscribe({
            next: (res) => {
                console.log('config GET:', res.status, res.url);
                const cfg = res.body ?? { servers: [] };
                this.serverlist.set(cfg.servers ?? []);
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