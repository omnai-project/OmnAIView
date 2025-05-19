import { Component } from '@angular/core';
import { SettingsService } from '../source-selection/settings-for-source.service';
import { DataSourceSelectionService } from '../source-selection/data-source-selection.service';
import { OmnAIScopeDataService } from '../omnai-datasource/omnai-scope-server/live-data.service';
import { MatIconModule } from '@angular/material/icon';
import { inject } from '@angular/core';
import { MeasurementService } from './measurment-state.service';

@Component({
  selector: 'app-measurement',
  imports: [MatIconModule],
  templateUrl: './measurement.component.html',
  styleUrl: './measurement.component.css'
})
export class MeasurementComponent {
   constructor(
      private settings: SettingsService,
      private scope   : OmnAIScopeDataService   // für devices()
    ) {}

    private readonly dataSourceSelection = inject(DataSourceSelectionService); 
    private readonly measurementService = inject(MeasurementService);
  
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
  
      if(this.measurementService.getMeasurementRunning()){
  
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

    stopMeasurement(){
      this.measurementService.setMeasurementRunning(false);
      this.dataSourceSelection.currentSource()?.disconnect(); 
    }

    deleteMeasurementData() {
    this.measurementService.setMeasurementRunning(false);
    this.dataSourceSelection.currentSource()?.clearData();
    this.dataSourceSelection.clearSelection();
    // Clear all data (in future data selection also)
    }
}
