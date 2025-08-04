
import { Component, inject } from '@angular/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { DataSourceSelectionService } from '../source-selection/data-source-selection.service';
import { SourceSelectModalComponent } from '../source-selection/source-select-modal.component';
import { MatIconModule } from '@angular/material/icon';
import { AdvancedModeService } from '../advanced-mode/advanced-mode.service';
import { ToolbarState, ToolbarStateManagerService } from './toolbarStateManager.service';

@Component({
    selector: 'app-start-data-button',
    standalone: true,
    imports: [MatDialogModule, MatIconModule],
    template: `
        <button mat-icon-button (click)="toggleStartButton()" aria-label="Start Data" id="start-button" [disabled]="this.toolbarState.getState() === ToolbarState.RECORD">
        <mat-icon>{{ (this.toolbarState.getState() === ToolbarState.STARTED ) ? 'stop' : 'play_arrow' }}</mat-icon>
        </button>
    `,
    styles: `button { display: flex; padding: .3em }`,
})
export class StartDataButtonComponent {
    private readonly dialog = inject(MatDialog);
    private readonly datasource = inject(DataSourceSelectionService);
    private readonly advancedMode = inject(AdvancedModeService);
    protected readonly toolbarState = inject(ToolbarStateManagerService);
    ToolbarState = ToolbarState;

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
                    this.toolbarState.setState(ToolbarState.STARTED);
                    this.datasource.currentSource()?.connect();
                }
                else this.toolbarState.setState(ToolbarState.IDLE);
            });
            return;
        }
        else {
            const OmnAIScope = this.datasource.availableSources().find(s => s.id === 'omnaiscope');
            if (OmnAIScope) {
                this.datasource.selectSource(OmnAIScope);
                OmnAIScope.connect();
                this.toolbarState.setState(ToolbarState.STARTED);
            }
        }
    }

    stopMeasurement(): void {
        this.datasource.currentSource()?.disconnect();
    }

    toggleStartButton(): void {
        switch (this.toolbarState.getState()) {
            case ToolbarState.IDLE: // fall through on purpose  
            case ToolbarState.STOPPED:
                this.openModal();
                break;
            case ToolbarState.STARTED:
                this.stopMeasurement();
                this.toolbarState.setState(ToolbarState.STOPPED);
                break;
        }
    }
}
