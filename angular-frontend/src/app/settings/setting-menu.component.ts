import { Component } from "@angular/core";
import { MatIcon } from "@angular/material/icon";
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { SettingsDialogComponent } from "./settings-dialog.component";

@Component({
    selector: `app-settings-menu`,
    standalone: true,
    imports: [MatIcon, MatDialogModule],
    template: `
    <button mat-icon-button aria-label="Settings" (click)="openDialog()">
      <mat-icon>settings</mat-icon>
    </button>
  `,
})
export class SettingsMenuComponent {
    constructor(private dialog: MatDialog) { }

    openDialog(): void {
        this.dialog.open(SettingsDialogComponent, {
            width: '600px',
            maxWidth: '90vw',
            height: 'auto',
            maxHeight: '90vh',
            autoFocus: true,
            restoreFocus: true,
        });
    }
}