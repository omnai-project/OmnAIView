import { computed, inject, Injectable, Signal, signal } from '@angular/core';
import { type DataFormat, OmnAIScopeDataService } from '../omnai-datasource/omnai-scope-server/live-data.service';
import { Observable } from 'rxjs';
import { DummyDataService } from '../omnai-datasource/dummy-data-server/dummy-data.service';
import { CsvFileImportService } from '../omnai-datasource/csv-file-import/csv-file-import.service';
/** Dummy interface to match your expected shape */
export interface DataPoint {
    x: number;
    y: number;
}

/** Your expected DataSource interface */
export interface DataSource {
    connect(): unknown;
    disconnect(): void;
    clearData(): void;
    save(): void;
    record(): void;
    data: Signal<Record<string, DataFormat[]>>
}


export interface DataSourceInfo extends DataSource {
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
            disconnect: this.liveDataService.disconnect.bind(this.liveDataService),
            clearData: this.liveDataService.clearData.bind(this.liveDataService),
            save: this.liveDataService.save.bind(this.liveDataService),
            record: this.liveDataService.record.bind(this.liveDataService),
            data: this.liveDataService.data
        },
        {
            id: 'dummydata',
            name: 'Random Dummy Data',
            description: 'Random generated data points',
            connect: this.dummyDataService.connect.bind(this.dummyDataService),
            disconnect: this.dummyDataService.disconnect.bind(this.dummyDataService),
            clearData: this.dummyDataService.clearData.bind(this.dummyDataService),
            save: this.dummyDataService.save.bind(this.dummyDataService),
            record: this.dummyDataService.record.bind(this.dummyDataService),
            data: this.dummyDataService.data
        },
        {
            id: 'csv-file',
            name: 'CSV Data',
            description: 'Import a CSV file',
            connect: this.csvDataService.connect.bind(this.csvDataService),
            disconnect: this.csvDataService.disconnect.bind(this.csvDataService),
            clearData: this.csvDataService.clearData.bind(this.csvDataService),
            save: this.csvDataService.save.bind(this.csvDataService),
            record: this.csvDataService.record.bind(this.csvDataService),
            data: this.csvDataService.data
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
        if (!source) return signal<Record<string, DataFormat[]>>({});
        return source.data;
    });
}
