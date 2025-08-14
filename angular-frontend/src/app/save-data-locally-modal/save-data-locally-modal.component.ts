import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  MatDialogContent,
  MatDialogTitle,
  MatDialogModule,
  MatDialogRef
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-save-data-locally-modal',
  imports: [MatDialogContent, MatDialogTitle, MatDialogModule, MatButtonModule, MatInputModule, FormsModule, MatIcon],
  templateUrl: './save-data-locally-modal.component.html',
  styleUrl: './save-data-locally-modal.component.css'
})
export class SaveDataLocallyModalComponent {
  protected filePath: string = '';
  protected fileName: string = '';
  private dialogRef = inject(MatDialogRef);

  onFolderPicked(ev: Event) {
    const input = ev.target as HTMLInputElement;
    const f = input.files?.[0]; // first file in selected folder 
    if (!f) return;
    if (window.electronAPI) {
      const fullPath = window.electronAPI.getAbsolutePath(f);
      this.filePath = fullPath.split(/[\\/]/).slice(0, -1).join('/');
    }
  }

  onCancel(): void {
    this.dialogRef.close(); // Close dialog without data
  }
}
