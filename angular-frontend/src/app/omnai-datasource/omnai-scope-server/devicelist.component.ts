// src/app/components/device-list/device-list.component.ts

import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { OmnAIScopeDataService } from './live-data.service';

@Component({
    selector: 'app-device-list',
    templateUrl: './devicelist.component.html',
    imports: [],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DeviceListComponent {
    private readonly deviceHandler = inject(OmnAIScopeDataService);
    protected readonly devices = this.deviceHandler.devices;
    getDevicesList = this.deviceHandler.getDevices.bind(this.deviceHandler);
}
