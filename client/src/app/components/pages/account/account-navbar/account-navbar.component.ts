import { MediaMatcher } from '@angular/cdk/layout';
import { Component } from '@angular/core';
import { UserService } from '@services/user.service';

@Component({
  selector: 'app-account-navbar',
  templateUrl: './account-navbar.component.html',
  styleUrls: ['./account-navbar.component.scss'],
})
export class AccountNavbarComponent {
  static IS_SCREEN_BIG: boolean;

  closed: boolean;
  matcher: MediaQueryList;

  firstName: string;
  lastName: string;
  username: string;

  constructor(private mediaMatcher: MediaMatcher, public userService: UserService) {
    this.firstName = 'Samuel';
    this.lastName = 'Poulin';
    this.username = this.userService.username;

    this.matcher = this.mediaMatcher.matchMedia('(min-width: 635px)');
    this.matcher.addEventListener('change', this.screenChanged);
    AccountNavbarComponent.IS_SCREEN_BIG = this.matcher.matches;

    this.closed = true;
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
