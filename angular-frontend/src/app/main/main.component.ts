import { Component } from "@angular/core";
import { GraphComponent } from "../graph/graph.component";
import { ToolbarComponent } from "../toolbar/toolbar.component";
import { SideBarComponent } from "../sidebar/sidebar.component";

/**
 * Main Component containing all components shown on the main page 
 */
@Component({
    selector: 'app-main',
    templateUrl: './main.component.html',
    styleUrl: './main.component.css',
    imports: [GraphComponent, ToolbarComponent, SideBarComponent]
})
export class mainComponent {

}