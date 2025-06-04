import { isPlatformBrowser, JsonPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  PLATFORM_ID,
  signal,
  viewChild,
  type ElementRef,
  AfterViewInit
} from '@angular/core';
import { axisBottom, axisLeft } from 'd3-axis';
import { select } from 'd3-selection';
import { DeviceListComponent } from "../omnai-datasource/omnai-scope-server/devicelist.component";
import { ResizeObserverDirective } from '../shared/resize-observer.directive';
import { StartDataButtonComponent } from "../source-selection/start-data-from-source.component";
import { DataSourceService } from './graph-data.service';
import { transition } from 'd3-transition';
import { zoomIdentity, ZoomTransform } from 'd3-zoom';

@Component({
  selector: 'app-graph',
  standalone: true,
  templateUrl: './graph.component.html',
  providers: [DataSourceService],
  styleUrls: ['./graph.component.css'],
  imports: [ResizeObserverDirective, JsonPipe, StartDataButtonComponent, DeviceListComponent],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GraphComponent implements AfterViewInit {
  readonly dataservice = inject(DataSourceService);
  readonly svgGraph = viewChild.required<ElementRef<SVGElement>>('graphContainer');
  readonly axesContainer = viewChild.required<ElementRef<SVGGElement>>('xAxis');
  readonly axesYContainer = viewChild.required<ElementRef<SVGGElement>>('yAxis');
  readonly gridContainer = viewChild.required<ElementRef<SVGGElement>>('grid');
  readonly guideContainer = viewChild.required<ElementRef<SVGGElement>>('guideline');
  readonly fixedGuides = signal<number[]>([]);

  private readonly platform = inject(PLATFORM_ID);
  isInBrowser = isPlatformBrowser(this.platform);

  constructor() {
    if (this.isInBrowser) {
      queueMicrotask(() => {
        const rect = this.svgGraph().nativeElement.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          this.dataservice.updateGraphDimensions({ width: rect.width, height: rect.height });
        }
      });
    }
  }

  //   private isDragging = false;
  // private dragStart: { x: number, y: number } | null = null;

  // private initPan() {
  //   const svgElement = this.svgGraph().nativeElement;

  //   svgElement.addEventListener('mousedown', (event) => {
  //     if (event.button !== 0) return; // nur linke Maustaste
  //     this.isDragging = true;
  //     this.dragStart = { x: event.clientX, y: event.clientY };
  //   });

  //   window.addEventListener('mousemove', (event) => {
  //     if (!this.isDragging || !this.dragStart) return;

  //     const dx = event.clientX - this.dragStart.x;
  //     const dy = event.clientY - this.dragStart.y;

  //     const xScale = this.dataservice.xScale();
  //     const yScale = this.dataservice.yScale();

  //     const [x0, x1] = xScale.domain().map(d => d.getTime());
  //     const [y0, y1] = yScale.domain();

  //     const xRange = x1 - x0;
  //     const yRange = y1 - y0;

  //     const { width, height } = this.dataservice.graphDimensions();

  //     const xShift = (dx / width) * xRange;
  //     const yShift = (dy / height) * yRange;

  //     this.dataservice.setDomains(
  //       [new Date(x0 - xShift), new Date(x1 - xShift)],
  //       [y0 + yShift, y1 + yShift]
  //     );

  //     this.dragStart = { x: event.clientX, y: event.clientY };
  //   });

  //   window.addEventListener('mouseup', () => {
  //     this.isDragging = false;
  //     this.dragStart = null;
  //   });
  // }

  private initKeyboardPan() {
    window.addEventListener('keydown', (event) => {
      const step = 0.05;

      const xScale = this.dataservice.xScale();
      const yScale = this.dataservice.yScale();
      const [x0, x1] = xScale.domain().map(d => d.getTime());
      const [y0, y1] = yScale.domain();

      const xRange = x1 - x0;
      const yRange = y1 - y0;

      let dx = 0, dy = 0;

      switch (event.key) {
        case 'ArrowLeft': dx = -step * xRange; break;
        case 'ArrowRight': dx = step * xRange; break;
        case 'ArrowDown': dy = -step * yRange; break;
        case 'ArrowUp': dy = step * yRange; break;
        default: return;
      }

      this.dataservice.setDomains(
        [new Date(x0 + dx), new Date(x1 + dx)],
        [y0 + dy, y1 + dy]
      );
    });
  }


  currentTransform: ZoomTransform = zoomIdentity;
  ngAfterViewInit(): void {
    if (this.isInBrowser) {
      this.initZoom();
      // this.initPan();
      this.initKeyboardPan();
    }
  }

  private initZoom() {
    const svgElement = this.svgGraph().nativeElement;
    svgElement.addEventListener("wheel", this.onWheel.bind(this), { passive: false });
  }

  onWheel(event: WheelEvent): void {
    if (!this.isInBrowser) return;
    event.preventDefault();

    const svgElement = this.svgGraph().nativeElement;
    const { left, top } = svgElement.getBoundingClientRect();
    const svgX = event.clientX - left;
    const svgY = event.clientY - top;

    const xScale = this.dataservice.xScale();
    const yScale = this.dataservice.yScale();

    const [x0, x1] = xScale.domain().map(d => d.getTime());
    const [y0, y1] = yScale.domain();
    const margin = this.dataservice.margin;
    const mouseX = svgX - margin.left;
    const mouseY = svgY - margin.top;

    const xValueUnderMouse = xScale.invert(mouseX).getTime();
    const yValueUnderMouse = yScale.invert(mouseY);

    // I'm not sure why mousewheel and touchpad behave inverted but oh well this is a godgiven feature now
    const zoomFactor = event.deltaY < 0 ? 0.9 : 1.1;

    const newX0 = xValueUnderMouse + (x0 - xValueUnderMouse) * zoomFactor;
    const newX1 = xValueUnderMouse + (x1 - xValueUnderMouse) * zoomFactor;

    const newY0 = yValueUnderMouse + (y0 - yValueUnderMouse) * zoomFactor;
    const newY1 = yValueUnderMouse + (y1 - yValueUnderMouse) * zoomFactor;

    this.dataservice.setDomains(
      [new Date(newX0), new Date(newX1)],
      [newY0, newY1]
    );

    const baseX = this.dataservice.xScale();
    const baseY = this.dataservice.yScale();


    const newXScale = this.dataservice.xScale();
    const newYScale = this.dataservice.yScale();

    this.currentTransform = zoomIdentity
      .scale((newX1 - newX0) / (x1 - x0))
      .translate(
        -newX0 / ((newX1 - newX0) / (x1 - x0)), 0
      );

    this.drawFixedLines();
  }

  updateGraphDimensions(dimension: { width: number, height: number }) {
    this.dataservice.updateGraphDimensions(dimension);
  }

  onMouseMove(hover: MouseEvent) {
    const topOffset = ((hover.target as HTMLElement).closest("svg")!.getBoundingClientRect().top);
    const yaxis = this.dataservice.yScale();
    const botlimit = yaxis(0) + 20;
    const toplimit = yaxis(100) + 20;
    const ypos = Math.max(Math.min(hover.clientY - topOffset, botlimit), toplimit);

    const g = this.guideContainer().nativeElement;
    const container = select(g);

    const value = yaxis.invert(ypos - 20);
    const formatted = value.toFixed(1);

    container.selectAll("line.temporary")
      .data([ypos])
      .join("line")
      .attr("class", "temporary")
      .attr("stroke", "darkgray")
      .attr("stroke-opacity", 0.7)
      .attr("x1", 0)
      .attr("x2", "100%")
      .attr("y1", d => d - 20)
      .attr("y2", d => d - 20);

    container.selectAll("text.temporary")
      .data([ypos])
      .join("text")
      .attr("class", "temporary")
      .attr("x", 5)
      .attr("y", d => d - 25)
      .attr("fill", "black")
      .attr("font-size", "12px")
      .attr("font-family", "sans-serif")
      .text(formatted);
  }

  onClick(event: MouseEvent) {
    const topOffset = ((event.target as HTMLElement).closest("svg")!.getBoundingClientRect().top);
    const yaxis = this.dataservice.yScale();
    const svgY = event.clientY - topOffset;
    const botlimit = yaxis(0) + 20;
    const toplimit = yaxis(100) + 20;
    const ypos = Math.max(Math.min(svgY, botlimit), toplimit);
    const yDataValue = yaxis.invert(ypos - this.dataservice.margin.top);

    this.fixedGuides.update(lines => [...lines, yDataValue]);
    this.drawFixedLines();
  }

  drawFixedLines() {
    const g = this.guideContainer().nativeElement;
    const yaxis = this.dataservice.yScale();

    select(g).selectAll("line.fixed").remove();
    select(g).selectAll("text.fixed").remove();
    select(g)
      .selectAll("line.fixed")
      .data(this.fixedGuides())
      .join("line")
      .attr("class", "fixed")
      .attr("stroke", "red")
      .attr("stroke-width", 1)
      .attr("stroke-dasharray", "2,2")
      .attr("x1", 0)
      .attr("x2", "100%")
      .attr("y1", d => yaxis(d))
      .attr("y2", d => yaxis(d));

    select(g)
      .selectAll("text.fixed")
      .data(this.fixedGuides())
      .join("text")
      .attr("class", "fixed")
      .attr("x", 5)
      .attr("y", d => yaxis(d) - 5)
      .attr("fill", "red")
      .attr("font-size", "12px")
      .attr("font-family", "sans-serif")
      .text(d => d.toFixed(1));
  }

  marginTransform = computed(() => {
    return `translate(${this.dataservice.margin.left}, ${this.dataservice.margin.top})`;
  });

  xAxisTransformString = computed(() => {
    const yScale = this.dataservice.yScale();
    return `translate(0, ${yScale.range()[0]})`;
  });

  yAxisTransformString = computed(() => {
    const xScale = this.dataservice.xScale();
    return `translate(${xScale.range()[0]}, 0)`;
  });

  updateXAxisInCanvas = effect(() => {
    if (!this.isInBrowser) return;
    const x = this.dataservice.xScale();
    const g = this.axesContainer().nativeElement;
    select(g).transition(transition()).duration(300).call(axisBottom(x));
  });

  updateYAxisInCanvas = effect(() => {
    if (!this.isInBrowser) return;
    const y = this.dataservice.yScale();
    const g = this.axesYContainer().nativeElement;
    select(g).transition(transition()).duration(300).call(axisLeft(y));
  });

  updateGridInCanvas = effect((onCleanUp) => {
    if (!this.isInBrowser) return;
    const x = this.dataservice.xScale();
    const y = this.dataservice.yScale();
    const g = this.gridContainer().nativeElement;

    select(g).attr("stroke", "lightgray").attr("stroke-opacity", 0.7);

    // Horizontale Linien
    select(g)
      .append("g")
      .attr("class", "horizontal-grid")
      .selectAll("line")
      .data(y.ticks())
      .join("line")
      .attr("y1", d => 0.5 + y(d))
      .attr("y2", d => 0.5 + y(d))
      .attr("x1", 0)
      .attr("x2", "100%");

    onCleanUp(() => g.innerHTML = "");
  });
}

// drawGrid() {
//   const g = this.gridContainer().nativeElement;
//   const x = this.dataservice.xScale();
//   const y = this.dataservice.yScale();

//   select(g).attr("stroke", "lightgray").attr("stroke-opacity", 0.7);

//    // vertical grid
//   // .call(g => g.append("g")
//   //       .selectAll("line")
//   //       .data(x.ticks())
//   //       .join("line")
//   //         .attr("x1", d => 0.5 + x(d))
//   //         .attr("x2", d => 0.5 + x(d))
//   //         .attr("y1", 0)
//   //         .attr("y2", 100))
//   // horizontale Linien
//   select(g)
//     .append("g")
//     .attr("class", "horizontal-grid")
//     .selectAll("line")
//     .data(y.ticks())
//     .join("line")
//     .attr("y1", d => 0.5 + y(d))
//     .attr("y2", d => 0.5 + y(d))
//     .attr("x1", 0)
//     .attr("x2", "100%");
// }

// clearGrid() {
//   this.gridContainer().nativeElement.innerHTML = '';
// }
