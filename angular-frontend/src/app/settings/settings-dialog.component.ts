import { Component } from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

@Component({
    selector: 'app-settings-dialog',
    standalone: true,
    imports: [MatDialogModule, MatButtonModule],
    template: `
    <h1 mat-dialog-title>Settings</h1>

    <mat-dialog-content>
      <p>Select Language</p>
      <p>Select Font-Size</p>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Close</button>
    </mat-dialog-actions>
  `,
})
export class SettingsDialogComponent { }
