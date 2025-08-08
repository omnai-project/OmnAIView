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
  templateUrl: './font-size-settings.component.html',
  styleUrl: './font-size-settings.component.scss'
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