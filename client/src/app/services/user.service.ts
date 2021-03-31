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
  private _avatarBlob: string = '';

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

  // TODO: REMOVE ANY
  async fetchAvatar(): Promise<void> {
    return new Promise<void>((resolve) => {
      this.apiService.getAccount().then((account) => {
        // eslint-disable-next-line
        this.apiService.getAvatarById(account.avatar._id).then((blob: any) => {
          this._avatarBlob = blob;
          resolve();
        });
      });
    });
  }

  get username(): string {
    return this._username;
  }

  get avatarBlob(): string {
    return this._avatarBlob;
  }

  get loggedIn(): boolean {
    return this._loggedIn;
  }
}
