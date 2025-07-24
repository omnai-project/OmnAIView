import { inject, Injectable, signal } from '@angular/core';
import { interval, Subscription  } from 'rxjs';
import { map } from 'rxjs/operators';
import { DataSource } from '../../source-selection/data-source-selection.service';
import { DataFormat } from '../omnai-scope-server/live-data.service';
import { MatDialog } from '@angular/material/dialog';
import { SaveDataLocallyModalComponent } from '../../save-data-locally-modal/save-data-locally-modal.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DownloadProgressComponent } from '../omnai-scope-server/downloadProgress.component';


@Injectable({ providedIn: 'root' })
export class DummyDataService implements DataSource {
    private readonly _data = signal<Record<string, DataFormat[]>>({});
    private readonly dialog = inject(MatDialog);

    readonly data = this._data.asReadonly(); 
    private subscription: Subscription | null = null;
    readonly isConnected = signal<boolean>(false);

    constructor(private snackBar: MatSnackBar) {}

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
        dialogRef.afterClosed().subscribe(({dir, fileName}) => {
            if(window.electronAPI) {
                const csv = ['# source: dummy data','# version: 1.0.0','timestamp,value', ...this._data()['dummy'].map(item => `${item.timestamp},${item.value}`)].join('\n');
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
        });
    }
    
    record(): void {
        console.log(`Start recording dummy data ...`);
    }
}