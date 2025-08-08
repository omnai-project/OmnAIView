import { Component, inject } from "@angular/core";
import { DeviceCardComponent } from "../../sidebar/devices/devicecard.component";
import { SideBarService } from "../../sidebar/sidebar.service";

/**
 * Hardcoded mat-card showing random data as a source 
 */
@Component({
    selector: 'app-device-list-dummy',
    styleUrl: './devicelist-dummy.component.css',
    imports: [DeviceCardComponent],
    template: `
    <div class="scope-card" [class.scope-card-collapsed]="sideBarService.collapsed()">
        <app-device-card [uuid]="'testuuid'" [name]="'dummyDataSource'" [color]="{r: 70, g:130, b:180}"></app-device-card>
    </div>
    `
})
export class DeviceListDummyComponent {

    sideBarService = inject(SideBarService);
}