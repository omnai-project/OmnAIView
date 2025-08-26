import { Component, inject } from "@angular/core";
import { SideBarService } from "../sidebar.service";
import { DeviceListService } from "./devicelist.service";
import { DeviceCardComponent } from "./devicecard.component";

@Component({
    selector: 'app-deviceslist',
    templateUrl: './deviceslist.component.html',
    styleUrl: './deviceslist.component.css',
    imports: [DeviceCardComponent]
})
export class DevicesList {
    readonly sideBarService = inject(SideBarService);
    readonly devicelistService = inject(DeviceListService);
}