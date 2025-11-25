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

// ---- Plotly Runtime Element Type ----
type PlotlyHTMLElement = HTMLDivElement & {
  data: any[];
  layout: any;
  on: (...args: any[]) => void;
};

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

  @Input() yAxisType: 'linear' | 'log' = 'log';
  @Input() yAxisTickFormat: ',.0f' | ',.0f' = ',.0f';

  @ViewChild('plotContainer', { static: true })
  plotContainer!: ElementRef<HTMLDivElement>;

  selectedField = '';
  selectedScale = '';

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
  private scaleSub?: Subscription;

  constructor(
    private ngZone: NgZone,
    private appStateService: AppStateService,
    private truncate: TruncateAfterDashPipe
  ) {}

  //-----------------------------------------------------
  // LIFECYCLE
  //-----------------------------------------------------

  ngOnInit(): void {
    // Subscribe to selected field
    this.fieldSub = this.appStateService.selectedField$.subscribe(field => {
      this.selectedField = field ?? '';
      this.updatePlotTitle();
    });

    // Subscribe to Y-axis type changes
    this.scaleSub = this.appStateService.yAxisType$.subscribe(type => {
      if (!type) return;
      this.selectedScale = type;
      this.yAxisType = type as 'linear' | 'log';

      if (this.initialized) {
        this.updateYAxisType();
      } else if (this.prod?.length) {
        this.renderOrUpdatePlot();
      }
    });
  }

  ngOnDestroy(): void {
    this.fieldSub?.unsubscribe();
    this.scaleSub?.unsubscribe();
  }

  ngAfterViewInit(): void {
    if (this.prod?.length) this.renderOrUpdatePlot();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['prod'] && this.prod?.length) {
      this.plotReady = false;
      this.renderOrUpdatePlot();
    }
  }

  //-----------------------------------------------------
  // PLOT RENDER / UPDATE
  //-----------------------------------------------------

  private renderOrUpdatePlot(): void {
    const graphDiv = this.plotContainer.nativeElement as PlotlyHTMLElement;
    const traces = this.buildTraces();

    const layoutWithDragmode: Partial<Layout> = {
      ...this.layout,
      dragmode: this.dragmode,
      yaxis: {
        ...this.layout.yaxis,
        type: this.yAxisType,
        tickformat: ',.0f' //this.yAxisType === 'log' ? ',.0f' : ',.0f'
      }
    };

    if (!this.initialized) {
      // First-time plot
      Plotly.newPlot(graphDiv, traces, layoutWithDragmode, this.config).then(() => {
        this.ngZone.run(() => (this.plotReady = true));
        this.attachSelectionListener(graphDiv);
      });
      this.initialized = true;
    } else {
      // Update traces while keeping user zoom/pan
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
      setTimeout(() => this.ngZone.run(() => (this.plotReady = true)), 400);
    }
  }

  private updateYAxisType(): void {
    const graphDiv = this.plotContainer.nativeElement as PlotlyHTMLElement;
    Plotly.relayout(graphDiv, {
      'yaxis.type': this.yAxisType,
      'yaxis.tickformat': this.yAxisType === 'log' ? ',.0f' : ',.0f',
      //'yaxis.autorange': true,
      'yaxis.dtick': this.yAxisType === 'log' ? 1 : undefined,
      'yaxis.tickvals': undefined,
      'yaxis.tickmode': 'auto'
    });
  }

  //-----------------------------------------------------
  // TRACE BUILDER
  //-----------------------------------------------------

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
        width: 1
      },
      marker: {
        size: 8,
        color: this.colorMap[name] || 'black',
        opacity: 1
      },
      selected: {
        marker: { size: 12, color: this.colorMap[name] || 'black', opacity: 1 }
      },
      unselected: {
        marker: { size: 8, color: this.colorMap[name] || 'black', opacity: 0.2 }
      }
    }));
  }

  //-----------------------------------------------------
  // SELECTION HANDLING
  //-----------------------------------------------------

  private attachSelectionListener(graphDiv: PlotlyHTMLElement) {
    setTimeout(() => {
      graphDiv.on('plotly_selected', (eventData: any) => this.handleSelection(eventData));
      graphDiv.on('plotly_deselect', () => this.ngZone.run(() => this.selectionChanged.emit([])));
    }, 0);
  }

  private handleSelection(eventData: any) {
    const points = (eventData?.points || []).map((pt: any) => ({
      x: pt.x,
      y: pt.y,
      traceName: pt.data.name,
      pointIndex: pt.pointIndex,
    }));

    setTimeout(() => {
      this.ngZone.run(() =>
        this.selectionChanged.emit(JSON.parse(JSON.stringify(points)))
      );
    }, 0);
  }

  //-----------------------------------------------------
  // TITLE UPDATE
  //-----------------------------------------------------

  private updatePlotTitle(): void {
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
      const graphDiv = this.plotContainer.nativeElement as PlotlyHTMLElement;
      Plotly.relayout(graphDiv, { title: this.layout.title });
    }
  }
}
