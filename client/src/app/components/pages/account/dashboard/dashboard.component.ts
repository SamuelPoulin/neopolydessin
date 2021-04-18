import { Component, ViewChild } from '@angular/core';
import { Game, GameResult } from '@common/communication/dashboard';
import { GameType } from '@common/communication/lobby';
import { APIService } from '@services/api.service';

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
  private static NB_DAYS_PER_WEEK: number = 7; //eslint-disable-line
  private static MS_PER_DAY: number = 86400000; //eslint-disable-line
  private static MS_TO_MINS: number = 60000; // eslint-disable-line
  private static MS_TO_HOURS: number = 3600000; // eslint-disable-line
  private static MONTHS: string[] = [
    'Janvier',
    'Février',
    'Mars',
    'Avril',
    'Mai',
    'Juin',
    'Juillet',
    'Août',
    'Septembre',
    'Octobre',
    'Novembre',
    'Décembre',
  ];

  @ViewChild('chart') chart: ChartComponent;
  chartOptions: Partial<ChartOptions>;

  playTime: string;
  connectionTime: string;
  gamesPlayed: number;
  winRatio: number;
  soloHighScore: number;
  coopHighScore: number;

  games: Game[];
  logins: { start: number; end?: number }[];

  constructor(
    private apiService: APIService
  ) {

    this.apiService.getDashBoardInfo().then((info) => {
      this.playTime = this.toHours(info.gameHistory.totalTimePlayed);
      this.gamesPlayed = info.gameHistory.nbGamePlayed;
      this.winRatio = info.gameHistory.winPercentage;
      this.soloHighScore = info.gameHistory.bestScoreSolo;
      this.coopHighScore = info.gameHistory.bestScoreCoop;
      this.games = info.gameHistory.games;
      this.logins = info.logins;
      this.connectionTime = this.toHours(this.getTimeConnected());

      const victories: number[] = [];
      const defeats: number[] = [];
      const soloCoopGames: number[] = [];

      const xAxis = this.getChartXAxis();

      xAxis.forEach((date, xIndex) => {
        victories.push(0);
        defeats.push(0);
        soloCoopGames.push(0);
        this.games.forEach((game) => {
          if (date === this.getDateMonth(game.startDate)) {
            switch (game.gameResult) {
              case GameResult.WIN:
                victories[xIndex]++;
                break;
              case GameResult.LOSE:
                defeats[xIndex]++;
                break;
              case GameResult.NEUTRAL:
                soloCoopGames[xIndex]++;
                break;
            }
          }
        });
      });
      this.chartOptions = {
        series: [
          {
            name: 'Victoires',
            color: '#00a550',
            data: victories,
          },
          {
            name: 'Défaites',
            color: '#e83946',
            data: defeats,
          },
          {
            name: 'Parties solo et coop',
            color: '#ebc634',
            data: soloCoopGames,
          }
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
          categories: xAxis,
        },
        fill: {
          opacity: 1,
          type: 'solid',
        },
      };
    });
  }

  get gameType() {
    return GameType;
  }

  prettyGameMode(gameType: GameType): string {
    switch (gameType) {
      case GameType.CLASSIC:
        return 'Classique';
      case GameType.SPRINT_COOP:
        return 'Sprint coop';
      case GameType.SPRINT_SOLO:
        return 'Sprint solo';
    }
  }

  prettyGameResult(gameResult: GameResult): string {
    switch (gameResult) {
      case GameResult.WIN:
        return 'Victoire';
      case GameResult.LOSE:
        return 'Défaite';
      case GameResult.NEUTRAL:
        return 'Neutre';
    }

  }

  getGameTime(game: Game): string {
    const gameTime = (game.endDate - game.startDate) / DashboardComponent.MS_TO_MINS;
    const mins = Math.floor(gameTime);
    // eslint-disable-next-line @typescript-eslint/no-magic-numbers
    const seconds = Math.round((gameTime - mins) * 60);
    return `${mins}m ${seconds}s`;
  }

  getDate(timestamp: number): string {
    const date = new Date(timestamp);
    return this.getDateMonth(timestamp)
      + ` à ${this.formatTime(date.getHours())}:${this.formatTime(date.getMinutes())}`
      + `:${this.formatTime(date.getSeconds())}`;
  }

  private getDateMonth(timestamp: number): string {
    const date = new Date(timestamp);
    return `${date.getDate()} ${DashboardComponent.MONTHS[date.getMonth()]}`;
  }

  private formatTime(time: number): string {
    return time.toString().length === 1 ? `0${time}` : time.toString();
  }

  private getTimeConnected(): number {
    let timeConnected = 0;
    this.logins.forEach((login) => {
      if (login.end) {
        timeConnected += login.end - login.start;
      } else {
        timeConnected += Date.now() - login.start;
      }
    });
    return timeConnected;
  }

  private toHours(milliseconds: number): string {
    return (milliseconds / DashboardComponent.MS_TO_HOURS).toFixed(2);
  }

  private getChartXAxis(): string[] {
    let day = Date.now();
    const lastWeek: string[] = [];
    lastWeek.unshift(this.getDateMonth(day));
    for (let i = 0; i < DashboardComponent.NB_DAYS_PER_WEEK - 1; i++) {
      day -= DashboardComponent.MS_PER_DAY;
      const dateMonth = this.getDateMonth(day);
      lastWeek.unshift(dateMonth);
    }
    return lastWeek;
  }

}
