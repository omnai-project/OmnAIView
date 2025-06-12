// server-communication.service.ts
import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { DataBounds, DataSource } from '../../source-selection/data-source-selection.service';
import { BackendPortService } from './backend-port.service';

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

  private socket: WebSocket | null = null;
  lastUpdate: number = 0;

  readonly isConnected = signal<boolean>(false);
  readonly devices = signal<DeviceInformation[]>([]);
  readonly data = signal({data: new Map(), bounds: new DataBounds()});
  readonly dataAsList = computed(() => {
    const allDataPoints: DataFormat[] = [];
    const dataRecord = this.data();

    for (const deviceData of dataRecord.data.values()) {
      allDataPoints.push(...deviceData);
    }

    return allDataPoints;
  });

  readonly #httpClient = inject(HttpClient);
  readonly port = inject(BackendPortService).port;
  readonly serverUrl = computed(() => {
    const port = this.port();
    if (port === null) throw new Error('Port not initialized');
    return `127.0.0.1:${port}`;
  });

  // Abrufen der verfügbaren Geräte vom Server
  getDevices(): void {
    const url = `http://${this.serverUrl()}/UUID`;
    console.log("Current OmnAIScope Datatserver Backend URL (Angular):", url);
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

    const wsUrl = `ws://${this.serverUrl()}/ws`;
    this.socket = new WebSocket(wsUrl);

    this.socket.addEventListener('open', () => {
      this.isConnected.set(true);
      this.data.set({data: new Map(), bounds: new DataBounds()});

      // Send start message
      const deviceUuids = this.devices().map(device => device.UUID).join(" ");
      if(!this.socket){
        throw new Error("Websocket is not defined");
      }
      this.socket.send(deviceUuids);
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
        let start = performance.now();
        const timeToUpdate = 250;
        const dataInfo = this.data();

        //Update bounds and Data, without causing any updates
        const bounds = dataInfo.bounds;
        parsedMessage.data.forEach((currentValue:any) => {
          currentValue.value.forEach((currentValue:number) => {
            if (currentValue > bounds.maxValue) bounds.maxValue = currentValue;
            if (currentValue < bounds.minValue) bounds.minValue = currentValue;
          });
          if (currentValue.timestamp < bounds.minTimestamp) bounds.minTimestamp = currentValue.timestamp;
          if (currentValue.timestamp > bounds.maxTimestamp) bounds.maxTimestamp = currentValue.timestamp;
        });

        const data = dataInfo.data;
        parsedMessage.devices.forEach((uuid: string, index: number) => {
          if (!data.has(uuid)) data.set(uuid, []);
          const newDataPoints:DataFormat[] = parsedMessage.data.map((point: any) => ({
            timestamp: point.timestamp,
            value: point.value[index],
          }));
          let record = data.get(uuid)!;
          record.push(...newDataPoints);
        });

        //Update bounds & data, once every so often.
        if (performance.now() > this.lastUpdate + timeToUpdate) {
          this.data.set({data, bounds});
          this.lastUpdate = performance.now();
        }
        let end = performance.now();
        // console.warn(`Message handing took ${end-start}`)

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
