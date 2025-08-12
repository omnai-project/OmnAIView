import { Injectable, signal, effect, Renderer2, RendererFactory2 } from '@angular/core';

export enum FontSizeLevel {
  SMALL = 'small',
  MEDIUM = 'medium', 
  LARGE = 'large',
  EXTRA_LARGE = 'extra-large'
}

export interface FontSizeOption {
  level: FontSizeLevel;
  label: string;
  scale: number;
  description?: string;
}

@Injectable({
  providedIn: 'root'
})
export class FontSizeService {
  private readonly STORAGE_KEY = 'omni-font-size-preference';
  private readonly renderer: Renderer2;

  // Font size configuration
  private readonly fontSizeOptions: FontSizeOption[] = [
    {
      level: FontSizeLevel.SMALL,
      label: 'small',
      scale: 0.875,
      description: 'compact representation for experienced users'
    },
    {
      level: FontSizeLevel.MEDIUM,
      label: 'medium',
      scale: 1.0,
      description: 'Standard font size'
    },
    {
      level: FontSizeLevel.LARGE,
      label: 'large',
      scale: 1.125,
      description: 'Improved readability'
    },
    {
      level: FontSizeLevel.EXTRA_LARGE,
      label: 'extra-large',
      scale: 1.25,
      description: 'Maximum readability for accessibility'
    }
  ];

  // All possible font size classes for cleanup
  private readonly allFontSizeClasses = [
    'font-size-small',
    'font-size-medium', 
    'font-size-large',
    'font-size-extra-large'
  ];

  // Reactive current font size
  readonly currentFontSize = signal<FontSizeLevel>(FontSizeLevel.MEDIUM);

  constructor(rendererFactory: RendererFactory2) {
    this.renderer = rendererFactory.createRenderer(null, null);
    
    // Load saved preference
    this.loadSavedFontSize();
    
    // Apply font size changes reactively
    effect(() => {
      this.applyFontSizeClass(this.currentFontSize());
    });
  }

  getFontSizeOptions(): FontSizeOption[] {
    return [...this.fontSizeOptions];
  }

  setFontSize(level: FontSizeLevel): void {
    this.currentFontSize.set(level);
    this.saveFontSizePreference(level);
  }

  getFontSize(): FontSizeLevel {
    return this.currentFontSize();
  }

  getCurrentScale(): number {
    const current = this.currentFontSize();
    const option = this.fontSizeOptions.find(opt => opt.level === current);
    return option?.scale || 1.0;
  }

  getCurrentOption(): FontSizeOption {
    const current = this.currentFontSize();
    return this.fontSizeOptions.find(opt => opt.level === current) || this.fontSizeOptions[1];
  }

  resetToDefault(): void {
    this.setFontSize(FontSizeLevel.MEDIUM);
  }

  isDefaultSize(): boolean {
    return this.currentFontSize() === FontSizeLevel.MEDIUM;
  }

  /**
   * Apply the appropriate font size class to the body
   */
  private applyFontSizeClass(level: FontSizeLevel): void {
    // Remove all existing font size classes
    this.allFontSizeClasses.forEach(className => {
      this.renderer.removeClass(document.body, className);
    });

    // Add the appropriate class (only if not medium/default)
    if (level !== FontSizeLevel.MEDIUM) {
      const className = this.getFontSizeClassName(level);
      this.renderer.addClass(document.body, className);
    }
  }

  /**
   * Convert FontSizeLevel to CSS class name
   */
  private getFontSizeClassName(level: FontSizeLevel): string {
    switch (level) {
      case FontSizeLevel.SMALL:
        return 'font-size-small';
      case FontSizeLevel.LARGE:
        return 'font-size-large';
      case FontSizeLevel.EXTRA_LARGE:
        return 'font-size-extra-large';
      case FontSizeLevel.MEDIUM:
      default:
        return ''; 
    }
  }

  private loadSavedFontSize(): void {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY) as FontSizeLevel;
      if (saved && this.isValidFontSizeLevel(saved)) {
        this.currentFontSize.set(saved);
      }
    } catch (error) {
      console.warn('Failed to load font size preference from localStorage:', error);
    }
  }

  private saveFontSizePreference(level: FontSizeLevel): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, level);
    } catch (error) {
      console.warn('Failed to save font size preference to localStorage:', error);
    }
  }

  private isValidFontSizeLevel(value: string): value is FontSizeLevel {
    return Object.values(FontSizeLevel).includes(value as FontSizeLevel);
  }
}