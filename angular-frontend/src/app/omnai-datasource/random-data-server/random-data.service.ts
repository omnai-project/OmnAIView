import { Injectable, signal } from '@angular/core';
import { interval } from 'rxjs';
import { map } from 'rxjs/operators';
import { DataBounds, DataSource } from '../../source-selection/data-source-selection.service';
import { DataFormat } from '../omnai-scope-server/live-data.service';


@Injectable({ providedIn: 'root' })
export class DummyDataService implements DataSource {
    private readonly _data = signal({data: new Map(), bounds: new DataBounds()});

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
              const uuid = "dummy";
              this._data.update(data => {
                if (point.timestamp < data.bounds.minTimestamp) data.bounds.minTimestamp = point.timestamp;
                if (point.timestamp > data.bounds.maxTimestamp) data.bounds.maxTimestamp = point.timestamp;
                if (point.value > data.bounds.maxValue) data.bounds.maxValue = point.value;
                if (point.value < data.bounds.minValue) data.bounds.minValue = point.value;

                if (!data.data.has(uuid)) data.data.set(uuid, []);
                data.data.get(uuid)!.push(point);
                return {data: data.data, bounds: data.bounds};
              });
            });
    }
}
