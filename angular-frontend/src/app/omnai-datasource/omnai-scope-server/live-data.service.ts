// server-communication.service.ts
import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal, DestroyRef } from '@angular/core';
import { DataSource } from '../../source-selection/data-source-selection.service';
import { catchError, Observable, of, Subject, switchMap, takeUntil, timer } from 'rxjs';
import { map, filter } from 'rxjs/operators';
import { BackendPortService } from './backend-port.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

interface DeviceInformation {
  UUID: string;
  color: { r: number; g: number; b: number };
}

export interface DataFormat {
  timestamp: number;
  value: number;
}

interface DeviceOverview {
  devices: {
    UUID: string;
  }[];
  colors: {
    color: { r: number; g: number; b: number };
  }[];
}

@Injectable({
  providedIn: 'root'
})
export class OmnAIScopeDataService implements DataSource {

  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    this.setupDevicePolling();
  }
  private socket: WebSocket | null = null;

  readonly isConnected = signal<boolean>(false);
  readonly devices = signal<DeviceInformation[]>([]);
  readonly data = signal<Record<string, DataFormat[]>>({});
  readonly dataAsList = computed(() => {
    const allDataPoints: DataFormat[] = [];
    const dataRecord = this.data();

    for (const deviceData of Object.values(dataRecord)) {
      allDataPoints.push(...deviceData);
    }

    return allDataPoints;
  });

  readonly #httpClient = inject(HttpClient);

  private setupDevicePolling(): void {
    const pollInterval_ms = 15 * 1000;
    timer(0, pollInterval_ms)
      .pipe(
        filter(() => !this.isConnected() && this.port() !== null),
        switchMap(() => this.getDevices()),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((devices: DeviceInformation[]) => {
        this.devices.set(devices);
      });
  }
  readonly port = inject(BackendPortService).port;
  readonly serverUrl = computed(() => {
    const port = this.port();
    if (port === null) throw new Error('Port not initialized');
    return `127.0.0.1:${port}`;
  });

  // Abrufen der verfügbaren Geräte vom Server
  public getDevices(): Observable<DeviceInformation[]> {
    console.log("called getDevices")
    const url = `http://${this.serverUrl()}/UUID`;

    return this.#httpClient.get<Partial<DeviceOverview>>(url).pipe(
      map(response => {
        const devices = response.devices ?? [];
        const colors = response.colors ?? [];

        return devices.map((device, index) => ({
          UUID: device.UUID,
          color: colors[index]?.color ?? { r: 0, g: 0, b: 0 }
        }));
      }),
      catchError(error => {
        console.warn('error while loading devices', error);
        return of([]);
      })
    );
  }

  connect(): void {
    if (this.socket?.readyState === WebSocket.CLOSING) {
      this.socket.addEventListener("close", () => this.connect(), { once: true });
      return;
    }
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      console.log('WebSocket is already connected');
      return;
    }

    const wsUrl = `ws://${this.serverUrl()}/ws`;
    this.socket = new WebSocket(wsUrl);

    this.socket.addEventListener('open', () => {
      this.isConnected.set(true);
      this.data.set({});

      // define start message 
      const startMessage = {
        type: `start`,
        uuids: this.devices().map(device => device.UUID),
        rate: 2000
      }
      if (!this.socket) {
        throw new Error("Websocket is not defined");
      }
      // send startMessage 
      console.log(JSON.stringify(startMessage));
      this.socket.send(JSON.stringify(startMessage));
    });

    let ignoreCounter = 0;
    this.socket.addEventListener('message', (event) => {
      if (ignoreCounter < 2) {
        // ignore first messages sometimes 
        ignoreCounter++;
        return;
      }

      let parsedMessage: any;
      try {
        parsedMessage = JSON.parse(event.data);
      } catch {
        parsedMessage = event.data;
      }

      if (this.isOmnAIDataMessage(parsedMessage)) {
        this.data.update(records => {
          parsedMessage.devices.forEach((uuid: string, index: number) => {
            const existingData = records[uuid] ?? [];
            const newDataPoints = parsedMessage.data.map((point: any) => ({
              timestamp: point.timestamp,
              value: point.value[index],
            }));
            records[uuid] = existingData.concat(newDataPoints);
          });

          return { ...records };
        });
      } else {
        console.warn('Unbekanntes Nachrichtenformat:', parsedMessage);
      }
    });

    this.socket.addEventListener('close', () => {
      this.isConnected.set(false);
      this.socket = null;
    });

    this.socket.addEventListener('error', (error) => {
      console.error('WebSocket Fehler:', error);
      this.isConnected.set(false);
    });
  }

  // close websocket connection
  disconnect(): void {
    if (this.socket?.readyState === WebSocket.OPEN) this.socket.close();
  }

  clearData(): void {
    this.data.set({});
  }

  save(): void {

  }

  record(): void {
    console.log('Start recording OmnAI data ...');
  }

  // Typprüfung für OmnAI-Daten-Nachrichten
  private isOmnAIDataMessage(message: any): boolean {
    if (typeof message !== 'object' || message === null) return false;

    if (!('devices' in message) || !('data' in message)) return false;
    if (
      !Array.isArray(message.devices) ||
      !message.devices.every((d: unknown) => typeof d === 'string')
    ) {
      return false;
    }

    if (
      !Array.isArray(message.data) ||
      !message.data.every(
        (entry: any) =>
          typeof entry.timestamp === 'number' &&
          Array.isArray(entry.value) &&
          entry.value.every((v: unknown) => typeof v === 'number'),
      )
    ) {
      return false;
    }

    return true;
  }
}
