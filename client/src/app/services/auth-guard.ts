import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { LocalSaveService } from './localsave.service';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private userService: UserService, private localSaveService: LocalSaveService, private router: Router) {}

  canActivate() {
    if (this.userService.loggedIn) {
      return true;
    } else if (this.localSaveService.username) {
      this.userService.login(this.localSaveService.username);
      return true;
    } else {
      this.router.navigate(['/login']);
      return false;
    }
  }
}
