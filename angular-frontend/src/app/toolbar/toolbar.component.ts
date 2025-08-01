import { Component, inject } from '@angular/core';
import { AdvancedModeService } from '../advanced-mode/advanced-mode.service';
import { StartDataButtonComponent } from "../toolbar/start-data-button.component";
import { SaveDataButtonComponent } from '../toolbar/save-data-button.component';
import { SettingsMenuComponent } from '../settings/setting-menu.component';
import { MatSlideToggle } from '@angular/material/slide-toggle';

@Component({
    selector: 'app-toolbar',
    templateUrl: './toolbar.component.html',
    styleUrl: './toolbar.component.css',
    imports: [StartDataButtonComponent, SaveDataButtonComponent, SettingsMenuComponent, MatSlideToggle]
})
export class ToolbarComponent {
    protected readonly advancedMode = inject(AdvancedModeService);
}