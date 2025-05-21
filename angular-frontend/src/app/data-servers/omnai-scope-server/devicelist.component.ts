// src/app/components/device-list/device-list.component.ts
import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { OmnAIScopeDataService } from './live-data.service';

@Component({
    selector: 'app-device-list',
    templateUrl: './devicelist.component.html',
    imports: [CommonModule],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DeviceListComponent {
    readonly #deviceHandler = inject(OmnAIScopeDataService);
    devices = this.#deviceHandler.devices

    getDevicesList = this.#deviceHandler.getDevices.bind(this.#deviceHandler)
}
