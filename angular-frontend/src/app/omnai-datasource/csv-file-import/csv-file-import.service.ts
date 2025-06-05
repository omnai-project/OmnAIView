import {computed, effect, inject, Injectable, signal} from '@angular/core';
import {DataSource} from '../../source-selection/data-source-selection.service';
import {DataFormat} from '../omnai-scope-server/live-data.service';
import {MatDialog} from '@angular/material/dialog';
import {CsvFileSelectModalComponent} from './csv-file-select-modal.component';

/**
 * The different errors, that can be thrown during file parsing
 */
enum CsvFileImportErrorKind {
  FileEmpty = "The file is empty.",
  InvalidHeader = "The header of the File is malformed",
  InvalidSamplingSpeed = "The sampling speed could not be parsed.",
}

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

  /**
   * Processes file content and transforms it into a record entry.
   * If parsing goes wrong a {@link CsvFileImportErrorKind} is thrown.
   *
   * @param file File to be parsed
   * @throws CsvFileImportErrorKind
   * @private
   */
  private async processFile(file: File):Promise<{name: string, out: DataFormat[]}> {
    let text = await file.text();
    let lines = text.split('\n');
    if (lines.length < 1) throw CsvFileImportErrorKind.FileEmpty;

    let info = lines[0].split(',');
    if (info.length != 6) throw CsvFileImportErrorKind.InvalidHeader;

    let samplingSpeed = Number(info[5]);
    if (Number.isNaN(samplingSpeed) || !Number.isFinite(samplingSpeed))
      throw CsvFileImportErrorKind.InvalidSamplingSpeed;

    let keepEvery = 1;
    let length = (lines.length-1);
    if (samplingSpeed > 1000) {
      keepEvery = samplingSpeed/1000;
      length = length/keepEvery
    }

    let name = info[4];

    let out = new Array(Math.ceil(length/samplingSpeed*1000));
    let arrayIndex = 0;
    for (let [index, sample] of lines.slice(1).entries()) {
      if (keepEvery !== 0 && index % keepEvery !== 0) continue;
      out[arrayIndex++] = {
        timestamp: index/samplingSpeed*1000,
        value: Number(sample),
      };
    }
    return {
      name,
      out,
    };
  }
  private readonly dataFileChanged = effect(async ()=>{
    let files = this.files();
    let data: Record<string, DataFormat[]> = {};
    for (let file of files) {
      try {
        let {name, out} = await this.processFile(file);
        data[name] = out;
      } catch (e) {
        console.error(`There was an error, whilst parsing the file '${file.name}'. The file will be ignored. Error: ${e}`);
      }
    }
    this.$data.set(data);
  });
}
