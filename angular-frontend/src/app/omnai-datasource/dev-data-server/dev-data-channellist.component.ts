// src/app/components/device-list/device-list.component.ts
import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DevDataService } from './dev-data.service';

@Component({
    selector: 'app-dev-data-channel-list',
    templateUrl: './dev-data-channellist.component.html',
    imports: [CommonModule],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DevDataChannelList {
    readonly #deviceHandler = inject(DevDataService);
    devices = this.#deviceHandler.devices

    getDevicesList = this.#deviceHandler.getDevices.bind(this.#deviceHandler)
}
