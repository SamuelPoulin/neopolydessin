import { Component, ViewChild } from '@angular/core';

import { ChartComponent, ApexAxisChartSeries, ApexChart, ApexXAxis, ApexTitleSubtitle, ApexFill } from 'ng-apexcharts';

export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  title: ApexTitleSubtitle;
  fill: ApexFill;
};

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent {
  @ViewChild('chart') chart: ChartComponent;
  chartOptions: Partial<ChartOptions>;

  constructor() {
    this.chartOptions = {
      series: [
        {
          name: 'Victoires',
          color: '#00a550',
          data: [7, 5, 4, 6, 8, 15, 1],
        },
        {
          name: 'Défaites',
          color: '#e83946',
          data: [9, 4, 16, 3, 6, 3, 7],
        },
      ],
      chart: {
        height: 350,
        type: 'bar',
        stacked: true,
        toolbar: {
          show: false,
        },
      },
      xaxis: {
        categories: ['1 mars', '2 mars', '3 mars', '4 mars', '5 mars', '6 mars', '7 mars'],
      },
      fill: {
        opacity: 1,
        type: 'solid',
      },
    };
  }
}
