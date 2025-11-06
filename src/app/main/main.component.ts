import { Component, OnInit } from '@angular/core';
 import { CommonModule } from '@angular/common';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { 
  Router,
  RouterOutlet,
  RouterLink,
  RouterLinkActive 
} from '@angular/router';
import { HeaderComponent } from "../header/header.component";
import {FormsModule} from '@angular/forms';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {MatFormFieldModule} from '@angular/material/form-field';
import { HakConnectionsService } from '../hak-connections.service';
import { AppStateService } from '../app-state.service';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-main',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatInputModule,
    MatSelectModule,
    MatFormFieldModule,
    MatSidenavModule, 
    MatToolbarModule, 
    MatListModule,
    RouterOutlet, 
    HeaderComponent, 
    RouterLink, 
    RouterLinkActive
  ],
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit {

  teams: any[] = [];
  fields: any[] = [];
  loading: boolean = false;
  errorMessage: string | null = null;

  constructor(
    private hakConnectionsService: HakConnectionsService,
    private router: Router,
    private appState: AppStateService,
    private cd: ChangeDetectorRef
  ) {}

   ngOnInit(): void {
    this.loadTeams();
    this.appState.selectedField$.subscribe(field => this.selectedField = field ?? undefined);
    this.appState.selectedTeam$.subscribe(team => this.selectedTeam = team ?? undefined);
  //   this.appState.selectedField$.subscribe(field => {
  //   this.selectedField = field ?? undefined;
  //   console.log('Sidebar selected field:', field);
  // });
  }

  onTeamSelect(selectedTeam: string) {
    if (selectedTeam) {
      this.selectedField = ''
      this.appState.setSelectedTeam(selectedTeam);
      this.router.navigate(['/teamOverview', selectedTeam]);
      this.loadFields(selectedTeam);
    }
  }
  

  onFieldSelect(selectedField: string) {
    if (selectedField) {
      this.appState.setSelectedField(selectedField);
      this.router.navigate(['/fieldOverview', selectedField]);
    }
  }

  selectedTeam: string | undefined;
  loadTeams(): void {
    this.loading = true;  // Set loading to true while the data is being fetched
    this.hakConnectionsService.getTeamList()
      .subscribe({
        next: (data) => {
          this.teams = data;  // Assign the data to the fields variable
          this.loading = false;  // Set loading to false after receiving the data
        },
        error: (error) => {
          this.errorMessage = 'Failed to load data';  // Set an error message if there's an issue
          this.loading = false;  // Set loading to false if there's an error
        }
      });
  }

  selectedField: string | undefined
  loadFields(selectedTeam: string): void {
    this.loading = true;  // Set loading to true while the data is being fetched
    this.hakConnectionsService.getFieldsList(selectedTeam)
      .subscribe({
        next: (data) => {
          this.fields = data;  // Assign the data to the fields variable
          this.loading = false;  // Set loading to false after receiving the data
        },
        error: (error) => {
          this.errorMessage = 'Failed to load data';  // Set an error message if there's an issue
          this.loading = false;  // Set loading to false if there's an error
        }
      });
  }
  

}

