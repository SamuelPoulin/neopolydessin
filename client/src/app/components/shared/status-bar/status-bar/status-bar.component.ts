import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { GameService } from '@services/game.service';
import { TutorialService, TutorialStep } from '@services/tutorial.service';
import { UserService } from '@services/user.service';

@Component({
  selector: 'app-status-bar',
  templateUrl: './status-bar.component.html',
  styleUrls: ['./status-bar.component.scss'],
})
export class StatusBarComponent {
  @Input() quit: boolean;
  @Input() disableDashboard: boolean;
  @Input() back: boolean;
  @Input() previousPage: string;

  username: string;

  constructor(
    private router: Router,
    public userService: UserService,
    private gameService: GameService,
    private tutorialService: TutorialService,
  ) {
    this.username = this.userService.account.username;
  }

  navigateBack() {
    if (this.quit !== undefined) {
      this.gameService.leaveGame();
      this.gameService.clearGameInfo();
    }
    this.router.navigate([this.previousPage]);
    if (this.tutorialService.tutorialActive) {
      this.tutorialService.next(TutorialStep.END);
    }
  }
}
