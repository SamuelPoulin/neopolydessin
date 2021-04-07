import { EventEmitter, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
import { AccountInfo } from '@common/communication/account';
import { ACCESS_TOKEN_REFRESH_INTERVAL } from '../../../../common/communication/login';
import { APIService } from './api.service';
import { LocalSaveService } from './localsave.service';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private jwtService: JwtHelperService;
  private intervalId: number;

  avatarBlob: Blob | undefined;
  loggedOut: EventEmitter<void>;
  loggedIn: EventEmitter<void>;

  constructor(private localSaveService: LocalSaveService, private apiService: APIService, private router: Router) {
    this.jwtService = new JwtHelperService();
    this.loggedOut = new EventEmitter<void>();
    this.loggedIn = new EventEmitter<void>();

    this.intervalId = window.setInterval(() => {
      this.validateAuth().catch(() => {
        this.logout();
      });
    }, ACCESS_TOKEN_REFRESH_INTERVAL);
  }

  async validateAuth(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      if (this.localSaveService.accessToken && this.jwtService.isTokenExpired(this.localSaveService.accessToken)) {
        if (this.localSaveService.refreshToken && this.jwtService.isTokenExpired(this.localSaveService.refreshToken)) {
          reject();
        } else {
          this.apiService
            .refreshAccessToken(this.localSaveService.refreshToken)
            .then((accessToken) => {
              this.localSaveService.accessToken = accessToken;
              this.fetchAccount()
                .then(() => resolve())
                .catch(() => reject());
            })
            .catch(() => reject());
        }
      } else {
        this.fetchAccount()
          .then(() => resolve())
          .catch(() => reject());
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
    this.avatarBlob = undefined;
    clearInterval(this.intervalId);
    this.localSaveService.clearData();
    this.loggedOut.emit();
    this.router.navigate(['login']);
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
}
