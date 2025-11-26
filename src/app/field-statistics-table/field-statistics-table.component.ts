import { Component, Input, OnChanges, AfterViewInit, SimpleChanges, ViewChild, ElementRef } from '@angular/core';
import { FieldDataTable, BasicStat } from './helpers/data-models';

declare var Plotly: any;

@Component({
  selector: 'app-field-statistics-table',
  template: `<div #tableContainer class="plot-container"></div>`,
  styles: [`
    :host { display: block; width: 100%; height: 100%; }
    .plot-container { width: 100%; height: 100%; }
  `]
})
export class FieldStatisticsTableComponent implements OnChanges, AfterViewInit {
  @Input() stats?: FieldDataTable;
  @ViewChild('tableContainer', { static: true }) tableDiv!: ElementRef;

  private viewReady = false;
  private statsReady = false;

  ngAfterViewInit(): void {
    this.viewReady = true;
    this.buildTableIfReady();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['stats'] && this.stats) {
      this.statsReady = true;
      this.buildTableIfReady();
    }
  }

  private buildTableIfReady() {
    if (!this.viewReady || !this.statsReady) return;

    const basicStats = this.stats?.basic_stats;

    if (Array.isArray(basicStats) && Array.isArray(basicStats[0])) {
      this.buildStatsTable(basicStats as BasicStat[][]);
    } else {
      this.tableDiv.nativeElement.innerHTML = `<div style="text-align:center; color:gray; font-size:14px;">No data available</div>`;
    }
  }

private buildStatsTable(stats: BasicStat[][]) {
  const manualOrder = [
    'Oil (bbl/d)',
    'Gas (mcf/d)',
    'Water (bbl/d)',
    'Inj Water (bbl/d)',
    'Inj Gas (mcf/d)',
    'Producer Count'
  ]

  const flatStats = stats.flat();

  const orderedStats = manualOrder
    .map(key => flatStats.find(s => s.Stream === key))
    .filter((s): s is BasicStat => !!s);
    
  const table = {
    type: 'table',
    header: {
      values: ['Stream','Sum','Average','Start','Start Value','Stop','Stop Value','Date Diff','Total Days'],
      align: 'center',
      fill: { color: '#1f2eb4ff' },
      font: { color: 'white', size: 14 }
    },
    cells: {
      values: [
        orderedStats.map(s => s.Stream),
        orderedStats.map(s => s.Sum),
        orderedStats.map(s => s.Average),
        orderedStats.map(s => s.Start),
        orderedStats.map(s => s.Start_Value),
        orderedStats.map(s => s.Stop),
        orderedStats.map(s => s.Stop_Value),
        orderedStats.map(s => s.Date_Diff),
        orderedStats.map(s => s.Total_Days),
      ],
      font: { color: 'black', size: 14},
      height: 30,
      align: 'center',
      fill: { color: ['#dfdcdce7', '#ffffff'] }
    }
  };

  const layout = {
    title: 'Field Statistics',
    autosize: true,
    margin: { t: 0, l: 0, r: 0, b: 0 }
  };

  Plotly.newPlot(this.tableDiv.nativeElement, [table], layout, { responsive: true });

  // Force a resize after a short delay
  setTimeout(() => {
    Plotly.Plots.resize(this.tableDiv.nativeElement);
  }, 50); // 50ms is usually enough; increase to 100–150ms if needed
}

}
