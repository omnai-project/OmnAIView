import { Component, inject } from "@angular/core";
import { MatIcon } from "@angular/material/icon";
import { MatButtonModule } from "@angular/material/button";
import { MatDialog } from '@angular/material/dialog';
import { SettingsDialogComponent } from "../settings/settings-dialog.component";

@Component({
    selector: `app-settings-menu`,
    standalone: true,
    imports: [MatIcon, MatButtonModule],
    templateUrl: './settings-button.component.html',
    styleUrls: ['./toolbar.component.css']
})
export class SettingsMenuComponent {
    private readonly dialog = inject(MatDialog);

    openDialog(): void {
        this.dialog.open(SettingsDialogComponent, {
            width: '600px',
            maxWidth: '90vw',
            height: 'auto',
            maxHeight: '90vh',
            autoFocus: true,
            restoreFocus: true,
            panelClass: 'settings-dialog-panel'
        });
    }
}