
import { Component, inject } from '@angular/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { DataSourceSelectionService } from './data-source-selection.service';
import { SourceSelectModalComponent } from './source-select-modal.component';
import { MatIconModule } from '@angular/material/icon';


@Component({
    selector: 'app-start-data-button',
    standalone: true,
    imports: [MatDialogModule, MatIconModule],
    template: `
    <button mat-icon-button (click)="openModal()" aria-label="Start Data">
      <mat-icon>play_arrow</mat-icon>
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

        dialogRef.afterClosed().subscribe(() => {
            if (this.datasource.hasSelection()) {
                // This should always be true as hasSelection is true when current Source is set
                this.datasource.currentSource()?.connect();
            }
        });
    }
}
