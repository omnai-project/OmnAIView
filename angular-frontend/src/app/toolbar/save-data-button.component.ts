import { Component, inject } from "@angular/core";
import { MatDialogModule } from "@angular/material/dialog";
import { MatIconModule } from "@angular/material/icon";
import { DataSourceSelectionService } from "../source-selection/data-source-selection.service";
import { ToolbarState, ToolbarStateManagerService } from "./toolbarStateManager.service";

@Component({
    selector: 'app-save-data-button',
    standalone: true,
    imports: [MatDialogModule, MatIconModule],
    template: `
        <button mat-icon-button (click)="saveData()" aria-label="Save Data" id="save-button" [disabled]="this.toolbarState.getState() !== ToolbarState.STOPPED">
        <mat-icon>save</mat-icon>
        </button>
    `,
    styles: `button { display: flex; padding: .3em }`,
})
export class SaveDataButtonComponent {
    private readonly datasource = inject(DataSourceSelectionService);
    protected readonly toolbarState = inject(ToolbarStateManagerService);
    protected ToolbarState = ToolbarState;

    saveData(): void {
        if (!this.datasource.currentSource()) console.log("No datasource connected.");
        this.datasource.currentSource()?.save();
    }
}
