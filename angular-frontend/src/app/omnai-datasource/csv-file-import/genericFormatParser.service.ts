import { Injectable } from "@angular/core";
import { FileParser, ParsedFile } from "./csv-file-import.service";
import { DataFormat } from "../omnai-scope-server/live-data.service";

/**
 * Parse files with source/version header format 
 */
@Injectable({
    providedIn: 'root'
}) 
export class genericFormatParserService implements FileParser {

    canParse(lines: string[]){
        return (
            lines.length >= 2 &&
            lines[0].startsWith('# source:') &&
            lines[1].startsWith('# version:')
        );
    }

    parse(lines: string[]): ParsedFile {
        const source = lines[0].replace('# source:', '').trim();
        const version = lines[1].replace('# version:', '').trim();
        const body = lines.slice(2);

        switch(`${source}:${version}`){
            case 'OmnAIScope-DataServer:1.1.1': 
                return this.parseScopev111(body); 
            case 'dummy data:1.0.0': 
                return this.parseDummyData(body); 
            default : 
                throw new Error ( `No parser for source registered`); 
        }
    }

    parseScopev111(body: string[]): ParsedFile {
        if (body.length < 3)
            throw new Error('OmnAI‑CSV (1.1.1) contains no data.');

        const idParts = body[0].split(',');
        if (idParts.length < 2)
            throw new Error('Header does not exist');

        const name = idParts[1].trim();          // UUID
        const SAMPLE_RATE = 100_000;            
        const keepEvery   = SAMPLE_RATE > 1_000 
            ? SAMPLE_RATE / 1_000                  
            : 1;

        const raw = body.slice(2)                // skip physical units 
                        .filter(l => l.trim().length);   // delete empty lines 

        if (raw.length === 0)
            throw new Error('No measurement values found.');

        /* CSV data has a timeshift thats needs to be calculated */ 
        const firstTimeSec = Number(raw[0].split(',')[0].trim());
        const timeShiftSec = -firstTimeSec;      

        const data: DataFormat[] = [];
        for (let i = 0; i < raw.length; i++) {
            if (i % keepEvery) continue;           

            const [tStr, vStr] = raw[i].split(',');
            const tSec  = Number(tStr.trim()) + timeShiftSec;
            const value = Number(vStr.trim());

            if (!Number.isFinite(tSec) || Number.isNaN(value)) continue;

            data.push({
            timestamp: tSec * 1000,             
            value,
            });
        }

        return { name, data };
    }

    parseDummyData(body: string[]): ParsedFile {
         if (body.length < 2) {
            throw new Error('Dummy‑CSV does not contain data');
        }

        const data: DataFormat[] = [];

        for (const line of body.slice(1)) {
            if (line.trim().length === 0) continue;  

            const [tsStr, valStr] = line.split(',');
            const timestamp = Number(tsStr.trim());
            const value      = Number(valStr.trim());

            if (!Number.isFinite(timestamp) || Number.isNaN(value)) {
            console.warn(`Line skipped (error): ${line}`);
            continue;
            }

            data.push({ timestamp, value });
        }

        return {
            name: 'dummy data', 
            data,
        };
    }
}