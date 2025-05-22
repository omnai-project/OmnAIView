import { Injectable, signal } from "@angular/core";
import { DataSource } from "../../source-selection/data-source-selection.service";
import { DataFormat } from "../omnai-scope-server/live-data.service";
import { HttpClient } from "@angular/common/http";
import { inject } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { firstValueFrom } from "rxjs";
import { DeviceSelectionDialogComponent } from "./test-dialog-component";
import { filter } from "rxjs";

export interface DeviceInformation {
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

interface DevDataMessage {
    datastreams: string[];
    data: number[][];
    timestamp: number;
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

    private readonly matdialog = inject(MatDialog);

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
        // Handle device selection 
        const devs = this.devices();

        const dialogRef = this.matdialog.open(DeviceSelectionDialogComponent, {
            data: devs,
            disableClose: true,
        });

        dialogRef.afterClosed() // Websocket connection after device selection
            .pipe(
                filter((uuids: string[] | undefined): uuids is string[] => !!uuids && uuids.length > 0)
            )
            .subscribe(selectedUuids => {

                // if websocket already open send new message 
                if (this.socket?.readyState === WebSocket.OPEN) {
                    this.socket?.send(selectedUuids.join(' '));
                    return;
                }

                // create new websocket connection 
                if (!this.socket || this.socket.readyState === WebSocket.CLOSED) {
                    this.socket = new WebSocket(`ws://${this.serverURL}/v1/subscribe_ws`);

                    this.socket.addEventListener('message', this.handleMessage.bind(this));
                    this.socket.addEventListener('close', () => (this.socket = null));
                    this.socket.addEventListener('error', e => console.error('WebSocket Fehler:', e));
                }


                if (this.socket.readyState === WebSocket.CONNECTING) {
                    const onOpen = () => {
                        this.socket?.removeEventListener('open', onOpen); // make sure the old selectedUUIDs is not send again when opening again 
                        this.data.set({});
                        this.socket?.send(selectedUuids.join(' '));
                    };
                    this.socket.addEventListener('open', onOpen);
                }
            });
    }

    /** check type of message and parse message from the DevDataServer websocket 
     */
    private handleMessage = (event: MessageEvent) => {
        let parsed: unknown;
        try { parsed = JSON.parse(event.data); } catch { parsed = event.data; }

        if (!this.isDevDataMessage(parsed)) {
            console.warn('Unexpected message format:', parsed);
            return;
        }

        this.data.update(records => {
            parsed.datastreams.forEach((uuid: string, i: number) => {
                const prev = records[uuid] ?? [];
                const newPts = parsed.data.map((row: number[]) => ({
                    timestamp: parsed.timestamp,
                    value: row[i],
                }));
                records[uuid] = prev.concat(newPts);
            });
            return { ...records };
        });
    };

    private isDevDataMessage(obj: any): obj is DevDataMessage {
        return typeof obj === 'object'
            && obj !== null
            && Array.isArray(obj.datastreams)
            && obj.datastreams.every((d: any) => typeof d === 'string')
            && Array.isArray(obj.data)
            && obj.data.every((row: any) => Array.isArray(row) && row.every((n: any) => typeof n === 'number'))
            && typeof obj.timestamp === 'number';
    }

}