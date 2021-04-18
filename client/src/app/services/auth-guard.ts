import { Injectable } from '@angular/core';
import { CanActivate } from '@angular/router';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private userService: UserService) {}

  async canActivate() {
    return new Promise<boolean>((resolve) => {
      this.userService
        .validateAuth()
        .then(() => {
          resolve(true);
        })
        .catch(() => {
          this.userService.logout();
          resolve(false);
        });
    });
  }
}
