import { Component, inject } from '@angular/core';
import { SelectionAnalysisService, SelectionAnalysisResult } from '../selection-analysis.service';
import { OmnAIScopeDataService } from '../../omnai-datasource/omnai-scope-server/live-data.service';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';

interface TimeRange {
  start: Date;
  end: Date;
}

/**
 * Component displaying statistical analysis results for selected graph regions
 * Shows metrics like min/max, average, RMS for each device in the selection
 */
@Component({
  selector: 'app-selection-results',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatButtonModule, MatDividerModule],
  template: `
    @if (analysisService.analysisResult(); as result) {
      @if (result.isValid) {
        <div class="results-container">
          <mat-card class="analysis-card">
            <mat-card-header>
              <mat-card-title>
                <mat-icon>analytics</mat-icon>
                Analyse
              </mat-card-title>
              <mat-card-subtitle>
                {{formatTimeRange(result.timeRange)}} 
                ({{result.totalDataPoints}} data points)
              </mat-card-subtitle>
            </mat-card-header>
            
            <mat-card-content>
              @for (device of result.devices; track device.uuid) {
                <div class="device-analysis">
                  <h4 class="device-title">
                    <span class="device-indicator" [style.background-color]="getDeviceColor(device.uuid)"></span>
                    {{device.deviceName}}
                    <span class="uuid-hint">({{device.uuid.substring(0, 8)}}...)</span>
                  </h4>
                  
                  <div class="metrics-grid">
                    <div class="metric">
                      <span class="metric-label">Min:</span>
                      <span class="metric-value">{{device.min | number:'1.3-3'}} V</span>
                    </div>
                    
                    <div class="metric">
                      <span class="metric-label">Max:</span>
                      <span class="metric-value">{{device.max | number:'1.3-3'}} V</span>
                    </div>
                    
                    <div class="metric">
                      <span class="metric-label">Avg:</span>
                      <span class="metric-value">{{device.average | number:'1.3-3'}} V</span>
                    </div>
                    
                    <div class="metric">
                      <span class="metric-label">RMS:</span>
                      <span class="metric-value">{{device.rms | number:'1.3-3'}} V</span>
                    </div>
                    
                    <div class="metric">
                      <span class="metric-label">Peak-to-Peak:</span>
                      <span class="metric-value">{{device.peakToPeak | number:'1.3-3'}} V</span>
                    </div>
                    
                    <div class="metric">
                      <span class="metric-label">Samples:</span>
                      <span class="metric-value">{{device.dataPointCount}}</span>
                    </div>
                  </div>
                </div>
                
                @if (!$last) {
                  <mat-divider></mat-divider>
                }
              }
            </mat-card-content>
          </mat-card>
        </div>
      }
    }
  `,
  styleUrls: ['./selection-results.component.css']
})
export class SelectionResultsComponent {
  readonly analysisService = inject(SelectionAnalysisService);
  readonly omnAIScopeService = inject(OmnAIScopeDataService);

  /**
   * Formats time range duration for display
   */
  formatTimeRange(timeRange: TimeRange | null): string {
    if (!timeRange) return '';
    const duration = timeRange.end.getTime() - timeRange.start.getTime();
    return `${duration.toFixed(1)} ms`;
  }

  /**
   * Gets the actual OmnAIScope RGB color for a specific device UUID
   * Uses the real hardware-assigned LED colors from the backend API
   */
  getDeviceColor(uuid: string): string {
    const devices = this.omnAIScopeService.devices();

    if (!devices || devices.length === 0) {
      return this.getFallbackColor(uuid);
    }

    const targetDevice = devices.find(device => device.uuid === uuid);
    if (!targetDevice) {
      return this.getFallbackColor(uuid);
    }

    if (targetDevice.color) {
      return this.parseOmnAIScopeColor(targetDevice.color);
    }

    return this.getFallbackColor(uuid);
  }

  /**
   * Converts OmnAIScope color object to CSS RGB string
   */
  private parseOmnAIScopeColor(colorObj: { r: number; g: number; b: number }): string {
    try {
      const r = Math.max(0, Math.min(255, Math.round(colorObj.r)));
      const g = Math.max(0, Math.min(255, Math.round(colorObj.g)));
      const b = Math.max(0, Math.min(255, Math.round(colorObj.b)));

      return `rgb(${r}, ${g}, ${b})`;
    } catch (error) {
      console.warn('Failed to parse OmnAIScope color:', colorObj, error);
      return '#2196f3';
    }
  }

  /**
   * Generates a consistent fallback color when OmnAIScope color is not available
   * Uses hash-based color generation for consistent colors across sessions
   */
  private getFallbackColor(uuid: string): string {
    const fallbackColors = [
      '#f44336', // Red 500
      '#2196f3', // Blue 500  
      '#4caf50', // Green 500
      '#ff9800', // Orange 500
      '#9c27b0', // Purple 500
      '#00bcd4', // Cyan 500
      '#795548', // Brown 500
      '#607d8b'  // Blue Grey 500
    ];

    const hash = uuid.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return fallbackColors[hash % fallbackColors.length];
  }
}