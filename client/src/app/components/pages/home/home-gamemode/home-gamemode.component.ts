import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { Difficulty, GameType } from '@common/communication/lobby';
import { AbstractModalComponent } from '@components/shared/abstract-modal/abstract-modal.component';
import { SocketService } from '@services/socket-service.service';
import { UserService } from '@services/user.service';

@Component({
  selector: 'app-home-gamemode',
  templateUrl: './home-gamemode.component.html',
  styleUrls: ['./home-gamemode.component.scss'],
})
export class HomeGamemodeComponent extends AbstractModalComponent {
  gamemodes: string[];
  difficulties: string[];
  selectedGamemode: string;
  selectedDifficulty: string;

  lobbyName: string;

  constructor(
    dialogRef: MatDialogRef<AbstractModalComponent>,
    private socketService: SocketService,
    private userService: UserService,
    private router: Router,
    private snackBar: MatSnackBar,
  ) {
    super(dialogRef);

    this.gamemodes = ['Classique', 'Co-op', 'Solo'];
    this.difficulties = ['Facile', 'Intermédiaire', 'Difficile'];

    this.selectedGamemode = 'Classique';
    this.selectedDifficulty = 'Facile';

    this.lobbyName = 'Partie de ' + this.userService.account.username;
  }

  startGame(): void {
    this.socketService
      .createLobby(this.lobbyName, this.gamemode, this.difficulty)
      .then(() => {
        this.dialogRef.close();
        this.router.navigate(['lobby']);
      })
      .catch(() => {
        this.snackBar.open('Erreur lors de la création de la partie.', 'Ok', {
          duration: 2000,
          horizontalPosition: 'center',
          verticalPosition: 'bottom',
        });
      });
  }

  get gamemode() {
    switch (this.selectedGamemode) {
      case 'Classique':
        return GameType.CLASSIC;
      case 'Co-op':
        return GameType.SPRINT_COOP;
      case 'Solo':
        return GameType.SPRINT_SOLO;
      default:
        return GameType.CLASSIC;
    }
  }

  get difficulty() {
    switch (this.selectedDifficulty) {
      case 'Facile':
        return Difficulty.EASY;
      case 'Intermédiaire':
        return Difficulty.INTERMEDIATE;
      case 'Difficile':
        return Difficulty.HARD;
      default:
        return Difficulty.EASY;
    }
  }
}
