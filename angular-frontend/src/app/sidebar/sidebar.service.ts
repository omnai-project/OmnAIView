import { Injectable } from "@angular/core";
import { signal } from "@angular/core";

@Injectable({
    providedIn: 'root'
})
export class SideBarService {
    readonly collapsed = signal(true);

    toggleSideBar() {
        this.collapsed.update(v => !v);
    }
}