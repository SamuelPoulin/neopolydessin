import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Player } from '../../../../common/communication/lobby';
import { SocketService } from './socket-service.service';

@Injectable({
  providedIn: 'root',
})
export class GameService {
  private static readonly SECOND: number = 1000;
  isDrawer: boolean = false;

  lobbySubscription: Subscription;
  gameSubscription: Subscription;
  timestampSubscription: Subscription;

  teams: Player[][];
  nextTimestamp: number;
  timeRemaining: number;

  constructor(private router: Router, private socketService: SocketService) {
    this.resetTeams();
    this.initSubscriptions();
  }

  initSubscriptions() {
    this.lobbySubscription = this.socketService.getLobbyInfo().subscribe((players) => {
      this.resetTeams();
      for (const player of players) {
        this.teams[player.teamNumber].push(player);
      }
    });
    this.timestampSubscription = this.socketService.receiveNextTimestamp().subscribe((timestamp) => {
      this.nextTimestamp = timestamp;
      this.startCount();
    });
  }

  resetTeams() {
    this.teams = [[], []];
  }

  startGame() {
    this.socketService.startGame();
  }

  leaveGame() {
    this.socketService.leaveLobby();
    this.resetTeams();
    this.router.navigate(['']);
  }

  startCount(): void {
    this.timeRemaining = this.getTimeLeft();

    setInterval(() => {
      this.timeRemaining = this.getTimeLeft();
    }, GameService.SECOND);
  }

  getTimeLeft(): number {
    if (this.nextTimestamp) {
      return this.nextTimestamp - Date.now();
    } else {
      return 0;
    }
  }
}
