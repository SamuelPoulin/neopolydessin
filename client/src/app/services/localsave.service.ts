import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class LocalSaveService {
  private static LOCAL_USER_ID: string = 'username';

  private _username: string;

  loadUsername(): void {
    const localUser: string | null = localStorage.getItem(LocalSaveService.LOCAL_USER_ID);
    if (localUser) {
      this._username = localUser;
    }
  }

  set username(username: string) {
    if (username) {
      localStorage.setItem(LocalSaveService.LOCAL_USER_ID, username);
    } else {
      localStorage.removeItem(LocalSaveService.LOCAL_USER_ID);
    }
  }

  get username(): string {
    this.loadUsername();
    return this._username;
  }
}
