import { Routes } from '@angular/router';
import { GraphComponent } from './graph/graph.component';
import { RenderMode } from '@angular/ssr';

export const routes: Routes = [
  {
    path: 'graph',
    children: [
      {
        path: 'main',
        component: GraphComponent,
        
      }
    ],
  },
  {
  path: '**',
  redirectTo: 'graph/main'
}

];
