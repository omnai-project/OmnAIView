// server-communication.service.ts
import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { DataSource } from '../../source-selection/data-source-selection.service';
import {map} from 'rxjs/operators'
import { timer, Subject } from 'rxjs';
import { switchMap, takeUntil} from 'rxjs/operators';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { MeasurementService } from '../../measurement/measurment-state.service';
import { withLatestFrom } from 'rxjs/operators';
import { filter } from 'rxjs/operators';

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
export class OmnAIScopeDataService implements DataSource{

  private serverUrl = '127.0.0.1:8080';

  constructor(private http:HttpClient) {
    this.init();
    this.startDevicePolling(); 
  }

  async init(): Promise<void> {
    const port = await window.electronAPI?.getOmnAIScopeBackendPort();
    if (port) {
      this.setServerUrl(`127.0.0.1:${port}`);
    } else {
      console.error('unable to set backend port');
    }
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
  private readonly destroy$ = new Subject<void>(); 


  // Abrufen der verfügbaren Geräte vom Server
  getDevices(): void {
    const url = `http://${this.serverUrl}/UUID`;
    this.#httpClient.get<DeviceOverview>(url).subscribe({
      next: (response) => {
        console.log("got response", response)
        if (response.devices && response.colors) {
          const mappedDevices = response.devices.map((device, index) => ({
            UUID: device.UUID,
            color: response.colors[index]?.color ?? { r: 0, g: 0, b: 0 },
          }));
          this.devices.set(mappedDevices);
        }
      },
      error: (error) => {
        console.error('Fehler beim Abrufen der Geräte:', error);
      }
    });
  }

  connect(): void {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      console.log('WebSocket ist bereits verbunden.');
      return;
    }

    const wsUrl = `ws://${this.serverUrl}/ws`;
    this.socket = new WebSocket(wsUrl);

    this.socket.addEventListener('open', () => {
      this.isConnected.set(true);
      this.data.set({});

      // Send start message
      const deviceUuids = this.devices().map(device => device.UUID).join(" ");
      this.socket?.send(JSON.stringify(deviceUuids));
    });

    let ignoreCounter = 0;
    this.socket.addEventListener('message', (event) => {
      if (ignoreCounter < 2) {
        // Die ersten Nachrichten manchmal ignorieren
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

  // WebSocket-Verbindung schließen
  disconnect(): void {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
      this.isConnected.set(false);
    }
  }

  // Server-URL ändern
  setServerUrl(url: string): void {
    this.serverUrl = url;
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
  private startDevicePolling(): void {
    timer(0,15_000).pipe(
      withLatestFrom(this.measurementService.getMeasurementRunning$()),
      filter(([, isRunning]) => !isRunning),
      switchMap(()=>this.fetchDevices()), // switch the old http request with the new one 
      takeUntil(this.destroy$)
    ).subscribe(devices => this.devices.set(devices)); 
  }

  private fetchDevices(): Observable<DeviceInformation[]> {
  const url = `http://${this.serverUrl}/UUID`;

  return this.http.get<Partial<DeviceOverview>>(url).pipe( // get new devices list else default empty devices list 
    map(resp => {
      const devs   = resp.devices ?? [];   // fallback
      const colors = resp.colors  ?? [];

      return devs.map((d, i) => ({
        UUID : d.UUID,
        color: colors[i]?.color ?? { r: 0, g: 0, b: 0 }
      }));
    }),

    catchError(err => {
      console.warn('[fetchDevices] failed:', err); // stream runs even if no scopes are connected or an error occurs in the http request 
      return of([]);                      
    })
  );
}

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}