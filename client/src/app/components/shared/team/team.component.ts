import { Component, Input } from '@angular/core';
import { Player } from '../../../../../../common/communication/lobby';

@Component({
  selector: 'app-team',
  templateUrl: './team.component.html',
  styleUrls: ['./team.component.scss'],
})
export class TeamComponent {
  @Input() team: Player[];
  @Input() name: string;
  @Input() ennemy: boolean;

  constructor() {
    this.team = [];
    this.name = '';
  }
}
