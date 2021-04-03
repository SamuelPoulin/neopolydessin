import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Drawing } from '@models/drawing';
import { environment } from 'src/environments/environment';
import { PictureWordPicture } from '@common/communication/picture-word';
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

  async login(username: string, password: string) {
    return this.http
      .post(APIService.API_LOGIN_ROUTE, { username, password })
      .toPromise()
      .then((reply: { accessToken: string; refreshToken: string }) => {
        this.localSaveService.accessToken = reply.accessToken;
        this.localSaveService.refreshToken = reply.refreshToken;
      });
  }

  async refreshToken(refreshToken: string) {
    return this.http
      .post(APIService.API_REFRESH_ROUTE, { refreshToken })
      .toPromise()
      .then((reply: { accessToken: string }) => {
        this.localSaveService.accessToken = reply.accessToken;
      });
  }

  async register(firstName: string, lastName: string, username: string, email: string, password: string) {
    return this.http
      .post(APIService.API_REGISTER_ROUTE, { firstName, lastName, username, email, password, passwordConfirm: password })
      .toPromise()
      .then((reply: { accessToken: string; refreshToken: string }) => {
        this.localSaveService.accessToken = reply.accessToken;
        this.localSaveService.refreshToken = reply.refreshToken;
      }); // todo - fix duplicate password
  }

  async uploadDrawing() {
    // todo - redo
  }

  async uploadPicture(data: PictureWordPicture): Promise<number> {
    let headers = new HttpHeaders().set('Content-Type', 'application/json; charset=utf-8');
    headers = headers.set('authorization', this.localSaveService.accessToken);
    const url = APIService.API_PICTUREWORD_ROUTE + '/upload/picture';
    return this.http
      .post<number>(url, data, { headers })
      .toPromise();
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

  // TODO: REMOVE ANYs
  // eslint-disable-next-line
  async getAvatarById(id: string): Promise<any> {
    // eslint-disable-next-line
    return new Promise<any>((resolve) => {
      const url = APIService.API_AVATAR_ROUTE + `/${id}`;
      this.http.get(url, { headers: { authorization: this.localSaveService.accessToken }, responseType: 'blob' }).subscribe((blob) => {
        resolve(blob);
      });
    });
  }

  // eslint-disable-next-line
  async getAccount(): Promise<any> {
    // eslint-disable-next-line
    return new Promise<any>((resolve) => {
      this.http
        .get(APIService.API_ACCOUNT_ROUTE, { headers: { authorization: this.localSaveService.accessToken } })
        .subscribe((account) => {
          resolve(account);
        });
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
