import { Component } from '@angular/core';
import { CommonModule, AsyncPipe } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';
import { AppStateService } from '../app-state.service';

@Component({
  selector: 'app-field-summary',
  standalone: true,
  imports: [CommonModule, MatToolbarModule, MatButtonToggleModule, MatIconModule, AsyncPipe],
  templateUrl: './field-summary.component.html'
})
export class FieldSummaryComponent {

  filters = ['Week', 'Month', 'Year', 'All Time'];
  selectedFilters: string[] = [];

  constructor(public appState: AppStateService) {}

  toggleSelection(value: string) {
    if (this.selectedFilters.includes(value)) {
      this.selectedFilters = this.selectedFilters.filter(v => v !== value);
    } else {
      this.selectedFilters = [...this.selectedFilters, value];
    }
  }

  selectField(field: string) {
    this.appState.setSelectedField(field);
  }
}
