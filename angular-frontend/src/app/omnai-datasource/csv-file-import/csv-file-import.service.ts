import {computed, effect, inject, Injectable, signal} from '@angular/core';
import {DataSource} from '../../source-selection/data-source-selection.service';
import {DataFormat} from '../omnai-scope-server/live-data.service';
import {MatDialog} from '@angular/material/dialog';
import {CsvFileSelectModalComponent} from './csv-file-select-modal.component';
import { OldFormatParseService } from './oldFormatParser.service';
import { genericFormatParserService } from './genericFormatParser.service';

/**
 * The different errors, that can be thrown during file parsing
 */
export enum CsvFileImportErrorKind {
  FileEmpty = "The file is empty.",
  InvalidHeader = "The header of the File is malformed",
  InvalidSamplingSpeed = "The sampling speed could not be parsed.",
}

export interface ParsedFile{
  name: string; 
  data: DataFormat[]; 
}
export interface FileParser {
  canParse(lines: string[]): boolean; 
  parse(lines: string[]): ParsedFile; 
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
  disconnect(): void { }
  clearData(): void { }
  save(): void {}
  record(): void {}
  private readonly $data = signal<Record<string, DataFormat[]>>({});
  readonly data = this.$data.asReadonly();

  private readonly oldParser = inject(OldFormatParseService); 
  private readonly generalParser = inject(genericFormatParserService); 

  private readonly parsers: FileParser[] = [
    this.oldParser, 
    this.generalParser
  ]; 

  private async processFile(file: File): Promise<ParsedFile> {
    const lines = (await file.text()).split(/\r?\n/);

    for (const p of this.parsers) {
      if (p.canParse(lines)) return p.parse(lines);
    }
    throw new Error('No suitable parser found');
  }


  private readonly dataFileChanged = effect(async ()=>{
    let files = this.files();
    let result: Record<string, DataFormat[]> = {};
    for (let file of files) {
      try {
        let {name, data} = await this.processFile(file);
        result[name] = data;
      } catch (e) {
        console.error(`There was an error, whilst parsing the file '${file.name}'. The file will be ignored. Error: ${e}`);
      }
    }
    this.$data.set(result);
  });
}
