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
    styles: `button { display: flex; padding: .3em }`,
})
export class SettingsMenuComponent {
    constructor(private dialog: MatDialog) { }

    openDialog(): void {
        this.dialog.open(SettingsDialogComponent);
    }
}