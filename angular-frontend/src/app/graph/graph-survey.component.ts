import { Component } from "@angular/core";
import { GraphCursorDirective } from "../shared/graph-cursor.directive";
import { DataSourceService } from "./graph-data.service";
import { input, inject, signal, computed } from "@angular/core";
import { MatSlideToggle } from "@angular/material/slide-toggle";
import { DecimalPipe } from "@angular/common";

/**
 * On selector usage : Toggle button to activate survey Mode.  
 * Functions: Provide logic to use survey mode for an svg graph. 
 */
@Component({
    selector: `app-graph-survey`,
    template: `
        <mat-slide-toggle [checked]="surveyMeasurement()" (change)="toggleSurveyTool()">Survey
        Measurement</mat-slide-toggle>
        @if (delta()) {
        <p class="readout">
            Δt: {{ delta()!.dt | number:'1.0-0' }} ms<br>
            Δy: {{ delta()!.dy | number:'1.2-2' }}
        </p>
        }
    `,
    imports: [MatSlideToggle, DecimalPipe]
})
export class GraphSurveyComponent {

    cursor = input.required<GraphCursorDirective>();
    private dataservice = inject(DataSourceService);
    surveyMeasurement = signal(false);

    firstPoint = signal<{ x: number; y: number } | null>(null);
    secondPoint = signal<{ x: number; y: number } | null>(null);

    /** derived Δ */
    delta = computed(() => {
        const a = this.firstPoint();
        const b = this.secondPoint();
        return a && b ? { dt: b.x - a.x, dy: b.y - a.y } : null;
    });

    // graph.component.ts
    markerTransform(p: { x: number; y: number }): string {
        const sx = this.dataservice.xScale()(new Date(p.x));
        const sy = this.dataservice.yScale()(p.y);
        return `translate(${sx},${sy})`;
    }


    toggleSurveyTool() {
        this.surveyMeasurement.update(v => !v);
        this.resetSurvey();
    }

    onGraphClick() {
        if (!this.surveyMeasurement()) {
            this.resetSurvey()
            return;
        }
        const cursor = this.cursor();
        if (!cursor) return;
        const x = cursor.xValue();    // from GraphCursorDirective
        const y = cursor.yValue();
        if (x === null || y === null) return;   // cursor outside plot

        if (this.firstPoint() === null) {
            this.firstPoint.set({ x, y });
        } else {
            this.secondPoint.set({ x, y });
        }
    }

    resetSurvey() {
        this.firstPoint.set(null);
        this.secondPoint.set(null);
    }
}