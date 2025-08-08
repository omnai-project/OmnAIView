import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatSliderModule } from '@angular/material/slider';
import { MatDividerModule } from '@angular/material/divider';
import { FontSizeService, FontSizeLevel } from '../services/font-size.service';

@Component({
  selector: 'app-font-size-settings',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatIconModule,
    MatCardModule,
    MatSliderModule,
    MatDividerModule
  ],
  template: `
    <mat-card class="font-size-settings-card">
      <mat-card-header>
        <mat-card-title>
          <mat-icon>text_fields</mat-icon>
          Schriftgröße
        </mat-card-title>
        <mat-card-subtitle>
          Passen Sie die Textgröße an Ihre Bedürfnisse an
        </mat-card-subtitle>
      </mat-card-header>

      <mat-card-content>
        <!-- Font Size Toggle Buttons -->
        <div class="font-size-options">
          <mat-button-toggle-group 
            [value]="fontSizeService.currentFontSize()" 
            (change)="onFontSizeChange($event.value)"
            aria-label="Schriftgröße auswählen">
            
            <mat-button-toggle 
              *ngFor="let option of fontSizeOptions" 
              [value]="option.level"
              [attr.aria-label]="option.label + ' (' + (option.scale * 100) + '%)'">
              <div class="font-option">
                <span class="font-label">{{ option.label }}</span>
                <small class="font-percentage">{{ (option.scale * 100) }}%</small>
              </div>
            </mat-button-toggle>
          </mat-button-toggle-group>
        </div>

        <mat-divider class="settings-divider"></mat-divider>

        <!-- Preview Section -->
        <div class="font-preview">
          <h4>Vorschau</h4>
          <div class="preview-content">
            <p class="preview-title">Messwert-Anzeige</p>
            <p class="preview-measurement">12.34 V</p>
            <p class="preview-normal">
              Dies ist ein Beispieltext zur Demonstration der gewählten Schriftgröße. 
              Die Einstellung wird auf alle Textelemente der Anwendung angewendet.
            </p>
            <small class="preview-small">Kleine Beschriftungen und Hinweise</small>
          </div>
        </div>

        <!-- Current Settings Info -->
        <div class="current-settings">
          <mat-icon>info</mat-icon>
          <span>
            Aktuelle Einstellung: 
            <strong>{{ getCurrentFontSizeLabel() }}</strong> 
            ({{ (fontSizeService.getCurrentScale() * 100) | number:'1.0-0' }}%)
          </span>
        </div>
      </mat-card-content>

      <mat-card-actions align="end">
        <button mat-button (click)="resetToDefault()" [disabled]="isDefaultSize()">
          <mat-icon>refresh</mat-icon>
          Zurücksetzen
        </button>
      </mat-card-actions>
    </mat-card>
  `,
  styles: [`
    .font-size-settings-card {
      max-width: 600px;
      margin: 16px auto;
    }

    .font-size-options {
      margin: 16px 0;
    }

    .mat-button-toggle-group {
      width: 100%;
    }

    .mat-button-toggle {
      flex: 1;
    }

    .font-option {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 8px;
    }

    .font-label {
      font-weight: 500;
      margin-bottom: 4px;
    }

    .font-percentage {
      opacity: 0.7;
      font-size: 0.8em;
    }

    .settings-divider {
      margin: 24px 0;
    }

    .font-preview {
      margin: 16px 0;
      padding: 16px;
      border: 1px solid var(--mat-sys-outline-variant);
      border-radius: 8px;
      background: var(--mat-sys-surface-variant);
    }

    .font-preview h4 {
      margin: 0 0 16px 0;
      color: var(--mat-sys-on-surface-variant);
    }

    .preview-content {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .preview-title {
      font-size: var(--font-size-large);
      font-weight: 600;
      margin: 0;
      color: var(--mat-sys-primary);
    }

    .preview-measurement {
      font-size: var(--font-size-xl);
      font-weight: 500;
      margin: 0;
      color: var(--mat-sys-secondary);
      font-family: monospace;
    }

    .preview-normal {
      font-size: var(--font-size-base);
      margin: 0;
      line-height: 1.5;
    }

    .preview-small {
      font-size: var(--font-size-small);
      opacity: 0.8;
    }

    .current-settings {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-top: 16px;
      padding: 12px;
      background: var(--mat-sys-primary-container);
      color: var(--mat-sys-on-primary-container);
      border-radius: 8px;
    }

    .current-settings mat-icon {
      color: var(--mat-sys-primary);
    }

    mat-card-header mat-icon {
      margin-right: 8px;
    }

    mat-card-actions button mat-icon {
      margin-right: 4px;
    }

    /* Responsive adjustments */
    @media (max-width: 600px) {
      .font-size-settings-card {
        margin: 8px;
      }

      .mat-button-toggle-group {
        flex-direction: column;
      }

      .font-option {
        flex-direction: row;
        justify-content: space-between;
        padding: 12px 16px;
      }
    }
  `]
})
export class FontSizeSettingsComponent {
  fontSizeService = inject(FontSizeService);
  
  fontSizeOptions = this.fontSizeService.getFontSizeOptions();

  onFontSizeChange(level: FontSizeLevel): void {
    this.fontSizeService.setFontSize(level);
  }

  getCurrentFontSizeLabel(): string {
    const currentLevel = this.fontSizeService.getFontSize();
    const option = this.fontSizeOptions.find(opt => opt.level === currentLevel);
    return option?.label || 'Unbekannt';
  }

  resetToDefault(): void {
    this.fontSizeService.setFontSize(FontSizeLevel.MEDIUM);
  }

  isDefaultSize(): boolean {
    return this.fontSizeService.getFontSize() === FontSizeLevel.MEDIUM;
  }
}