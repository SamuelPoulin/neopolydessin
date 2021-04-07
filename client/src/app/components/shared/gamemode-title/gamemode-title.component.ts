import { Component, Input } from '@angular/core';
import { GameType } from '@common/communication/lobby';

@Component({
  selector: 'app-gamemode-title',
  templateUrl: './gamemode-title.component.html',
  styleUrls: ['./gamemode-title.component.scss'],
})
export class GamemodeTitleComponent {
  @Input() gamemode: GameType;

  constructor() {
    this.gamemode = GameType.CLASSIC;
  }

  get gamemodeName(): string {
    switch (this.gamemode) {
      case GameType.CLASSIC:
        return 'Classique';
      case GameType.SPRINT_COOP:
        return 'Co-op';
      case GameType.SPRINT_SOLO:
        return 'Solo';
      default:
        return '';
    }
  }

  get gameType() {
    return GameType;
  }
}
