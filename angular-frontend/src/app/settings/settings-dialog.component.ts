import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatDividerModule } from '@angular/material/divider';
import { FontSizeService, FontSizeLevel } from '../services/font-size.service';

@Component({
    selector: 'app-settings-dialog',
    standalone: true,
    imports: [
        CommonModule,
        MatDialogModule, 
        MatButtonModule,
        MatTabsModule,
        MatIconModule,
        MatButtonToggleModule,
        MatDividerModule
    ],
    template: `
        <h1 mat-dialog-title>
            <mat-icon>settings</mat-icon>
            Settings
        </h1>

        <mat-dialog-content class="settings-content">
            <mat-tab-group>
                <!-- Appearance Tab -->
                <mat-tab>
                    <ng-template mat-tab-label>
                        <mat-icon class="tab-icon">text_fields</mat-icon>
                        Darstellung
                    </ng-template>
                    
                    <div class="tab-content">
                        <!-- Font Size Section -->
                        <div class="settings-section">
                            <h3>Schriftgröße</h3>
                            <p class="section-description">
                                Passen Sie die Textgröße an Ihre Bedürfnisse an
                            </p>
                            
                            <mat-button-toggle-group 
                                [value]="fontSizeService.currentFontSize()" 
                                (change)="onFontSizeChange($event.value)"
                                class="font-size-toggles">
                                
                                <mat-button-toggle 
                                    *ngFor="let option of fontSizeOptions" 
                                    [value]="option.level">
                                    <div class="font-option">
                                        <span class="font-label">{{ option.label }}</span>
                                        <small class="font-percentage">{{ (option.scale * 100) }}%</small>
                                    </div>
                                </mat-button-toggle>
                            </mat-button-toggle-group>

                            <!-- Font Size Preview -->
                            <div class="font-preview">
                                <h4>Vorschau</h4>
                                <div class="preview-content">
                                    <p class="preview-measurement">12.34 V</p>
                                    <p class="preview-normal">Beispieltext in gewählter Schriftgröße</p>
                                    <small class="preview-small">Kleine Beschriftungen</small>
                                </div>
                            </div>
                        </div>

                        <mat-divider></mat-divider>

                        <!-- Language Section (Placeholder) -->
                        <div class="settings-section">
                            <h3>Sprache</h3>
                            <p class="section-description">
                                Spracheinstellungen (wird in zukünftiger Version implementiert)
                            </p>
                        </div>
                    </div>
                </mat-tab>

                <!-- Measurement Tab -->
                <mat-tab>
                    <ng-template mat-tab-label>
                        <mat-icon class="tab-icon">timeline</mat-icon>
                        Messung
                    </ng-template>
                    
                    <div class="tab-content">
                        <div class="settings-section">
                            <h3>Messeinstellungen</h3>
                            <p class="section-description">
                                Konfiguration für Abtastrate und Messparameter (zukünftige Implementierung)
                            </p>
                        </div>
                    </div>
                </mat-tab>
            </mat-tab-group>
        </mat-dialog-content>

        <mat-dialog-actions align="end">
            <button mat-button (click)="resetFontSize()" [disabled]="isDefaultFontSize()">
                <mat-icon>refresh</mat-icon>
                Zurücksetzen
            </button>
            <button mat-button mat-dialog-close>
                <mat-icon>close</mat-icon>
                Schließen
            </button>
        </mat-dialog-actions>
    `,
    styles: [`
        .settings-content {
            width: 600px;
            max-width: 90vw;
            height: auto;
            max-height: none;
            overflow: visible;
        }

        .tab-icon {
            margin-right: 8px;
        }

        .tab-content {
            padding: 20px;
            overflow: visible;
        }

        .settings-section {
            margin: 20px 0;
        }

        .settings-section h3 {
            margin: 0 0 8px 0;
            color: var(--mat-sys-primary);
            font-size: var(--font-size-large);
        }

        .section-description {
            margin: 0 0 16px 0;
            color: var(--mat-sys-on-surface-variant);
            font-size: var(--font-size-small);
        }

        .font-size-toggles {
            width: 100%;
            margin: 16px 0;
        }

        .font-size-toggles .mat-button-toggle {
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

        .font-preview {
            margin: 20px 0;
            padding: 16px;
            border: 1px solid var(--mat-sys-outline-variant);
            border-radius: 8px;
            background: var(--mat-sys-surface-variant);
        }

        .font-preview h4 {
            margin: 0 0 12px 0;
            color: var(--mat-sys-on-surface-variant);
        }

        .preview-content {
            display: flex;
            flex-direction: column;
            gap: 8px;
        }

        .preview-measurement {
            font-size: var(--font-size-xl);
            font-weight: 500;
            color: var(--mat-sys-primary);
            font-family: monospace;
            margin: 0;
        }

        .preview-normal {
            font-size: var(--font-size-base);
            margin: 0;
        }

        .preview-small {
            font-size: var(--font-size-small);
            opacity: 0.8;
        }

        mat-dialog-title mat-icon {
            margin-right: 8px;
        }

        mat-dialog-actions button mat-icon {
            margin-right: 4px;
        }

        /* Responsive adjustments */
        @media (max-width: 768px) {
            .settings-content {
                width: 95vw;
            }

            .font-size-toggles {
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
export class SettingsDialogComponent {
    fontSizeService = inject(FontSizeService);
    
    fontSizeOptions = this.fontSizeService.getFontSizeOptions();

    onFontSizeChange(level: FontSizeLevel): void {
        this.fontSizeService.setFontSize(level);
    }

    resetFontSize(): void {
        this.fontSizeService.setFontSize(FontSizeLevel.MEDIUM);
    }

    isDefaultFontSize(): boolean {
        return this.fontSizeService.getFontSize() === FontSizeLevel.MEDIUM;
    }
}