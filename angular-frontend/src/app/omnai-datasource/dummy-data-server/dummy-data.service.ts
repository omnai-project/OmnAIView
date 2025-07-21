import { inject, Injectable, signal } from '@angular/core';
import { interval, Subscription  } from 'rxjs';
import { map } from 'rxjs/operators';
import { DataSource } from '../../source-selection/data-source-selection.service';
import { DataFormat } from '../omnai-scope-server/live-data.service';
import { MatDialog } from '@angular/material/dialog';
import { SaveDataLocallyModalComponent } from '../../save-data-locally-modal/save-data-locally-modal.component';


@Injectable({ providedIn: 'root' })
export class DummyDataService implements DataSource {
    private readonly _data = signal<Record<string, DataFormat[]>>({});
    private readonly dialog = inject(MatDialog);

    readonly data = this._data.asReadonly(); 
    private subscription: Subscription | null = null;
    readonly isConnected = signal<boolean>(false);

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
        this.dialog.open(SaveDataLocallyModalComponent, { width: '60vw' });

    }
    
    record(): void {
        console.log(`Start recording dummy data ...`);
    }
}