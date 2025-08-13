import { Component, inject } from "@angular/core";
import { MatIconModule } from "@angular/material/icon";
import { ToolbarState, ToolbarStateManagerService } from "./toolbarStateManager.service";
import { DataSourceSelectionService } from "../source-selection/data-source-selection.service";
import { RecordingModalComponent } from "../recording-modal/recording-modal.component";
import { MatDialog } from "@angular/material/dialog";

@Component({
    selector: 'app-record-data-button',
    standalone: true,
    imports: [MatIconModule],
    template: `
        <button mat-icon-button (click)="recordData()" aria-label="Record Data" id="record-button" [disabled]="this.toolbarState.getState() === ToolbarState.STARTED || this.toolbarState.getState() === ToolbarState.RECORD">
        <mat-icon>radio_button_checked</mat-icon>
        </button>
    `,
    styles: `button { display: flex; padding: .3em }`,
})
export class RecordDataButtonComponent {
    private readonly datasource = inject(DataSourceSelectionService);
    protected readonly toolbarState = inject(ToolbarStateManagerService);
    protected ToolbarState = ToolbarState;
    private readonly dialog = inject(MatDialog);

    clearAllData(): void {
        this.datasource.availableSources().forEach((source) => {
            source.clearData();
        });
        window.dispatchEvent(new CustomEvent('clearGraphSelection'));
    }

    recordData(): void {
        if (this.toolbarState.getState() !== ToolbarState.RECORD) {
            this.clearAllData();
            const dialogRef = this.dialog.open(RecordingModalComponent, { width: '60vw' });
            dialogRef.afterClosed().subscribe(async (result: {dir: string, fileName: string, duration: number} | undefined) => {
                if (result) {
                    const {dir, fileName, duration} = result;
                    try {
                        this.toolbarState.setState(ToolbarState.RECORD);
                        await this.datasource.currentSource()?.record(dir, fileName, duration);
                        this.toolbarState.setState(ToolbarState.STOPPED);
                    } catch (error) {
                        console.error('Recording failed:', error);
                    }
                } else {
                    console.log('Recording dialog closed without starting recording.');
                }
            });
        } else {
            // Add stopping/aborting mechanism
            this.toolbarState.setState(ToolbarState.IDLE);
        }
        
    }
}
