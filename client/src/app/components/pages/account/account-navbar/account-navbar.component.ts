import { MediaMatcher } from '@angular/cdk/layout';
import { Component } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
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

  constructor(
    private mediaMatcher: MediaMatcher,
    public userService: UserService,
    private snackBar: MatSnackBar
  ) {
    this.firstName = this.userService.account.firstName;
    this.lastName = this.userService.account.lastName;
    this.username = this.userService.account.username;

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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  uploadAvatar(event: any): void {
    this.userService.uploadAvatar(event.target.files[0])
      .catch((err) => {
        this.sendNotification('Il y a eu une erreur, essayez une autre image.');
      });
  }

  sendNotification(message: string) {

    this.snackBar.open(message, 'Ok', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
    });
  }
}
