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
  selectedGamemode: string;

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
    this.selectedGamemode = 'Classique';

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
    return GameType.CLASSIC;
  }

  get difficulty() {
    return Difficulty.EASY;
  }
}
