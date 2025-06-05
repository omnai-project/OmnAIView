import {computed, effect, inject, Injectable, signal} from '@angular/core';
import {DataSource} from '../../source-selection/data-source-selection.service';
import {DataFormat} from '../omnai-scope-server/live-data.service';
import {MatDialog} from '@angular/material/dialog';
import {CsvFileSelectModalComponent} from './csv-file-select-modal.component';

@Injectable({
  providedIn: 'root'
})
export class CsvFileImportService implements DataSource {
  private readonly dialog = inject(MatDialog);
  readonly files = signal<File[]>([]);
  connect() {
    this.dialog.open(CsvFileSelectModalComponent)
  }
  private readonly $data = signal<Record<string, DataFormat[]>>({});
  readonly data = this.$data.asReadonly();

  private async processFile() {
    const files = this.files();
    let out:Record<string, DataFormat[]> = {};
    for(let file of files) {
      let text = await file.text();
      let lines = text.split('\n');
      if (lines.length < 1) continue;

      let info = lines[0].split(',');
      if (info.length != 6) continue;

      let samplingSpeed = Number(info[5]);
      let keepEvery = 1;
      let length = (lines.length-1);
      if (samplingSpeed > 1000) {
        keepEvery = samplingSpeed/1000;
        length = length/keepEvery
      }

      let name = info[4];

      out[name] = new Array(Math.ceil(length/samplingSpeed*1000));
      let arrayIndex = 0;
      for (let [index, sample] of lines.slice(1).entries()) {
        if (keepEvery !== 0 && index % keepEvery !== 0) continue;
        out[name][arrayIndex++] = {
          timestamp: index/samplingSpeed*1000,
          value: Number(sample),
        };
      }
    }
    this.$data.set(out);
  }
  private readonly dataFileChanged = effect(this.processFile.bind(this));
}
