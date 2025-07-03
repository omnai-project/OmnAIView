import { computed, inject, Injectable, Signal, signal } from '@angular/core';
import { type DataFormat, OmnAIScopeDataService } from '../omnai-datasource/omnai-scope-server/live-data.service';
import { Observable } from 'rxjs';
import { CsvFileImportService } from '../omnai-datasource/csv-file-import/csv-file-import.service';
import { DummyDataService } from '../omnai-datasource/random-data-server/random-data.service';
import { DevDataService } from '../omnai-datasource/dev-data-server/dev-data.service';
/** Dummy interface to match your expected shape */
export interface DataPoint {
    x: number;
    y: number;
}

/** Your expected DataSource interface */
export interface DataSource {
    connect(): unknown;
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
    private readonly devDataService = inject(DevDataService);

    private readonly _availableSources = signal<DataSourceInfo[]>([
        {
            id: 'omnaiscope',
            name: 'OmnAIScope',
            description: 'Live data from connected OmnAIScope devices',
            connect: this.liveDataService.connect.bind(this.liveDataService),
            data: this.liveDataService.data
        },
        {
            id: 'dummydata',
            name: 'Random Dummy Data',
            description: 'Random generated data points',
            connect: this.dummyDataService.connect.bind(this.dummyDataService),
            data: this.dummyDataService.data
        },
        {
            id: 'csv-file',
            name: 'CSV Data',
            description: 'Import a CSV file',
            connect: this.csvDataService.connect.bind(this.csvDataService),
            data: this.csvDataService.data
        },
        {
            id: 'sinrectestdata',
            name: 'Dev Data Server',
            description: 'Generate a sinus or rectangular function as testdata for the graph',
            connect: this.devDataService.connect.bind(this.devDataService),
            data: this.devDataService.data
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
