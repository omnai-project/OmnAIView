import { Component } from '@angular/core';
import { StartDataButtonComponent } from "../source-selection/start-data-from-source.component";
import { MatButtonModule } from '@angular/material/button';
@Component({
  selector: 'app-sidenav',
  imports: [StartDataButtonComponent, MatButtonModule],
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.css']
})
export class SidenavComponent {

}
