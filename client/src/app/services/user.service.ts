import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { APIService } from './api.service';
import { LocalSaveService } from './localsave.service';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private _username: string = '';
  private _loggedIn: boolean = false;

  constructor(private localSaveService: LocalSaveService, private router: Router, private apiService: APIService) {}

  login(username: string) {
    this.localSaveService.username = username;
    this._username = username;
    this._loggedIn = true;
  }

  refreshToken(token: string) {
    this.apiService.refreshToken(token);
  }

  logout() {
    this.localSaveService.username = '';
    this.localSaveService.accessToken = '';
    this.localSaveService.refreshToken = '';
    this._username = '';
    this._loggedIn = false;
    this.router.navigate(['/login']);
  }

  get username(): string {
    return this._username;
  }

  get loggedIn(): boolean {
    return this._loggedIn;
  }
}
