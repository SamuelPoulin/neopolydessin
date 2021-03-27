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
  // TODO: Remove dummy data
  private static MAX_RANDOM: number = 20; // eslint-disable-line
  private static LENGTH_RANDOM: number = 7; // eslint-disable-line

  @ViewChild('chart') chart: ChartComponent;
  chartOptions: Partial<ChartOptions>;

  playTime: number;
  connectionTime: number;
  gamesPlayed: number;
  winRatio: number;

  constructor() {
    this.playTime = 25;
    this.connectionTime = 38;
    this.gamesPlayed = 51;
    this.winRatio = 0.21;

    const data1 = Array.from({ length: DashboardComponent.LENGTH_RANDOM }, () => Math.floor(Math.random() * DashboardComponent.MAX_RANDOM));
    const data2 = Array.from({ length: DashboardComponent.LENGTH_RANDOM }, () => Math.floor(Math.random() * DashboardComponent.MAX_RANDOM));

    this.chartOptions = {
      series: [
        {
          name: 'Victoires',
          color: '#00a550',
          data: data1,
        },
        {
          name: 'Défaites',
          color: '#e83946',
          data: data2,
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
