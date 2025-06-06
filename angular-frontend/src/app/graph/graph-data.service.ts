import { computed, effect, inject, Injectable, linkedSignal, signal, untracked } from '@angular/core';
import { scaleLinear as d3ScaleLinear, scaleUtc as d3ScaleUtc } from 'd3-scale';
import { line as d3Line } from 'd3-shape';
import { DataSourceSelectionService } from '../source-selection/data-source-selection.service';

type UnwrapSignal<T> = T extends import('@angular/core').Signal<infer U> ? U : never;

 /* Provide the data to be displayed in the {@link GraphComponent}
 */
@Injectable()
export class DataSourceService {
  private readonly $graphDimensions = signal({ width: 800, height: 600 });
  private readonly $xDomain = signal([new Date(0), new Date(0)]);
  private readonly $yDomain = signal([0, 100]);
  private readonly dataSourceSelectionService = inject(DataSourceSelectionService);
  private firstTimestamp = 0;

  private readonly dummySeries = computed(() => {
    const selectedSource = this.dataSourceSelectionService.currentSource();
    if (!selectedSource) return {};

    return selectedSource.data();
  });


  readonly margin = { top: 20, right: 30, bottom: 40, left: 60 };
  graphDimensions = this.$graphDimensions.asReadonly();

  xScale = linkedSignal({
    source: () => ({
      dimensions: this.$graphDimensions(),
      xDomain: this.$xDomain(),
    }),
    computation: ({ dimensions, xDomain }) => {
      const margin = { top: 20, right: 30, bottom: 40, left: 40 };
      const width = dimensions.width - margin.left - margin.right;
      return d3ScaleUtc()
        .domain(xDomain)
        .range([0, width]);
    },
  });

  yScale = linkedSignal({
    source: () => ({
      dimensions: this.$graphDimensions(),
      yDomain: this.$yDomain(),
    }),
    computation: ({ dimensions, yDomain }) => {
      const margin = { top: 20, right: 30, bottom: 40, left: 40 };
      const height = dimensions.height - margin.top - margin.bottom;
      return d3ScaleLinear()
        .domain(yDomain)
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

  updateScalesWhenDataChanges = effect(() => {
    const data = this.dummySeries();
    untracked(() => this.scaleAxisToData(data))
  })

  private scaleAxisToData(data: UnwrapSignal<typeof this.dummySeries>) {
    console.log(data)
    if (Object.keys(data).length === 0) return;

    const expandBy = 0.1;

    const initial = {
      minTimestamp: Number.POSITIVE_INFINITY,
      maxTimestamp: Number.NEGATIVE_INFINITY,
      minValue: Number.POSITIVE_INFINITY,
      maxValue: Number.NEGATIVE_INFINITY
    };

    const allPoints = Object.values(data).flat(); // DataFormat[]

    const result = allPoints.reduce((acc, point) => ({
      minTimestamp: Math.min(acc.minTimestamp, point.timestamp),
      maxTimestamp: Math.max(acc.maxTimestamp, point.timestamp),
      minValue: Math.min(acc.minValue, point.value),
      maxValue: Math.max(acc.maxValue, point.value),
    }), initial);

    if (!isFinite(result.minTimestamp) || !isFinite(result.minValue)) return;
    this.firstTimestamp = result.minTimestamp;
    const xDomainRange = result.maxTimestamp - result.minTimestamp;
    const xExpansion = xDomainRange * expandBy;
    if (xDomainRange === 0) {
      this.$xDomain.set([
        new Date(0),
        new Date(1000),
      ]);
    }
    else {
      this.$xDomain.set([
        new Date(result.minTimestamp),
        new Date(result.maxTimestamp)
      ]);
    }

    const yDomainRange = result.maxValue - result.minValue;
    const yExpansion = yDomainRange * expandBy;

    this.$yDomain.set([
      result.minValue - yExpansion,
      result.maxValue + yExpansion,
    ]);
  }

  readonly paths = linkedSignal({
    source: () => ({
      xScale: this.xScale(),
      yScale: this.yScale(),
      series: this.dummySeries(),
    }),
    computation: ({ xScale, yScale, series }) => {
      const lineGen = d3Line<{ time: Date; value: number }>()
        .x(d => xScale(d.time))
        .y(d => yScale(d.value));

      return Object.entries(series).map(([key, points]) => {
        const parsedValues = points.map(({ timestamp, value }) => ({
          time: new Date(timestamp),
          value,
        }));

        const pathData = lineGen(parsedValues) ?? '';
        return {
          id: key,
          d: pathData,
        };
      });
    },
  });
}
