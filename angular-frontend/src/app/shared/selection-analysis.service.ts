import { Injectable, computed, inject } from '@angular/core';
import { GraphSelectionService, SelectionRect } from './graph-selection.service';
import { DataSourceService } from '../graph/graph-data.service';
import { DataSourceSelectionService } from '../source-selection/data-source-selection.service';
import { OmnAIScopeDataService } from '../omnai-datasource/omnai-scope-server/live-data.service';
import { DataFormat } from '../omnai-datasource/omnai-scope-server/live-data.service';

export interface DeviceAnalysis {
  uuid: string;
  deviceName: string;
  min: number;
  max: number;
  average: number;
  rms: number;
  peakToPeak: number;
  dataPointCount: number;
  timeSpan: number;
}

export interface SelectionAnalysisResult {
  isValid: boolean;
  timeRange: { start: Date; end: Date } | null;
  devices: DeviceAnalysis[];
  totalDataPoints: number;
}

/**
 * Service for analyzing data within selected graph regions
 * Calculates statistical metrics for time-series data in selected areas
 */
@Injectable()
export class SelectionAnalysisService {
  private readonly selectionService = inject(GraphSelectionService);
  private readonly dataService = inject(DataSourceService);
  private readonly dataSourceSelectionService = inject(DataSourceSelectionService);
  private readonly omnAIScopeService = inject(OmnAIScopeDataService);

  /**
   * Computed analysis result for the current selection
   * Automatically updates when selection changes
   */
  readonly analysisResult = computed(() => {
    const rect = this.selectionService.selectionRect();
    if (!rect) {
      return { isValid: false, timeRange: null, devices: [], totalDataPoints: 0 };
    }

    return this.analyzeSelection(rect);
  });

  /**
   * Analyzes the selected rectangular region and calculates statistics
   */
  private analyzeSelection(rect: SelectionRect): SelectionAnalysisResult {
    const xScale = this.dataService.xScale();
    
    const currentSource = this.dataSourceSelectionService.currentSource();
    if (!currentSource) {
      return { isValid: false, timeRange: null, devices: [], totalDataPoints: 0 };
    }

    const data = currentSource.data();

    // Transform screen coordinates to time domain
    const startTime = xScale.invert(rect.x - this.dataService.margin.left);
    const endTime = xScale.invert(rect.x + rect.width - this.dataService.margin.left);

    const timeRange = { start: startTime, end: endTime };
    const devices: DeviceAnalysis[] = [];
    let totalDataPoints = 0;

    // Analyze each device's data within the time range
    Object.entries(data).forEach(([uuid, points]) => {
      const analysis = this.analyzeDeviceData(uuid, points, timeRange);
      if (analysis) {
        devices.push(analysis);
        totalDataPoints += analysis.dataPointCount;
      }
    });

    return {
      isValid: devices.length > 0,
      timeRange,
      devices,
      totalDataPoints
    };
  }

  /**
   * Analyzes data for a single device within the specified time range
   */
  private analyzeDeviceData(
    uuid: string, 
    points: DataFormat[], 
    timeRange: { start: Date; end: Date }
  ): DeviceAnalysis | null {
    if (!points || points.length === 0) return null;

    // Filter data points within time range
    const filteredPoints = points.filter(point => {
      const pointTime = new Date(point.timestamp);
      return pointTime >= timeRange.start && pointTime <= timeRange.end;
    });

    if (filteredPoints.length === 0) return null;

    const values = filteredPoints.map(p => p.value);
    
    // Calculate statistical metrics
    const min = Math.min(...values);
    const max = Math.max(...values);
    const average = values.reduce((sum, val) => sum + val, 0) / values.length;
    
    // Root Mean Square calculation
    const rms = Math.sqrt(
      values.reduce((sum, val) => sum + val * val, 0) / values.length
    );
    
    const peakToPeak = max - min;
    const timeSpan = timeRange.end.getTime() - timeRange.start.getTime();

    return {
      uuid,
      deviceName: this.getDeviceName(uuid),
      min,
      max,
      average,
      rms,
      peakToPeak,
      dataPointCount: filteredPoints.length,
      timeSpan
    };
  }

  /**
   * Gets a human-readable device name using OmnAIScope metadata
   * Falls back to UUID-based name if metadata not available
   */
  private getDeviceName(uuid: string): string {
    const devices = this.omnAIScopeService.devices();
    
    if (devices && devices.length > 0) {
      const targetDevice = devices.find(device => device.UUID === uuid);
      
      if (targetDevice) {
        const colorInfo = targetDevice.color ? 
          `RGB(${targetDevice.color.r},${targetDevice.color.g},${targetDevice.color.b})` : 
          'No Color';
        
        return `OmnAIScope ${uuid.substring(0, 6)} (${colorInfo})`;
      }
    }
    
    return `OmnAIScope ${uuid.substring(0, 8)}`;
  }
}