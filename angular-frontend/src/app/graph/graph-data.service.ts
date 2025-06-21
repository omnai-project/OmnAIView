import {
  computed,
  effect,
  inject,
  Injectable,
  linkedSignal,
  signal,
  untracked,
} from '@angular/core';
import {
  scaleLinear as d3ScaleLinear,
  scaleUtc as d3ScaleUtc,
} from 'd3-scale';
import { line as d3Line } from 'd3-shape';
import { DataSourceSelectionService } from '../source-selection/data-source-selection.service';

type UnwrapSignal<T> = T extends import('@angular/core').Signal<infer U> ? U : never;

@Injectable()
export class DataSourceService {
  private readonly $graphDimensions = signal({ width: 800, height: 600 });
  private readonly $xDomain = signal<[Date, Date]>([new Date(2020), new Date()]);
  private readonly $yDomain = signal<[number, number]>([0, 100]);
  private readonly dataSourceSelectionService = inject(DataSourceSelectionService);
  private readonly $isZoomed = signal(false);

  readonly margin = { top: 20, right: 30, bottom: 40, left: 60 };
  graphDimensions = this.$graphDimensions.asReadonly();

  private readonly dummySeries = computed(() => {
    const selectedSource = this.dataSourceSelectionService.currentSource();
    if (!selectedSource) return {};
    return selectedSource.data();
  });

  innerWidth() {
    const dim = this.graphDimensions();
    return dim.width - this.margin.left - this.margin.right;
  }

  innerHeight() {
    const dim = this.graphDimensions();
    return dim.height - this.margin.top - this.margin.bottom;
  }

  readonly xScale = linkedSignal({
    source: () => ({
      dimensions: this.$graphDimensions(),
      xDomain: this.$xDomain(),
    }),
    computation: ({ dimensions, xDomain }) => {
      const { left, right } = this.margin;
      const width = dimensions.width - left - right;
      return d3ScaleUtc().domain(xDomain).range([0, width]);
    },
  });

  readonly yScale = linkedSignal({
    source: () => ({
      dimensions: this.$graphDimensions(),
      yDomain: this.$yDomain(),
    }),
    computation: ({ dimensions, yDomain }) => {
      const { top, bottom } = this.margin;
      const height = dimensions.height - top - bottom;
      return d3ScaleLinear().domain(yDomain).range([height, 0]);
    },
  });

  setZoomed(isZoomed: boolean) {
    this.$isZoomed.set(isZoomed);
  }

  setDomains(
    newX: [Date, Date],
    newY: [number, number]
  ): void {
    this.$xDomain.set(newX);
    this.$yDomain.set(newY);
    this.setZoomed(true);
  }

  updateGraphDimensions(settings: { width: number; height: number }) {
    const current = this.$graphDimensions();
    if (current.width !== settings.width || current.height !== settings.height) {
      this.$graphDimensions.set(settings);
    }
  }

  readonly updateScalesWhenDataChanges = effect(() => {
    const data = this.dummySeries();
    if (this.$isZoomed()) return;

    untracked(() => this.scaleAxisToData(data));
  });

  private scaleAxisToData(data: UnwrapSignal<typeof this.dummySeries>) {
    if (Object.keys(data).length === 0) return;

    const expandBy = 0.1;
    const initial = {
      minTimestamp: Number.POSITIVE_INFINITY,
      maxTimestamp: Number.NEGATIVE_INFINITY,
      minValue: Number.POSITIVE_INFINITY,
      maxValue: Number.NEGATIVE_INFINITY,
    };

    const allPoints = Object.values(data).flat();

    const result = allPoints.reduce(
      (acc, point) => ({
        minTimestamp: Math.min(acc.minTimestamp, point.timestamp),
        maxTimestamp: Math.max(acc.maxTimestamp, point.timestamp),
        minValue: Math.min(acc.minValue, point.value),
        maxValue: Math.max(acc.maxValue, point.value),
      }),
      initial
    );

    if (!isFinite(result.minTimestamp) || !isFinite(result.minValue)) return;

    const xDomainRange = result.maxTimestamp - result.minTimestamp;
    const xExpansion = xDomainRange * expandBy;

    const yDomainRange = result.maxValue - result.minValue;
    const yExpansion = yDomainRange * expandBy;

    this.$xDomain.set([
      new Date(result.minTimestamp - xExpansion),
      new Date(result.maxTimestamp + xExpansion),
    ]);

    this.$yDomain.set([
      result.minValue - yExpansion,
      result.maxValue + yExpansion,
    ]);
  }

  // Methode um Zoom zurückzusetzen, scheune wir mal wie das benutzt wird
  resetZoom() {
    this.$isZoomed.set(false);
    this.scaleAxisToData(this.dummySeries());
  }

  readonly paths = linkedSignal({
    source: () => ({
      xScale: this.xScale(),
      yScale: this.yScale(),
      series: this.dummySeries(),
    }),
    computation: ({ xScale, yScale, series }) => {
      const lineGen = d3Line<{ time: Date; value: number }>()
        .x((d) => xScale(d.time))
        .y((d) => yScale(d.value));

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