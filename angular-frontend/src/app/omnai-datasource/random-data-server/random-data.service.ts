import { Injectable, signal } from '@angular/core';
import { interval } from 'rxjs';
import { map } from 'rxjs/operators';
import { DataInfo, DataSource } from '../../source-selection/data-source-selection.service';
import { DataFormat } from '../omnai-scope-server/live-data.service';


@Injectable({ providedIn: 'root' })
export class DummyDataService implements DataSource {
    private readonly _data = signal({data: new Map()});

    readonly data = this._data.asReadonly();
    readonly info = signal({info: new DataInfo()});
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
              this.info.update(initial => {
                if (point.timestamp < initial.info.minTimestamp) initial.info.minTimestamp = point.timestamp;
                if (point.timestamp > initial.info.maxTimestamp) initial.info.maxTimestamp = point.timestamp;
                if (point.value > initial.info.maxValue) initial.info.maxValue = point.value;
                if (point.value < initial.info.minValue) initial.info.minValue = point.value;
                return {info: initial.info};
              });
              this._data.update(current => {
                if (!current.data.has(uuid)) current.data.set(uuid, []);
                current.data.get(uuid)!.push(point);
                return {data: current.data};
              });
            });
    }
}