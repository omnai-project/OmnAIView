import { computed, effect, inject, Injectable, linkedSignal, signal, untracked } from '@angular/core';
import { scaleLinear as d3ScaleLinear, scaleUtc as d3ScaleUtc } from 'd3-scale';
import { line as d3Line } from 'd3-shape';
import {DataFormat, OmnAIScopeDataService} from '../omnai-datasource/omnai-scope-server/live-data.service';
import { type GraphComponent } from './graph.component';
import {DataBounds, DataSourceSelectionService} from '../source-selection/data-source-selection.service';

type UnwrapSignal<T> = T extends import('@angular/core').Signal<infer U> ? U : never;

/**
 * Provide the data to be displayed in the {@link GraphComponent}
 */
@Injectable({
  providedIn: 'root',
})
export class DataSourceService {
  private readonly $graphDimensions = signal({ width: 800, height: 600 });
  readonly domain = computed(() => {
      const info = this.dummySeries();
      if (!info || !isFinite(info.bounds.minTimestamp) || !isFinite(info.bounds.maxTimestamp) || !isFinite(info.bounds.minValue) || !isFinite(info.bounds.maxValue))
        return {
          xDomain: [new Date(2020), new Date()],
          yDomain: [0, 100],
        };

      const result = info.bounds;
      const expandBy = 0.1;

      const xDomainRange = result.maxTimestamp - result.minTimestamp;
      const xExpansion = xDomainRange * expandBy;

      const yDomainRange = result.maxValue - result.minValue;
      const yExpansion = yDomainRange * expandBy;

      return {
        xDomain: [
          new Date(result.minTimestamp - xExpansion),
          new Date(result.maxTimestamp + xExpansion),
        ],
        yDomain: [
          result.minValue - yExpansion,
          result.maxValue + yExpansion,
        ],
      }
    }
  );
  private readonly dataSourceSelectionService = inject(DataSourceSelectionService);

  readonly dummySeries = computed(() => {
    const selectedSource = this.dataSourceSelectionService.currentSource();
    if (!selectedSource) return {data: new Map<string, DataFormat[]>(), bounds: new DataBounds()};

    return selectedSource.data();
  });

  readonly margin = { top: 20, right: 30, bottom: 40, left: 60 };
  readonly graphDimensions = this.$graphDimensions.asReadonly();


  xScale = linkedSignal({
    source: () => ({
      dimensions: this.$graphDimensions(),
      domain: this.domain(),
    }),
    computation: ({ dimensions, domain }) => {
      const margin = { top: 20, right: 30, bottom: 40, left: 40 };
      const width = dimensions.width - margin.left - margin.right;
      return d3ScaleUtc()
        .domain(domain.xDomain)
        .range([0, width]);
    },
  });

  yScale = linkedSignal({
    source: () => ({
      dimensions: this.$graphDimensions(),
      domain: this.domain(),
    }),
    computation: ({ dimensions, domain }) => {
      const margin = { top: 20, right: 30, bottom: 40, left: 40 };
      const height = dimensions.height - margin.top - margin.bottom;
      return d3ScaleLinear()
        .domain(domain.yDomain)
        .range([height, 0]);
    },
  });

  updateGraphDimensions(settings: { width: number; height: number }) {
    const currentSettings = this.$graphDimensions();
    if (
      currentSettings.width !== settings.width ||
      currentSettings.height !== settings.height
    ) {
      this.$graphDimensions.set({ width: settings.width, height: settings.height });
    }
  }
}
