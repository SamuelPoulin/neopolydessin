import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-gamemode-title',
  templateUrl: './gamemode-title.component.html',
  styleUrls: ['./gamemode-title.component.scss'],
})
export class GamemodeTitleComponent {
  @Input() gamemode: string;

  constructor() {
    this.gamemode = 'classique';
  }

  get gamemodeName(): string {
    switch (this.gamemode) {
      case 'classique':
        return 'Classique';
      case 'coop':
        return 'Co-op';
      case 'solo':
        return 'Solo';
      default:
        return '';
    }
  }
}
