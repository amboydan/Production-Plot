import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy } from '@angular/core';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { AppStateService } from '../app-state.service';
import { FormsModule } from '@angular/forms';
import { HakConnectionsService } from '../hak-connections.service';
import {
  trigger,
  state,
  style,
  animate,
  transition
} from '@angular/animations'

@Component({
  selector: 'app-field-summary',
  imports: [
    CommonModule,
    MatButtonToggleModule,
    MatIconModule,
    MatToolbarModule,
    FormsModule
  ],
  templateUrl: './field-summary.component.html',
  styleUrl: './field-summary.component.scss',
  changeDetection: ChangeDetectionStrategy.Default,
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
export class FieldSummaryComponent implements OnInit {

  selectedField: string | null = null;
  selectedDateRange: string | null = null;
  loading: boolean = false;
  errorMessage: string | null = null;

  filters = ['Week', 'Month', 'Year', 'All Time'];
  selectedFilters: string[] = [];

  constructor(
      private hakConnectionsService: HakConnectionsService,
      private appState: AppStateService
  ) {}

  ngOnInit(): void {
      this.appState.selectedField$.subscribe(field => {
        this.selectedField = field;
      });
  }

  toggleSelection(value: string) {
    if (this.selectedFilters.includes(value)) {
      this.selectedFilters = this.selectedFilters.filter(v => v !== value);
    } else {
      this.selectedFilters = [...this.selectedFilters, value];
    }
  }

  isSelected(value: string): boolean {
    return this.selectedFilters.includes(value);
  }

}
