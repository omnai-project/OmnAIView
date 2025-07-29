import { AfterViewInit, Directive, OnDestroy, Input, inject, ElementRef } from "@angular/core";
import { ZoomBehavior, zoom, ZoomTransform } from "d3-zoom";
import { select } from "d3";
import { DataSourceService } from "../graph/graph-data.service";
/**
 * Attaches d3.zoom() to any <svg> or <g>.
 * The directive attaches a ZoomBehavior to the host element.
 * Every zoom / pan gesture emits the resulting **ZoomTransform**
 *   to `DataSourceService.setZoom()`.
 * `DataSourceService` combines that transform with its baseline
 *   scales, so axes, grid and line update automatically.
 * Usage:
 *   <svg appZoomable [minZoom]="0.5" [maxZoom]="32"></svg>
 */
@Directive({
    selector: '[appZoomable]',
    standalone: true
})
export class ZoomableDirective implements AfterViewInit, OnDestroy {
    /**
    * How far the user can zoom *out*
    * MINZOOM < 1 compresses multiple data‑pixels into one screen‑pixel.
    * User can shrink the graph up to MINZOOM x 
    */
    @Input() MINZOOM = 0.5;
    /**
     * How far the user can zoom *in*
     * A zoom factor k means “one data‑pixel covers k canvas‑pixels".
     * User can magnify the graph up to MAXZOOM x 
     */
    @Input() MAXZOOM = 32;

    private readonly dataservice = inject(DataSourceService);
    private readonly svgElement = inject(ElementRef) as ElementRef<SVGSVGElement>;

    private zoomBehaviour: ZoomBehavior<SVGSVGElement, unknown> | null = null;

    ngAfterViewInit(): void {
        this.initZoom();
    }
    ngOnDestroy(): void {
        select(this.svgElement.nativeElement).on('zoom', null);
    }

    private initZoom() {

        this.zoomBehaviour = zoom<SVGSVGElement, unknown>()
            .scaleExtent([this.MINZOOM, this.MAXZOOM])
            .on('zoom', ({ transform }) => this.onZoom(transform));

        select(this.svgElement.nativeElement).call(this.zoomBehaviour as any);
    }

    private onZoom(t: ZoomTransform) {
        this.dataservice.setZoom(t);
    }
}