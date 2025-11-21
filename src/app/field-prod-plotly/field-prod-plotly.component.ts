import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  ElementRef,
  ViewChild,
  AfterViewInit,
  SimpleChanges,
  NgZone,
  OnInit,
  OnDestroy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Layout, Config, Data } from 'plotly.js';
import { getPlotlyLayout, colorMap, legendNameMap } from './helpers/ProdPlotConfig';
import { AppStateService } from '../app-state.service';
import { TruncateAfterDashPipe } from '../truncate-after-dash.pipe';
import { Subscription } from 'rxjs';

declare var Plotly: any;

@Component({
  selector: 'app-field-prod-plotly',
  standalone: true,
  imports: [
    CommonModule,
    TruncateAfterDashPipe
  ],
  templateUrl: './field-prod-plotly.component.html',
  styleUrls: ['./field-prod-plotly.component.scss'],
})
export class FieldProdPlotlyComponent
  implements AfterViewInit, OnChanges, OnInit, OnDestroy {

  @Input({ required: true }) prod: any[] = [];
  @Input() dragmode: 'select' | 'lasso' | 'zoom' = 'select';
  @Output() selectionChanged = new EventEmitter<any[]>();

  @ViewChild('plotContainer', { static: true })
  plotContainer!: ElementRef<HTMLDivElement>;

  selectedField = '';
  private layout: Partial<Layout> = getPlotlyLayout();
  private config: Partial<Config> = {
    responsive: true,
    displaylogo: false,
    scrollZoom: true,
  };
  private colorMap = colorMap;
  private legendNameMap = legendNameMap;

  private initialized = false;
  plotReady = false;

  private fieldSub?: Subscription;

  constructor(
    private ngZone: NgZone,
    private fieldSelectionService: AppStateService,
    private truncate: TruncateAfterDashPipe
  ) {}

  ngOnInit(): void {
    // Subscribe once to field selection
    this.fieldSub = this.fieldSelectionService.selectedField$.subscribe(field => {
      this.selectedField = field ?? '';
      this.updatePlotTitle();
    });
  }

  ngOnDestroy(): void {
    this.fieldSub?.unsubscribe();
  }

  ngAfterViewInit(): void {
    if (this.prod?.length) this.renderOrUpdatePlot();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['prod'] && this.prod?.length) {
      this.plotReady = false; // show spinner
      this.renderOrUpdatePlot();
    }
  }

  /** Handles initial render and updates */
  private renderOrUpdatePlot(): void {
    const graphDiv = this.plotContainer.nativeElement as any;
    const traces = this.buildTraces();
    const layoutWithDragmode = { ...this.layout, dragmode: this.dragmode };

    if (!this.initialized) {
      // Initial render
      Plotly.newPlot(graphDiv, traces, layoutWithDragmode, this.config).then(() => {
        this.ngZone.run(() => (this.plotReady = true));
        this.attachSelectionListener(graphDiv);
      });
      this.initialized = true;
    } else {
      // Update plot
      const existingTraceNames = graphDiv.data.map((t: any) => t.name);
      const mergedTraces = traces.map((trace) => {
        const index = existingTraceNames.indexOf(trace.name);
        return index !== -1
        // @ts-ignore
          ? { ...graphDiv.data[index], x: trace.x, y: trace.y }
          : trace;
      });

      const userAdjustedX = graphDiv.layout?.xaxis?.autorange === false;
      const userAdjustedY = graphDiv.layout?.yaxis?.autorange === false;

      const newLayout: Partial<Layout> = {
        ...layoutWithDragmode,
        xaxis: {
          ...this.layout.xaxis,
          autorange: !userAdjustedX,
          range: userAdjustedX ? graphDiv.layout?.xaxis?.range : undefined,
        },
        yaxis: {
          ...this.layout.yaxis,
          autorange: !userAdjustedY,
          range: userAdjustedY ? graphDiv.layout?.yaxis?.range : undefined,
        },
      };

      Plotly.react(graphDiv, mergedTraces, newLayout, this.config);

      // Minimal spinner duration
      setTimeout(() => this.ngZone.run(() => (this.plotReady = true)), 500);
    }
  }

  /** Build Plotly traces from prod array */
  private buildTraces(): Data[] {
    if (!this.prod?.length) return [];

    const dates = this.prod.map((item) => item.date);
    const traceNames = Object.keys(this.prod[0]).filter((key) => key !== 'date');

    return traceNames.map((name) => ({
      x: dates,
      y: this.prod.map((item) => item[name]),
      type: 'scatter',
      mode: 'lines+markers',
      name: this.legendNameMap[name],
      line: { 
        color: this.colorMap[name] || 'black',
        size: 1
      },
      marker: { 
        size: 8,
        color: this.colorMap[name] || 'black',
        opacity: 1
      },
      selected: {
        marker: { 
          size: 12,
          color: this.colorMap[name] || 'black',
          opacity: 1
        }
      },
      unselected: {
        marker: { 
          size: 8,
          color: this.colorMap[name] || 'black',
          opacity: 0.2 
        }
      }
    }));
  }

  /** Attach selection listener */
  private attachSelectionListener(graphDiv: any) {
    setTimeout(() => {
      if (typeof graphDiv.on === 'function') {
        graphDiv.on('plotly_selected', (eventData: any) => this.handleSelection(eventData));
        graphDiv.on('plotly_deselect', () => this.ngZone.run(() => this.selectionChanged.emit([])));
      } else {
        console.warn('Plotly graphDiv.on() is not available!');
      }
    }, 0);
  }

  /** Handle selection and emit a deep-cloned fresh array */
  private handleSelection(eventData: any) {
    const points = (eventData?.points || []).map((pt: any) => ({
      x: pt.x,
      y: pt.y,
      traceName: pt.data.name,
      pointIndex: pt.pointIndex,
    }));

    // Deep clone to avoid reference reuse
    setTimeout(() => {
      this.ngZone.run(() => this.selectionChanged.emit(JSON.parse(JSON.stringify(points))));
    }, 0);
  }

  private updatePlotTitle() {
    this.layout.title = { 
      text: `Production Plot: ${this.truncate.transform(this.selectedField)}`,
      font: {
        family: 'Ariel Black',
        size: 40,
        weight: 300,
        color: 'black'
      }
    };

    if (this.initialized) {
      const graphDiv = this.plotContainer.nativeElement as any;

      Plotly.relayout(graphDiv, {
        title: this.layout.title
      });
    }
  }
}
