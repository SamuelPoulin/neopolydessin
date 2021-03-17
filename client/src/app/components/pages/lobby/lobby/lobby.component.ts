import { Component } from '@angular/core';
import { Clipboard } from '@angular/cdk/clipboard';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-lobby',
  templateUrl: './lobby.component.html',
  styleUrls: ['./lobby.component.scss'],
})
export class LobbyComponent {
  gamemode: string = 'classique';
  inviteCode: string = 'dWA1gV';

  constructor(private clipboard: Clipboard, private snackBar: MatSnackBar) {}

  copyInviteCode(): void {
    this.clipboard.copy(this.inviteCode);
    this.snackBar.open("Code d'invitation copié.", 'Ok', {
      duration: 2000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
    });
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
}
