import { inject, Injectable, signal } from '@angular/core';
import { interval, Observable, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { DataSource } from '../../source-selection/data-source-selection.service';
import { DataFormat } from '../omnai-scope-server/live-data.service';
import { MatDialog } from '@angular/material/dialog';
import { SaveDataLocallyModalComponent } from '../../save-data-locally-modal/save-data-locally-modal.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DownloadProgressComponent } from '../omnai-scope-server/downloadProgress.component';
import { Device } from '../../sidebar/devices/devicecard.component';
import { of } from 'rxjs';
import { DeviceFetch } from '../../sidebar/devices/devicelist.service';


@Injectable({ providedIn: 'root' })
export class DummyDataService implements DataSource {
    private readonly _data = signal<Record<string, DataFormat[]>>({});
    private readonly dialog = inject(MatDialog);

    readonly data = this._data.asReadonly();
    private subscription: Subscription | null = null;
    readonly isConnected = signal<boolean>(false);

    constructor(private snackBar: MatSnackBar) { }

    connect(): void {
        if (this.subscription) return;
        this.isConnected.set(true);
        this.subscription = interval(1000)
            .pipe(
                map(() => ({
                    timestamp: Date.now(),
                    value: Math.random() * 100,
                }))
            )
            .subscribe((point) => {
                this._data.update(current => ({
                    ...current,
                    dummy: [...(current['dummy'] ?? []), point]
                }));
            });
    }

    disconnect(): void {
        this.subscription?.unsubscribe();
        this.subscription = null;
        this.isConnected.set(false);
    }

    clearData(): void {
        this._data.set({});
    }

    save(): void {
        if (!this.isConnected) {
            console.log('Dummy data source not connected.');
            return;
        }
        const dialogRef = this.dialog.open(SaveDataLocallyModalComponent, { width: '60vw' });
        dialogRef.afterClosed().subscribe((result: { dir: string, fileName: string } | undefined) => {
            if (result) {
                const { dir, fileName } = result;
                this.saveData(dir, fileName);
            } else {
                console.log('Saving dialog closed without saving')
            }
        });
    }

    saveData(dir: string, fileName: string): void {
        if (window.electronAPI) {
            const csv = [
                '# source: dummy data',
                '# version: 1.0.0',
                'timestamp,value',
                ...(this._data()['dummy']?.length
                    ? this._data()['dummy'].map(item => `${item.timestamp},${item.value}`)
                    : ['-,-'])
            ].join('\n');
            const progressRef = this.dialog.open(DownloadProgressComponent, {
                disableClose: true
            });
            try {
                window.electronAPI.saveFile(csv, dir, fileName);
                this.snackBar.open('File sucessfully saved ✓', '', { duration: 4000 });
            } catch {
                this.snackBar.open('Saving error', '', { duration: 4000 });
            }
            progressRef.close();
        } else {
            console.log('Electron app not activated');
        }
    }

    async record(dir: string, fileName: string, duration: number): Promise<any> {
        this.connect();
        try {
            const result = await new Promise((resolve, reject) => {
                setTimeout(() => {
                    if (!this.subscription) reject(new Error('Recording aborted'));
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

    /**
     * Returns a dummy device to show as the device for the random data server 
     * @param serverUrl dummy url for interface
     * @returns dummy device for random data server 
     */
    getDevices(serverUrl: string): Observable<DeviceFetch> {
        console.log("getdevices was called");
        const device: Device[] = [{
            uuid: "1234",
            color: { r: 0, g: 0, b: 255 }
        }]
        return of({ devices: device, status: 200 });
    }
}