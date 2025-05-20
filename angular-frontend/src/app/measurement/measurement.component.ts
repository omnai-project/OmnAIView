import { Component } from '@angular/core';
import { SettingsService } from '../source-selection/settings-for-source.service';
import { DataSourceSelectionService } from '../source-selection/data-source-selection.service';
import { OmnAIScopeDataService } from '../omnai-datasource/omnai-scope-server/live-data.service';
import { MatIconModule } from '@angular/material/icon';
import { inject } from '@angular/core';
import { MeasurementService } from './measurment-state.service';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-measurement',
  imports: [MatIconModule, MatButtonModule],
  templateUrl: './measurement.component.html',
  styleUrl: './measurement.component.css'
})
export class MeasurementComponent {
   constructor(
      private settings: SettingsService,
      private scope   : OmnAIScopeDataService   // für devices()
    ) {}

    private readonly buttonsDefault = [
      { fontIcon: "play_arrow", isActive: false, isDisabled: false},
      { fontIcon: "save", isActive: false, isDisabled: false},
      { fontIcon: "radio_button_checked", isActive: false, isDisabled: false},
      { fontIcon: "delete", isActive: false, isDisabled: false}
    ]
    private buttons = this.buttonsDefault;

    private readonly dataSourceSelection = inject(DataSourceSelectionService); 
    private readonly measurementService = inject(MeasurementService);

    // Getter to read properties of the buttons in html file
    get buttonList() {
      return this.buttons
    }
  
    startMeasurement(): void {
  
      this.measurementService.setMeasurementRunning(!this.measurementService.getMeasurementRunning()); // start stop handling 
      const source_id      = this.settings.selectedSourceId(); // gets source from the settings 
      const source  = this.dataSourceSelection.availableSources()
                         .find(s => s.id === source_id );
  
      if (!source) { console.error('No datasource found'); return; } // if no source error 
      else { 
        this.dataSourceSelection.selectSource(source);
      }
      
      let configOfUUIDS: unknown = undefined; 
  
      if (this.measurementService.getMeasurementRunning()) {
  
        if (source_id  === 'omnaiscope') {  // Create config of UUIDS from OmnAIScopes 
          const available = this.scope.devices().map(d => d.UUID); 
          const wished    = this.settings.selectedUUIDs() ?? available;
          const valid     = wished.filter(u => available.includes(u));
  
          if (!valid.length) {
            alert('Non of the chosen devices is available');
            return;
          }
          configOfUUIDS = { UUIDS: valid };        
        }
        this.dataSourceSelection.currentSource()?.connect(configOfUUIDS); // connects the sources for data 
      }
      else {
        this.stopMeasurement(); 
      }       
    }

    clickRecordButton() {
      this.buttons[2].isActive = !this.buttons[2].isActive;
      if (this.buttons[2].isActive) {
        this.buttons[2].fontIcon = "stop";
        this.buttons[0].isDisabled = true;
        this.buttons[1].isDisabled = true;
      } else {
        this.buttons[2].fontIcon = "radio_button_checked";
        this.buttons[0].isDisabled = false;
        this.buttons[1].isDisabled = false;
      }
      // Dummy function
      this.startMeasurement();
      /** @todo: implement the rest of the if clause */
      // 1. inactive:
      // Change Picogram of button to stop, disable Start and Save
        // Open window for settings (runtime, path)
        // Start or cancel
      // Clear all data in Graph
      // Show graph evolving
        // show timer when it will stop, file size
        // save data to file in batches (check if still able to save if not, abort)
        // Toast data written successfully 
      // 2. active (does record):
      // Disconnect source
      // if data is not written to file write it to file
      // change button to default state
    }

    clickStartButton() {
      this.buttons[0].isActive = !this.buttons[0].isActive;
      if (this.buttons[0].isActive) {
        this.buttons[0].fontIcon = "stop"
        this.buttons[1].isDisabled = true;
        this.buttons[2].isDisabled = true;
      } else {
        this.buttons[0].fontIcon = "play_arrow"
        this.buttons[1].isDisabled = false;
        this.buttons[2].isDisabled = false;
      }
      this.startMeasurement();
      /** @todo: implement the rest of the if clause */
      // 1. inactive:
      // Change Pictogram to stop, disable save, record
      // Show graph evolving
      // 2. active (does measure):
      // Disconnect source
      // Change pictogram to default, enable save
    }

    clickSaveButton() {
      /** @todo: implement saving window */
      // open save window for naming and saving chunk of data selected (or new selection?)
      // Save or Cancel
      // delete Graph
      this.deleteMeasurementData();
    }

    clickDeleteButton() {
      /** @todo: implement delete button with if clause */
      // 1. case record active:
      // Cancel record (Disconnect)
      // Delete file written by record if there is
      // 2. case start active:
      // disconnect source, delete measurement data
      // clear selection (?)
    }

    stopMeasurement() {
      this.measurementService.setMeasurementRunning(false);
      this.dataSourceSelection.currentSource()?.disconnect(); 
    }

    deleteMeasurementData() {
      this.measurementService.setMeasurementRunning(false);
      this.buttons = [...this.buttonsDefault];
      this.dataSourceSelection.currentSource()?.clearData();
      this.dataSourceSelection.clearSelection();
      // Clear all data (in future data selection also)
    }
}
