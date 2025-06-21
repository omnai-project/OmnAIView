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
  readonly fixedXGuides = signal<number[]>([]);

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

    const zoomFactor = event.deltaY < 0 ? 1.1 : 0.9;

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
    const svgRect = (hover.target as HTMLElement).closest("svg")!.getBoundingClientRect();
    const topOffset = svgRect.top;
    const leftOffset = svgRect.left;

    const xaxis = this.dataservice.xScale();
    const yaxis = this.dataservice.yScale();
    const margin = this.dataservice.margin;

    const mouseX = hover.clientX - leftOffset - margin.left;
    const mouseY = hover.clientY - topOffset - margin.top;

    const ypos = Math.max(Math.min(mouseY, yaxis.range()[0]), yaxis.range()[1]);
    const xpos = Math.max(Math.min(mouseX, xaxis.range()[1]), xaxis.range()[0]);

    const g = this.guideContainer().nativeElement;
    const container = select(g);

    const yValue = yaxis.invert(ypos);
    const xValue = xaxis.invert(xpos);

    container.selectAll("line.temporary").remove();
    container.selectAll("text.temporary").remove();

    // Horizontale Linie + Label
    container.append("line")
      .attr("class", "temporary")
      .attr("stroke", "darkgray")
      .attr("stroke-opacity", 0.7)
      .attr("x1", 0)
      .attr("x2", "100%")
      .attr("y1", ypos)
      .attr("y2", ypos);

    container.append("text")
      .attr("class", "temporary")
      .attr("x", 5)
      .attr("y", ypos - 5)
      .attr("fill", "black")
      .attr("font-size", "12px")
      .attr("font-family", "sans-serif")
      .text(yValue.toFixed(1));

    // // Vertikale Linie (+ Label) wenn es funktionieren würde
    // container.append("line")
    //   .attr("class", "temporary")
    //   .attr("stroke", "darkgray")
    //   .attr("stroke-opacity", 0.7)
    //   .attr("y1", 0)
    //   .attr("y2", "100%")
    //   .attr("x1", xpos)
    //   .attr("x2", xpos);

    // container.append("text")
    //   .attr("class", "temporary")
    //   .attr("x", xpos + 5)
    //   .attr("y", 12)
    //   .attr("fill", "black")
    //   .attr("font-size", "12px")
    //   .attr("font-family", "sans-serif")
    //   //.text(yValue.toFixed(1))
    //   ;
  }

  onClick(event: MouseEvent) {
    const svgRect = (event.target as HTMLElement).closest("svg")!.getBoundingClientRect();
    const xaxis = this.dataservice.xScale();
    const yaxis = this.dataservice.yScale();
    const margin = this.dataservice.margin;

    const svgX = event.clientX - svgRect.left;
    const svgY = event.clientY - svgRect.top;

    const xDataValue = xaxis.invert(svgX - margin.left).getTime();
    const yDataValue = yaxis.invert(svgY - margin.top);

    this.fixedGuides.update(lines => [...lines, yDataValue]);
    this.fixedXGuides.update(lines => [...lines, xDataValue]);

    this.drawFixedLines();
  }

  drawFixedLines() {
    const g = this.guideContainer().nativeElement;
    const xaxis = this.dataservice.xScale();
    const yaxis = this.dataservice.yScale();

    const visibleHeight = yaxis.range();
    const visibleWidth = xaxis.range();

    const visibleYGuides = this.fixedGuides().filter(d => {
      const yPos = yaxis(d);
      return yPos >= visibleHeight[1] && yPos <= visibleHeight[0];
    });

    const visibleXGuides = this.fixedXGuides().filter(d => {
      const xPos = xaxis(new Date(d));
      return xPos >= visibleWidth[0] && xPos <= visibleWidth[1];
    });

    const container = select(g);
    container.selectAll("line.fixed").remove();
    container.selectAll("text.fixed").remove();

    // Horizontale Linien
    container
      .selectAll("line.fixed-h")
      .data(visibleYGuides)
      .join("line")
      .attr("class", "fixed fixed-h")
      .attr("stroke", "red")
      .attr("stroke-width", 1)
      .attr("stroke-dasharray", "2,2")
      .attr("x1", 0)
      .attr("x2", "100%")
      .attr("y1", d => yaxis(d))
      .attr("y2", d => yaxis(d));

    container
      .selectAll("text.fixed-h")
      .data(visibleYGuides)
      .join("text")
      .attr("class", "fixed fixed-h")
      .attr("x", 5)
      .attr("y", d => yaxis(d) - 5)
      .attr("fill", "red")
      .attr("font-size", "12px")
      .text(d => d.toFixed(1));

    // Vertikale Linien
    // container
    //   .selectAll("line.fixed-v")
    //   .data(visibleXGuides)
    //   .join("line")
    //   .attr("class", "fixed fixed-v")
    //   .attr("stroke", "blue")
    //   .attr("stroke-width", 1)
    //   .attr("stroke-dasharray", "2,2")
    //   .attr("x1", d => xaxis(new Date(d)))
    //   .attr("x2", d => xaxis(new Date(d)))
    //   .attr("y1", 0)
    //   .attr("y2", "100%");

    // container
    //   .selectAll("text.fixed-v")
    //   .data(visibleXGuides)
    //   .join("text")
    //   .attr("class", "fixed fixed-v")
    //   .attr("x", d => xaxis(new Date(d)) + 5)
    //   .attr("y", 12)
    //   .attr("fill", "blue")
    //   .attr("font-size", "12px")
    //   .text(d => new Date(d).toLocaleTimeString());
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

    // Vertikale Linien
    // select(g)
    // .append("g")
    // .attr("class", "vertical-grid")
    // .selectAll("line")
    // .data(x.ticks()) 
    // .join("line")
    // .attr("x1", d => 0.5 + x(d))
    // .attr("x2", d => 0.5 + x(d))
    // .attr("y1", 0)
    // .attr("y2", "100%"); 

    onCleanUp(() => g.innerHTML = "");
  });

  readonly updateGuidelines = effect(() => {
    if (!this.isInBrowser) return;
    this.fixedGuides();
    this.fixedXGuides();
    this.drawFixedLines();
  });

}