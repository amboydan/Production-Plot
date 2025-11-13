import { 
  AfterViewInit, Component, 
  ElementRef, Input, 
  OnChanges, OnInit, SimpleChanges, 
  ViewChild 
} from '@angular/core';
import { getPlotlyLayout } from './helpers/ProdPlotConfig';

declare var Plotly: any;

@Component({
  selector: 'app-field-prod-plotly',
  imports: [],
  templateUrl: './field-prod-plotly.component.html',
  styleUrl: './field-prod-plotly.component.scss'
})
export class FieldProdPlotlyComponent  implements OnInit, AfterViewInit, OnChanges {
 

 @Input() prod: any[] = [];

 @ViewChild('productionPlot', { static: false }) chartEl!: ElementRef;

 ngOnInit(): void {
  console.log(this.prod)
   this.plotData();
 }
 ngAfterViewInit() {
    if (this.prod?.length) {
      this.plotData();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['prod'] && this.prod?.length) {
      // if (this.chart) {
        this.plotData();
      // } else {
        //this.initChart();
      // }
    }
  }

  private plotInitialized = false;
  private seriesKeys: string[] = [];

  plotData() {
    if (!this.prod || this.prod.length === 0) return;
    console.log(this.prod);
    const allKeys = Object.keys(this.prod[0]);
    const keepKeys: string[] = [
      'gas', 'oil', 'water', 'inj_gas', 
      'inj_wtr', 'wtr_disposal', 'well_count'
    ];
    const xKey = 'date';
    this.seriesKeys = allKeys.filter(k => keepKeys.includes(k));
    const xValues = this.prod.map(row => row[xKey]);

    const layout = getPlotlyLayout(xKey);
    const plotlyDiv = this.chartEl.nativeElement;

    if (!this.plotInitialized) {
      
      const traces = this.seriesKeys.map(seriesName => ({
        x: xValues,
        y: this.prod.map(row => row[seriesName]),
        type: 'scatter',
        mode: 'lines+markers',
        name: seriesName,
      }));

      Plotly.newPlot(plotlyDiv, traces, layout, {
        responsive: true,
        //margin: { t: 30 },
      }).then(() => {
        this.plotInitialized = true;

        plotlyDiv.on('plotly_click', (data: any) => {
          // Optional: handle clicks
        });
      });

    } else {
      // Update both x and y for each trace
      this.seriesKeys.forEach((seriesName, i) => {
        Plotly.restyle(plotlyDiv, {
          x: [xValues],
          y: [this.prod.map(row => row[seriesName])]
        }, [i]);
      });
    }
  }
}
