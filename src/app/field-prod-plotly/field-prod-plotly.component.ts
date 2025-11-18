import {
  Component,
  Input,
  OnChanges,
  ElementRef,
  ViewChild,
  AfterViewInit,
  SimpleChanges,
} from '@angular/core';
import { Layout, Config, Data } from 'plotly.js';
import { getPlotlyLayout, colorMap } from './helpers/ProdPlotConfig';

declare var Plotly: any;

@Component({
  selector: 'app-field-prod-plotly',
  standalone: true,
  template: `<div #plotContainer ></div>`,
  styleUrls: ['./field-prod-plotly.component.scss']
})
export class FieldProdPlotlyComponent implements AfterViewInit, OnChanges {
  @Input({ required: true }) prod: any[] = [];
  @ViewChild('plotContainer', { static: true })
  plotContainer!: ElementRef<HTMLDivElement>;

  private layout: Partial<Layout> = getPlotlyLayout();

  private config: Partial<Config> = {
    responsive: true,
    displaylogo: false,
    scrollZoom: true,
  };

  private colorMap = colorMap;

  private initialized = false;

  ngAfterViewInit(): void {
    if (this.prod?.length) {
      this.renderPlot();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['prod'] && this.prod?.length) {
      this.initialized ? this.updatePlot() : this.renderPlot();
    }
  }

  /** Render the initial Plotly plot */
  private renderPlot(): void {
    const traces = this.buildTraces();
    Plotly.newPlot(
      this.plotContainer.nativeElement,
      traces,
      this.layout,
      this.config
    );
    this.initialized = true;
  }

  private updatePlot(): void {
    const graphDiv = this.plotContainer.nativeElement as any;
    const newTraces = this.buildTraces();

    // Match traces by name to preserve user interactions
    const existingTraceNames = graphDiv.data.map((t: any) => t.name);

    const mergedTraces = newTraces.map((trace) => {
      const index = existingTraceNames.indexOf(trace.name);
      return index !== -1
      // @ts-ignore
        ? { ...graphDiv.data[index], y: trace.y, x: trace.x }
        : trace;
    });

    const userAdjustedX = graphDiv.layout?.xaxis?.autorange === false;
    const userAdjustedY = graphDiv.layout?.yaxis?.autorange === false;

    const newLayout: Partial<Layout> = {
      ...this.layout,
      xaxis: {
        ...this.layout.xaxis,
        autorange: userAdjustedX ? false : true,
        range: userAdjustedX ? graphDiv.layout?.xaxis?.range : undefined,
      },
      yaxis: {
        ...this.layout.yaxis,
        autorange: userAdjustedY ? false : true,
        range: userAdjustedY ? graphDiv.layout?.yaxis?.range : undefined,
      },
  };

  queueMicrotask(() => Plotly.react(graphDiv, mergedTraces, newLayout, this.config));
}


  /** Transform your flat data to Plotly traces */
  private buildTraces(): Data[] {
    if (!this.prod?.length) return [];

    const dates = this.prod.map((item) => item.date);
    const traceNames = Object.keys(this.prod[0]).filter(
      (key) => key !== 'date'
    );

    return traceNames.map((name) => ({
      x: dates,
      y: this.prod.map((item) => item[name]),
      type: 'scatter',
      mode: 'lines',
      name: name,
      line: {
        color: this.colorMap[name] || 'black'
      }
    }));
  }
}
