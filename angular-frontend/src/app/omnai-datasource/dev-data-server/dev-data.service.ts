import { Injectable, signal } from "@angular/core";
import { DataSource } from "../../source-selection/data-source-selection.service";
import { DataFormat } from "../omnai-scope-server/live-data.service";
import { HttpClient } from "@angular/common/http";
import { inject } from "@angular/core";

interface DeviceInformation {
    UUID: string;
    color: {
        r: number;
        g: number;
        b: number;
    };
}
interface DeviceOverview {
    datastreams: DeviceInformation[];
}

/**
 * @classdesc Provides the logic to receive information and data from the
 * [OmnAI DevDataServer](https://github.com/omnai-project/OmnAI-DevDataServer)
 */
@Injectable({
    providedIn: 'root'
})
export class DevDataService implements DataSource {
    private serverURL = 'localhost:8080';
    readonly #httpClient = inject(HttpClient);
    private socket: WebSocket | null = null;

    readonly data = signal<Record<string, DataFormat[]>>({});
    readonly devices = signal<DeviceInformation[]>([]);

    getDevices(): void {
        const url = `http://${this.serverURL}/v1/get_devices`;
        this.#httpClient.get<DeviceOverview>(url).subscribe({
            next: (response) => {
                console.log("got response", response);
                if (response.datastreams) {
                    this.devices.set(response.datastreams);
                }
            },
            error: (error) => {
                console.error('Error receiving the data:', error);
            }
        });
    }
    connect(): void {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            console.log('Websocket already connected.');
            return;
        }
        const wsUrl = `ws://${this.serverURL}/v1/subscribe_ws`;
        this.socket = new WebSocket(wsUrl);

        this.socket.addEventListener('open', () => {
            this.data.set({});

            const deviceUuids = this.devices().map(device => device.UUID).join(" ");
            this.socket?.send(deviceUuids);
        });

        this.socket.addEventListener('message', (event) => {
            let parsedMessage: any;
            try {
                parsedMessage = JSON.parse(event.data);
            }
            catch {
                parsedMessage = event.data;
            }

            this.data.update(records => {
                parsedMessage.datastreams.forEach((uuid: string, index: number) => {
                    const existingData = records[uuid] ?? [];

                    // generate new time series for every data object 
                    const newDataPoints = parsedMessage.data.map((row: number[]) => ({
                        timestamp: parsedMessage.timestamp,
                        value: row[index],
                    }));

                    records[uuid] = existingData.concat(newDataPoints);
                });

                return { ...records };
            });
        });

        this.socket.addEventListener('close', () => {
            this.socket = null;
        });

        this.socket.addEventListener('error', (error) => {
            console.error('WebSocket Error:', error);
        });
    }
}