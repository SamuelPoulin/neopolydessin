import { AfterViewInit, Component } from '@angular/core';
import { Clipboard } from '@angular/cdk/clipboard';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SocketService } from '@services/socket-service.service';
import { Router } from '@angular/router';
import { UserService } from '@services/user.service';
import randomColor from 'randomcolor';

@Component({
  selector: 'app-lobby',
  templateUrl: './lobby.component.html',
  styleUrls: ['./lobby.component.scss'],
})
export class LobbyComponent implements AfterViewInit {
  inviteCode: string = 'Bientôt';
  playersTeam1: string[] = [];
  playersTeam2: string[] = [];

  constructor(
    private clipboard: Clipboard,
    private snackBar: MatSnackBar,
    private socketService: SocketService,
    private router: Router,
    userService: UserService,
  ) {
    this.playersTeam1.push(userService.username);
  }

  get electronContainer(): Element | null {
    return document.querySelector('.container-after-titlebar');
  }

  firstLetter(username: string): string {
    return username ? username[0].toUpperCase() : '';
  }

  avatarColor(username: string): string {
    return randomColor({ seed: username, luminosity: 'bright' });
  }

  ngAfterViewInit(): void {
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
