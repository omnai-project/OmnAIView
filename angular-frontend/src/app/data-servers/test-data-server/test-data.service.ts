import { Injectable, signal } from "@angular/core";
import { DataSource } from "../../source-selection/data-source-selection.service";
import { DataFormat } from "../omnai-scope-server/live-data.service";


@Injectable({
    providedIn: 'root'
})
export class TestDataService implements DataSource {
    readonly data = signal<Record<string, DataFormat[]>>({}); 

    connect():void{}
}