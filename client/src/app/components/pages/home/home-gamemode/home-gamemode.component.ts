import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { Difficulty, GameType, LobbyInfo } from '@common/communication/lobby';
import { AbstractModalComponent } from '@components/shared/abstract-modal/abstract-modal.component';
import { GameService } from '@services/game.service';
import { SocketService } from '@services/socket-service.service';
import { TutorialService, TutorialStep } from '@services/tutorial.service';
import { UserService } from '@services/user.service';

@Component({
  selector: 'app-home-gamemode',
  templateUrl: './home-gamemode.component.html',
  styleUrls: ['./home-gamemode.component.scss'],
})
export class HomeGamemodeComponent extends AbstractModalComponent {
  gamemodes: string[];
  difficulties: string[];
  privacyButtonText: string[];
  privacyColors: string[];
  selectedGamemode: string;
  selectedDifficulty: string;

  lobbyName: string;
  privateGame: number;
  privacyText: string;

  constructor(
    dialogRef: MatDialogRef<AbstractModalComponent>,
    private socketService: SocketService,
    private userService: UserService,
    private gameService: GameService,
    private router: Router,
    private snackBar: MatSnackBar,
    private tutorialService: TutorialService,
  ) {
    super(dialogRef);

    this.dialogRef.disableClose = true;

    this.gamemodes = this.tutorialService.tutorialActive ? ['Solo'] : ['Classique', 'Co-op', 'Solo'];
    this.difficulties = ['Facile', 'Intermédiaire', 'Difficile'];

    this.selectedGamemode = this.tutorialService.tutorialActive ? 'Solo' : 'Classique';
    this.privacyButtonText = ['Partie publique', 'Partie privée'];
    this.privacyColors = ['#3bbf51', '#e84646'];
    this.privateGame = 0;

    this.selectedDifficulty = 'Facile';

    this.lobbyName = 'Partie de ' + this.userService.account.username;
  }

  startGame(): void {
    const privacy: boolean = this.privateGame === 0 ? false : true;
    this.socketService
      .createLobby(this.lobbyName, this.gamemode, this.difficulty, privacy)
      .then((lobbyInfo: LobbyInfo) => {
        this.gameService.setGameInfo(lobbyInfo);
        this.dialogRef.close();
        this.router.navigate(['lobby']);
        if (this.tutorialService.tutorialActive) {
          this.tutorialService.next(TutorialStep.START_GAME);
        }
      })
      .catch(() => {
        this.snackBar.open('Erreur lors de la création de la partie.', 'Ok', {
          duration: 2000,
          horizontalPosition: 'center',
          verticalPosition: 'bottom',
        });
      });
  }

  togglePrivacy(): void {
    this.privateGame = (this.privateGame + 1) % 2;
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
