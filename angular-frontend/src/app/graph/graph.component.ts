import { isPlatformBrowser, JsonPipe, DecimalPipe, DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  PLATFORM_ID,
  signal,
  viewChild,
  ViewChild,
  type ElementRef
} from '@angular/core';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { transition } from 'd3';
import { axisBottom, axisLeft } from 'd3-axis';
import { select } from 'd3-selection';
import { ResizeObserverDirective } from '../shared/resize-observer.directive';
import { DataSourceService } from './graph-data.service';
import { makeXAxisTickFormatter, type xAxisMode } from './x-axis-formatter.utils';
import { ZoomableDirective } from '../shared/graph-zoom.directive';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { GraphCursorDirective } from '../shared/graph-cursor.directive';
import { GraphSurveyComponent } from './graph-survey.component';

/**
 * How far the user can zoom *in*
 * A zoom factor k means “one data‑pixel covers k canvas‑pixels".
 * User can magnify the graph up to MAXZOOM x 
 */
const MAXZOOM = 32;
/**
 * How far the user can zoom *out*
 * MINZOOM < 1 compresses multiple data‑pixels into one screen‑pixel.
 * User can shrink the graph up to MINZOOM x 
 */
const MINZOOM = 0.5;
@Component({
  selector: 'app-graph',
  standalone: true,
  templateUrl: './graph.component.html',
  providers: [DataSourceService],
  styleUrls: ['./graph.component.css'],
  imports: [ResizeObserverDirective, JsonPipe, MatSlideToggleModule, ZoomableDirective, MatCheckboxModule, GraphCursorDirective, DecimalPipe, DatePipe, GraphSurveyComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GraphComponent {
  readonly dataservice = inject(DataSourceService);
  readonly svgGraph = viewChild.required<ElementRef<SVGElement>>('graphContainer');
  readonly axesContainer = viewChild.required<ElementRef<SVGGElement>>('xAxis');
  readonly axesYContainer = viewChild.required<ElementRef<SVGGElement>>('yAxis');

  zoomXOnly = signal(false);
  zoomYOnly = signal(false);

  private readonly platform = inject(PLATFORM_ID);
  isInBrowser = isPlatformBrowser(this.platform);

  constructor() {
    if (this.isInBrowser) {
      queueMicrotask(() => {
        const rect = this.svgGraph().nativeElement.getBoundingClientRect(); if (rect.width > 0 && rect.height > 0) {
          this.dataservice.updateGraphDimensions({ width: rect.width, height: rect.height });
        }
      });
    }
  }

  updateGraphDimensions(dims: { width: number; height: number }) {
    this.dataservice.updateGraphDimensions(dims);
  }

  innerSize = computed(() => {
    const { width, height } = this.dataservice.graphDimensions();
    const m = this.dataservice.margin;
    return {
      w: width - m.left - m.right,
      h: height - m.top - m.bottom,
    };
  });

  mousePos = { x: 0, y: 0 };
  /**
   * Sets mouse position in screen coordinates 
   * Used for tooltip coordinate calculation 
   */
  onPointerMove(evt: PointerEvent) {
    this.mousePos = { x: evt.clientX, y: evt.clientY };
  }

  marginTransform = computed(() => {
    return `translate(${this.dataservice.margin.left}, ${this.dataservice.margin.top})`
  })

  xAxisTransformString = computed(() => {
    const yScale = this.dataservice.yScale();
    return `translate(0, ${yScale.range()[0]})`; // for d3, (0,0) is the upper left hand corner. When looking at data, the lower left hand corner is (0,0)
  });

  yAxisTransformString = computed(() => {
    const xScale = this.dataservice.xScale();
    return `translate(${xScale.range()[0]}, 0)`;
  });

  toggleXZoom($event: boolean) {
    this.zoomXOnly.set($event);
  }
  toggleYZoom($event: boolean) {
    this.zoomYOnly.set($event);
  }
  /**
   * Signal to control the x-axis time mode. Relative starts with 0, absolute reflects the time of day the data was recorded.
   */
  readonly xAxisTimeMode = signal<xAxisMode>("absolute");

  onXAxisTimeModeToggle(checked: boolean): void {
    this.xAxisTimeMode.set(checked ? 'relative' : 'absolute');
  }
  updateXAxisInCanvas = effect(() => {
    if (!this.isInBrowser) return;
    const x = this.dataservice.xScale();
    const t0 = this.dataservice.referenceStartTimestamp();
    const baseline = t0 !== null ? new Date(t0) : x.domain()[0];
    const formatter = makeXAxisTickFormatter(this.xAxisTimeMode(), baseline);
    const g = this.axesContainer().nativeElement;
    select(g)
      .transition(transition())
      .duration(300)
      .call(axisBottom(x).tickFormat(formatter));
  });

  updateYAxisInCanvas = effect(() => {
    if (!this.isInBrowser) return;
    const y = this.dataservice.yScale();
    const g = this.axesYContainer().nativeElement;
    select(g).transition(transition()).duration(300).call(axisLeft(y));
  });
}
