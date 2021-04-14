import { Component } from '@angular/core';
import { Router } from '@angular/router';
import randomColor from 'randomcolor';
import { GameService } from '@services/game.service';
import { ChatService } from '@services/chat.service';
import { TutorialService, TutorialStep } from '@services/tutorial.service';
import { EditorService } from '@services/editor.service';
import { GameType, Player } from '../../../../../../../common/communication/lobby';

@Component({
  selector: 'app-lobby',
  templateUrl: './lobby.component.html',
  styleUrls: ['./lobby.component.scss'],
})
export class LobbyComponent {
  inviteCode: string = 'Bientôt';
  teams: Player[][];

  constructor(
    public gameService: GameService,
    private router: Router,
    public chatService: ChatService,
    private editorService: EditorService,
    private tutorialService: TutorialService,
  ) {}

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
      this.gameService.leaveGame();
      this.editorService.isFreeEdit = true;
      this.tutorialService.next(TutorialStep.SELECT_TOOL);
    } else {
      this.gameService.startGame();
    }
    this.router.navigate(['/edit']);
  }

  get gamemode(): GameType {
    return this.gameService.gameType ? this.gameService.gameType : GameType.CLASSIC;
  }

  get splitTeams(): boolean {
    return this.gameService.gameType === GameType.CLASSIC;
  }
}
