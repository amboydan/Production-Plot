import type { Layout } from 'plotly.js';
import { AppStateService } from '../../app-state.service';

export function getPlotlyLayout(): Partial<Layout> {

  return {
    height: 780,
    autosize: true,
    xaxis: {
      title: {
        text: ''
      },
      showline: true,
      showgrid: true,
      mirror: true,
      bordercolor: 'black',
      borderwidth: 3,
      ticklen: 5,
      tickfont: {
            family: 'Ariel Black',
            size: 20,
            color: 'black',
            weight: 10
        }
        
    } as any,
    yaxis: {
      title: {
        text: 'Prod / Inj Rate & Pressure',
        standoff: 30,
        font: {
            family: 'Ariel Black',
            size: 26,
            weight: 300,
            color: 'black'
        }
      },
      automargin: true,
      //type: 'log',
      tickformat: ',.0f',
      //dtick: 1,
      tickvals: undefined,
      tickmode: 'auto',
      ticklen: 5,
      showline: true,
      showgrid: true,
      gridcolor: 'lightgrey',
      mirror: true,
      bordercolor: 'black',
      borderwidth: 3,
      minor: {
        showgrid: true,
        ticklen: 3,
        tickcolor: 'black',
        tickmode: 'auto'

      },
      tickfont: {
            family: 'Ariel Black',
            size: 20,
            color: 'black',
            weight: 10
        }
    } as any,
    legend: {
      orientation: 'h',
      y: 0.2,
      x: 0.5,
      xref: 'container',
      yref: 'container',
      xanchor: 'center',
      yanchor: 'top',
      title: {
        text: '',
        standoff: 30,
        font: {
            family: 'Ariel Black',
            size: 20,
            weight: 10,
            color: 'black'
        }
      },
      font: {
        size: 16,
        color: 'black',
        weight: 500
      }
    } as any,
    hovermode: 'x unified',
    hoverlabel: {
      bgcolor: 'white',       
      font: { size: 14 },     
      align: 'left',           
      namelength: -1          
    },
    margin: {
      l: 250,
      r: 150,
      b: 200,
      t: 100,
      pad: 0
    },
    selectdirection: 'any',
    selectionrevision: 0
  };
}

export const colorMap: Record<string, string> = {
    'gas': 'red',
    'oil': 'green',
    'water': 'blue',
    'inj_gas': 'pink',
    'inj_wtr': 'purple',
    'wtr_disposal': 'lightblue',
    'well_count': 'black'
};

export const legendNameMap: Record<string, string> = {
  oil: "Oil (bbl/d)",
  gas: "Gas (mcf/d)",
  water: "Water (bbl/d)",
  inj_wtr: "Inj Water (bbl/d)",
  inj_gas: "Inj Gas (mcf/d)",
  wtr_disposal: "Wtr Disposal (bbl/d)",
  well_count: 'Producer Count'
}  
