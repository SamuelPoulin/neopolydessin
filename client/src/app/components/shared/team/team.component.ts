import { Component, Input } from '@angular/core';
import { GameService } from '@services/game.service';
import { Player, PlayerRole } from '../../../../../../common/communication/lobby';

@Component({
  selector: 'app-team',
  templateUrl: './team.component.html',
  styleUrls: ['./team.component.scss'],
})
export class TeamComponent {
  @Input() team: Player[];
  @Input() scoreIndex: number;
  @Input() name: string;
  @Input() hideScore: boolean;
  @Input() ennemy: boolean;

  constructor(private gameService: GameService) {
    this.team = [];
    this.name = '';
  }

  get playerRole() {
    return PlayerRole;
  }

  get score() {
    return this.gameService.scores[this.scoreIndex].score;
  }

  get showScore() {
    return this.hideScore !== undefined && !this.hideScore;
  }
}
