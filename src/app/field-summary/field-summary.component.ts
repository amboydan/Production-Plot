import { Component, ViewEncapsulation, OnInit } from '@angular/core'; // Added OnInit
import { CommonModule, AsyncPipe } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';
import { AppStateService } from '../app-state.service';
import { HakConnectionsService } from '../hak-connections.service';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms'; // Import FormBuilder, FormGroup

import {
  trigger,
  state,
  style,
  animate,
  transition
} from '@angular/animations'

@Component({
  selector: 'app-field-summary',
  standalone: true,
  imports: [CommonModule, MatToolbarModule, MatButtonToggleModule, MatIconModule, AsyncPipe, ReactiveFormsModule],
  templateUrl: './field-summary.component.html',
  styleUrls: ['./field-summary.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: [
    trigger('slideInFromLeft', [
          state('void', style({ transform: 'translateX(-100%)', opacity: 0 })), // Initial state (hidden left)
          state('*', style({ transform: 'translateX(0)', opacity: 1 })), // Final state (visible)
          transition('void => *', [ // Transition from hidden to visible
            animate('500ms ease-out') // Animation duration and easing
          ]),
          transition('* => void', [ // Optional: transition for when it leaves
            animate('300ms ease-in', style({ transform: 'translateX(-100%)', opacity: 0 }))
          ])
        ])
  ]
})
export class FieldSummaryComponent implements OnInit { // Implement OnInit

  filters = ['Week', 'Month', 'Year', 'All Time'];

  public filterForm!: FormGroup; 
  public defaultFilterValue: string = 'Year'; 

  constructor(
    private hakConnectionsService: HakConnectionsService, 
    public appState: AppStateService, 
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.filterForm = this.fb.group({
      selectedTimeFilter: [this.defaultFilterValue] 
    });
    
    this.filterForm.get('selectedTimeFilter')?.valueChanges.subscribe(value => {
      // this.appState.setCurrentFilter(value); 
    });

    this.appState.selectedField$.subscribe(field => {
      this.selectedField = field;
    });

    this.loadFieldWells();
    console.log(this.wells);
  }

  selectField(field: string) {
    this.appState.setSelectedField(field);
  }

  selectedField: string | null = null;
  wells: any[] = [];
  loading: boolean = false;
  errorMessage: string | null = null;
  
  loadFieldWells(): void {
    if (!this.selectedField) return;

    this.loading = true;
    this.errorMessage = null;

    this.hakConnectionsService.getFieldWells(this.selectedField).subscribe({
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
}
