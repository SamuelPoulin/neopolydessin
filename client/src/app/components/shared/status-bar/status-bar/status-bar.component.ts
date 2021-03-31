import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { GameService } from '@services/game.service';
import { UserService } from '@services/user.service';

@Component({
  selector: 'app-status-bar',
  templateUrl: './status-bar.component.html',
  styleUrls: ['./status-bar.component.scss'],
})
export class StatusBarComponent {
  @Input() quit: boolean;
  @Input() back: boolean;
  @Input() previousPage: string;

  username: string;

  constructor(private router: Router, public userService: UserService, private gameService: GameService) {
    this.username = this.userService.username;
  }

  navigateBack() {
    if (this.quit !== undefined) {
      this.gameService.leaveGame();
    }
    this.router.navigate([this.previousPage]);
  }
}
