import { Injectable, signal } from "@angular/core";

export interface RGB { r: number; g: number; b: number }
/**
 * Provides logic to set the colours of the colour signal 
 */
@Injectable({
    providedIn: 'root'
})
export class SourceColorService {
    readonly colour = signal<Record<string, string>>({});

    setColours(list: { UUID: string; color: RGB }[]) {
        const map: Record<string, string> = {};
        for (const device of list) map[device.UUID] = `rgb(${device.color.r}, ${device.color.g}, ${device.color.b})`;
        this.colour.set(map);
    }
}