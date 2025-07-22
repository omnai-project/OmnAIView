import { Component, inject } from "@angular/core";
import { MatDialogModule } from "@angular/material/dialog";
import { MatIconModule } from "@angular/material/icon";
import { DataSourceSelectionService } from "./data-source-selection.service";

@Component({
    selector: 'app-save-data-button',
    standalone: true,
    imports: [MatDialogModule, MatIconModule],
    template: `
        <button mat-icon-button (click)="saveData()" aria-label="Save Data" id="save-button">
        <mat-icon>save</mat-icon>
        </button>
    `,
    styles: `button { display: flex; padding: .3em }`,
})
export class SaveDataButtonComponent {
    private readonly datasource = inject(DataSourceSelectionService);

    saveData(): void {
        if (!this.datasource.currentSource()) console.log("No datasource connected.");
        this.datasource.currentSource()?.save();
    }
}
