import { AfterViewInit, Component } from '@angular/core';
import { Clipboard } from '@angular/cdk/clipboard';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SocketService } from '@services/socket-service.service';
import { Router } from '@angular/router';
import { UserService } from '@services/user.service';
import { GameService } from '@services/game.service';

@Component({
  selector: 'app-lobby',
  templateUrl: './lobby.component.html',
  styleUrls: ['./lobby.component.scss'],
})
export class LobbyComponent implements AfterViewInit {
  gamemode: string = 'classique';
  inviteCode: string = 'dWA1gV';
  playersTeam1: string[] = new Array<string>();
  playersTeam2: string[] = new Array<string>();

  constructor(
    private clipboard: Clipboard,
    private snackBar: MatSnackBar,
    private socketService: SocketService,
    private router: Router,
    private gameService: GameService,
    userService: UserService,
  ) {
    this.playersTeam1.push(userService.username);
  }

  get gamemodeName(): string {
    switch (this.gamemode) {
      case 'classique':
        return 'Classique';
      case 'coop':
        return 'Co-op';
      default:
        return '';
    }
  }

  get electronContainer(): Element | null {
    return document.querySelector('.container-after-titlebar');
  }

  ngAfterViewInit(): void {
    this.gameService.isDrawer = true;
    this.socketService.createLobby('client-lourd'); // todo - host only must create lobby;
    this.socketService.getPlayerJoined().subscribe((player) => {
      this.playersTeam2.push(player);
    });
  }

  copyInviteCode(): void {
    this.clipboard.copy(this.inviteCode);
    this.snackBar.open("Code d'invitation copié.", 'Ok', {
      duration: 2000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
    });
  }

  startGame(): void {
    this.socketService.startGame();
    this.router.navigate(['edit']);
  }
}
