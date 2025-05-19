import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { DataSourceSelectionService } from './data-source-selection.service';
import { SourceSelectModalComponent } from './source-select-modal.component';
import { MatButtonModule } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';

@Component({
    selector: 'app-start-data-button',
    standalone: true,
    imports: [CommonModule, MatDialogModule, MatIcon],
    styleUrls:['./start-data-from-source.component.css'],
    template: `
    <button mat-raised-button class ="settings-button" color="accent" (click)="openModal()" >
        <mat-icon>settings</mat-icon> <span>Settings</span>
    </button>
  `
})
export class StartDataButtonComponent {
    private readonly dialog = inject(MatDialog);
    private readonly datasource = inject(DataSourceSelectionService);

    openModal() {
        const dialogRef = this.dialog.open(SourceSelectModalComponent, {
            width: '60vw'
        });
    }
}
