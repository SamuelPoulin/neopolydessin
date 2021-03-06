import { EventEmitter, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import {
  CurrentGameState,
  Difficulty,
  GameType,
  LobbyInfo,
  Player,
  PlayerRole,
  ReasonEndGame,
  TeamScore,
} from '@common/communication/lobby';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SocketService } from './socket-service.service';
import { UserService } from './user.service';

interface GameEndState {
  won: boolean;
  score: number;
}

@Injectable()
export class GameService {
  static readonly SECOND: number = 1000;
  static readonly CLASSIC_PLAYER_NUMBER: number = 4;

  isInGame: boolean = false;
  canDraw: boolean = false;
  lastGameEndState: GameEndState | null = null;
  roleChanged: EventEmitter<PlayerRole> = new EventEmitter<PlayerRole>();
  canGuessChanged: EventEmitter<void> = new EventEmitter<void>();
  drawingChanged: EventEmitter<void> = new EventEmitter<void>();
  gameStarted: EventEmitter<void> = new EventEmitter<void>();
  gameEnded: EventEmitter<void> = new EventEmitter<void>();
  isHost: boolean = false;
  wordToDraw: string = '';

  gameType: GameType | undefined;
  difficulty: Difficulty | undefined;
  privacy: boolean;

  lobbySubscription: Subscription;
  rolesSubscription: Subscription;
  gameStateSubscription: Subscription;
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
  canStartGame: boolean;
  currentRole: PlayerRole;

  loggedInSubscription: Subscription;

  constructor(
    private router: Router,
    private socketService: SocketService,
    private userService: UserService,
    private snackBar: MatSnackBar,
  ) {
    this.loggedInSubscription = this.userService.loggedIn.subscribe(() => this.initSubscriptions());
    this.resetTeams();
    this.canStartGame = false;
    this.resetScores();
    this.initSubscriptions();
  }

  initSubscriptions() {
    this.lobbySubscription = this.socketService.getLobbyInfo().subscribe((players) => {
      this.resetTeams();
      if (this.gameType === GameType.CLASSIC) {
        if (players.length === GameService.CLASSIC_PLAYER_NUMBER) {
          this.canStartGame = true;
        } else {
          this.canStartGame = false;
        }
      }
      for (const player of players) {
        if (player.username === this.userService.account.username) {
          this.isHost = player.isOwner;
          this.canDraw = player.playerRole === PlayerRole.DRAWER;
        }
        this.teams[player.teamNumber].push(player);
      }
    });
    this.timestampSubscription = this.socketService.receiveNextTimestamp().subscribe((timeInfo) => {
      this.nextTimestamp = Date.now() - timeInfo.serverTime + timeInfo.timestamp;
      this.startCount();
    });
    this.endGameSubscription = this.socketService.receiveGameEnd().subscribe((reason) => {
      if (reason === ReasonEndGame.WINNING_SCORE_REACHED) {
        this.gameEnded.emit();
        this.lastGameEndState = { won: this.wonLastGame(), score: this.lastGameScore() };
        this.router.navigate(['/gameend']);
      } else if (reason === ReasonEndGame.PLAYER_DISCONNECT) {
        this.snackBar.open('Un joueur a quitt?? la partie.', 'Ok', {
          duration: 5000,
          horizontalPosition: 'center',
          verticalPosition: 'bottom',
        });
        this.leaveGame();
      } else if (reason === ReasonEndGame.TIME_RUN_OUT) {
        this.lastGameEndState = { won: true, score: this.scores[0].score };
        this.router.navigate(['/gameend']);
      } else {
        this.leaveGame();
      }
    });
    this.startClientGameSubscription = this.socketService.receiveGameStart().subscribe(() => {
      this.gameStarted.emit();
      this.isInGame = true;
      this.router.navigate(['edit']);
    });
    this.rolesSubscription = this.socketService.receiveRoles().subscribe((players) => {
      this.resetTeams();
      for (const player of players) {
        if (player.username === this.userService.account.username) {
          this.currentRole = player.playerRole;
          this.canGuess = player.playerRole === PlayerRole.GUESSER;
          this.canGuessChanged.emit();
          this.canDraw = player.playerRole === PlayerRole.DRAWER;
          this.roleChanged.emit();
        }
        this.teams[player.teamNumber].push(player);
      }
    });

    this.gameStateSubscription = this.socketService.receiveGameState().subscribe((state) => {
      if (state === CurrentGameState.DRAWING) {
        this.wordToDraw = '';
        this.drawingChanged.emit();
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
    this.socketService.removedFromLobby().subscribe(() => {
      this.router.navigate(['/']);
    });
  }

  resetTeams() {
    this.teams = [[], []];
  }

  resetScores() {
    this.scores = [
      { teamNumber: 0, score: 0 },
      { teamNumber: 1, score: 0 },
    ];
  }

  startGame() {
    this.socketService.startGame();
  }

  changePrivacySetting(privateGame: boolean) {
    this.socketService.changeLobbyPrivacy(privateGame).then((newPrivacy) => {
      this.privacy = newPrivacy;
    });
  }

  async addBot(teamNumber: number): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.socketService.addBot(teamNumber).subscribe((success) => {
        if (success) resolve();
        else reject();
      });
    });
  }

  removePlayer(accountId: string) {
    this.socketService.removePlayer(accountId);
  }

  removeBot(username: string) {
    this.socketService.removeBot(username);
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

  setGameInfo(lobbyInfo: LobbyInfo) {
    this.resetScores();
    this.gameType = lobbyInfo.gameType;
    this.difficulty = lobbyInfo.difficulty;
    this.privacy = lobbyInfo.private;
    this.canStartGame = GameType.CLASSIC === this.gameType ? false : true;
  }

  clearGameInfo() {
    this.gameType = undefined;
    this.difficulty = undefined;
  }

  wonLastGame(): boolean {
    const winningIndex = this.scores[0].score > this.scores[1].score ? 0 : 1;

    return this.teams[winningIndex].findIndex((player) => player.username === this.userService.account.username) !== -1;
  }

  lastGameScore(): number {
    for (const player of this.teams[0]) {
      if (player.username === this.userService.account.username) return this.scores[0].score;
    }

    return this.scores[1].score;
  }
}
