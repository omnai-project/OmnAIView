import { Injectable } from "@angular/core";
import { signal } from "@angular/core";

/**
 * @todo settings service that sets the default source and uuids or the user wish for source and uuids 
 */

@Injectable({ providedIn:'root' })
export class SettingsService {
  readonly selectedSourceId = signal<string>('dummydata');
  readonly selectedUUIDs    = signal<string[]|null>(null);

  setSource(id:string)        { this.selectedSourceId.set(id); }
  setUUIDs(uuids:string[]|null){ this.selectedUUIDs.set(uuids); }
  reset()                     { this.selectedSourceId.set('dummydata');
                                this.selectedUUIDs.set(null); }
}