import { Component } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialogContent } from '@angular/material/dialog';
/**
 * Progressspinner running on indeterminate printing "Saving file ..." as long as opened 
 */
@Component({
    selector: 'app-download-progress',
    imports: [MatProgressSpinnerModule, MatDialogContent],
    styleUrls: ['./downloadProgress.component.css'],
    template: `
    <mat-dialog-content class="center-content">
      <p>Saving file ...</p>
      <mat-spinner diameter="44" mode="indeterminate"></mat-spinner>
    </mat-dialog-content>
  `
})
export class DownloadProgressComponent { }
