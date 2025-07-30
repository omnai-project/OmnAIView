// server-communication.service.ts
import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal, DestroyRef } from '@angular/core';
import { DataSource } from '../../source-selection/data-source-selection.service';
import { catchError, Observable, of, Subject, switchMap, takeUntil, timer } from 'rxjs';
import { map, filter } from 'rxjs/operators';
import { BackendPortService } from './backend-port.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { take } from 'rxjs/operators';
import { SaveDataLocallyModalComponent } from '../../save-data-locally-modal/save-data-locally-modal.component';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DownloadProgressComponent } from './downloadProgress.component';

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

// WSMessageInterfaces 

interface DataMessage {
  type: 'data';
  devices: string[];
  data: { timestamp: number, value: number[] }[];
}

interface FileReadyMessage {
  type: 'file-ready',
  url: string
}

type WSMessage = DataMessage | FileReadyMessage;

@Injectable({
  providedIn: 'root'
})
export class OmnAIScopeDataService implements DataSource {

  private readonly destroyRef = inject(DestroyRef);
  private readonly dialog = inject(MatDialog);

  constructor(private snackBar: MatSnackBar) {
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
  private readonly fileReady$ = new Subject<FileReadyMessage>();

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
        rate: 200
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
      const raw = (event.data as string).trim();

      if (!raw.startsWith('{')) return;

      let parsedMessage: WSMessage;
      try {
        parsedMessage = JSON.parse(event.data);
      } catch {
        console.warn("Wrong JSON format", event.data);
        return;
      }

      switch (parsedMessage.type) {
        case 'data':
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
          break;
        case 'file-ready':
          console.log("File was ready");
          this.fileReady$.next(parsedMessage);
          break;
        default:
          console.warn("Not known message format");
          console.log(parsedMessage);
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
    if (this.socket) {
      let stopMessage = {
        type: 'stop'
      }
      console.log(JSON.stringify(stopMessage));
      this.socket.send(JSON.stringify(stopMessage));
    }
  }

  clearData(): void {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
      this.isConnected.set(false);
      this.data.set({});
    }
  }

  save(): void {
    const dialogRef = this.dialog.open(SaveDataLocallyModalComponent, {
      width: '60vw'
    });
    dialogRef.afterClosed().pipe(filter(Boolean)).subscribe(({ dir, fileName }) => {
      let serverpath = `/download/${fileName}`;
      const saveMessage = {
        type: `save`,
        uuids: this.devices().map(device => device.UUID),
        path: `${fileName}`,
        format: `csv`
      }
      const progressRef = this.dialog.open(DownloadProgressComponent, {
        disableClose: true
      });
      this.fileReady$
        .pipe(
          filter(m => m.url === serverpath),
          take(1)
        )
        .subscribe(() => {
          window.electronAPI?.downloadFile(serverpath, dir, fileName)
            .then(() => {
              this.snackBar.open('File sucessfully saved ✓', '', { duration: 4000 });
            })
            .catch(() => {
              this.snackBar.open('Saving error', '', { duration: 4000 });
            })
            .finally(() => progressRef.close());
        });
      this.socket?.send(JSON.stringify(saveMessage));
      console.log("dialog closed");
    });
  }

  record(): void {
    console.log('Start recording OmnAI data ...');
  }
}
