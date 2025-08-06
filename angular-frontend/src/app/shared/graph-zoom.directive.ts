import { AfterViewInit, Directive, OnDestroy, Input, inject, ElementRef, input, effect } from "@angular/core";
import { ZoomBehavior, zoom, ZoomTransform, zoomIdentity, zoomTransform } from "d3-zoom";
import { select } from "d3";
import { DataSourceService } from "../graph/graph-data.service";
import { D3ZoomEvent } from "d3-zoom";
import { pointer } from "d3";
/**
 * Attaches d3.zoom() to any <svg> or <g>.
 * The directive attaches a ZoomBehavior to the host element.
 * Every zoom / pan gesture emits the resulting **ZoomTransform**
 *   to `DataSourceService.setZoom()`.
 * `DataSourceService` combines that transform with its baseline
 *   scales, so axes, grid and line update automatically.
 */
@Directive({
    selector: '[appZoomable]'
})
export class ZoomableDirective implements AfterViewInit, OnDestroy {
    /**
    * How far the user can zoom *out*
    * MINZOOM < 1 compresses multiple data‑pixels into one screen‑pixel.
    * User can shrink the graph up to MINZOOM x 
    */
    MINZOOM = input(0.5);
    /**
     * How far the user can zoom *in*
     * A zoom factor k means “one data‑pixel covers k canvas‑pixels".
     * User can magnify the graph up to MAXZOOM x 
     */
    MAXZOOM = input(32);
    /**
     * If only the X-Axis is zoomed in on zoom behavior
     */
    onlyXZoom = input(false);
    /** 
     * If only the Y-Axis is zoomed in on zoom behavior
     */
    onlyYZoom = input(false);
    /** 
     * Should contain inner plot Area without margins 
     */
    plotHost = input<Element | null>(null);

    private readonly dataservice = inject(DataSourceService);
    private readonly svgElement = inject(ElementRef) as ElementRef<SVGSVGElement>;

    private zoomBehaviour: ZoomBehavior<SVGSVGElement, unknown> | null = null;
    private last = zoomIdentity;
    private gx: SVGGElement | null = null;
    private gy: SVGGElement | null = null;
    private zoomX: ZoomBehavior<SVGGElement, unknown> | null = null;
    private zoomY: ZoomBehavior<SVGGElement, unknown> | null = null;
    private tx: () => ZoomTransform = () => zoomIdentity;
    private ty: () => ZoomTransform = () => zoomIdentity;


    ngAfterViewInit(): void {
        this.initZoom();
    }
    ngOnDestroy(): void {
        select(this.svgElement.nativeElement).on('zoom', null);
    }

    private initZoom() {
        const root = select(this.svgElement.nativeElement);
        this.gx = root.append('g').style('pointer-events', 'none').node() as SVGGElement;
        this.gy = root.append('g').style('pointer-events', 'none').node() as SVGGElement;
        this.zoomX = zoom<SVGGElement, unknown>().scaleExtent([this.MINZOOM(), this.MAXZOOM()]);
        this.zoomY = zoom<SVGGElement, unknown>().scaleExtent([this.MINZOOM(), this.MAXZOOM()]);

        select(this.gx).call(this.zoomX!);
        select(this.gy).call(this.zoomY);

        this.tx = () => zoomTransform(this.gx!);
        this.ty = () => zoomTransform(this.gy!);

        this.zoomBehaviour = zoom<SVGSVGElement, unknown>()
            .scaleExtent([this.MINZOOM(), this.MAXZOOM()])
            .on('zoom', (e: D3ZoomEvent<SVGSVGElement, unknown>) => this.onZoom(e));

        select(this.svgElement.nativeElement).call(this.zoomBehaviour);
    }

    /**
     * Dispatches the d3 ZoomTransform together with the selected axis from the axis input  
     * @param t The `D3ZoomEvent` emitted by the d3‑zoom behaviour
     * 
     * This function separates the transform on the x-axis and y-axis based on the Directive inputs 
     * as the scale cant be separate into x-scale and y-scale on one transform object 
     * Example for this code : https://observablehq.com/@d3/x-y-zoom
     */
    private onZoom(e: D3ZoomEvent<SVGSVGElement, unknown>): void {
        if (!this.gx || !this.gy || !this.zoomX || !this.zoomY) return;
        const t = e.transform;
        const k = t.k / this.last.k; // only use latest scale changes 
        const point = pointer(e.sourceEvent, this.plotHost()) as [number, number];

        const doX = this.onlyXZoom();
        const doY = this.onlyYZoom();

        // only translate or scale with latest changes, automatically updates tx, ty 
        if (k === 1) { // pure translation
            doX && select(this.gx).call(this.zoomX.translateBy, (t.x - this.last.x) / this.tx().k, 0);
            doY && select(this.gy).call(this.zoomY.translateBy, 0, (t.y - this.last.y) / this.ty().k);
        } else { // zooming on a fixed point 
            doX && select(this.gx).call(this.zoomX.scaleBy, k, point);
            doY && select(this.gy).call(this.zoomY.scaleBy, k, point);
        }

        this.last = t;
        this.dataservice.setZoom(this.tx(), this.ty());

    }
}