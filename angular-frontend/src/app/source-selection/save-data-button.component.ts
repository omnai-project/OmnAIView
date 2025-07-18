import { Component } from "@angular/core";
import { MatDialogModule } from "@angular/material/dialog";
import { MatIconModule } from "@angular/material/icon";


@Component({
    selector: 'app-save-data-button',
    standalone: true,
    imports: [MatDialogModule, MatIconModule],
    template: `
        <button mat-icon-button (click)="toggleSaveButton()" aria-label="Save Data" id="save-button">
        <mat-icon>save</mat-icon>
        </button>
    `,
    styles: `button { display: flex; padding: .3em }`,
})
export class SaveDataButtonComponent {

    toggleSaveButton(): void {

    }
    
}