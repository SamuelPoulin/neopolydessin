/* eslint-disable max-lines */
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { EventEmitter, Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Drawing } from '@models/drawing';
import { environment } from 'src/environments/environment';
import { PictureWordDrawing, PictureWord, UpdatePictureWord, PictureWordPicture } from '@common/communication/picture-word';
import { DrawingSequence } from '@common/communication/drawing-sequence';
import { AccountInfo, PublicAccountInfo } from '@common/communication/account';
import { FriendsList } from '@common/communication/friends';
import { Decision } from '@common/communication/friend-request';
import { PrivateMessage } from '@common/communication/private-message';
import { DashBoardInfo } from '@common/communication/dashboard';
import { LoginResponse } from '@common/communication/login';
import { LocalSaveService } from './localsave.service';

@Injectable({
  providedIn: 'root',
})
export class APIService {
  static readonly SENDING_MSG: string = 'Envoi du courriel en cours . . .';
  static readonly EMAIL_NOT_FOUND_MSG: string = 'Nous ne trouvons pas votre courriel';
  static readonly INVALID_DATA_MSG: string = 'Les données soumises ne sont pas valides';
  static readonly SERVER_PROBLEM_MSG: string = 'Problèmes de serveurs, essayez plus tard';
  static readonly FILE_TOO_LARGE_MSG: string = 'Votre format png est probablement trop gros';

  private static API_BASE_URL: string;
  private static API_DATABASE_ROUTE: string;
  private static API_DASHBOARD_ROUTE: string;
  private static API_PICTUREWORD_ROUTE: string;
  private static API_DRAWINGS_ROUTE: string;
  private static API_DRAWING_ROUTE: string;
  private static API_EMAIL_ROUTE: string;
  private static API_AUTH_ROUTE: string;
  private static API_LOGIN_ROUTE: string;
  private static API_REFRESH_ROUTE: string;
  private static API_REGISTER_ROUTE: string;
  private static API_AVATAR_ROUTE: string;
  private static API_UPLOAD_AVATAR_ROUTE: string;
  private static API_ACCOUNT_ROUTE: string;
  private static API_FRIENDS_ROUTE: string;
  private static API_FRIENDS_DECISION_ROUTE: string;
  private static API_FRIENDS_HISTORY_ROUTE: string;

  friendslistUpdated: EventEmitter<FriendsList>;

  constructor(private http: HttpClient, private notification: MatSnackBar, private localSaveService: LocalSaveService) {
    APIService.API_BASE_URL = environment.apiBaseUrl;
    APIService.API_EMAIL_ROUTE = '/email';
    APIService.API_DRAWINGS_ROUTE = '/drawings';
    APIService.API_DRAWING_ROUTE = '/drawing';
    APIService.API_DATABASE_ROUTE = APIService.API_BASE_URL + '/database';
    APIService.API_DASHBOARD_ROUTE = APIService.API_DATABASE_ROUTE + '/dashboard';
    APIService.API_PICTUREWORD_ROUTE = APIService.API_BASE_URL + '/pictureword';
    APIService.API_AUTH_ROUTE = APIService.API_DATABASE_ROUTE + '/auth';
    APIService.API_LOGIN_ROUTE = APIService.API_AUTH_ROUTE + '/login';
    APIService.API_REFRESH_ROUTE = APIService.API_AUTH_ROUTE + '/refresh';
    APIService.API_REGISTER_ROUTE = APIService.API_AUTH_ROUTE + '/register';
    APIService.API_AVATAR_ROUTE = APIService.API_BASE_URL + '/avatar';
    APIService.API_UPLOAD_AVATAR_ROUTE = APIService.API_AVATAR_ROUTE + '/upload';
    APIService.API_ACCOUNT_ROUTE = APIService.API_DATABASE_ROUTE + '/account';
    APIService.API_FRIENDS_ROUTE = APIService.API_DATABASE_ROUTE + '/friends';
    APIService.API_FRIENDS_DECISION_ROUTE = APIService.API_FRIENDS_ROUTE + '/decision';
    APIService.API_FRIENDS_HISTORY_ROUTE = APIService.API_FRIENDS_ROUTE + '/history';

    this.friendslistUpdated = new EventEmitter<FriendsList>();
  }

  async login(username: string, password: string): Promise<LoginResponse> {
    return new Promise<LoginResponse>((resolve, reject) => {
      this.http.post(APIService.API_LOGIN_ROUTE, { username, password }).subscribe(
        (loginResponse: LoginResponse) => {
          resolve(loginResponse);
        },
        (e) => {
          reject(e);
        },
      );
    });
  }

  async register(firstName: string, lastName: string, username: string, email: string, password: string): Promise<LoginResponse> {
    return new Promise<LoginResponse>((resolve, reject) => {
      this.http
        .post(APIService.API_REGISTER_ROUTE, { firstName, lastName, username, email, password, passwordConfirm: password })
        .subscribe(
          (loginResponse: LoginResponse) => {
            resolve(loginResponse);
          },
          (e) => {
            reject(e);
          },
        );
    });
  }

  async refreshAccessToken(refreshToken: string | undefined): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      this.http.post(APIService.API_REFRESH_ROUTE, { refreshToken }).subscribe(
        (response: { accessToken: string }) => {
          resolve(response.accessToken);
        },
        (e) => {
          reject(e);
        },
      );
    });
  }

  async uploadDrawing(data: PictureWordDrawing): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      if (this.localSaveService.accessToken) {
        let headers = new HttpHeaders().set('Content-Type', 'application/json; charset=utf-8');
        headers = headers.set('authorization', this.localSaveService.accessToken);
        const url = APIService.API_PICTUREWORD_ROUTE + '/upload/drawing';
        this.http
          .post<{ id: string }>(url, data, { headers })
          .subscribe(
            (response: { id: string }) => {
              resolve(response.id);
            },
            (e) => {
              reject(e);
            },
          );
      } else {
        reject();
      }
    });
  }

  async uploadPicture(data: PictureWordPicture): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      if (this.localSaveService.accessToken) {
        let headers = new HttpHeaders().set('Content-Type', 'application/json; charset=utf-8');
        headers = headers.set('authorization', this.localSaveService.accessToken);
        const url = APIService.API_PICTUREWORD_ROUTE + '/upload/picture';
        this.http
          .post<{ id: string }>(url, data, { headers })
          .subscribe(
            (response: { id: string }) => {
              resolve(response.id);
            },
            (e) => {
              reject(e);
            },
          );
      } else {
        reject();
      }
    });
  }

  async getDrawingPreview(id: string): Promise<DrawingSequence> {
    return new Promise<DrawingSequence>((resolve, reject) => {
      if (this.localSaveService.accessToken) {
        let headers = new HttpHeaders().set('Content-Type', 'application/json; charset=utf-8');
        headers = headers.set('authorization', this.localSaveService.accessToken);
        const url = APIService.API_PICTUREWORD_ROUTE + '/sequence/' + id;
        this.http
          .get<DrawingSequence>(url, { headers })
          .subscribe(
            (response: DrawingSequence) => {
              resolve(response);
            },
            (e) => {
              reject(e);
            },
          );
      } else {
        reject();
      }
    });
  }

  async updateDrawing(id: string, data: UpdatePictureWord): Promise<DrawingSequence> {
    return new Promise<DrawingSequence>((resolve, reject) => {
      if (this.localSaveService.accessToken) {
        let headers = new HttpHeaders().set('Content-Type', 'application/json; charset=utf-8');
        headers = headers.set('authorization', this.localSaveService.accessToken);
        const url = APIService.API_PICTUREWORD_ROUTE + '/' + id;
        this.http
          .post<DrawingSequence>(url, data, { headers })
          .subscribe(
            (response: DrawingSequence) => {
              resolve(response);
            },
            (e) => {
              reject(e);
            },
          );
      } else {
        reject();
      }
    });
  }

  async deleteDrawing(id: string): Promise<PictureWord> {
    return new Promise<PictureWord>((resolve, reject) => {
      if (this.localSaveService.accessToken) {
        let headers = new HttpHeaders().set('Content-Type', 'application/json; charset=utf-8');
        headers = headers.set('authorization', this.localSaveService.accessToken);
        const url = APIService.API_PICTUREWORD_ROUTE + '/' + id;
        this.http
          .delete<PictureWord>(url, { headers })
          .subscribe(
            (response: PictureWord) => {
              resolve(response);
            },
            (e) => {
              reject(e);
            },
          );
      } else {
        reject();
      }
    });
  }

  async getAllDrawings(): Promise<Drawing[]> {
    return new Promise<Drawing[]>((resolve) => {
      const url = APIService.API_BASE_URL + APIService.API_DATABASE_ROUTE + APIService.API_DRAWINGS_ROUTE;

      this.http.get<Drawing[]>(url).subscribe((drawings: Drawing[]) => {
        resolve(drawings);
      });
    });
  }

  async getDrawingById(id: string): Promise<Drawing> {
    return new Promise<Drawing>((resolve) => {
      const url = APIService.API_BASE_URL + APIService.API_DATABASE_ROUTE + APIService.API_DRAWINGS_ROUTE + '/' + id;
      this.http.get<Drawing>(url).subscribe((drawing: Drawing) => {
        resolve(drawing);
      });
    });
  }

  async getAvatarById(id: string): Promise<Blob> {
    return new Promise<Blob>((resolve, reject) => {
      if (this.localSaveService.accessToken) {
        const url = APIService.API_AVATAR_ROUTE + `/${id}`;
        this.http.get(url, { headers: { authorization: this.localSaveService.accessToken }, responseType: 'blob' }).subscribe(
          (blob: Blob) => {
            resolve(blob);
          },
          (e) => {
            reject(e);
          },
        );
      } else {
        reject();
      }
    });
  }

  async uploadAvatar(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);
    return new Promise<string>((resolve, reject) => {
      if (this.localSaveService.accessToken) {
        this.http
          .post(APIService.API_UPLOAD_AVATAR_ROUTE, formData, { headers: { authorization: this.localSaveService.accessToken } })
          .subscribe(
            (avatarId: { id: string }) => {
              resolve(avatarId.id);
            },
            (e) => {
              reject(e);
            },
          );
      }
    });
  }

  async getAccount(): Promise<AccountInfo> {
    return new Promise<AccountInfo>((resolve, reject) => {
      if (this.localSaveService.accessToken) {
        this.http.get(APIService.API_ACCOUNT_ROUTE, { headers: { authorization: this.localSaveService.accessToken } }).subscribe(
          (account: AccountInfo) => {
            resolve(account);
          },
          (e) => {
            reject(e);
          },
        );
      } else {
        reject();
      }
    });
  }

  async getPublicAccount(accountId: string): Promise<PublicAccountInfo> {
    return new Promise<PublicAccountInfo>((resolve, reject) => {
      if (this.localSaveService.accessToken) {
        this.http
          .get(APIService.API_ACCOUNT_ROUTE + `/${accountId}`, { headers: { authorization: this.localSaveService.accessToken } })
          .subscribe(
            (accountInfo: PublicAccountInfo) => {
              resolve(accountInfo);
            },
            (e) => reject(e),
          );
      } else {
        reject();
      }
    });
  }

  async getDashBoardInfo(): Promise<DashBoardInfo> {
    return new Promise<DashBoardInfo>((resolve, reject) => {
      if (this.localSaveService.accessToken) {
        this.http
          .get(APIService.API_DASHBOARD_ROUTE, {
            headers: { authorization: this.localSaveService.accessToken },
          })
          .subscribe(
            (dashboard: DashBoardInfo) => {
              resolve(dashboard);
            },
            (e) => {
              reject(e);
            },
          );
      } else {
        reject();
      }
    });
  }

  async updateAccount(firstName?: string, lastName?: string, username?: string, email?: string): Promise<AccountInfo> {
    return new Promise<AccountInfo>((resolve, reject) => {
      if (this.localSaveService.accessToken) {
        this.http
          .post(
            APIService.API_ACCOUNT_ROUTE,
            { firstName, lastName, email, username },
            { headers: { authorization: this.localSaveService.accessToken } },
          )
          .subscribe(
            (accountInfo: AccountInfo) => {
              resolve(accountInfo);
            },
            (err) => {
              reject(err);
            },
          );
      } else {
        reject();
      }
    });
  }

  async getFriendsList(): Promise<FriendsList> {
    return new Promise<FriendsList>((resolve, reject) => {
      if (this.localSaveService.accessToken) {
        this.http.get(APIService.API_FRIENDS_ROUTE, { headers: { authorization: this.localSaveService.accessToken } }).subscribe(
          (friendslist: FriendsList) => {
            resolve(friendslist);
          },
          (e) => {
            reject(e);
          },
        );
      } else {
        reject();
      }
    });
  }

  async searchDrawings(name: string, tags: string): Promise<Drawing[]> {
    return new Promise<Drawing[]>((resolve) => {
      let url = APIService.API_BASE_URL + APIService.API_DATABASE_ROUTE + APIService.API_DRAWING_ROUTE + '?name=' + name;

      tags.split(',').forEach((tag) => {
        url += '&tag=' + tag;
      });

      this.http.get<Drawing[]>(url).subscribe((drawings: Drawing[]) => {
        resolve(drawings);
      });
    });
  }

  handleResponse(res: string): void {
    const response = res.split('"')[1];
    const message =
      response === 'message' ? APIService.SENDING_MSG : response === 'error' ? APIService.EMAIL_NOT_FOUND_MSG : APIService.INVALID_DATA_MSG;
    this.notification.open(message, '', { duration: 5000 });
  }

  handleError(error: ErrorEvent): void {
    const errorMessage = error.message.split(': ')[1];
    const message = errorMessage.includes('500') ? APIService.SERVER_PROBLEM_MSG : APIService.FILE_TOO_LARGE_MSG;
    this.notification.open(message, 'ok', {
      duration: 10000,
    });
  }

  async sendFriendDecision(idOfFriend: string, decision: Decision): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      if (this.localSaveService.accessToken) {
        this.http
          .post(
            APIService.API_FRIENDS_DECISION_ROUTE,
            { idOfFriend, decision },
            { headers: { authorization: this.localSaveService.accessToken } },
          )
          .subscribe(
            (friendslist: FriendsList) => {
              this.friendslistUpdated.emit(friendslist);
              resolve();
            },
            (e) => reject(e),
          );
      }
    });
  }

  async removeFriend(idOfFriend: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      if (this.localSaveService.accessToken) {
        this.http
          .delete(APIService.API_FRIENDS_ROUTE + `/${idOfFriend}`, {
            headers: { authorization: this.localSaveService.accessToken },
          })
          .subscribe(
            (friendslist: FriendsList) => {
              this.friendslistUpdated.emit(friendslist);
              resolve();
            },
            (e) => reject(e),
          );
      }
    });
  }

  async addFriend(username: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      if (this.localSaveService.accessToken) {
        this.http
          .post(
            APIService.API_FRIENDS_ROUTE,
            { username },
            {
              headers: { authorization: this.localSaveService.accessToken },
            },
          )
          .subscribe(
            (friendslist: FriendsList) => {
              this.friendslistUpdated.emit(friendslist);
              resolve();
            },
            (e) => reject(e),
          );
      }
    });
  }

  async getPrivateMessageHistory(friendId: string): Promise<PrivateMessage[]> {
    return new Promise<PrivateMessage[]>((resolve, reject) => {
      if (this.localSaveService.accessToken) {
        this.http
          .get(APIService.API_FRIENDS_HISTORY_ROUTE, {
            params: {
              page: '1',
              otherId: friendId,
              limit: '10',
            },
            headers: {
              authorization: this.localSaveService.accessToken,
            },
          })
          .subscribe(
            (privateMessages: { messages: PrivateMessage[] }) => {
              resolve(privateMessages.messages);
            },
            (e) => {
              reject(e);
            },
          );
      }
    });
  }

  sendEmail(userName: string, userEmail: string, dataUrl: string, fileName: string, extension: string): void {
    const url = APIService.API_BASE_URL + APIService.API_EMAIL_ROUTE;
    if (extension !== 'svg') {
      dataUrl = dataUrl.split(',')[1];
    }
    const user = {
      name: userName,
      email: userEmail,
      dataURL: dataUrl,
      file: fileName,
      ext: extension,
    };
    this.http.post(url, user, { responseType: 'text' }).subscribe(
      (res) => {
        this.handleResponse(res);
      },
      (error) => {
        this.handleError(error);
      },
    );
  }
}
