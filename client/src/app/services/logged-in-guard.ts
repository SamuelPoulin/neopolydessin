import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root',
})
export class LoggedInGuard implements CanActivate {
  constructor(private userService: UserService, private router: Router) {}

  async canActivate(): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      this.userService
        .validateAuth()
        .then(() => {
          this.router.navigate(['']);
          resolve(false);
        })
        .catch(() => {
          this.userService.clearData();
          resolve(true);
        });
    });
  }
}
