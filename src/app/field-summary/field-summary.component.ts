import { Component, ViewEncapsulation, OnInit } from '@angular/core'; // Added OnInit
import { CommonModule, AsyncPipe } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';
import { AppStateService } from '../app-state.service';
import { HakConnectionsService } from '../hak-connections.service';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms'; // Import FormBuilder, FormGroup
import {SelectionModel} from '@angular/cdk/collections';
import {MatTableDataSource, MatTableModule} from '@angular/material/table';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {
  trigger,
  state,
  style,
  animate,
  transition
} from '@angular/animations'

export interface PeriodicElement {
  name: string;
  position: number;
  weight: number;
  symbol: string;
}

export interface WellsData {
  well: string;
  type: string;
  status: string;
}

const ELEMENT_DATA: PeriodicElement[] = [
  {position: 1, name: 'Hydrogen', weight: 1.0079, symbol: 'H'},
  {position: 2, name: 'Helium', weight: 4.0026, symbol: 'He'},
  {position: 3, name: 'Lithium', weight: 6.941, symbol: 'Li'},
  {position: 4, name: 'Beryllium', weight: 9.0122, symbol: 'Be'},
  {position: 5, name: 'Boron', weight: 10.811, symbol: 'B'},
  {position: 6, name: 'Carbon', weight: 12.0107, symbol: 'C'},
  {position: 7, name: 'Nitrogen', weight: 14.0067, symbol: 'N'},
  {position: 8, name: 'Oxygen', weight: 15.9994, symbol: 'O'},
  {position: 9, name: 'Fluorine', weight: 18.9984, symbol: 'F'},
  {position: 10, name: 'Neon', weight: 20.1797, symbol: 'Ne'},
];

@Component({
  selector: 'app-field-summary',
  standalone: true,
  imports: [
    CommonModule, MatToolbarModule, 
    MatButtonToggleModule, MatIconModule, 
    AsyncPipe, ReactiveFormsModule,
    MatTableModule, MatCheckboxModule
  ],
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
    console.log(this.fieldWells);
  }

  selectField(field: string) {
    this.appState.setSelectedField(field);
  }

  selectedField: string | null = null;
  fieldWells: any[] = [];
  loading: boolean = false;
  errorMessage: string | null = null;
  
  loadFieldWells(): void {
    if (!this.selectedField) return;

    this.loading = true;
    this.errorMessage = null;

    this.hakConnectionsService.getFieldWells(this.selectedField).subscribe({
      next: (data) => {
        this.fieldWells = data || [];
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

  // this should probably be in its own module. 
  displayedColumns: string[] = ['select', 'position', 'name', 'weight', 'symbol'];
  dataSource = new MatTableDataSource<PeriodicElement>(ELEMENT_DATA);
  selection = new SelectionModel<PeriodicElement>(true, []);

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  toggleAllRows() {
    if (this.isAllSelected()) {
      this.selection.clear();
      return;
    }

    this.selection.select(...this.dataSource.data);
  }

  /** The label for the checkbox on the passed row */
  checkboxLabel(row?: PeriodicElement): string {
    if (!row) {
      return `${this.isAllSelected() ? 'deselect' : 'select'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.position + 1}`;
  }
}
