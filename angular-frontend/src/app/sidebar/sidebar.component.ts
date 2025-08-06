import { Component, signal } from "@angular/core";
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatIconButton } from "@angular/material/button";
import { MatIcon } from "@angular/material/icon";
import { DevicesList } from "./devices/deviceslist.component";


@Component({
    selector: 'app-sidebar',
    templateUrl: './sidebar.component.html',
    styleUrl: './sidebar.component.css',
    imports: [DevicesList, MatSidenavModule, MatIconButton, MatIcon]
})
export class SideBarComponent {
    selectedTab = signal<'devices'|'files'|'analysis'>('devices'); 
    
}