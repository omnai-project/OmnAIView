import {inject, Injectable, signal} from '@angular/core';
import {DataSource} from '../../source-selection/data-source-selection.service';
import {DataFormat} from '../omnai-scope-server/live-data.service';
import {MatDialog} from '@angular/material/dialog';
import {CsvFileSelectModalComponent} from './csv-file-select-modal.component';

@Injectable({
  providedIn: 'root'
})
export class CsvFileImportComponent implements DataSource {
  private readonly dialog = inject(MatDialog);
  readonly file = signal<File[]>([]);
  connect() {
    this.dialog.open(CsvFileSelectModalComponent)
  }
  readonly data = signal<Record<string, DataFormat[]>>({});
}
