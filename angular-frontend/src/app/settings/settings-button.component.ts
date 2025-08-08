import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { SettingsModalService } from './settings-modal.service';

@Component({
  selector: 'app-settings-button',
  standalone: true,
  imports: [
    MatButtonModule,
    MatIconModule,
    MatTooltipModule
  ],
  template: `
    <button 
      mat-icon-button 
      (click)="openSettings()" 
      matTooltip="Einstellungen öffnen"
      matTooltipPosition="below"
      aria-label="Einstellungen öffnen"
      class="settings-button">
      <mat-icon>settings</mat-icon>
    </button>
  `,
  styles: [`
    .settings-button {
      color: var(--mat-sys-on-surface);
      transition: all 0.2s ease-in-out;
    }

    .settings-button:hover {
      background-color: var(--mat-sys-primary-container);
      color: var(--mat-sys-on-primary-container);
    }

    .settings-button:hover mat-icon {
      transform: rotate(45deg);
    }

    .settings-button mat-icon {
      transition: transform 0.2s ease-in-out;
    }

    /* Dark theme adjustments */
    .dark-theme .settings-button {
      color: var(--mat-sys-on-surface);
    }

    .dark-theme .settings-button:hover {
      background-color: var(--mat-sys-primary-container);
      color: var(--mat-sys-on-primary-container);
    }
  `]
})
export class SettingsButtonComponent {
  private settingsModalService = inject(SettingsModalService);

  openSettings(): void {
    this.settingsModalService.openSettings();
  }
}