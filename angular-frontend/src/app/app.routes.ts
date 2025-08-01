import { Routes } from '@angular/router';
import { RenderMode } from '@angular/ssr';
import { mainComponent } from './main/main.component';

export const routes: Routes = [
  {
    path: 'main',
    children: [
      {
        path: 'main',
        component: mainComponent,

      }
    ],
  },
  {
    path: '**',
    redirectTo: 'main/main'
  }

];
