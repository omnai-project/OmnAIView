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
  type ElementRef
} from '@angular/core';
import { line, transition } from 'd3';
import { axisBottom, axisLeft } from 'd3-axis';
import { select } from 'd3-selection';
import { DeviceListComponent } from "../omnai-datasource/omnai-scope-server/devicelist.component";
import { ResizeObserverDirective } from '../shared/resize-observer.directive';
import { StartDataButtonComponent } from "../source-selection/start-data-from-source.component";
import { DataSourceService } from './graph-data.service';
import * as d3 from 'd3'

interface GraphComment {
  x: number;
  y: number;
  text: string;
}

@Component({
  selector: 'app-graph',
  standalone: true,
  templateUrl: './graph.component.html',
  providers: [DataSourceService],
  styleUrls: ['./graph.component.css'],
  imports: [ResizeObserverDirective, JsonPipe, StartDataButtonComponent, DeviceListComponent],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GraphComponent {
  readonly dataservice = inject(DataSourceService);
  readonly svgGraph = viewChild.required<ElementRef<SVGElement>>('graphContainer');
  readonly axesContainer = viewChild.required<ElementRef<SVGGElement>>('xAxis');
  readonly axesYContainer = viewChild.required<ElementRef<SVGGElement>>('yAxis');
  readonly gridContainer = viewChild.required<ElementRef<SVGGElement>>('grid');
  readonly guideContainer = viewChild.required<ElementRef<SVGGElement>>('guideline');
  readonly commentLayer = viewChild.required<ElementRef<SVGGElement>>('commentLayer');
  readonly fixedGuides = signal<number[]>([]);
  readonly comments = signal<GraphComment[]>([]);

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
    const botlimit = yaxis(0) + 20;
    const toplimit = yaxis(100) + 20;
    const ypos = Math.max(Math.min(event.clientY - topOffset, botlimit), toplimit);

    this.fixedGuides.update(lines => [...lines, ypos]);
    this.drawFixedLines();
  }

  onRightClick(event: MouseEvent) {
    event.preventDefault();

    const svg = (event.target as HTMLElement).closest("svg")!;
    const rect = svg.getBoundingClientRect();

    const x = event.clientX - rect.left - this.dataservice.margin.left;
    const y = event.clientY - rect.top - this.dataservice.margin.top;

    const commentText = prompt("Kommentar eingeben:");
    if (!commentText) return;

    this.comments.update(c => [...c, { x, y, text: commentText }]);

    this.addComment(x, y, commentText);
  }

  private addComment(x: number, y: number, text: string): void {
    const layer = d3.select(this.commentLayer().nativeElement);

    const group = layer
      .append('g')
      .attr('transform', `translate(${x},${y})`)
      .call(
        d3.drag<SVGGElement, unknown>()
          .on('drag', function (event) {
            d3.select(this).attr('transform', `translate(${event.x},${event.y})`);
          })
      );

    const textElement = group
      .append('text')
      .attr('x', 10)
      .attr('y', 25)
      .text(text)
      .attr('font-size', '14px')
      .attr('fill', '#333');

    const textNode = textElement.node();
    const textWidth = textNode ? textNode.getComputedTextLength() : 100;

    const rectWidth = textWidth + 30; 
    const rectHeight = 40;
      
    group
      .insert('rect', 'text') 
      .attr('width', rectWidth)
      .attr('height', rectHeight)
      .attr('fill', 'rgba(255, 255, 204, 0.9)') 
      .attr('stroke', '#ccc')
      .attr('stroke-width', 1)
      .attr('rx', 8)
      .attr('ry', 8)
      .style('filter', 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))');
    
    group.select('text')
      .attr('font-family', "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif")
      .attr('font-weight', '500')
      .attr('fill', '#333');  
    
    group
      .append('text')
      .attr('x', rectWidth - 15)
      .attr('y', 15)
      .text('✖')
      .attr('font-size', '16px')
      .attr('fill', '#900')
      .attr('cursor', 'pointer')
      .on('mouseover', function () {
        d3.select(this).attr('fill', '#f44336');
      })
      .on('mouseout', function () {
        d3.select(this).attr('fill', '#900');
      })
      .on('click', function () {
        group.remove();
    });
  }

  drawFixedLines() {
    const g = this.guideContainer().nativeElement;
    const lines = this.fixedGuides();
    const yaxis = this.dataservice.yScale();
  
    select(g).selectAll("line.fixed").remove();
    select(g)
      .selectAll("line.fixed")
      .data(lines)
      .join("line")
      .attr("class", "fixed")
      .attr("stroke", "red")
      .attr("stroke-width", 1)
      .attr("stroke-dasharray", "2,2")
      .attr("x1", 0)
      .attr("x2", "100%")
      .attr("y1", d => d - 20)
      .attr("y2", d => d - 20);
  
    select(g).selectAll("text.fixed").remove();
    select(g)
      .selectAll("text.fixed")
      .data(lines)
      .join("text")
      .attr("class", "fixed")
      .attr("x", 5)
      .attr("y", d => d - 25)
      .attr("fill", "red")
      .attr("font-size", "12px")
      .attr("font-family", "sans-serif")
      .text(d => yaxis.invert(d - 20).toFixed(1));
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

    // vertical grid
    // .call(g => g.append("g")
    //       .selectAll("line")
    //       .data(x.ticks())
    //       .join("line")
    //         .attr("x1", d => 0.5 + x(d))
    //         .attr("x2", d => 0.5 + x(d))
    //         .attr("y1", 0)
    //         .attr("y2", 100))
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
