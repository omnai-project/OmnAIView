import { CommonModule } from "@angular/common";
import { Component, inject } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatDialogModule } from "@angular/material/dialog";
import { MatFormField, MatInputModule } from "@angular/material/input";
import { MatDialogRef } from "@angular/material/dialog";
import { MAT_DIALOG_DATA } from "@angular/material/dialog";

@Component({
    selector: 'app-devices-settings-dialog',
    templateUrl: './devices-settings-dialog.component.html',
    imports: [MatDialogModule, MatFormField, MatInputModule, MatButtonModule, CommonModule, FormsModule]
})
export class DevicesSettingsDialogComponent {
    dialog = inject(MatDialogRef<DevicesSettingsDialogComponent>);
    data = inject(MAT_DIALOG_DATA) as { uuid: string; name: string };

    name = this.data.name;

    save() {
        console.log(this.name);
        this.dialog.close({ name: this.name });
    }
}