import { Injectable, signal } from "@angular/core";
import { DataSource } from "../../source-selection/data-source-selection.service";
import { DataFormat } from "../omnai-scope-server/live-data.service";

/**
 * @classdesc Provides the logic to receive information and data from the
 * [OmnAI DevDataServer](https://github.com/omnai-project/OmnAI-DevDataServer)
 */
@Injectable({
    providedIn: 'root'
})
export class DevDataService implements DataSource {
    readonly data = signal<Record<string, DataFormat[]>>({});

    connect(): void { }
}