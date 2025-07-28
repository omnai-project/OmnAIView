import { Injectable } from "@angular/core";
import { FileParser } from "./csv-file-import.service";
import { ParsedFile } from "./csv-file-import.service";
import { CsvFileImportErrorKind } from "./csv-file-import.service";
/**
 * Parse files from old OmnAIView C++ Software 
 */
@Injectable({
    providedIn: 'root'
})
export class OldFormatParseService implements FileParser {
    canParse(lines: string[]) {
        return lines.length > 0 && lines[0].split(',').length === 6;
    }

     /**
     * Processes file content and transforms it into a record entry.
     * If parsing goes wrong a {@link CsvFileImportErrorKind} is thrown.
     *
     * @param lines lines to be parsed 
     * @throws CsvFileImportErrorKind
     * @private
      */

    parse(lines: string[]): ParsedFile {
        if (lines.length < 1) throw CsvFileImportErrorKind.FileEmpty;

        //The header of a file should be formed of 6 comma-seperated values:
        //name,vin,kilometers,manufacturer,id,sampleRate
        let info = lines[0].split(',');
        if (info.length != 6) throw CsvFileImportErrorKind.InvalidHeader;

        //sampleRate is the 5th index in the list above
        //name should be the id, which is the 4th index
        let name = info[4];
        let sampleRate = Number(info[5]);
        if (Number.isNaN(sampleRate) || !Number.isFinite(sampleRate))
        throw CsvFileImportErrorKind.InvalidSamplingSpeed;

        //Internally the Graph render converts everything to Date object.
        //The Date object constructor takes a number and interprets it as milliseconds since the Unix Epoch.
        //Therefore, the Date object cannot represent any timepoint, that doesn't lie exactly on one millisecond.
        //
        //This code calculates how many different millisecond values we can represent (length) and which items represent those milliseconds (keepEvery).
        let keepEvery = 1;
        let length = (lines.length-1);
        if (sampleRate > 1000) {
        keepEvery = sampleRate/1000;
        length = Math.ceil(length/sampleRate*1000);
        }

        //Pre-allocating the array, when you know the size is good practice.
        //It makes it, so that data doesn't need to be moved, whilst adding more data
        let out = new Array(length);
        let arrayIndex = 0;

        // keep only every 1 data-value of keepEvery
        // the first line is the header of the file, so we need to skip it
        for (let [index, sample] of lines.slice(1).entries()) {
        if (keepEvery !== 0 && index % keepEvery !== 0) continue;
        out[arrayIndex++] = {
            timestamp: index/sampleRate*1000,
            value: Number(sample),
        };
        }

        return {
        name,
        data: out,
        };   
    }

}