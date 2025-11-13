import { Component, ViewEncapsulation, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { FieldProdPlotComponent } from "../field-prod-plot/field-prod-plot.component";
import { FieldProdPlotlyComponent } from '../field-prod-plotly/field-prod-plotly.component';
import { CommonModule, AsyncPipe } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';
import { AppStateService } from '../app-state.service';
import { HakConnectionsService } from '../hak-connections.service';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatTableModule } from '@angular/material/table';
import { MatCheckboxModule } from '@angular/material/checkbox';
import {
  trigger, 
  state,
  style,
  animate,
  transition
} from '@angular/animations';

@Component({
  selector: 'app-field-summary',
  standalone: true,
  imports: [
    CommonModule, MatToolbarModule, MatButtonToggleModule, MatIconModule,
    AsyncPipe, ReactiveFormsModule, MatTableModule, MatCheckboxModule, MatGridListModule,
    FieldProdPlotComponent, FieldProdPlotlyComponent
],
  templateUrl: './field-summary.component.html',
  styleUrls: ['./field-summary.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: [
    trigger('slideInFromLeft', [
      state('void', style({ transform: 'translateX(-100%)', opacity: 0 })),
      state('*', style({ transform: 'translateX(0)', opacity: 1 })),
      transition('void => *', [animate('500ms ease-out')]),
      transition('* => void', [animate('300ms ease-in', style({ transform: 'translateX(-100%)', opacity: 0 }))])
    ])
  ]
})
export class FieldSummaryComponent implements OnInit, OnDestroy {
  
  fieldWells: any[] = [];
  wellAPIs: string[] = [];
  loading = false;
  errorMessage: string | null = null;
  selectedTeam: string | null = null;
  selectedField: string | null = null;
  fieldProduction: any[] = [];
  filters = ['Week', 'Month', 'Year', 'All Time'];

  filterForm!: FormGroup;
  defaultFilterValue = 'Year';

  private subscriptions = new Subscription();

  constructor(
    private hakConnectionsService: HakConnectionsService,
    public appState: AppStateService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.filterForm = this.fb.group({
      selectedTimeFilter: [this.defaultFilterValue]
    });

    // Watch filter changes (optional)
    this.subscriptions.add(
      this.filterForm.get('selectedTimeFilter')?.valueChanges.subscribe(value => {
        // this.appState.setCurrentFilter(value);
      })
    );

    // Watch for team changes
    this.subscriptions.add(
      this.appState.selectedTeam$.subscribe(team => {
        if (team && team !== this.selectedTeam) {
          this.selectedTeam = team;
          // You could trigger related updates here if needed
        }
      })
    );

    // Watch for field changes
    this.subscriptions.add(
      this.appState.selectedField$.subscribe(field => {
        if (field && field !== this.selectedField) {
          this.selectedField = field;
          // Automatically refresh data when field changes
          this.loadFieldWells();
          this.loadFieldProduction();
        }
      })
    );
  }

  ngOnDestroy(): void {
    // Prevent memory leaks
    this.subscriptions.unsubscribe();
  }

  selectField(field: string) {
    this.appState.setSelectedField(field);
  }

  loadFieldWells(): void {
    if (!this.selectedField) return;

    this.loading = true;
    this.errorMessage = null;

    this.hakConnectionsService.getFieldWells(this.selectedField).subscribe({
      next: (data) => {
        this.fieldWells = data || [];
        this.wellAPIs = data.map((s: { api: string }) => s.api);
        this.loading = false;
        //console.log('Field wells loaded:', data);
      },
      error: (error) => {
        console.error(error);
        this.errorMessage = 'Failed to load field wells.';
        this.loading = false;
      }
    });
  }

  loadFieldProduction(): void {
    if (!this.selectedField) return;

    this.loading = true;
    this.errorMessage = null;

    this.hakConnectionsService.getFieldProduction(this.selectedField).subscribe({
      next: (data) => {
        //That ensures the input binding [prod]="fieldProduction" actually detects a change and triggers ngOnChanges() in the child.
        this.fieldProduction = [...(data || [])];
        this.loading = false;
        console.log('Field production loaded:', data);
      },
      error: (error) => {
        console.error(error);
        this.errorMessage = 'Failed to load field production.';
        this.loading = false;
      }
    });
  }
}
