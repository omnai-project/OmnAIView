import { Component, inject, signal, OnInit, ChangeDetectorRef, OnDestroy, Renderer2 } from '@angular/core';
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
            <!-- FIXED TABS - Always Visible -->
            <mat-tab-group class="settings-tabs">
                <!-- Appearance Tab -->
                <mat-tab>
                    <ng-template mat-tab-label>
                        <mat-icon class="tab-icon">palette</mat-icon>
                        Display
                    </ng-template>
                    
                    <!-- SCROLLABLE CONTENT AREA -->
                    <div class="scrollable-content">
                        <!-- Design Theme Section - NOW CONSISTENT -->
                        <div class="settings-section">
                            <div class="section-container">
                                <h3>Design Theme</h3>
                                <p class="section-description">
                                    Switch between light and dark design
                                </p>
                                
                                <mat-button-toggle-group 
                                    [value]="currentTheme()" 
                                    (change)="onThemeChange($event.value)"
                                    class="theme-toggles">
                                    
                                    <mat-button-toggle value="light">
                                        <div class="theme-option">
                                            <mat-icon>wb_sunny</mat-icon>
                                            <span class="theme-label">Light</span>
                                        </div>
                                    </mat-button-toggle>
                                    
                                    <mat-button-toggle value="dark">
                                        <div class="theme-option">
                                            <mat-icon>nights_stay</mat-icon>
                                            <span class="theme-label">Dark</span>
                                        </div>
                                    </mat-button-toggle>
                                </mat-button-toggle-group>
                            </div>
                        </div>

                        <!-- Font Size Section -->
                        <div class="settings-section">
                            <div class="section-container">
                                <h3>Font Size</h3>
                                <p class="section-description">
                                    Adjust text size to your needs
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
                                    <h4>Preview</h4>
                                    <div class="preview-content">
                                        <p class="preview-measurement">12.34 V</p>
                                        <p class="preview-normal">Sample text in selected font size</p>
                                        <small class="preview-small">Small labels and hints</small>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Language Section -->
                        <div class="settings-section">
                            <div class="section-container">
                                <h3>Language</h3>
                                <p class="section-description">
                                    Language settings (to be implemented in future version)
                                </p>
                            </div>
                        </div>

                        <!-- Extra Section for Testing Scroll -->
                        <div class="settings-section">
                            <div class="section-container">
                                <h3>Advanced Options</h3>
                                <p class="section-description">
                                    Additional configuration options for testing scroll behavior.
                                    This section demonstrates how the content scrolls when there are many options.
                                </p>
                                
                                <div style="height: 200px; background: var(--mat-sys-outline-variant); border-radius: 8px; display: flex; align-items: center; justify-content: center; opacity: 0.5;">
                                    <span>Future Settings Content</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </mat-tab>

                <!-- Measurement Tab -->
                <mat-tab>
                    <ng-template mat-tab-label>
                        <mat-icon class="tab-icon">timeline</mat-icon>
                        Measurement
                    </ng-template>
                    
                    <div class="scrollable-content">
                        <div class="settings-section">
                            <div class="section-container">
                                <h3>Measurement Settings</h3>
                                <p class="section-description">
                                    Configuration for sampling rate and measurement parameters (future implementation)
                                </p>
                            </div>
                        </div>
                    </div>
                </mat-tab>
            </mat-tab-group>
        </mat-dialog-content>

        <!-- FIXED BUTTONS - Always Visible -->
        <mat-dialog-actions align="end" class="fixed-actions">
            <button mat-button (click)="resetFontSize()" [disabled]="isDefaultFontSize()">
                <mat-icon>refresh</mat-icon>
                Reset
            </button>
            <button mat-button mat-dialog-close color="primary">
                <mat-icon>save</mat-icon>
                Save
            </button>
        </mat-dialog-actions>
    `,
    styles: [`
    h1{
        display: flex;
        align-items: center;    
    }
        /* DIALOG STRUCTURE - Fixed Layout */
        .settings-content {
            width: 600px;
            max-width: 90vw;
            height: 70vh;
            max-height: 600px;
            overflow: hidden;
            display: flex;
            flex-direction: column;
            padding: 0;
        }

        /* DARK MODE DIALOG BACKGROUND - Even lighter grey for better contrast */
        .dark-theme ::ng-deep .mat-mdc-dialog-container {
            background: #505050 !important; /* Lighter grey with !important */
        }

        .dark-theme ::ng-deep .mat-mdc-dialog-surface {
            background: #505050 !important;
        }

        /* Alternative approach - target the dialog directly */
        ::ng-deep .mat-mdc-dialog-container .mat-mdc-dialog-surface {
            background: var(--mat-sys-surface);
        }

        .dark-theme ::ng-deep .mat-mdc-dialog-container .mat-mdc-dialog-surface {
            background: #505050 !important;
        }

        /* TABS - Fixed at top */
        .settings-tabs {
            flex: 1;
            display: flex;
            flex-direction: column;
            overflow: hidden;
        }

        .settings-tabs ::ng-deep .mat-mdc-tab-body-wrapper {
            flex: 1;
            overflow: hidden;
        }

        .settings-tabs ::ng-deep .mat-mdc-tab-header {
            background: var(--mat-sys-surface);
            border-bottom: 1px solid var(--mat-sys-outline-variant);
        }

        .dark-theme .settings-tabs ::ng-deep .mat-mdc-tab-header {
            background: #505050 !important;
        }

        .tab-icon {
            margin-right: 8px;
        }

        /* SCROLLABLE CONTENT AREA - This is where scroll happens */
        .scrollable-content {
            flex: 1;
            overflow-y: auto;
            overflow-x: hidden;
            padding: 20px;
            
            /* SCROLL BAR STYLING - Theme-aware and wider */
            scrollbar-width: auto; /* Firefox: auto for wider scrollbar */
            scrollbar-color: var(--mat-sys-primary) var(--mat-sys-surface-container);
        }

        /* Webkit Scroll Bar Styling (Chrome, Safari, Edge) - WIDER & THEME-AWARE */
        .scrollable-content::-webkit-scrollbar {
            width: 12px; /* WIDER SCROLL BAR */
            height: 12px;
        }

        .scrollable-content::-webkit-scrollbar-track {
            background: var(--mat-sys-surface-container);
            border-radius: 6px;
            border: 1px solid var(--mat-sys-outline-variant);
        }

        .scrollable-content::-webkit-scrollbar-thumb {
            background: var(--mat-sys-primary);
            border-radius: 6px;
            border: 2px solid var(--mat-sys-surface-container);
        }

        .scrollable-content::-webkit-scrollbar-thumb:hover {
            background: var(--mat-sys-primary-container);
        }

        .scrollable-content::-webkit-scrollbar-thumb:active {
            background: var(--mat-sys-secondary);
        }

        /* SIMPLIFIED SECTION DESIGN - No background, just separation */
        .settings-section {
            margin: 0 0 32px 0;
            padding: 0 0 24px 0;
            border-bottom: 1px solid var(--mat-sys-outline-variant);
        }

        .settings-section:last-child {
            border-bottom: none;
            margin-bottom: 0;
        }

        .section-container {
            padding: 0;
            /* No background - clean separation only */
        }

        .section-container h3 {
            margin: 0 0 8px 0;
            color: var(--mat-sys-primary);
            font-size: var(--font-size-large);
            font-weight: 600;
        }

        .section-description {
            margin: 0 0 16px 0;
            color: var(--mat-sys-on-surface-variant);
            font-size: var(--font-size-small);
            opacity: 0.8;
        }

        /* THEME CONTROLS - Now consistent with font-size */
        .theme-controls {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 12px 0;
        }

        .theme-label {
            font-weight: 500;
            color: var(--mat-sys-on-surface-variant);
        }

        /* FONT SIZE CONTROLS */
        .font-size-toggles {
            width: 100%;
            margin: 16px 0;
            display: flex;
        }

        .font-size-toggles .mat-button-toggle {
            flex: 1 1 25%; /* Equal width for 4 buttons */
            min-width: 0;
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

        /* FONT PREVIEW */
        .font-preview {
            margin: 20px 0 0 0;
            padding: 16px;
            background: var(--mat-sys-primary-container);
            color: var(--mat-sys-on-primary-container);
            border-radius: 8px;
        }

        .font-preview h4 {
            margin: 0 0 12px 0;
            font-size: var(--font-size-base);
            opacity: 0.8;
        }

        .preview-content {
            display: flex;
            flex-direction: column;
            gap: 8px;
        }

        .preview-measurement {
            font-size: var(--font-size-xl);
            font-weight: 600;
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

        /* FIXED BUTTONS - Always visible at bottom */
        .fixed-actions {
            background: var(--mat-sys-surface);
            border-top: 1px solid var(--mat-sys-outline-variant);
            padding: 16px 24px;
            margin: 0;
            position: sticky;
            bottom: 0;
            z-index: 10;
        }

        .dark-theme .fixed-actions {
            background: #505050 !important;
        }

        .fixed-actions button mat-icon {
            margin-right: 4px;
        }

        /* Dialog Title */
        ::ng-deep .mat-mdc-dialog-title {
            margin: 0 0 8px 0;
            padding: 24px 24px 16px 24px;
            background: var(--mat-sys-surface);
        }

        ::ng-deep .mat-mdc-dialog-title mat-icon {
            margin-right: 8px;
        }

        .dark-theme ::ng-deep .mat-mdc-dialog-title {
            background: #505050 !important;
        }
        .theme-option mat-icon {
                vertical-align: middle;
                margin: 0;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
            .settings-content {
                width: 95vw;
                height: 80vh;
            }

            .scrollable-content {
                padding: 16px;
            }

            .font-size-toggles,
            .theme-toggles {
                flex-direction: column;
            }

            .font-option,
            .theme-option {
                flex-direction: row;
                justify-content: flex-start; /* Left-align on mobile */
                padding: 12px 16px;
                gap: 12px;
            }

            .font-option {
                justify-content: space-between; /* Keep percentage on right */
            }

            .theme-option mat-icon {
                vertical-align: middle;
                margin: 0;
            }

            /* MOBILE SCROLL BAR - Still wider than before */
            .scrollable-content::-webkit-scrollbar {
                width: 8px;
            }
        }

        /* DARK THEME SCROLLBAR ADJUSTMENTS */
        .dark-theme .scrollable-content::-webkit-scrollbar-track {
            background: var(--mat-sys-surface-container);
            border-color: var(--mat-sys-outline);
        }

        .dark-theme .scrollable-content::-webkit-scrollbar-thumb {
            background: var(--mat-sys-primary);
        }

        .dark-theme .scrollable-content::-webkit-scrollbar-thumb:hover {
            background: var(--mat-sys-primary-container);
        }

        /* FALLBACK: Ensure modal background is lighter in dark mode */
        .dark-theme ::ng-deep .cdk-overlay-pane .mat-mdc-dialog-container {
            background: #505050 !important;
        }

        .dark-theme ::ng-deep .mat-mdc-dialog-container {
            background-color: #505050 !important;
        }
    `]
})
export class SettingsDialogComponent implements OnInit, OnDestroy {
    fontSizeService = inject(FontSizeService);
    private cdr = inject(ChangeDetectorRef);
    private renderer = inject(Renderer2);
    
    // Reactive theme status
    currentTheme = signal<'light' | 'dark'>('light');
    
    fontSizeOptions = this.fontSizeService.getFontSizeOptions();
    
    private observer?: MutationObserver;

    ngOnInit() {
        // Initialize theme status
        this.updateThemeStatus();
        
        // Watch for theme changes on body element
        this.observer = new MutationObserver(() => {
            this.updateThemeStatus();
        });

        this.observer.observe(document.body, {
            attributes: true,
            attributeFilter: ['class']
        });
    }

    ngOnDestroy() {
        this.observer?.disconnect();
    }

    private updateThemeStatus() {
        const isDark = document.body.classList.contains('dark-theme');
        const newTheme = isDark ? 'dark' : 'light';
        
        if (this.currentTheme() !== newTheme) {
            this.currentTheme.set(newTheme);
            this.cdr.detectChanges();
        }
    }

    onThemeChange(theme: 'light' | 'dark'): void {
        if (theme === 'dark') {
            this.renderer.addClass(document.body, 'dark-theme');
        } else {
            this.renderer.removeClass(document.body, 'dark-theme');
        }
        // Theme will be updated automatically via MutationObserver
    }

    onFontSizeChange(level: FontSizeLevel): void {
        this.fontSizeService.setFontSize(level);
    }

    resetFontSize(): void {
        this.fontSizeService.setFontSize(FontSizeLevel.MEDIUM);
    }

    isDefaultFontSize(): boolean {
        return this.fontSizeService.getFontSize() === FontSizeLevel.MEDIUM;
    }

    getCurrentThemeLabel(): string {
        return this.currentTheme() === 'dark' ? 'Dark Theme' : 'Light Theme';
    }
}