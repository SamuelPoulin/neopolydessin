import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Drawing } from '@models/drawing';
import { environment } from 'src/environments/environment';
import { SocketService } from './socket-service.service';

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
  private static API_DRAWINGS_ROUTE: string;
  private static API_DRAWING_ROUTE: string;
  private static API_EMAIL_ROUTE: string;

  constructor(private http: HttpClient, private notification: MatSnackBar) {
    APIService.API_BASE_URL = environment.apiBaseUrl;
    APIService.API_EMAIL_ROUTE = '/email';
    APIService.API_DATABASE_ROUTE = '/database';
    APIService.API_DRAWINGS_ROUTE = '/drawings';
    APIService.API_DRAWING_ROUTE = '/drawing';
  }

  login(username: string, password: string) {
    const url = APIService.API_BASE_URL + APIService.API_DATABASE_ROUTE + '/auth/login';
    return this.http.post(url, {username, password}).toPromise()
      .then((reply: {accessToken: string, refreshToken: string}) => {
        SocketService.accessToken = reply.accessToken;
        SocketService.refreshToken = reply.refreshToken;
      });
  }

  register(firstName:string, lastName: string, username: string, email: string, password: string) {
    const url = APIService.API_BASE_URL + APIService.API_DATABASE_ROUTE + '/auth/register';
    return this.http.post(url, {firstName, lastName, username, email, password, passwordConfirm: password}).toPromise()
      .then((reply: {accessToken: string, refreshToken: string}) => {
        SocketService.accessToken = reply.accessToken;
        SocketService.refreshToken = reply.refreshToken;
      });  // todo - fix duplicate password
  }

  async uploadDrawing(drawing: Drawing): Promise<void> {
    return new Promise<void>((resolve) => {
      const url = APIService.API_BASE_URL + APIService.API_DATABASE_ROUTE + APIService.API_DRAWINGS_ROUTE;

      const reqHeaders = new HttpHeaders().set('Content-Type', 'application/json; charset=utf-8');
      this.http.post(url, drawing, { responseType: 'text', headers: reqHeaders }).subscribe(() => {
        resolve();
      });
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
