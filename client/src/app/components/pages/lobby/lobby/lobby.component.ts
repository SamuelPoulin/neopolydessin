import { Component } from '@angular/core';
import { Clipboard } from '@angular/cdk/clipboard';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import randomColor from 'randomcolor';
import { GameService } from '@services/game.service';
import { Player } from '../../../../../../../common/communication/lobby';

@Component({
  selector: 'app-lobby',
  templateUrl: './lobby.component.html',
  styleUrls: ['./lobby.component.scss'],
})
export class LobbyComponent {
  inviteCode: string = 'Bientôt';
  teams: Player[][];

  constructor(
    private clipboard: Clipboard,
    private snackBar: MatSnackBar,
    public gameService: GameService,
    private router: Router,
    private route: ActivatedRoute,
  ) {
    this.route.params.subscribe((params) => {
      if (!params.id) {
        this.gameService.isHost = true;
      }
    });
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

  copyInviteCode(): void {
    this.clipboard.copy(this.inviteCode);
    this.snackBar.open("Code d'invitation copié.", 'Ok', {
      duration: 2000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
    });
  }

  startGame(): void {
    this.gameService.startGame();
    this.router.navigate(['edit']);
  }
}
