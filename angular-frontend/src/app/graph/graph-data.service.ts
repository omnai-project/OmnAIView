import {
  computed,
  effect,
  inject,
  Injectable,
  linkedSignal,
  signal,
  untracked,
} from '@angular/core';
import { scaleLinear as d3ScaleLinear, scaleUtc as d3ScaleUtc } from 'd3-scale';
import { line as d3Line } from 'd3-shape';
import { DataSourceSelectionService } from '../source-selection/data-source-selection.service';
import { zoomIdentity, ZoomTransform } from 'd3-zoom';
import type { UnwrapSignal } from '../utils/unwrap-signal.type';
import { SourceColorService } from '../source-selection/source-color.service';

/**
 * Describes the potential Domain values for the x-axis
 * */
type xDomainType = Date;
type xDomainTuple = [xDomainType, xDomainType];

const defaultXDomain: xDomainTuple = [
  new Date(),
  new Date(Date.now() - 24 * 60 * 60 * 1000),
];

/**
 * Provide the data to be displayed in the {@link GraphComponent}
 * This class also provides the axis descriptions. As these are dependend on the size of the current
 * graph, this service needs to be provided in any component that creates a graph to ensure that
 * every graph has its own state management.
 *  */
@Injectable()
export class DataSourceService {
  private readonly $graphDimensions = signal({ width: 800, height: 600 });
  private readonly $xDomain = signal<xDomainTuple>(defaultXDomain);
  private readonly $yDomain = signal([0, 100]);
  readonly referenceStartTimestamp = signal<number | null>(null); // Reference the start timestamp of a measurement
  private readonly dataSourceSelectionService = inject(
    DataSourceSelectionService
  );
  private readonly sourceColorService = inject(SourceColorService);

  private readonly dummySeries = computed(() => {
    const selectedSource = this.dataSourceSelectionService.currentSource();
    if (!selectedSource) return {};

    return selectedSource.data();
  });

  private $zoomX = signal<ZoomTransform>(zoomIdentity);
  private $zoomY = signal<ZoomTransform>(zoomIdentity);
  
  /**
   * Set Zoom for Axis
   * @param axis Axis zoomed: x, y or both 
   */
  setZoom(tx: ZoomTransform, ty: ZoomTransform) {
    this.$zoomX.set(tx);
    this.$zoomY.set(ty);
  }

  readonly margin = { top: 20, right: 30, bottom: 40, left: 60 };
  graphDimensions = this.$graphDimensions.asReadonly();

  /**  
  * Base Axis-Scales computed solely from current data domain and graphDimensions (windowSize)
  * Purpose: Provide a stable reference that can be rescaled by d3-zoom 
  * For actual size see {@link xScale} . Here additional parameters from zooming etc. are taken into account 
  */
  private readonly baseX = linkedSignal({
    source: () => ({
      dimensions: this.$graphDimensions(),
      xDomain: this.$xDomain(),
    }),
    computation: ({ dimensions, xDomain }) => {
      const margin = { top: 20, right: 30, bottom: 40, left: 40 };
      const width = dimensions.width - margin.left - margin.right;
      return d3ScaleUtc().domain(xDomain).range([0, width]);
    },
  });
  private readonly baseY = linkedSignal({
    source: () => ({
      dimensions: this.$graphDimensions(),
      yDomain: this.$yDomain(),
    }),
    computation: ({ dimensions, yDomain }) => {
      const margin = { top: 20, right: 30, bottom: 40, left: 40 };
      const height = dimensions.height - margin.top - margin.bottom;
      return d3ScaleLinear().domain(yDomain).range([height, 0]);
    },
  });

  /**
   * Live Scale calculated from baseScales {@link baseX} and zooming 
   * Whenever Scale or Zoom changes the Axis Scale is rescaled with d3.helper rescale function 
   */
  xScale = linkedSignal({
    source: () => ({ b: this.baseX(), z: this.$zoomX() }),
    computation: ({ b, z }) => z.rescaleX(b),
  });

  yScale = linkedSignal({
    source: () => ({ b: this.baseY(), z: this.$zoomY() }),
    computation: ({ b, z }) => z.rescaleY(b),
  });

  updateGraphDimensions(settings: { width: number; height: number }) {
    const currentSettings = this.$graphDimensions();
    if (
      currentSettings.width !== settings.width ||
      currentSettings.height !== settings.height
    ) {
      this.$graphDimensions.set({
        width: settings.width,
        height: settings.height,
      });
    }
  }

  updateScalesWhenDataChanges = effect(() => {
    const data = this.dummySeries();
    untracked(() => this.scaleAxisToData(data));
  });

  private scaleAxisToData(data: UnwrapSignal<typeof this.dummySeries>) {
    console.log(data);
    if (Object.keys(data).length === 0) {
      this.referenceStartTimestamp.set(null);
      return;
    }

    const expandBy = 0.1;

    const initial = {
      minTimestamp: Number.POSITIVE_INFINITY,
      maxTimestamp: Number.NEGATIVE_INFINITY,
      minValue: Number.POSITIVE_INFINITY,
      maxValue: Number.NEGATIVE_INFINITY,
    };

    const allPoints = Object.values(data).flat(); // DataFormat[]

    const result = allPoints.reduce(
      (acc, point) => ({
        minTimestamp: Math.min(acc.minTimestamp, point.timestamp),
        maxTimestamp: Math.max(acc.maxTimestamp, point.timestamp),
        minValue: Math.min(acc.minValue, point.value),
        maxValue: Math.max(acc.maxValue, point.value),
      }),
      initial
    );

    if (this.referenceStartTimestamp() === null) {
      this.referenceStartTimestamp.set(result.minTimestamp);
    }

    if (!isFinite(result.minTimestamp) || !isFinite(result.minValue)) return;
    const xDomainRange = result.maxTimestamp - result.minTimestamp;
    const xExpansion = xDomainRange * expandBy;
    if (xDomainRange === 0) {
      this.$xDomain.set(defaultXDomain);
    } else {
      this.$xDomain.set([
        new Date(result.minTimestamp),
        new Date(result.maxTimestamp),
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
      colours: this.sourceColorService.colour()
    }),
    computation: ({ xScale, yScale, series, colours }) => {
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
          stroke: colours[key] ?? 'steelblue'
        };
      });
    },
  });
}
