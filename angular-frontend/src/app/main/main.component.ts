import { Component, inject } from "@angular/core";
import { DarkmodeComponent } from '../darkmode/darkmode.component';
import { GraphComponent } from "../graph/graph.component";
import { ToolbarComponent } from "../toolbar/toolbar.component";

/**
 * Main Component containing all components shown on the main page 
 */
@Component({
    selector: 'app-main',
    templateUrl: './main.component.html',
    imports: [DarkmodeComponent, GraphComponent, ToolbarComponent]
})
export class mainComponent {

}