import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { GraphSelectionService } from '../graph-selection.service';

/**
 * Toggle button component for enabling/disabling graph selection mode
 * Supports mouse, touch, and stylus interactions
 */
@Component({
  selector: 'app-selection-toggle',
  standalone: true,
  imports: [MatButtonModule, MatIconModule],
  template: `
    <button mat-fab 
            class="selection-toggle"
            (click)="selectionService.toggleSelectionMode()"
            [class.active]="selectionService.isSelectionMode()"
            [attr.title]="selectionService.isSelectionMode() ? 'Disable selection' : 'Enable area selection'">
      <mat-icon>crop_free</mat-icon>
    </button>
  `,
  styleUrls: ['./selection-toggle.component.css']
})
export class SelectionToggleComponent {
  readonly selectionService = inject(GraphSelectionService);
}