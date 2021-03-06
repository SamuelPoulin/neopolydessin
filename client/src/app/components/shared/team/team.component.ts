import { Component, Input } from '@angular/core';
import { GameService } from '@services/game.service';
import { Player, PlayerRole } from '@common/communication/lobby';

@Component({
  selector: 'app-team',
  templateUrl: './team.component.html',
  styleUrls: ['./team.component.scss'],
})
export class TeamComponent {
  @Input() team: Player[];
  @Input() scoreIndex: number;
  @Input() teamIndex: number;
  @Input() name: string;
  @Input() ennemy: boolean;

  constructor(public gameService: GameService) {
    this.team = [];
    this.name = '';
  }

  addBot(): void {
    this.gameService.addBot(this.teamIndex);
  }

  removePlayer(accountId: string): void {
    this.gameService.removePlayer(accountId);
  }

  removeBot(username: string): void {
    this.gameService.removeBot(username);
  }

  canAddBot(): boolean {
    return this.team.length < 2 && !this.team.find((player) => player.isBot);
  }

  get playerRole() {
    return PlayerRole;
  }

  get score() {
    return this.gameService.scores[this.scoreIndex].score;
  }

}
