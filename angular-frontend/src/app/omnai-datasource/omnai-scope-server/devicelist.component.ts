// src/app/components/device-list/device-list.component.ts

import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { OmnAIScopeDataService } from './live-data.service';
import { MatCardModule } from '@angular/material/card';
import { DeviceCardComponent } from '../../sidebar/devices/devicecard.component';

@Component({
    selector: 'app-device-list',
    templateUrl: './devicelist.component.html',
    styleUrl: './devicelist.component.css',
    imports: [MatCardModule, DeviceCardComponent],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DeviceListComponent {
    private readonly deviceHandler = inject(OmnAIScopeDataService);
    protected readonly devices = this.deviceHandler.devices;
    name = "test";
    getDevicesList = this.deviceHandler.getDevices.bind(this.deviceHandler);
}
