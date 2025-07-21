
import { Component, inject } from '@angular/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { DataSourceSelectionService } from './data-source-selection.service';
import { SourceSelectModalComponent } from './source-select-modal.component';
import { MatIconModule } from '@angular/material/icon';
import { AdvancedModeService } from '../advanced-mode/advanced-mode.service';

@Component({
    selector: 'app-start-data-button',
    standalone: true,
    imports: [MatDialogModule, MatIconModule],
    template: `
        <button mat-icon-button (click)="toggleStartButton()" aria-label="Start Data" id="start-button">
        <mat-icon>{{ measurementIsStarted ? 'stop' : 'play_arrow' }}</mat-icon>
        </button>
    `,
    styles: `button { display: flex; padding: .3em }`,
})
export class StartDataButtonComponent {
    private readonly dialog = inject(MatDialog);
    private readonly datasource = inject(DataSourceSelectionService);
    private readonly advancedMode = inject(AdvancedModeService);

    protected measurementIsStarted: boolean = false;

    clearAllData(): void {
        this.datasource.availableSources().forEach((source) => {
            source.clearData();
        });
    }

    openModal(): void {
        this.clearAllData();
        if (this.advancedMode.enabled()) {
            const dialogRef = this.dialog.open(SourceSelectModalComponent, {
                width: '60vw'
            });
            dialogRef.afterClosed().subscribe(() => {
                if (this.datasource.hasSelection()) {
                    this.datasource.currentSource()?.connect();
                }
            });
            return;
        }
        else {
            const OmnAIScope = this.datasource.availableSources().find(s => s.id === 'omnaiscope');
            if (OmnAIScope) {
                this.datasource.selectSource(OmnAIScope);
                OmnAIScope.connect();
            }
        }
    }

    stopMeasurement(): void {
        this.datasource.currentSource()?.disconnect();
    }

    toggleStartButton(): void {
        this.measurementIsStarted ? this.stopMeasurement() : this.openModal();
        this.measurementIsStarted = !this.measurementIsStarted;
    }
}
