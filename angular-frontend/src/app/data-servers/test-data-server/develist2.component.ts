// src/app/components/device-list/device-list.component.ts
import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TestDataService } from './test-data.service';

@Component({
    selector: 'app-device-list2',
    templateUrl: './devicelist2.component.html',
    imports: [CommonModule],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DeviceListComponent2 {
    readonly #deviceHandler = inject(TestDataService);
    devices = this.#deviceHandler.devices

    getDevicesList = this.#deviceHandler.getDevices.bind(this.#deviceHandler)
}
