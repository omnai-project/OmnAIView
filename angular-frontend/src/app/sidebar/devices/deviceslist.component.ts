import { Component, inject } from "@angular/core";
import { DeviceListComponent } from "../../omnai-datasource/omnai-scope-server/devicelist.component";
import { DeviceListDummyComponent } from "../../omnai-datasource/dummy-data-server/devicelist-dummy.component";
import { SideBarService } from "../sidebar.service";

@Component({
    selector: 'app-deviceslist',
    templateUrl: './deviceslist.component.html',
    styleUrl: './deviceslist.component.css',
    imports: [DeviceListComponent, DeviceListDummyComponent]
})
export class DevicesList {
    readonly sideBarService = inject(SideBarService);
}