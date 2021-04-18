import { Component } from '@angular/core';
import { Router } from '@angular/router';
import randomColor from 'randomcolor';
import { GameService } from '@services/game.service';
import { ChatService } from '@services/chat.service';
import { TutorialService, TutorialStep } from '@services/tutorial.service';
import { GameType, Player } from '../../../../../../../common/communication/lobby';

@Component({
  selector: 'app-lobby',
  templateUrl: './lobby.component.html',
  styleUrls: ['./lobby.component.scss'],
})
export class LobbyComponent {
  inviteCode: string = 'Bientôt';
  teams: Player[][];
  privacyButtonText: string[];
  privacyColors: string[];

  constructor(
    public gameService: GameService,
    private router: Router,
    public chatService: ChatService,
    private tutorialService: TutorialService,
  ) {
    this.privacyButtonText = ['Partie publique', 'Partie privée'];
    this.privacyColors = ['#3bbf51', '#e84646'];
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

  startGame(): void {
    if (this.tutorialService.tutorialActive) {
      this.tutorialService.next(TutorialStep.CHAT);
    } else {
      this.gameService.startGame();
    }
    this.router.navigate(['/edit']);
  }

  togglePrivacy(): void {
    this.gameService.changePrivacySetting(this.gameService.privacy ? false : true);
  }

  get gamemode(): GameType {
    return this.gameService.gameType ? this.gameService.gameType : GameType.CLASSIC;
  }

  get splitTeams(): boolean {
    return this.gameService.gameType === GameType.CLASSIC;
  }
}
