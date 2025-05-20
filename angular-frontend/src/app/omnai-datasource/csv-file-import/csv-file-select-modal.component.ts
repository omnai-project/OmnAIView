import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogActions, MatDialogClose, MatDialogContent, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import {CsvFileImportComponent} from './csv-file-import.component';

@Component({
    selector: 'csv-file-select-modal',
    standalone: true,
    imports: [MatButtonModule, MatDialogActions, MatDialogClose, MatDialogTitle, MatDialogContent],
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './csv-file-select-modal.component.html',
})
export class CsvFileSelectModalComponent {
    private readonly csvFileDialog = inject(CsvFileImportComponent);
    private readonly dialogRef = inject(MatDialogRef<CsvFileSelectModalComponent>);
    selected(fileList)
    onFileSelected(fileList:FileList) {
      if (fileList.length > 0)
      this.csvFileDialog.file.set(event.target.)
    }
}
