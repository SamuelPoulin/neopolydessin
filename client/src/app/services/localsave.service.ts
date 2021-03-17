import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class LocalSaveService {
  private static LOCAL_USER_ID: string = 'username';
  private static LOCAL_REFRESH_TOKEN_ID: string = 'refreshToken';
  private static LOCAL_ACCESS_TOKEN_ID: string = 'accessToken';

  private _username: string;
  private _refreshToken: string;
  private _accessToken: string;

  loadUsername(): void {
    const localUser: string | null = localStorage.getItem(LocalSaveService.LOCAL_USER_ID);
    if (localUser) {
      this._username = localUser;
    }
  }

  loadRefreshToken(): void {
    const localRefreshToken: string | null = localStorage.getItem(LocalSaveService.LOCAL_REFRESH_TOKEN_ID);
    if (localRefreshToken) {
      this._refreshToken = localRefreshToken;
    }
  }

  loadAccessToken(): void {
    const localAccessToken: string | null = localStorage.getItem(LocalSaveService.LOCAL_ACCESS_TOKEN_ID);
    if (localAccessToken) {
      this._accessToken = localAccessToken;
    }
  }

  get accessToken(): string {
    this.loadAccessToken();
    return this._accessToken;
  }

  set accessToken(accessToken: string) {
    if (accessToken) {
      localStorage.setItem(LocalSaveService.LOCAL_ACCESS_TOKEN_ID, accessToken);
    } else {
      localStorage.removeItem(LocalSaveService.LOCAL_ACCESS_TOKEN_ID);
    }
  }

  get refreshToken(): string {
    this.loadRefreshToken();
    return this._refreshToken;
  }

  set refreshToken(refreshToken: string) {
    if (refreshToken) {
      localStorage.setItem(LocalSaveService.LOCAL_REFRESH_TOKEN_ID, refreshToken);
    } else {
      localStorage.removeItem(LocalSaveService.LOCAL_REFRESH_TOKEN_ID);
    }
  }

  get username(): string {
    this.loadUsername();
    return this._username;
  }

  set username(username: string) {
    if (username) {
      localStorage.setItem(LocalSaveService.LOCAL_USER_ID, username);
    } else {
      localStorage.removeItem(LocalSaveService.LOCAL_USER_ID);
    }
  }
}
