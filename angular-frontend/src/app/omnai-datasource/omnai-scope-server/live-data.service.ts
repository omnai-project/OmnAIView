// server-communication.service.ts
import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal, DestroyRef } from '@angular/core';
import { DataSource } from '../../source-selection/data-source-selection.service';
import { catchError, Observable, of, Subject } from 'rxjs';
import { map, filter } from 'rxjs/operators';
import { BackendPortService } from './backend-port.service';
import { take } from 'rxjs/operators';
import { SaveDataLocallyModalComponent } from '../../save-data-locally-modal/save-data-locally-modal.component';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DownloadProgressComponent } from './downloadProgress.component';
import { SourceColorService } from '../../source-selection/source-color.service';
import { Device } from '../../sidebar/devices/devicecard.component';
import { tap } from 'rxjs/operators';

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

  private readonly dialog = inject(MatDialog);
  private readonly sourceColorService = inject(SourceColorService);

  constructor(private snackBar: MatSnackBar) { }
  private socket: WebSocket | null = null;

  readonly isConnected = signal<boolean>(false);
  readonly devices = signal<Device[]>([]);
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

  private firstMessage: boolean = true;

  readonly port = inject(BackendPortService).port;
  readonly serverUrlLocal = computed(() => {
    const port = this.port();
    if (port === null) throw new Error('Port not initialized');
    return `127.0.0.1:${port}`;
  });

  public overviewToDevices(deviceOverview: DeviceOverview): Device[] {
    const devs = deviceOverview?.devices ?? [];
    const cols = deviceOverview?.colors ?? [];
    return devs.map((devices, i) => ({
      uuid: devices.UUID,
      color: cols[i]?.color
    }));
  }

  /**
   * Request the list of devices from given serverurl/UUID endpoint. 
   * @param serverUrl 
   * @returns List of Devices 
   */
  public getDevices(serverUrl: string): Observable<Device[]> {
    console.log("called getDevices")
    const url = `${serverUrl}/UUID`;

    return this.#httpClient.get<DeviceOverview>(url).pipe(
      map(this.overviewToDevices),
      tap(list => {
        this.sourceColorService.setColours(
          list.map(device => ({ UUID: device.uuid, color: device.color }))
        );
      }),
      catchError(error => {
        console.warn('error while loading devices', error);
        return of([] as Device[]);
      })
    );
  }

  // this is not working with the current changes right now as the function is not dependend on the serverurl --> Will only call devices from hardcoded backend on port 8080
  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.socket?.readyState === WebSocket.CLOSING) {
        this.socket.addEventListener("close", () => this.connect(), { once: true });
        return;
      }
      if (this.socket && this.socket.readyState === WebSocket.OPEN) {
        console.log('WebSocket is already connected');
        resolve();
        return;
      }

      try {
        const wsUrl = `ws://127.0.0.1:8080/ws`;
        this.socket = new WebSocket(wsUrl);

        this.socket.addEventListener('open', () => {
          this.isConnected.set(true);
          this.data.set({});

          // define start message 
          const startMessage = {
            type: `start`,
            uuids: this.devices().map(device => device.uuid),
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
          if (this.firstMessage) {
            this.firstMessage = false;
            resolve();
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
      } catch (error) {
        reject(error);
      }
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
    dialogRef.afterClosed().pipe(filter(Boolean)).subscribe((result: { dir: string, fileName: string } | undefined) => {
      if (result) {
        const { dir, fileName } = result;
        this.saveData(dir, fileName);
      } else {
        console.log('Saving dialog closed without saving')
      }
    });
  }

  saveData(dir: string, fileName: string): void {
    let serverpath = `/download/${fileName}`;
    const saveMessage = {
      type: `save`,
      uuids: this.devices().map(device => device.uuid),
      path: `${fileName}`,
      format: `csv`
    };
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
  }

  async record(dir: string, fileName: string, duration: number): Promise<any> {
    await this.connect();
    try {
      const result = await new Promise((resolve, reject) => {
        setTimeout(() => {
          if (!this.socket) reject(new Error('Recording aborted'));
          this.disconnect();
          this.saveData(dir, fileName);
          resolve({ filePath: `${dir}/${fileName}`, duration, success: true });
        }, duration * 1000);
      });
      console.log('Recording done:', result);
    } catch (error) {
      this.disconnect();
      console.error('Recording error:', error);
      throw error;
    }
  }
}
