import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '@services/user.service';
import randomColor from 'randomcolor';

@Component({
  selector: 'app-status-bar',
  templateUrl: './status-bar.component.html',
  styleUrls: ['./status-bar.component.scss'],
})
export class StatusBarComponent {
  @Input() quit: boolean;
  @Input() back: boolean;
  @Input() previousPage: string;

  avatarColor: string;
  username: string;

  constructor(private router: Router, private userService: UserService) {
    this.username = this.userService.username;
    this.avatarColor = randomColor({ seed: this.username, luminosity: 'bright' });
  }

  navigateBack() {
    this.router.navigate([this.previousPage]);
  }
}
