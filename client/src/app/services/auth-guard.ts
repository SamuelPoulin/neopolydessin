import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { LocalSaveService } from './localsave.service';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private userService: UserService, private router: Router, private localSaveService: LocalSaveService) {}

  async canActivate() {
    return new Promise<boolean>((resolve) => {
      this.userService
        .validateAuth()
        .then(() => {
          resolve(true);
        })
        .catch(() => {
          this.router.navigate(['/login']);
          this.localSaveService.clearData();
          resolve(false);
        });
    });
  }
}
