import { MediaMatcher } from '@angular/cdk/layout';
import { Component } from '@angular/core';
import { UserService } from '@services/user.service';
import randomColor from 'randomcolor';

@Component({
  selector: 'app-account-navbar',
  templateUrl: './account-navbar.component.html',
  styleUrls: ['./account-navbar.component.scss'],
})
export class AccountNavbarComponent {
  static IS_SCREEN_BIG: boolean;

  avatarColor: string;
  avatarLetter: string;
  closed: boolean;
  matcher: MediaQueryList;

  firstName: string;
  lastName: string;
  username: string;
  firstLetter: string;

  constructor(private mediaMatcher: MediaMatcher, private userService: UserService) {
    this.firstName = 'Samuel';
    this.lastName = 'Poulin';
    this.username = this.userService.username;
    this.firstLetter = this.username ? this.username[0].toUpperCase() : '';

    this.matcher = this.mediaMatcher.matchMedia('(min-width: 635px)');
    this.matcher.addEventListener('change', this.screenChanged);
    AccountNavbarComponent.IS_SCREEN_BIG = this.matcher.matches;

    this.closed = true;

    this.avatarColor = randomColor({ seed: this.username, luminosity: 'bright' });
  }

  screenChanged(event: MediaQueryListEvent) {
    AccountNavbarComponent.IS_SCREEN_BIG = event.matches;
  }

  toggleClosed(): void {
    this.closed = !this.closed;
  }

  get electronContainer(): Element | null {
    return document.querySelector('.container-after-titlebar');
  }

  get isBigScreen(): boolean {
    return AccountNavbarComponent.IS_SCREEN_BIG;
  }

  logout(): void {
    this.userService.logout();
  }
}
