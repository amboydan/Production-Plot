import {
  Component,
  Input,
  OnChanges,
  ElementRef,
  ViewChild,
  SimpleChanges,
  Output,
  EventEmitter,
  AfterViewInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Layout, Config, Data } from 'plotly.js';
import { getPlotlyLayout, colorMap } from './helpers/ProdPlotConfig';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

declare var Plotly: any;

@Component({
  selector: 'app-field-prod-weekly-plotly',
  standalone: true,
  imports: [MatProgressSpinnerModule, CommonModule],
  templateUrl: './field-prod-weekly-plotly.component.html',
  styleUrls: ['./field-prod-weekly-plotly.component.scss'],
})
export class FieldProdWeeklyPlotlyComponent implements OnChanges {
  @Input({ required: true }) prodWeekly: any[] = [];
  @Output() plotReady2 = new EventEmitter<void>();

  @ViewChild('plotContainer', { static: false })
  plotContainer!: ElementRef<HTMLDivElement>;

  loading = false;
  initialized = false;

  private layout: Partial<Layout> = getPlotlyLayout();

  private config: Partial<Config> = {
    responsive: true,
    displaylogo: false,
    scrollZoom: true,
  };

  private colorMap = colorMap;

  /** Handle input changes */
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['prodWeekly'] && this.prodWeekly?.length) {
      if (!this.initialized) {
        this.renderPlot();
      } else {
        this.updatePlot();
      }
    }
  }

  /** Initial Plotly render */
private renderPlot(): void {
  this.loading = true;

  queueMicrotask(() => {
    const traces = this.buildTraces();

    Plotly.newPlot(
      this.plotContainer.nativeElement,
      traces,
      this.layout,
      this.config
    ).then(() => {
      this.initialized = true;
      this.loading = false; // now container becomes visible
      this.plotReady2.emit();
    });
  });
}


  /** Update existing plot with new data */
private updatePlot(): void {
  this.loading = true;
  const graphDiv = this.plotContainer.nativeElement as any;
  const newTraces = this.buildTraces();

  const existingTraceNames = (graphDiv.data as any[]).map((t) => t.name);
  const mergedTraces = newTraces.map((trace: any) => {
    const index = existingTraceNames.indexOf(trace.name);
    return index !== -1
      ? { ...(graphDiv.data[index] as any), y: trace.y, x: trace.x }
      : trace;
  });

  const userAdjustedX = graphDiv.layout?.xaxis?.autorange === false;
  const userAdjustedY = graphDiv.layout?.yaxis?.autorange === false;

  const newLayout: Partial<Layout> = {
    ...this.layout,
    xaxis: { ...this.layout.xaxis, autorange: userAdjustedX ? false : true, range: userAdjustedX ? graphDiv.layout?.xaxis?.range : undefined },
    yaxis: { ...this.layout.yaxis, autorange: userAdjustedY ? false : true, range: userAdjustedY ? graphDiv.layout?.yaxis?.range : undefined },
  };

  queueMicrotask(() =>
    Plotly.react(graphDiv, mergedTraces, newLayout, this.config).then(() => {
      this.loading = false;
      this.plotReady2.emit();
    })
  );
}


  /** Build Plotly traces from input data */
  private buildTraces(): Data[] {
    if (!this.prodWeekly?.length) return [];

    const dates = this.prodWeekly.map((item) => item.date);
    const traceNames = Object.keys(this.prodWeekly[0]).filter(
      (key) => key !== 'date'
    );

    return traceNames.map((name) => ({
      x: dates,
      y: this.prodWeekly.map((item) => item[name]),
      type: 'scatter',
      mode: 'lines+markers',
      name,
      line: {
        color: this.colorMap[name] || 'black',
        shape: 'vh',
      },
      marker: {
        size: 5,
      },
    }));
  }
}
