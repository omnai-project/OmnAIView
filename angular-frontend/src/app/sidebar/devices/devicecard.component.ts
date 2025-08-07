import { ChangeDetectionStrategy, Component, inject, model } from "@angular/core";
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { computed } from "@angular/core";
import { MatDialog, MatDialogModule } from "@angular/material/dialog";
import { DevicesSettingsDialogComponent } from "./devices-settings-dialog.component";

export interface Device {
    uuid: string;
    color: { r: number; g: number; b: number };
}

@Component({
    selector: 'app-device-card',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [MatIconModule, MatButtonModule, MatMenuModule, MatDialogModule],
    host: {
        class: 'device-card'
    },
    templateUrl: './devicecard.component.html',
    styleUrl: './devicecard.component.css'
})
export class DeviceCardComponent {
    private readonly dialog = inject(MatDialog);
    readonly uuid = model<string>();
    readonly color = model<{ r: number; g: number; b: number }>();
    readonly name = model<string>();

    readonly colorString = computed(() =>
        this.color() ? `rgb(${this.color()?.r}, ${this.color()?.g}, ${this.color()?.b})` : 'transparent'
    );

    openModal() {
        const ref = this.dialog.open(DevicesSettingsDialogComponent, {
            data: {
                uuid: this.uuid(),
                name: this.name(),
            },
        });

        ref.afterClosed().subscribe((result) => {
            if (result && result.name !== this.name()) {
                this.name.set(result.name);
            }
        });
    }
}