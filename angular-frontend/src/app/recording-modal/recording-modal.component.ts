import { Component, inject } from '@angular/core';
import { DataSourceInfo, DataSourceSelectionService } from '../source-selection/data-source-selection.service';
import { MatDialogContent, MatDialogModule, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select'
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-recording-modal',
  imports: [MatDialogContent, MatDialogTitle, MatDialogModule, MatButtonModule, MatInputModule, FormsModule, MatSelectModule, MatIconModule],
  templateUrl: './recording-modal.component.html',
  styleUrl: './recording-modal.component.css'
})
export class RecordingModalComponent {
  private readonly datasourceService = inject(DataSourceSelectionService);
  protected readonly sources = this.datasourceService.availableSources;
  protected readonly selected = this.datasourceService.currentSource;
  protected filePath = '';
  protected fileName = '';
  protected duration: number | null = null;
  private dialogRef = inject(MatDialogRef);
  protected readonly selectedName = this.selected()?.name ?? '' ;

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

  select(source: DataSourceInfo) {
      this.datasourceService.selectSource(source);
  }

}
