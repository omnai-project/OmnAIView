import { ChangeDetectionStrategy, Component, input } from "@angular/core";
import { Input, Output, EventEmitter } from "@angular/core";
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { RGB } from "../../source-selection/source-color.service";
import { computed } from "@angular/core";

export interface Device {
    uuid: string;
    color: { r: number; g: number; b: number };
}

@Component({
    selector: 'app-device-card',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [MatIconModule, MatButtonModule, MatMenuModule],
    host: {
        class: 'device-card'
    },
    templateUrl: './devicecard.component.html',
    styleUrl: './devicecard.component.css'
})
export class DeviceCardComponent {
    readonly uuid = input<string>();
    readonly color = input<{ r: number; g: number; b: number }>();
    readonly name = input<string>();
    @Output() edit = new EventEmitter<string>();

    readonly colorString = computed(() =>
        this.color() ? `rgb(${this.color()?.r}, ${this.color()?.g}, ${this.color()?.b})` : 'transparent'
    );

    editDeviceName() {
        this.edit.emit(this.name());
    }

    openModal(){
        
    }
}