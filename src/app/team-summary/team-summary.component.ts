import { 
  Component, 
  OnChanges, 
  OnInit, 
  SimpleChanges
} from '@angular/core';
import { HakConnectionsService } from '../hak-connections.service';
import { AppStateService } from '../app-state.service';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { CommonModule } from '@angular/common';
import { ViewEncapsulation } from '@angular/core';
import { 
  trigger, 
  state,
  style,
  transition,
  animate
} from '@angular/animations';
import { Router, RouterLink } from "@angular/router";

@Component({
  selector: 'app-team-summary',
  standalone: true,
  imports: [
    MatButtonModule,
    MatCardModule,
    CommonModule,
    RouterLink
],
  templateUrl: './team-summary.component.html',
  styleUrls: ['./team-summary.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: [
    trigger('fadeIn', [
      state('void', style(
        { opacity: 0, transform: 'translate(-50px, -20px)' }
      )),
      transition(':enter', [
        animate('600ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ]
})

export class TeamSummaryComponent implements OnInit {

  selectedTeam: string | null = null;
  stats: any[] = [];
  loading: boolean = false;
  errorMessage: string | null = null;

  constructor(
    private hakConnectionsService: HakConnectionsService,
    private appState: AppStateService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.appState.selectedTeam$.subscribe(team => {
      this.selectedTeam = team;
      this.loadTeamStatistics();
    });
  }

  loadTeamStatistics(): void {
    if (!this.selectedTeam) {
      console.warn('No team selected yet');
      return;
    }

    this.loading = true;
    this.errorMessage = null;

    this.hakConnectionsService.getTeamStats(this.selectedTeam)
      .subscribe({
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
    const sum = Object.values(obj).reduce((acc, currentVal) => acc + currentVal, 0);
    return sum === 0;
  }

  goToField(stat: any) {
    this.appState.setSelectedField(stat.field_nm)
    this.router.navigate(['/fieldOverview', stat.field_nm])
  }

  goToFieldOverview(field: string) {
    this.appState.setActiveLink('fieldOverview'); // key for the sidebar
    this.router.navigate(['/fieldOverview', field]);
  } 

}
