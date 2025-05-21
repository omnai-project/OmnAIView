import { Injectable, signal } from '@angular/core';
import { interval } from 'rxjs';
import { map } from 'rxjs/operators';
import { DataSource } from '../../source-selection/data-source-selection.service';
import { DataFormat } from '../omnai-scope-server/live-data.service';


@Injectable({ providedIn: 'root' })
export class DummyDataService implements DataSource {
    private readonly _data = signal<Record<string, DataFormat[]>>({});

    readonly data = this._data.asReadonly(); 
    connect(): void {
        interval(1000)
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
}