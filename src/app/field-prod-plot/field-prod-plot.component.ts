import { FormsModule } from '@angular/forms';
import {
  Component,
  Input,
  OnChanges,
  SimpleChanges,
  ElementRef,
  ViewChild,
  AfterViewInit
} from '@angular/core';
import {
  Chart,
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  LogarithmicScale,
  TimeScale,
  Title,
  Tooltip,
  Legend,
  CategoryScale,
  ChartEvent
} from 'chart.js';
import zoomPlugin from 'chartjs-plugin-zoom';
import 'chartjs-adapter-date-fns';

declare module 'chartjs-plugin-zoom' {
  interface DragOptions {
    axis?: 'x' | 'y' | 'xy';
  }
  interface WheelOptions {
    axis?: 'x' | 'y' | 'xy';
  }
  interface PinchOptions {
    axis?: 'x' | 'y' | 'xy';
  }
}

Chart.register(
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  LogarithmicScale,
  TimeScale,
  Title,
  Tooltip,
  Legend,
  CategoryScale,
  zoomPlugin
);

@Component({
  selector: 'app-field-prod-plot',
  template: `
    <div class="chart-toolbar">
      <button (click)="toggleYAxisScale()">Log / Linear</button>
      <button (click)="resetZoom()">Reset Zoom</button>

      <!-- Zoom mode buttons -->
      <button (click)="setZoomMode('x')">Zoom X Only</button>
      <button (click)="setZoomMode('y')">Zoom Y Only</button>
      <button (click)="setZoomMode('xy')">Zoom XY</button>

      <label>
        Y-Min:
        <input style="width: 50px" type="number" [(ngModel)]="yMin" (change)="updateYAxisLimits()" />
      </label>
      <label>
        Y-Max:
        <input style="width: 50px" type="number" [(ngModel)]="yMax" (change)="updateYAxisLimits()" />
      </label>
    </div>
    <canvas #chartCanvas></canvas>
  `,
  styleUrls: ['./field-prod-plot.component.scss'],
  imports: [FormsModule]
})
export class FieldProdPlotComponent implements OnChanges, AfterViewInit {
  @Input() prod: any[] = [];
  @ViewChild('chartCanvas') chartCanvas!: ElementRef<HTMLCanvasElement>;
  private chart: Chart | null = null;
  private currentYScale: 'linear' | 'logarithmic' = 'logarithmic';
  private lastClickedLegend: string | null = null;

  yMin: number | null = null;
  yMax: number | null = null;

  private zoomMode: 'x' | 'y' | 'xy' = 'xy';

  ngAfterViewInit() {
    if (this.prod?.length) {
      this.initChart();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['prod'] && this.prod?.length) {
      if (this.chart) {
        this.updateChartData();
      } else {
        this.initChart();
      }
    }
  }

  toggleYAxisScale() {
    this.currentYScale =
      this.currentYScale === 'linear' ? 'logarithmic' : 'linear';
    if (this.chart?.options.scales?.['y']) {
      this.chart.options.scales['y'].type = this.currentYScale;
      this.chart.update();
    }
  }

  resetZoom() {
    this.chart?.resetZoom();
  }

  updateYAxisLimits() {
    if (!this.chart?.options.scales?.['y']) return;
    const yAxis = this.chart.options.scales['y'];
    yAxis.min = this.yMin ?? undefined;
    yAxis.max = this.yMax ?? undefined;
    this.chart.update();
  }

  setZoomMode(mode: 'x' | 'y' | 'xy') {
    this.zoomMode = mode;
    if (this.chart?.options.plugins?.zoom) {
      const zoomOptions: any = this.chart.options.plugins.zoom;
      // update axis for each type
      zoomOptions.pan.mode = mode;
      if (zoomOptions.zoom.drag) zoomOptions.zoom.drag.axis = mode;
      if (zoomOptions.zoom.wheel) zoomOptions.zoom.wheel.axis = mode;
      if (zoomOptions.zoom.pinch) zoomOptions.zoom.pinch.axis = mode;
      this.chart.update();
    }
  }

  private initChart() {
    const labels = this.prod.map(p => p.date);

    const datasetsConfig = [
      { key: 'oil', label: 'Oil', color: '#52f312ff', unit: 'bbl' },
      { key: 'gas', label: 'Gas', color: '#f80808ff', unit: 'mcf' },
      { key: 'water', label: 'Water', color: '#072bf7ff', unit: 'bbl' },
      { key: 'inj_gas', label: 'Injected Gas', color: '#f79c9cff', unit: 'mcf' },
      { key: 'inj_wtr', label: 'Injected Water', color: '#8a0ef0ff', unit: 'bbl' },
      { key: 'wtr_disposal', label: 'Water Disposal', color: '#03f2faff', unit: 'bbl' },
      { key: 'well_count', label: 'Producer Count', color: '#030303ff', unit: '' }
    ];

    const datasets = datasetsConfig.map(ds => ({
      label: ds.label,
      data: this.prod.map(p => (p[ds.key] > 0 ? p[ds.key] : null)),
      borderColor: ds.color,
      //fill: ds.color,
      backgroundColor: ds.color,
      pointBackgroundColor: ds.color,
      tension: 0.3,
      fill: false,
      unit: ds.unit,
      hidden: false
    }));

    this.chart = new Chart(this.chartCanvas.nativeElement, {
      type: 'line',
      data: { labels, datasets },
      options: {
        hover: {
          mode: 'index',
          intersect: false
        },
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 500 },
        interaction: { mode: 'nearest', intersect: false },
        layout: {
          padding: 20
        },
        plugins: {
          title: { display: true, text: 'Field Production Over Time' },
          legend: {
            position: 'top',
            onClick: (e: ChartEvent, legendItem: any) => {
              if (!this.chart) return;

              const datasetIndex = legendItem.datasetIndex;
              const dataset = this.chart.data.datasets[datasetIndex];

              // Toggle hidden property
              dataset.hidden = !dataset.hidden;

              this.chart.update();
            }
          },
          tooltip: {
            mode: 'index',
            intersect: false,
            callbacks: {
              label: context => {
                const dataset: any = context.dataset;
                const value = context.raw;
                if (value == null) return '';
                return dataset.unit
                  ? `${dataset.label}: ${Number(value).toLocaleString()} ${dataset.unit}`
                  : `${dataset.label}: ${Number(value).toLocaleString()}`;
              }
            }
          },
          zoom: {

            pan: { enabled: true, mode: 'xy' },
            zoom: {
              // @ts-ignore
              drag: { enabled: false, axis: 'x', backgroundColor: 'rgba(0,123,255,0.25)' },
              // @ts-ignore
              wheel: { enabled: true, axis: 'x' },
              // @ts-ignore
              pinch: { enabled: true, axis: 'x' }
            },
            limits: {
              x: { min: 'original', max: 'original' },
              y: { min: 'original', max: 'original' }
            }
          }
        },
        scales: {
          x: {
            type: 'time',
            time: { unit: 'day' },
            title: { display: true, text: 'Date' }
          },
          y: {
            type: this.currentYScale,
            title: { display: true, text: 'Volume' },
            min: this.yMin ?? undefined,
            max: this.yMax ?? undefined,
            ticks: {
              callback: (value: string | number) => Number(value).toLocaleString()
            }
          }
        }
      }
    });
  }

  private updateChartData() {
    if (!this.chart) return;

    const labels = this.prod.map(p => p.date);
    this.chart.data.labels = labels;

    const datasetsConfig = [
      { key: 'oil', label: 'Oil', color: '#52f312ff', unit: 'bbl' },
      { key: 'gas', label: 'Gas', color: '#f80808ff', unit: 'mcf' },
      { key: 'water', label: 'Water', color: '#072bf7ff', unit: 'bbl' },
      { key: 'inj_gas', label: 'Injected Gas', color: '#f79c9cff', unit: 'mcf' },
      { key: 'inj_wtr', label: 'Injected Water', color: '#8a0ef0ff', unit: 'bbl' },
      { key: 'wtr_disposal', label: 'Water Disposal', color: '#03f2faff', unit: 'bbl' },
      { key: 'well_count', label: 'Producer Count', color: '#030303ff', unit: '' }
    ];

    this.chart.data.datasets.forEach((ds, i) => {
      ds.data = this.prod.map(p => (p[datasetsConfig[i].key] > 0 ? p[datasetsConfig[i].key] : null));
    });

    this.chart.update();
  }
}
