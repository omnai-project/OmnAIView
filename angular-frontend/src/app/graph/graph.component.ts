import {
  isPlatformBrowser,
  JsonPipe,
  DecimalPipe,
  DatePipe,
} from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  OnDestroy,
  PLATFORM_ID,
  signal,
  viewChild,
  type ElementRef,
} from '@angular/core';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { transition } from 'd3';
import { axisBottom, axisLeft } from 'd3-axis';
import { select } from 'd3-selection';
import { ResizeObserverDirective } from '../shared/resize-observer.directive';
import { DataSourceService } from './graph-data.service';
import {
  makeXAxisTickFormatter,
  type xAxisMode,
} from './x-axis-formatter.utils';
import { ZoomableDirective } from '../shared/graph-zoom.directive';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { GraphCursorDirective } from '../shared/graph-cursor.directive';
import { GraphSurveyComponent } from './graph-survey.component';
import { GraphSelectionService } from '../shared/graph-selection.service';
import { SelectionAnalysisService } from '../shared/selection-analysis.service';
import { SelectionResultsComponent } from '../shared/selection-results/selection-results.component';
import { SelectionToggleComponent } from '../shared/selection-toggle/selection-toggle.component';

@Component({
  selector: 'app-graph',
  standalone: true,
  templateUrl: './graph.component.html',
  providers: [
    DataSourceService,
    GraphSelectionService,
    SelectionAnalysisService,
  ],
  styleUrls: ['./graph.component.css'],
  imports: [
    ResizeObserverDirective,
    JsonPipe,
    MatSlideToggleModule,
    ZoomableDirective,
    MatCheckboxModule,
    GraphCursorDirective,
    DecimalPipe,
    DatePipe,
    GraphSurveyComponent,
    SelectionResultsComponent,
    SelectionToggleComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GraphComponent implements OnDestroy {
  readonly dataservice = inject(DataSourceService);
  readonly selectionService = inject(GraphSelectionService);
  readonly svgGraph =
    viewChild.required<ElementRef<SVGElement>>('graphContainer');
  readonly axesContainer = viewChild.required<ElementRef<SVGGElement>>('xAxis');
  readonly axesYContainer =
    viewChild.required<ElementRef<SVGGElement>>('yAxis');

  zoomXOnly = signal(false);
  zoomYOnly = signal(false);

  private readonly platform = inject(PLATFORM_ID);
  isInBrowser = isPlatformBrowser(this.platform);

  // Event listener reference for cleanup
  private clearSelectionListener = () => {
    this.selectionService.clearSelection();
  };

  constructor() {
    if (this.isInBrowser) {
      queueMicrotask(() => {
        const rect = this.svgGraph().nativeElement.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          this.dataservice.updateGraphDimensions({
            width: rect.width,
            height: rect.height,
          });
        }
      });

      window.addEventListener(
        'clearGraphSelection',
        this.clearSelectionListener
      );
    }
  }

  ngOnDestroy(): void {
    if (this.isInBrowser) {
      window.removeEventListener(
        'clearGraphSelection',
        this.clearSelectionListener
      );
    }
  }

  updateGraphDimensions(dims: { width: number; height: number }): void {
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
   * Sets mouse position in screen coordinates and handles selection movement
   * Used for tooltip coordinate calculation and selection updates
   */
  onPointerMove(evt: PointerEvent): void {
    this.mousePos = { x: evt.clientX, y: evt.clientY };

    // Handle selection movement if in selection mode
    if (this.selectionService.isSelectionMode()) {
      const rect = this.svgGraph().nativeElement.getBoundingClientRect();
      const x = evt.clientX - rect.left;
      const y = evt.clientY - rect.top;
      this.selectionService.updateSelection(x, y);
    }
  }

  marginTransform = computed(() => {
    return `translate(${this.dataservice.margin.left}, ${this.dataservice.margin.top})`;
  });

  xAxisTransformString = computed(() => {
    const yScale = this.dataservice.yScale();
    return `translate(0, ${yScale.range()[0]})`; // for d3, (0,0) is the upper left hand corner. When looking at data, the lower left hand corner is (0,0)
  });

  yAxisTransformString = computed(() => {
    const xScale = this.dataservice.xScale();
    return `translate(${xScale.range()[0]}, 0)`;
  });

  activateX(): void {
    this.zoomXOnly.set(true);
    this.zoomYOnly.set(false);
  }

  activateY(): void {
    this.zoomXOnly.set(false);
    this.zoomYOnly.set(true);
  }

  activateXY(): void {
    this.zoomXOnly.set(true);
    this.zoomYOnly.set(true);
  }

  deactivateZoom(): void {
    this.zoomXOnly.set(false);
    this.zoomYOnly.set(false);
  }

  /**
   * Signal to control the x-axis time mode. Relative starts with 0, absolute reflects the time of day the data was recorded.
   */
  readonly xAxisTimeMode = signal<xAxisMode>('absolute');

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

  // Selection event handlers with unified pointer support
  /**
   * Handles pointer down events for selection mode (mouse, touch, stylus)
   * Starts potential selection but waits for drag threshold before actual selection
   */
  onPointerDown(event: PointerEvent): void {
    if (!this.selectionService.isSelectionMode()) return;

    // Prevent default behavior and event bubbling
    event.preventDefault();
    event.stopPropagation();

    const rect = this.svgGraph().nativeElement.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    this.selectionService.setGraphHeight(
      this.dataservice.graphDimensions().height -
        this.dataservice.margin.top -
        this.dataservice.margin.bottom
    );

    this.selectionService.startPotentialSelection(x, y);

    // Capture pointer for consistent tracking across element boundaries
    (event.target as Element).setPointerCapture(event.pointerId);
  }

  /**
   * Handles pointer up events to finalize or cancel selection
   * Distinguishes between click (clear selection) and drag (finalize selection)
   */
  onPointerUp(event: PointerEvent): void {
    if (!this.selectionService.isSelectionMode()) return;

    event.preventDefault();
    event.stopPropagation();

    const wasDragOperation = this.selectionService.finishSelection();

    // Release pointer capture
    (event.target as Element).releasePointerCapture(event.pointerId);

    // Prevent click event from firing if this was a drag operation
    if (wasDragOperation) {
      event.preventDefault();
    }
  }
}
