import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { Router, RouterLink } from '@angular/router';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { HakConnectionsService } from '../hak-connections.service';
import { AppStateService } from '../app-state.service';
import { TruncateAfterDashPipe } from '../truncate-after-dash.pipe';

@Component({
  selector: 'app-team-summary',
  standalone: true,
  imports: [
    MatButtonModule,
    MatCardModule,
    CommonModule,
    RouterLink,
    TruncateAfterDashPipe
  ],
  templateUrl: './team-summary.component.html',
  styleUrls: ['./team-summary.component.scss'],
  animations: [
    trigger('fadeIn', [
      state('void', style({ opacity: 0, transform: 'translate(-50px, -20px)' })),
      transition(':enter', [
        animate('600ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ]
})
export class TeamSummaryComponent implements OnInit {

  selectedTeam: string | null = null;
  stats: any[] = [];
  fieldWells: any[] = [];
  wellAPIs: string[] = [];
  
  loading: boolean = false;
  errorMessage: string | null = null;

  constructor(
    private hakConnectionsService: HakConnectionsService,
    private appState: AppStateService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Subscribe to selected team from the app state service
    this.appState.selectedTeam$.subscribe(team => {
      this.selectedTeam = team;
      this.loadTeamStatistics();
    });
  }

  loadTeamStatistics(): void {
    if (!this.selectedTeam) return;

    this.loading = true;
    this.errorMessage = null;

    this.hakConnectionsService.getTeamStats(this.selectedTeam).subscribe({
      next: (data) => {
        this.stats = data || [];
        this.loading = false;
      },
      error: (error) => {
        console.error(error);
        this.errorMessage = 'Failed to load team stats.';
        this.loading = false;
      }
    });
  }

  isSumZero(obj: { [key: string]: number }): boolean {
    return Object.values(obj).reduce((sum, val) => sum + val, 0) === 0;
  }

  loadFieldWells(field: string): void {
    if (!field) return;

    this.loading = true;
    this.errorMessage = null;

    this.hakConnectionsService.getFieldWells(field).subscribe({
      next: (data) => {
        this.fieldWells = data || [];
        this.wellAPIs = data.map((s: { api: string }) => s.api);
        this.appState.setWells(data);
        this.loading = false;
      },
      error: (error) => {
        console.error(error);
        this.errorMessage = 'Failed to load field wells.';
        this.loading = false;
      }
    });
  }

  goToField(stat: any) {
    if (!stat?.field_nm) return;

    // Update the selected field in the shared service
    this.appState.setSelectedField(stat.field_nm);
    this.loadFieldWells(stat.field_nm);
    // Navigate to the field overview page
    this.router.navigate(['/fieldOverview', stat.field_nm]);
  }

  

}
