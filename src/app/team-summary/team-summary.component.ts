import { 
  Component, 
  OnInit,
  ChangeDetectionStrategy 
} from '@angular/core';
import { HakConnectionsService } from '../hak-connections.service';
import { AppStateService } from '../app-state.service';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-team-summary',
  imports: [
    MatButtonModule,
    MatCardModule,
    CommonModule
  ],
  templateUrl: './team-summary.component.html',
  styleUrl: './team-summary.component.scss'
})
export class TeamSummaryComponent implements OnInit {

  selectedTeam: string | null = null;
  
  stats: any[] = [];
  loading: boolean = false;
  errorMessage: string | null = null;

  constructor(
    private hakConnectionsService: HakConnectionsService,
    private appState: AppStateService
  ) {}

  ngOnInit(): void {
    this.appState.selectedTeam$.subscribe(team => {
      this.selectedTeam = team;
      this.loadTeamStatistics();
    });
  }

  ngOnChanges(): void {
    this.loadTeamStatistics();
    // console.log(this.selectedTeam);
  }

  teamStatistics: string | undefined;
  loadTeamStatistics(): void {
    if (!this.selectedTeam) {
     console.warn('No team selected yet');
     return;
    }
    this.loading = true;  // Set loading to true while the data is being fetched
    this.hakConnectionsService.getTeamStats(this.selectedTeam)
      .subscribe({
        next: (data) => {
          this.stats = data;  // Assign the data to the fields variable
          console.log(data);
          this.loading = false;  // Set loading to false after receiving the data
        },
        error: (error) => {
          this.errorMessage = 'Failed to load data';  // Set an error message if there's an issue
          this.loading = false;  // Set loading to false if there's an error
        }
      });
  }

}
