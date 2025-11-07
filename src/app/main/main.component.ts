import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { HeaderComponent } from '../header/header.component';
import { AppStateService } from '../app-state.service';
import { HakConnectionsService } from '../hak-connections.service';
import { AsyncPipe } from '@angular/common';


@Component({
  selector: 'app-main',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    //MatInputModule,
    MatSelectModule,
    MatFormFieldModule,
    MatSidenavModule,
    MatToolbarModule,
    MatListModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    HeaderComponent,
    AsyncPipe
  ],
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit {

  teams: any[] = [];
  fields: any[] = [];
  loading = false;
  errorMessage: string | null = null;

  constructor(
    private hakConnectionsService: HakConnectionsService,
    public appState: AppStateService, // make public to use async pipe
    private router: Router
  ) {}

  ngOnInit() {
    this.loadTeams();
  }

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
        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'Failed to load fields';
        this.loading = false;
      }
    });
  }

  
  wells: any[] = [];
  loadFieldWells(field: string): void {
    this.loading = true;
    this.errorMessage = null;

    this.hakConnectionsService.getFieldWells(field).subscribe({
      next: (data) => {
        this.wells = data || [];
        this.loading = false;
        console.log(data)
      },
      error: (error) => {
        console.error(error);
        this.errorMessage = 'Failed to load team wells.';
        this.loading = false;
      }
    });
  }

  onTeamSelect(team: string) {
    this.appState.setSelectedTeam(team);
    this.appState.setSelectedField(null);
    this.loadFields(team);
    this.router.navigate(['/teamOverview', team]);
  }

  onFieldSelect(field: string) {
    this.appState.setSelectedField(field);
    this.router.navigate(['/fieldOverview', field]);
    this.loadFieldWells(field);
  }
}
