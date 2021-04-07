import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Account } from '@models/account';
import { Drawing } from '@models/drawing';
import { environment } from 'src/environments/environment';
import { PictureWordPicture } from '@common/communication/picture-word';
import { DrawingSequence } from '@common/communication/drawing-sequence';
import { LoginResponse } from '../../../../common/communication/login';
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
  private static API_PICTUREWORD_ROUTE: string;
  private static API_DRAWINGS_ROUTE: string;
  private static API_DRAWING_ROUTE: string;
  private static API_EMAIL_ROUTE: string;
  private static API_AUTH_ROUTE: string;
  private static API_LOGIN_ROUTE: string;
  private static API_REFRESH_ROUTE: string;
  private static API_REGISTER_ROUTE: string;
  private static API_AVATAR_ROUTE: string;
  private static API_ACCOUNT_ROUTE: string;

  constructor(private http: HttpClient, private notification: MatSnackBar, private localSaveService: LocalSaveService) {
    APIService.API_BASE_URL = environment.apiBaseUrl;
    APIService.API_EMAIL_ROUTE = '/email';
    APIService.API_DRAWINGS_ROUTE = '/drawings';
    APIService.API_DRAWING_ROUTE = '/drawing';
    APIService.API_DATABASE_ROUTE = APIService.API_BASE_URL + '/database';
    APIService.API_PICTUREWORD_ROUTE = APIService.API_BASE_URL + '/pictureword';
    APIService.API_AUTH_ROUTE = APIService.API_DATABASE_ROUTE + '/auth';
    APIService.API_LOGIN_ROUTE = APIService.API_AUTH_ROUTE + '/login';
    APIService.API_REFRESH_ROUTE = APIService.API_AUTH_ROUTE + '/refresh';
    APIService.API_REGISTER_ROUTE = APIService.API_AUTH_ROUTE + '/register';
    APIService.API_AVATAR_ROUTE = APIService.API_BASE_URL + '/avatar';
    APIService.API_ACCOUNT_ROUTE = APIService.API_DATABASE_ROUTE + '/account';
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

  async uploadDrawing() {
    // todo - redo
  }

  async uploadPicture(data: PictureWordPicture): Promise<number> {
    return new Promise<number>((resolve, reject) => {
      if (this.localSaveService.accessToken) {
        let headers = new HttpHeaders().set('Content-Type', 'application/json; charset=utf-8');
        headers = headers.set('authorization', this.localSaveService.accessToken);
        const url = APIService.API_PICTUREWORD_ROUTE + '/upload/picture';
        this.http.post(url, data, { headers }).subscribe(
          (response: number) => {
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

  async getDrawingPreview(id: string) {
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

  async getAccount(): Promise<Account> {
    return new Promise<Account>((resolve, reject) => {
      if (this.localSaveService.accessToken) {
        this.http.get(APIService.API_ACCOUNT_ROUTE, { headers: { authorization: this.localSaveService.accessToken } }).subscribe(
          (account: Account) => {
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

  async deleteDrawing(id: string): Promise<void> {
    return new Promise<void>((resolve) => {
      const url = APIService.API_BASE_URL + APIService.API_DATABASE_ROUTE + APIService.API_DRAWINGS_ROUTE + '/' + id;
      this.http.delete(url, { responseType: 'text' }).subscribe(() => {
        resolve();
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
