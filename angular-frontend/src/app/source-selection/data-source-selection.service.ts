import { computed, inject, Injectable, Signal, signal } from '@angular/core';
import { type DataFormat, OmnAIScopeDataService } from '../omnai-datasource/omnai-scope-server/live-data.service';
import { Observable } from 'rxjs';
import { DummyDataService } from '../omnai-datasource/random-data-server/random-data.service';
 import {CsvFileImportService} from '../omnai-datasource/csv-file-import/csv-file-import.service';
/** Dummy interface to match your expected shape */
export interface DataPoint {
    x: number;
    y: number;
}

export class DataBounds {
  constructor() {
    this.minValue = Number.POSITIVE_INFINITY;
    this.maxValue = Number.NEGATIVE_INFINITY;
    this.minTimestamp = Number.POSITIVE_INFINITY;
    this.maxTimestamp = Number.NEGATIVE_INFINITY;
  }
  static copy(copy: DataBounds) {
    const newInfo = new DataBounds();
    newInfo.minValue = copy.minValue;
    newInfo.maxValue = copy.maxValue;
    newInfo.minTimestamp = copy.minTimestamp;
    newInfo.maxTimestamp = copy.maxTimestamp;
    return newInfo;
  }

  static newFromData(data: Map<string, DataFormat[]>){
    const newInfo = new DataBounds();
    for (const values of data.values())
      newInfo.applyDataPoints(values)
    return newInfo;
  }

  applyDataPoints(dataPoints: DataFormat[]) {
    for (const value of dataPoints) {
      this.applyDataPoint(value);
    }
  }

  applyDataPoint(dataPoint: DataFormat) {
    if (dataPoint.value > this.maxValue) this.maxValue = dataPoint.value;
    if (dataPoint.value < this.minValue) this.minValue = dataPoint.value;
    if (dataPoint.timestamp > this.maxTimestamp) this.maxTimestamp = dataPoint.timestamp;
    if (dataPoint.timestamp < this.minTimestamp) this.minTimestamp = dataPoint.timestamp;
  }

  minValue: number;
  maxValue: number;
  minTimestamp: number;
  maxTimestamp: number;
}
export interface DataSourceData {
  data: Map<string, DataFormat[]>,
  bounds: DataBounds
}
/** Your expected DataSource interface */
export interface DataSource {
    connect(): unknown;
    data: Signal<DataSourceData>
}


export interface DataSourceInfo  extends DataSource{
    id: string;
    name: string;
    description?: string;
}

@Injectable({
    providedIn: 'root'
})
export class DataSourceSelectionService {
    private readonly liveDataService = inject(OmnAIScopeDataService);
    private readonly dummyDataService = inject(DummyDataService);
    private readonly csvDataService = inject(CsvFileImportService);
    private readonly _currentSource = signal<DataSourceInfo | null>(null);

    private readonly _availableSources = signal<DataSourceInfo[]>([
        {
            id: 'omnaiscope',
            name: 'OmnAIScope',
            description: 'Live data from connected OmnAIScope devices',
            connect: this.liveDataService.connect.bind(this.liveDataService),
            data: this.liveDataService.data,
        },
        {
            id: 'dummydata',
            name: 'Random Dummy Data',
            description: 'Random generated data points',
            connect: this.dummyDataService.connect.bind(this.dummyDataService),
            data: this.dummyDataService.data,
        },
        {
          id: 'csv-file',
          name: 'CSV Data',
          description: 'Import a CSV file',
          connect: this.csvDataService.connect.bind(this.csvDataService),
          data: this.csvDataService.data,
        }
    ]);
    readonly availableSources = this._availableSources.asReadonly();

    // selected source as readonly signal
    readonly currentSource = this._currentSource.asReadonly();

    // whether a source is selected
    readonly hasSelection = computed(() => this._currentSource() !== null);

    // selected source ID (null if none selected)
    readonly selectedSourceId = computed(() => this._currentSource()?.id ?? null);

    selectSource(source: DataSourceInfo): void {
        this._currentSource.set(source);
    }

    clearSelection(): void {
        this._currentSource.set(null);
    }

    addSourceToAvailbleSoruces(source: DataSourceInfo) {
        this._availableSources.update((value) => [...value, source])
    }
    readonly data = computed(() => {
        const source = this._currentSource();
        if (!source) return signal({
          data: new Map(),
          info: new DataBounds(),
        }).asReadonly();
        return source.data;
    });
}
