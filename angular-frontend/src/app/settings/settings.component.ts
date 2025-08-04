import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { DarkmodeComponent } from '../darkmode/darkmode.component';
import { FontSizeSettingsComponent } from './font-size-settings.component';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    CommonModule,
    MatTabsModule,
    MatIconModule,
    MatButtonModule,
    MatToolbarModule,
    DarkmodeComponent,
    FontSizeSettingsComponent
  ],
  template: `
    <div class="settings-container">
      <mat-toolbar class="settings-header">
        <mat-icon>settings</mat-icon>
        <span>Einstellungen</span>
        <span class="spacer"></span>
        <!-- Dark mode toggle in header -->
        <app-darkmode></app-darkmode>
      </mat-toolbar>

      <div class="settings-content">
        <mat-tab-group animationDuration="300ms">
          <!-- Appearance Tab -->
          <mat-tab>
            <ng-template mat-tab-label>
              <mat-icon class="tab-icon">palette</mat-icon>
              Darstellung
            </ng-template>
            
            <div class="tab-content">
              <app-font-size-settings></app-font-size-settings>
              
              <!-- Additional appearance settings can go here -->
              <div class="settings-section">
                <h3>Theme</h3>
                <p>Wechseln Sie zwischen hellem und dunklem Design über den Schalter in der oberen rechten Ecke.</p>
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
                <p>Hier können zukünftig Einstellungen für Abtastrate, Puffergrößen und weitere messungsspezifische Parameter hinzugefügt werden.</p>
              </div>
            </div>
          </mat-tab>

          <!-- Data Tab -->
          <mat-tab>
            <ng-template mat-tab-label>
              <mat-icon class="tab-icon">storage</mat-icon>
              Daten
            </ng-template>
            
            <div class="tab-content">
              <div class="settings-section">
                <h3>Datenexport und -import</h3>
                <p>Hier können zukünftig Einstellungen für Dateiformate, Exportpfade und Datenverarbeitung hinzugefügt werden.</p>
              </div>
            </div>
          </mat-tab>

          <!-- Advanced Tab -->
          <mat-tab>
            <ng-template mat-tab-label>
              <mat-icon class="tab-icon">tune</mat-icon>
              Erweitert
            </ng-template>
            
            <div class="tab-content">
              <div class="settings-section">
                <h3>Erweiterte Einstellungen</h3>
                <p>Hier können zukünftig erweiterte Konfigurationsoptionen und Entwicklertools hinzugefügt werden.</p>
              </div>
            </div>
          </mat-tab>
        </mat-tab-group>
      </div>
    </div>
  `,
  styles: [`
    .settings-container {
      height: 100vh;
      display: flex;
      flex-direction: column;
    }

    .settings-header {
      background: var(--mat-sys-primary);
      color: var(--mat-sys-on-primary);
      position: sticky;
      top: 0;
      z-index: 10;
    }

    .settings-header mat-icon {
      margin-right: 12px;
    }

    .spacer {
      flex: 1 1 auto;
    }

    .settings-content {
      flex: 1;
      overflow: auto;
      padding: 0;
    }

    .mat-mdc-tab-group {
      height: 100%;
    }

    .mat-mdc-tab-body-wrapper {
      flex: 1;
    }

    .tab-icon {
      margin-right: 8px;
    }

    .tab-content {
      padding: 24px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .settings-section {
      margin: 32px 0;
      padding: 24px;
      border: 1px solid var(--mat-sys-outline-variant);
      border-radius: 12px;
      background: var(--mat-sys-surface-variant);
    }

    .settings-section h3 {
      margin: 0 0 16px 0;
      color: var(--mat-sys-primary);
      font-size: var(--font-size-large);
    }

    .settings-section p {
      margin: 0;
      color: var(--mat-sys-on-surface-variant);
      line-height: 1.6;
    }

    /* Responsive adjustments */
    @media (max-width: 768px) {
      .tab-content {
        padding: 16px;
      }

      .settings-section {
        margin: 16px 0;
        padding: 16px;
      }

      .settings-header {
        font-size: var(--font-size-base);
      }
    }

    /* Dark theme specific adjustments */
    .dark-theme .settings-header {
      background: var(--mat-sys-primary);
      color: var(--mat-sys-on-primary);
    }
  `]
})
export class SettingsComponent { }