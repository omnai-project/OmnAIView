import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import {MAT_DIALOG_DATA, MatDialogRef, MatDialogModule} from '@angular/material/dialog';
import { MatListModule }   from '@angular/material/list';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { DeviceInformation } from './test-data.service';

@Component({
  selector: 'app-device-selection-dialog',
  template: `
    <h2 mat-dialog-title>Choose devices</h2>

    <mat-selection-list [(ngModel)]="selection">
      @for (dev of data; track dev.UUID) {
        <mat-list-option [value]="dev.UUID">
          {{ dev.UUID }}
        </mat-list-option>
      }
    </mat-selection-list>

    <div mat-dialog-actions class="mt-4">
      <button mat-button (click)="dialogRef.close()">Back</button>
      <button mat-raised-button color="primary"
              (click)="dialogRef.close(selection)"
              [disabled]="selection.length === 0">
        Connect
      </button>
    </div>
  `, 
   imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatListModule,
    MatCheckboxModule,
    MatButtonModule,
  ], 
  standalone: true
})
export class DeviceSelectionDialogComponent {
  selection: string[] = [];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: DeviceInformation[],
    public dialogRef: MatDialogRef<DeviceSelectionDialogComponent>
  ) {}
}
