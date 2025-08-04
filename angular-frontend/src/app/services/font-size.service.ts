import { Injectable, signal, effect } from '@angular/core';

export enum FontSizeLevel {
  SMALL = 'small',
  MEDIUM = 'medium', 
  LARGE = 'large',
  EXTRA_LARGE = 'extra-large'
}

@Injectable({
  providedIn: 'root'
})
export class FontSizeService {
  private readonly STORAGE_KEY = 'omnaiview-font-size';
  
  // Font size scale factors
  private readonly fontSizeMap = {
    [FontSizeLevel.SMALL]: 0.875,      // 87.5%
    [FontSizeLevel.MEDIUM]: 1.0,       // 100% (default)
    [FontSizeLevel.LARGE]: 1.125,      // 112.5%
    [FontSizeLevel.EXTRA_LARGE]: 1.25  // 125%
  };

  // Reactive signal for current font size
  currentFontSize = signal<FontSizeLevel>(this.loadFontSizeFromStorage());

  constructor() {
    // Apply font size changes to document root
    effect(() => {
      this.applyFontSize(this.currentFontSize());
    });
  }

  /**
   * Set the font size level
   */
  setFontSize(level: FontSizeLevel): void {
    this.currentFontSize.set(level);
    this.saveFontSizeToStorage(level);
  }

  /**
   * Get the current font size level
   */
  getFontSize(): FontSizeLevel {
    return this.currentFontSize();
  }

  /**
   * Get the scale factor for current font size
   */
  getCurrentScale(): number {
    return this.fontSizeMap[this.currentFontSize()];
  }

  /**
   * Get all available font size options
   */
  getFontSizeOptions(): Array<{level: FontSizeLevel, label: string, scale: number}> {
    return [
      { level: FontSizeLevel.SMALL, label: 'Klein', scale: this.fontSizeMap[FontSizeLevel.SMALL] },
      { level: FontSizeLevel.MEDIUM, label: 'Normal', scale: this.fontSizeMap[FontSizeLevel.MEDIUM] },
      { level: FontSizeLevel.LARGE, label: 'Groß', scale: this.fontSizeMap[FontSizeLevel.LARGE] },
      { level: FontSizeLevel.EXTRA_LARGE, label: 'Sehr Groß', scale: this.fontSizeMap[FontSizeLevel.EXTRA_LARGE] }
    ];
  }

  private applyFontSize(level: FontSizeLevel): void {
    const scale = this.fontSizeMap[level];
    const root = document.documentElement;
    
    // Set CSS custom properties for font scaling
    root.style.setProperty('--font-scale', scale.toString());
    root.style.setProperty('--font-size-base', `${16 * scale}px`);
    root.style.setProperty('--font-size-small', `${14 * scale}px`);
    root.style.setProperty('--font-size-large', `${18 * scale}px`);
    root.style.setProperty('--font-size-xl', `${24 * scale}px`);
    
    // Add class to body for additional styling hooks
    document.body.className = document.body.className.replace(/font-size-\w+/g, '');
    document.body.classList.add(`font-size-${level}`);
  }

  private loadFontSizeFromStorage(): FontSizeLevel {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored && Object.values(FontSizeLevel).includes(stored as FontSizeLevel)) {
        return stored as FontSizeLevel;
      }
    } catch (error) {
      console.warn('Failed to load font size from storage:', error);
    }
    return FontSizeLevel.MEDIUM; // Default fallback
  }

  private saveFontSizeToStorage(level: FontSizeLevel): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, level);
    } catch (error) {
      console.warn('Failed to save font size to storage:', error);
    }
  }
}