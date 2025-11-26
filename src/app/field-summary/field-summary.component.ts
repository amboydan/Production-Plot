import { Component, ViewEncapsulation, OnInit, OnDestroy, OnChanges, SimpleChanges } from '@angular/core';
import { Subscription } from 'rxjs';
import { FieldProdPlotComponent } from "../field-prod-plot/field-prod-plot.component";
import { FieldProdPlotlyComponent } from '../field-prod-plotly/field-prod-plotly.component';
import { CommonModule, AsyncPipe } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { AppStateService } from '../app-state.service';
import { HakConnectionsService } from '../hak-connections.service';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormsModule, FormControl } from '@angular/forms';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatTableModule } from '@angular/material/table';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { TruncateAfterDashPipe } from '../truncate-after-dash.pipe';
import { FieldDataTable } from '../field-statistics-table/helpers/data-models';

import {
  trigger, 
  state,
  style,
  animate,
  transition
} from '@angular/animations';
import { MatFormField, MatLabel, MatHint } from "@angular/material/form-field";
import {MatInputModule} from '@angular/material/input';
import { FieldStatisticsTableComponent } from "../field-statistics-table/field-statistics-table.component";

@Component({
  selector: 'app-field-summary',
  standalone: true,
  imports: [
    CommonModule, MatToolbarModule, MatButtonToggleModule, MatIconModule, MatDatepickerModule,
    AsyncPipe, ReactiveFormsModule, MatTableModule, MatCheckboxModule, MatGridListModule,
    FieldProdPlotlyComponent, MatInputModule, FormsModule, TruncateAfterDashPipe,
    FieldStatisticsTableComponent
],
  templateUrl: './field-summary.component.html',
  styleUrls: ['./field-summary.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [provideNativeDateAdapter()],
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
  filters = ['Week', 'Month', 'Year', '5 Years', '10 Years', 'All Time'];
  scales = ['Log', 'Linear'];

  startDate: string | null = null;
  stopDate: string | null = null;
  regressionStats: FieldDataTable | undefined;

  filterForm!: FormGroup;
  defaultFilterValue = 'Year';

  yScaleForm!: FormGroup;
  defaultScaleValue = 'Log';
  yAxisType: 'linear' | 'log' = 'log';
  yAxisTickFormat: string | null = null;

  private subscriptions = new Subscription();

  constructor(
    private hakConnectionsService: HakConnectionsService,
    public appState: AppStateService,
    private fb: FormBuilder,
    private fb_: FormBuilder
  ) {}

  ngOnInit(): void {
    this.filterForm = this.fb.group({
      selectedTimeFilter: [this.defaultFilterValue],
      selectedScale: [this.defaultScaleValue]
    });
    this.applyTimeFilter(this.defaultFilterValue);
 
    this.applyScaleParams(this.defaultScaleValue);

    // Watch filter changes 
    this.subscriptions.add(
      this.filterForm.get('selectedTimeFilter')?.valueChanges.subscribe(value => {
        this.applyTimeFilter(value);
        // Only load production if a field is selected
        if (this.selectedField) {
          this.loadFieldProduction();
        }
      })
    );

    // Watch for scale changes 
    this.subscriptions.add(
      this.filterForm.get('selectedScale')?.valueChanges.subscribe(value => {
        this.applyScaleParams(value);
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

  loadFieldProduction(): void {
    if (!this.selectedField) return;

    this.loading = true;
    this.errorMessage = null;


    this.hakConnectionsService.getFieldProduction(this.selectedField, this.startDate).subscribe({
      next: (data) => {
        //That ensures the input binding [prod]="fieldProduction" actually detects a change and triggers ngOnChanges() in the child.
        this.fieldProduction = [...(data || [])];
        this.loading = false;
      },
      error: (error) => {
        console.error(error);
        this.errorMessage = 'Failed to load field production.';
        this.loading = false;
      }
    });
  }


  applyScaleParams(selectedScale: string) {
    const type: 'linear' | 'log' = selectedScale === 'Log' ? 'log' : 'linear';
    this.appState.setYAxisType(type); 
  }

  applyTimeFilter(filter: string) {
    const today = new Date();
    let startDate: Date | null = null;

    switch (filter) {
      case 'Week':
        startDate = new Date(today);
        startDate.setDate(today.getDate() - 8);
        break;

      case 'Month':
        startDate = new Date(today);
        startDate.setMonth(today.getMonth() - 1);
        break;

      case 'Year':
        startDate = new Date(today);
        startDate.setFullYear(today.getFullYear() - 1);
        break;

      case '5 Years':
        startDate = new Date(today);
        startDate.setFullYear(today.getFullYear() - 5);
        break;

      case '10 Years':
        startDate = new Date(today);
        startDate.setFullYear(today.getFullYear() - 10);
        break;

      case 'All Time':
        startDate = new Date(today);
        startDate.setFullYear(today.getFullYear() - 30);
        break;
    }

    if(startDate) {
      this.startDate = this.toSqlDate(startDate);
    }
    
  }

  private toSqlDate(date: Date ): string {
    return date.toISOString().split('T')[0]; // "YYYY-MM-DD"
  }


  onSelectedPoints(points: any[]) {
    this.hakConnectionsService.getRegressionStatistics(points)
      .subscribe({
        next: (result) => {
          this.regressionStats = result;
          console.log(this.regressionStats?.basic_stats[0])
        },
        error: (err) => console.error('Regression API error', err)
      }); 
  }

  get hasValidStats(): boolean {
    const stats = this.regressionStats?.basic_stats;
    
    // If stats is missing or not an array, return false
    if (!Array.isArray(stats)) return false;

    // If stats is ["No data!"] (string array), return false
    if (stats.length === 1 && typeof stats[0] === 'string' && stats[0] === "No data!") {
      return false;
    }

    // Otherwise assume valid
    return true;
  }

  // Dynamic rowspan for top tile
  get prodTileRowspan(): number {
    return this.hasValidStats ? 6 : 7; // shrink if table exists
  }

  // Dynamic rowspan for stats tile
  get statsTileRowspan(): number {
    return this.hasValidStats ? 2 : 0;
  }

}
