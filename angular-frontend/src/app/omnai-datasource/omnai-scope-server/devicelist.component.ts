// src/app/components/device-list/device-list.component.ts

import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { OmnAIScopeDataService } from './live-data.service';
import { DummyDataService } from '../random-data-server/random-data.service';

@Component({
    selector: 'app-device-list',
    templateUrl: './devicelist.component.html',
    imports: [],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DeviceListComponent {
    readonly #deviceHandler = inject(OmnAIScopeDataService);
    readonly #randomDataHandler = inject(DummyDataService);
    devices = this.#deviceHandler.devices
    isLiveDataConnected = this.#deviceHandler.isConnected
    isRandomDataConnected = this.#randomDataHandler.isConnected

    getDevicesList = this.#deviceHandler.getDevices.bind(this.#deviceHandler)
    disconnectSource = () => {
        if (this.#deviceHandler.isConnected()) {
            this.#deviceHandler.disconnect();
        } else if (this.#randomDataHandler.isConnected()) {
            this.#randomDataHandler.disconnect();
        }
    };
}
