import { Component } from "@angular/core";
import { DeviceListComponent } from "../../omnai-datasource/omnai-scope-server/devicelist.component";
import { DeviceListRandomComponent } from "../../omnai-datasource/dummy-data-server/devicelist-dummy.component";

@Component({
    selector: 'app-deviceslist',
    templateUrl: './deviceslist.component.html',
    styleUrl: './deviceslist.component.css',
    imports: [DeviceListComponent, DeviceListRandomComponent]
})
export class DevicesList {

}