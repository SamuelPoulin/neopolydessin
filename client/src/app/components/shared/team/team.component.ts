import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-team',
  templateUrl: './team.component.html',
  styleUrls: ['./team.component.scss'],
})
export class TeamComponent {
  @Input() team: string[];
  @Input() name: string;
  @Input() ennemy: boolean;

  constructor() {
    this.team = [];
    this.name = '';
  }
}
