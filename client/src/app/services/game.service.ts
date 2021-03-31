import { EventEmitter, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Player, PlayerRole } from '../../../../common/communication/lobby';
import { ChatService } from './chat.service';
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

  startClientGameSubscription: Subscription;
  endGameSubscription: Subscription;

  timestampSubscription: Subscription;

  teams: Player[][];
  nextTimestamp: number;
  timeRemaining: number;

  constructor(
    private router: Router,
    private socketService: SocketService,
    private userService: UserService,
    private chatService: ChatService,
  ) {
    this.resetTeams();
    this.initSubscriptions();
  }

  initSubscriptions() {
    this.lobbySubscription = this.socketService.getLobbyInfo().subscribe((players) => {
      this.resetTeams();
      for (const player of players) {
        if (player.username === this.userService.username) {
          this.isHost = false;
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
      console.log(players);
      this.resetTeams();
      for (const player of players) {
        if (player.username === this.userService.username) {
          this.canDraw = player.playerRole === PlayerRole.DRAWER;
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
  }

  resetTeams() {
    this.teams = [[], []];
  }

  startGame() {
    this.chatService.resetGameMessages();
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
