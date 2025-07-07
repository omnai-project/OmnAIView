import { computed, effect, inject, Injectable, linkedSignal, signal, untracked } from '@angular/core';
import { scaleLinear as d3ScaleLinear, scaleUtc as d3ScaleUtc } from 'd3-scale';
import { line as d3Line } from 'd3-shape';
import {DataFormat, OmnAIScopeDataService} from '../omnai-datasource/omnai-scope-server/live-data.service';
import { type GraphComponent } from './graph.component';
import {DataBounds, DataSourceSelectionService} from '../source-selection/data-source-selection.service';

type UnwrapSignal<T> = T extends import('@angular/core').Signal<infer U> ? U : never;

/**
 * Describes the potential Domain values for the x-axis
 * */
type xDomainType = Date;
type xDomainTuple = [xDomainType, xDomainType];

const defaultXDomain: xDomainTuple = [new Date(), new Date(Date.now() - 24 * 60 * 60 * 1000)];

/**
 * Provide the data to be displayed in the {@link GraphComponent}
 * This class also provides the axis descriptions. As these are dependend on the size of the current
 * graph, this service needs to be provided in any component that creates a graph to ensure that
 * every graph has its own state management.
 *  */
@Injectable()
export class DataSourceService {
  private readonly $graphDimensions = signal({ width: 800, height: 600 });
  readonly domain = computed(() => {
      const info = this.dummySeries();
      if (!info || !isFinite(info.bounds.minTimestamp) || !isFinite(info.bounds.maxTimestamp) || !isFinite(info.bounds.minValue) || !isFinite(info.bounds.maxValue))
        return {
          xDomain: defaultXDomain,
          yDomain: [0, 100],
        };

      const result = info.bounds;
      const expandBy = 0.1;

      const xDomainRange = result.maxTimestamp - result.minTimestamp;
      const xExpansion = xDomainRange * expandBy;
      let xDomain;
      if (xDomainRange === 0) {
        xDomain = defaultXDomain;
      }
      else {
        xDomain =[
          new Date(result.minTimestamp),
          new Date(result.maxTimestamp)
        ];
      }

      const yDomainRange = result.maxValue - result.minValue;
      const yExpansion = yDomainRange * expandBy;

      return {
        xDomain,
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
