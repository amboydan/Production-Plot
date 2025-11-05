import { Routes } from '@angular/router';
import { MainComponent } from './main/main.component';
import { ContentComponent } from './content/content.component';
import { TeamSummaryComponent } from './team-summary/team-summary.component';

export const routes: Routes = [
  {
    path: '',
    component: MainComponent,
    children: [
      { path: 'teamOverview/:selectedTeam', component: TeamSummaryComponent },
      { path: 'fieldProduction', component: ContentComponent },
      { path: 'wellProduction', component: ContentComponent },
      { path: 'dirSurveys', component: ContentComponent },
      { path: 'wellConstruction', component: ContentComponent },
    ]
  }
];
