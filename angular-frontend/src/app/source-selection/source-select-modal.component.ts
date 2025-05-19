import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogActions, MatDialogClose, MatDialogContent, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { type DataSourceInfo, DataSourceSelectionService } from './data-source-selection.service';

import { ReactiveFormsModule } from '@angular/forms';

import {MatStepperModule} from '@angular/material/stepper';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule, MatCheckboxChange} from '@angular/material/checkbox'; 

import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { OmnAIScopeDataService } from '../omnai-datasource/omnai-scope-server/live-data.service';
import { SettingsService } from './settings-for-source.service';

@Component({
    selector: 'app-source-select-modal',
    standalone: true,
    imports: [MatButtonModule, MatDialogActions, MatDialogClose, MatDialogTitle, MatDialogContent, MatStepperModule, MatFormFieldModule, MatSelectModule, MatInputModule, ReactiveFormsModule, MatCheckboxModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './source-select-modal.component.html',
    styleUrls: ['./source-select-modal.component.css']
})
export class SourceSelectModalComponent {
    private readonly datasourceService = inject(DataSourceSelectionService);
    private settings = inject(SettingsService); 

    readonly sources = this.datasourceService.availableSources;
    readonly selected = this.datasourceService.currentSource;

    readonly #deviceHandler = inject(OmnAIScopeDataService); 
    devices = this.#deviceHandler.devices; 

    private fb = inject(FormBuilder); 
    step1Form!: FormGroup; 
    step2Form!: FormGroup; 
    
    constructor(){
        this.step1Form = this.fb.group({
            source:[null, Validators.required]
        }); 
        this.step2Form = this.fb.group({
            selectedUUIDs: this.fb.control([], Validators.required)
        }); 
    }

    private readonly dialogRef = inject(MatDialogRef<SourceSelectModalComponent>);
    onSourceSelected(source: DataSourceInfo) {
        this.datasourceService.selectSource(source);
    }

    select(source: DataSourceInfo) {
        this.datasourceService.selectSource(source);
    }

    clear() {
        this.datasourceService.clearSelection();
    }

    get isOmnAIScopeSelected(){
        return this.datasourceService.currentSource()?.id === "omnaiscope"; 
    }

    onCheckboxChange(event: MatCheckboxChange, uuid:string): void {
        const selected = this.step2Form.get('selectedUUIDs')?.value as string []; 

        if(event.checked) {
            this.step2Form.patchValue({ selectedUUIDs: [...selected, uuid]}); 
        }
        else {
            this.step2Form.patchValue({selectedUUIDs: selected.filter(id => id !== uuid)}); 
        }

        this.step2Form.get('selectedUUIDs')?.updateValueAndValidity(); 
    }

    save(): void {
        // save source 
        const source: DataSourceInfo | null =
        this.step1Form.get('source')?.value ?? null;

        if (!source) {                              
        console.warn('No datasource was chosen');
        return;
        }
        this.settings.setSource(source.id);           

        // save UUID List 
        if (source.id === 'omnaiscope') {
        const uuids: string[] = this.step2Form.get('selectedUUIDs')?.value ?? [];
        this.settings.setUUIDs(uuids.length ? uuids : null);
        } else {
        this.settings.setUUIDs(null);
        }

        this.dialogRef.close();
  }

}
