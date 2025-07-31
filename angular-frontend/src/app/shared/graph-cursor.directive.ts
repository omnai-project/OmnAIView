// graph-cursor.directive.ts
import { Directive, ElementRef, inject, input, signal, WritableSignal } from '@angular/core';
import { fromEvent } from 'rxjs';
import { map } from 'rxjs/operators';
import { DataSourceService } from '../graph/graph-data.service';
import { timeFormat } from 'd3-time-format';

/**
 * Converts global pointer positions to coordinates of the graph.
 * Emits the current values through the `xValue` / `yValue` writable signals.
 * Attach to the graph’s <svg> or overlay <g>; enables a cross-hair cursor.
 */
@Directive({
    selector: '[appGraphCursor]',
    exportAs: 'appGraphCursor',
    host: { style: 'cursor: crosshair' }
})
export class GraphCursorDirective {
    /* flag to enable/disable tooltip without destroying directive */
    enabled = input(true);

    readonly xValue: WritableSignal<number | null> = signal(null);
    readonly yValue: WritableSignal<number | null> = signal(null);

    private readonly dataservice = inject(DataSourceService);
    private readonly svgEl = inject(ElementRef<SVGSVGElement>).nativeElement;

    fmtCursorTime = timeFormat('%H:%M:%S');

    constructor() {
        fromEvent<PointerEvent>(this.svgEl, 'pointermove')
            .pipe(
                map(evt => { // transfer mouse cursor coordinates into graph coordinates 
                    const pt = this.svgEl.createSVGPoint();
                    pt.x = evt.clientX; // receive svg coordinates globally 
                    pt.y = evt.clientY;
                    const loc = pt.matrixTransform(this.svgEl.getScreenCTM()?.inverse()); // transfer into svg corrdinates in graph 
                    const margin = this.dataservice.margin; // offset coordinates to fit graph margin 
                    const svgX = loc.x - margin.left;
                    const svgY = loc.y - margin.top;
                    const x = this.dataservice.xScale().invert(svgX).getTime(); // transfer into actual graph coordinates 
                    const y = this.dataservice.yScale().invert(svgY);
                    return { x, y };
                })
            )
            .subscribe(({ x, y }) => {
                if (this.enabled()) { // Set values if mouse tooltip is enabled 
                    this.xValue.set(x);
                    this.yValue.set(y);
                } else {
                    this.xValue.set(null);
                    this.yValue.set(null);
                }
            });

        /* reset when leaving svg area */
        fromEvent(this.svgEl, 'pointerleave').subscribe(() => {
            this.xValue.set(null);
            this.yValue.set(null);
        });
    }
}
