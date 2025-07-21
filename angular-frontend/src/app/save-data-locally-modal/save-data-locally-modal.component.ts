import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { 
  MatDialogContent, 
  MatDialogTitle,
  MatDialogModule, 
  MatDialogRef} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-save-data-locally-modal',
  imports: [MatDialogContent, MatDialogTitle, MatDialogModule, MatButtonModule, MatInputModule, FormsModule],
  templateUrl: './save-data-locally-modal.component.html',
  styleUrl: './save-data-locally-modal.component.css'
})
export class SaveDataLocallyModalComponent {
  protected filePath: string = '';
  protected fileName: string = '';
  private dialogRef = inject(MatDialogRef);

  onCancel(): void {
    this.dialogRef.close(); // Close dialog without data
  }
}
