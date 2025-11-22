import { AfterViewInit, Component} from '@angular/core';
import { HakConnectionsService } from '../hak-connections.service';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { TruncateAfterDashPipe } from '../truncate-after-dash.pipe';
import { Router, RouterLink } from '@angular/router';
import { AppStateService } from '../app-state.service';

@Component({
  selector: 'app-company-summary',
  imports: [
    MatButtonModule,
    MatCardModule,
    CommonModule,
    RouterLink,
    TruncateAfterDashPipe
  ],
  templateUrl: './company-summary.component.html',
  styleUrl: './company-summary.component.scss',
  animations: [
    trigger('fadeIn', [
      state('void', style({ opacity: 0, transform: 'translate(-50px, -20px)' })),
      transition(':enter', [
        animate('600ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ]
})
export class CompanySummaryComponent implements AfterViewInit{

  constructor(
    private hakConnectionsService: HakConnectionsService,
    private appState: AppStateService,
    private router: Router
  ) {}


  ngAfterViewInit(): void {
    this.loadTeams();  
  }

  teams: any[] = [];
  fields: any[] = [];
  loading = false;
  errorMessage: string | null = null;

  loadTeams() {
    this.loading = true;
    this.hakConnectionsService.getTeamList().subscribe({
      next: data => {
        this.teams = data;
        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'Failed to load teams';
        this.loading = false;
      }
    });
  }

  loadFields(team: string) {
    this.loading = true;
    this.hakConnectionsService.getFieldsList(team).subscribe({
      next: data => {
        this.fields = data;
        this.appState.setFields(data);
        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'Failed to load fields';
        this.loading = false;
      }
    });
  }

  goToTeam(team: any) {
    if (!team) return;

    // Update the selected field in the shared service
    this.appState.setSelectedTeam(team);
    this.appState.setSelectedField(null);
    this.loadFields(team);

    // Navigate to the field overview page
    this.router.navigate(['/teamOverview', team]);
  }

}
