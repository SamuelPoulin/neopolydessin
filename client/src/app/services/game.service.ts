import { EventEmitter, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Player, PlayerRole, TeamScore } from '../../../../common/communication/lobby';
import { SocketService } from './socket-service.service';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root',
})
export class GameService {
  private static readonly SECOND: number = 1000;
  canDraw: boolean = false;
  roleChanged: EventEmitter<PlayerRole> = new EventEmitter<PlayerRole>();
  isHost: boolean = false;
  wordToDraw: string = '';

  lobbySubscription: Subscription;
  rolesSubscription: Subscription;
  wordSubscription: Subscription;
  scoresSubscription: Subscription;

  startClientGameSubscription: Subscription;
  endGameSubscription: Subscription;

  timestampSubscription: Subscription;

  teams: Player[][];
  scores: TeamScore[];
  nextTimestamp: number;
  timeRemaining: number;
  canGuess: boolean;

  constructor(private router: Router, private socketService: SocketService, private userService: UserService) {
    this.resetTeams();
    this.initSubscriptions();
  }

  initSubscriptions() {
    this.lobbySubscription = this.socketService.getLobbyInfo().subscribe((players) => {
      console.log(players);
      this.resetTeams();
      for (const player of players) {
        if (player.username === this.userService.username) {
          this.isHost = player.isOwner;
        }
        this.teams[player.teamNumber].push(player);
      }
      console.log(this.teams);
    });
    this.timestampSubscription = this.socketService.receiveNextTimestamp().subscribe((timeInfo) => {
      this.nextTimestamp = Date.now() - timeInfo.serverTime + timeInfo.timestamp;
      this.startCount();
    });
    this.endGameSubscription = this.socketService.receiveGameEnd().subscribe(() => {
      this.leaveGame();
    });
    this.startClientGameSubscription = this.socketService.receiveGameStart().subscribe(() => {
      this.router.navigate(['edit']);
    });
    this.rolesSubscription = this.socketService.receiveRoles().subscribe((players) => {
      console.log(players);
      this.resetTeams();
      for (const player of players) {
        if (player.username === this.userService.username) {
          this.canDraw = player.playerRole === PlayerRole.DRAWER;
          this.canGuess = player.playerRole === PlayerRole.GUESSER;
          this.roleChanged.emit(player.playerRole);
        } else if (player.playerRole === PlayerRole.DRAWER) {
          this.wordToDraw = '';
        }
        this.teams[player.teamNumber].push(player);
      }
    });
    this.wordSubscription = this.socketService.receiveWord().subscribe((word) => {
      this.wordToDraw = word;
    });
    this.scoresSubscription = this.socketService.receiveScores().subscribe((scores) => {
      for (const score of scores) {
        this.scores[score.teamNumber].score = score.score;
      }
    });
  }

  resetTeams() {
    this.teams = [[], []];
    this.scores = [
      { teamNumber: 0, score: 0 },
      { teamNumber: 1, score: 0 },
    ];
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
