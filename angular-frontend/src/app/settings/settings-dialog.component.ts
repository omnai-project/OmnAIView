import { Component, inject, signal, OnInit, ChangeDetectorRef, OnDestroy, Renderer2 } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatDividerModule } from '@angular/material/divider';
import { FontSizeService, FontSizeLevel } from './services/font-size.service';

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
    templateUrl: './settings-dialog.component.html',
    styleUrls: ['./settings-dialog.component.scss']
})
export class SettingsDialogComponent implements OnInit, OnDestroy {
    private readonly cdr = inject(ChangeDetectorRef);
    private readonly renderer = inject(Renderer2);
    
    // Expose service for template access  
    readonly fontSizeService = inject(FontSizeService);
    
    // Reactive theme status
    readonly currentTheme = signal<'light' | 'dark'>('light');
    
    private observer?: MutationObserver;

    ngOnInit(): void {
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

    ngOnDestroy(): void {
        this.observer?.disconnect();
    }

    private updateThemeStatus(): void {
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
    }

    onFontSizeChange(level: FontSizeLevel): void {
        this.fontSizeService.setFontSize(level);
    }

    resetFontSize(): void {
        this.fontSizeService.resetToDefault();
    }

    isDefaultFontSize(): boolean {
        return this.fontSizeService.isDefaultSize();
    }
}