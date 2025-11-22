import { Routes } from '@angular/router';
import { MainComponent } from './main/main.component';
import { ContentComponent } from './content/content.component';
import { TeamSummaryComponent } from './team-summary/team-summary.component';
import { FieldSummaryComponent } from './field-summary/field-summary.component';
import { CompanySummaryComponent } from './company-summary/company-summary.component';

export const routes: Routes = [
  {
    path: '',
    component: MainComponent,
    children: [
      { path: 'companyOverview', component: CompanySummaryComponent},
      { path: 'teamOverview/:selectedTeam', component: TeamSummaryComponent },
      { path: 'fieldOverview/:selectedField', component: FieldSummaryComponent },
      { path: 'wellProduction', component: ContentComponent },
      { path: 'dirSurveys', component: ContentComponent },
      { path: 'wellConstruction', component: ContentComponent },
    ]
  }
];
