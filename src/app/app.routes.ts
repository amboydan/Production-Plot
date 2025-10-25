import { Routes } from '@angular/router';
import { MainComponent } from './main/main.component';
import { ContentComponent } from './content/content.component';

export const routes: Routes = [
  {
    path: '',
    component: MainComponent,
    children: [
      { path: 'fieldProduction', component: ContentComponent },
      { path: 'dirSurveys', component: ContentComponent },
      { path: 'wellConstruction', component: ContentComponent }
    ]
  }
];
