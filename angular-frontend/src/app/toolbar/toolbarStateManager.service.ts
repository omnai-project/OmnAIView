import { Injectable } from "@angular/core";

export enum ToolbarState {
    IDLE = 'IDLE',
    STARTED = 'STARTED',
    STOPPED = 'STOPPED'
}
@Injectable({
    providedIn: 'root'
})
export class ToolbarStateManagerService {
    private _state: ToolbarState = ToolbarState.IDLE;

    getState(): ToolbarState {
        return this._state;
    }

    setState(newState: ToolbarState): void {
        this._state = newState;
    }
}