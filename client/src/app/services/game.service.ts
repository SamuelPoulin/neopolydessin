import { EventEmitter, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Difficulty, GameType, Player, PlayerRole, TeamScore } from '../../../../common/communication/lobby';
import { SocketService } from './socket-service.service';
import { UserService } from './user.service';

@Injectable()
export class GameService {
  static readonly SECOND: number = 1000;
  canDraw: boolean = false;
  drawer: Player;
  roleChanged: EventEmitter<PlayerRole> = new EventEmitter<PlayerRole>();
  canGuessChanged: EventEmitter<void> = new EventEmitter<void>();
  isHost: boolean = false;
  wordToDraw: string = '';

  gameType: GameType | undefined;
  difficulty: Difficulty | undefined;

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

  loggedInSubscription: Subscription;

  constructor(private router: Router, private socketService: SocketService, private userService: UserService) {
    this.loggedInSubscription = this.userService.loggedIn.subscribe(() => this.initSubscriptions());
    this.resetTeams();
    this.scores = [
      { teamNumber: 0, score: 0 },
      { teamNumber: 1, score: 0 },
    ];
    this.initSubscriptions();
  }

  initSubscriptions() {
    this.lobbySubscription = this.socketService.getLobbyInfo().subscribe((players) => {
      this.resetTeams();
      for (const player of players) {
        if (player.username === this.userService.account.username) {
          this.isHost = player.isOwner;
          this.canDraw = player.playerRole === PlayerRole.DRAWER;
        }
        if (player.playerRole === PlayerRole.DRAWER) {
          this.drawer = player;
        }
        this.teams[player.teamNumber].push(player);
      }
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
      this.resetTeams();
      for (const player of players) {
        if (player.playerRole === PlayerRole.DRAWER) this.drawer = player;
        if (player.username === this.userService.account.username) {
          this.canGuess = player.playerRole === PlayerRole.GUESSER;
          this.canGuessChanged.emit();
          this.canDraw = player.playerRole === PlayerRole.DRAWER;
        }
        if (player.playerRole === PlayerRole.DRAWER && this.drawer.username !== player.username) {
          this.drawer = player;
          this.wordToDraw = '';
          this.roleChanged.emit(player.playerRole);
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

  setGameInfo(gameType: GameType, difficulty: Difficulty) {
    this.gameType = gameType;
    this.difficulty = difficulty;
  }

  clearGameInfo() {
    this.gameType = undefined;
    this.difficulty = undefined;
  }
}
