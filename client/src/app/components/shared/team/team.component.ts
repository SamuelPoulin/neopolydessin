import { Component, Input } from '@angular/core';
import { Player, PlayerRole } from '../../../../../../common/communication/lobby';

@Component({
  selector: 'app-team',
  templateUrl: './team.component.html',
  styleUrls: ['./team.component.scss'],
})
export class TeamComponent {
  @Input() team: Player[];
  @Input() score: number;
  @Input() name: string;
  @Input() ennemy: boolean;

  constructor() {
    this.team = [];
    this.name = '';
  }

  get playerRole() {
    return PlayerRole;
  }
}
