import { EventEmitter, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
import { AccountInfo } from '@common/communication/account';
import { ACCESS_TOKEN_REFRESH_INTERVAL } from '@common/communication/login';
import { differenceInMilliseconds } from 'date-fns';
import { APIService } from './api.service';
import { LocalSaveService } from './localsave.service';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private jwtService: JwtHelperService;

  updateAvatar: boolean;
  avatarBlob: Blob | undefined;
  loggedOut: EventEmitter<void>;
  loggedIn: EventEmitter<void>;
  accountUpdated: EventEmitter<void>;

  constructor(private localSaveService: LocalSaveService, private apiService: APIService, private router: Router) {
    this.updateAvatar = false;
    this.jwtService = new JwtHelperService();
    this.loggedOut = new EventEmitter<void>();
    this.loggedIn = new EventEmitter<void>();
    this.accountUpdated = new EventEmitter<void>();
  }

  async validateAuth(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      if (this.localSaveService.accessToken && this.jwtService.isTokenExpired(this.localSaveService.accessToken)) {
        if (this.localSaveService.refreshToken && this.jwtService.isTokenExpired(this.localSaveService.refreshToken)) {
          reject();
        } else {
          if (this.localSaveService.refreshToken) {
            this.refreshToken()
              .then(() => {
                this.startRefreshing();
                resolve();
              })
              .catch(() => reject());
          } else {
            reject();
          }
        }
      } else {
        if (this.localSaveService.accessToken) {
          if (this.msUntilExpired < ACCESS_TOKEN_REFRESH_INTERVAL) {
            this.refreshToken()
              .then(() => {
                this.startRefreshing();
                resolve();
              })
              .catch(() => reject());
          } else {
            this.fetchAccount()
              .then(() => {
                this.startRefreshing();
                resolve();
              })
              .catch(() => {
                reject();
              });
          }
        } else {
          reject();
        }
      }
    });
  }

  async login(username: string, password: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.apiService
        .login(username, password)
        .then((loginResponse) => {
          this.localSaveService.accessToken = loginResponse.accessToken;
          this.localSaveService.refreshToken = loginResponse.refreshToken;
          this.loggedIn.emit();
          resolve();
        })
        .catch(() => reject());
    });
  }

  async register(firstName: string, lastName: string, username: string, email: string, password: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.apiService
        .register(firstName, lastName, username, email, password)
        .then((loginResponse) => {
          this.localSaveService.accessToken = loginResponse.accessToken;
          this.localSaveService.refreshToken = loginResponse.refreshToken;
          this.loggedIn.emit();
          resolve();
        })
        .catch(() => reject());
    });
  }

  logout() {
    this.clearData();

    this.loggedOut.emit();
    this.router.navigate(['login']);
  }

  async refreshToken(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.apiService
        .refreshAccessToken(this.localSaveService.refreshToken)
        .then(async (accessToken) => {
          this.localSaveService.accessToken = accessToken;
          return this.fetchAccount();
        })
        .then(() => {
          resolve();
        })
        .catch(() => {
          reject();
        });
    });
  }

  clearData() {
    this.avatarBlob = undefined;
    this.localSaveService.clearData();
  }

  startRefreshing() {
    setTimeout(() => {
      this.validateAuth().catch(() => {
        this.logout();
      });
    }, this.msUntilExpired / 2);
  }

  async fetchAccount(): Promise<AccountInfo> {
    return new Promise<AccountInfo>((resolve, reject) => {
      if (this.localSaveService.account) {
        resolve(this.localSaveService.account);
      } else {
        this.apiService
          .getAccount()
          .then((account) => {
            this.localSaveService.account = account;
            this.accountUpdated.emit();
            resolve(account);
          })
          .catch(() => reject());
      }
    });
  }

  async fetchAvatar(): Promise<Blob> {
    return new Promise<Blob>((resolve, reject) => {
      if (this.localSaveService.account && this.localSaveService.account.avatar) {
        this.apiService
          .getAvatarById(this.localSaveService.account.avatar)
          .then((blob: Blob) => {
            this.avatarBlob = blob;
            resolve(this.avatarBlob);
          })
          .catch(() => reject());
      } else {
        reject();
      }
    });
  }

  async uploadAvatar(file: File): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      this.apiService
        .uploadAvatar(file)
        .then((returnedId) => {
          this.notifyAvatarChanged();
          resolve(true);
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  async updateAccount(firstName?: string, lastName?: string, username?: string, email?: string): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      this.apiService
        .updateAccount(firstName, lastName, username, email)
        .then((accountInfo) => {
          this.localSaveService.account = accountInfo;
          this.accountUpdated.emit();
          resolve(true);
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  private notifyAvatarChanged() {
    this.updateAvatar = this.updateAvatar ? false : true;
  }

  get account(): AccountInfo {
    if (this.localSaveService.account) {
      return this.localSaveService.account;
    } else {
      return { _id: '', firstName: '', lastName: '', username: '', email: '', createdDate: Date.now(), friends: [], avatar: '' };
    }
  }

  get accessToken(): string {
    if (this.localSaveService.accessToken) {
      return this.localSaveService.accessToken;
    } else {
      return '';
    }
  }

  get msUntilExpired() {
    const endDate = this.jwtService.getTokenExpirationDate(this.localSaveService.accessToken);
    if (endDate) {
      return differenceInMilliseconds(endDate.getTime(), Date.now());
    } else {
      return 0;
    }
  }
}
