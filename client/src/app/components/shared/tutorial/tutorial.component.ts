import { Component } from '@angular/core';
import { TutorialService } from '@services/tutorial.service';

@Component({
  selector: 'app-tutorial',
  templateUrl: './tutorial.component.html',
  styleUrls: ['./tutorial.component.scss'],
})
export class TutorialComponent {
  constructor(public tutorialService: TutorialService) {}

  get hint() {
    return this.tutorialService.currentHint;
  }
}
