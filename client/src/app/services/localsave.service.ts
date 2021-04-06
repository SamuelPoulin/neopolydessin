import { Injectable } from '@angular/core';
import { Account } from '@models/account';

@Injectable({
  providedIn: 'root',
})
export class LocalSaveService {
  private static STORAGE_ACCOUNT_KEY: string = 'account';
  private static STORAGE_REFRESH_TOKEN_KEY: string = 'refreshToken';
  private static STORAGE_ACCESS_TOKEN_KEY: string = 'accessToken';

  clearData() {
    localStorage.clear();
  }

  set account(account: Account | undefined) {
    if (account) {
      localStorage.setItem(LocalSaveService.STORAGE_ACCOUNT_KEY, JSON.stringify(account));
    } else {
      localStorage.removeItem(LocalSaveService.STORAGE_ACCOUNT_KEY);
    }
  }

  get account(): Account | undefined {
    const value = localStorage.getItem(LocalSaveService.STORAGE_ACCOUNT_KEY);
    if (value) {
      return JSON.parse(value) as Account;
    } else {
      return undefined;
    }
  }

  get accessToken(): string | undefined {
    const value = localStorage.getItem(LocalSaveService.STORAGE_ACCESS_TOKEN_KEY);
    return value ? value : undefined;
  }

  set accessToken(accessToken: string | undefined) {
    if (accessToken) {
      localStorage.setItem(LocalSaveService.STORAGE_ACCESS_TOKEN_KEY, accessToken);
    } else {
      localStorage.removeItem(LocalSaveService.STORAGE_ACCESS_TOKEN_KEY);
    }
  }

  get refreshToken(): string | undefined {
    const value = localStorage.getItem(LocalSaveService.STORAGE_REFRESH_TOKEN_KEY);
    return value ? value : undefined;
  }

  set refreshToken(refreshToken: string | undefined) {
    if (refreshToken) {
      localStorage.setItem(LocalSaveService.STORAGE_REFRESH_TOKEN_KEY, refreshToken);
    } else {
      localStorage.removeItem(LocalSaveService.STORAGE_REFRESH_TOKEN_KEY);
    }
  }
}
