// tslint:disable: no-string-literal max-line-length
import { Overlay } from '@angular/cdk/overlay';
import { HttpXhrBackend } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SharedModule } from '@components/shared/shared.module';
import { of } from 'rxjs';
import { APIService } from './api.service';

export const MockAPIService = jasmine.createSpyObj('APIService', {
  login: Promise.resolve(),
  refreshToken: Promise.resolve(),
  register: Promise.resolve(),
  handleResponse: null,
  handleError: null,
  getAccount: Promise.resolve(),
  getFriendsList: Promise.resolve({ friends: [] }),
  getDashBoardInfo: Promise.resolve({
    gameHistory: { games: [] },
    logins: [],
  }),
});

MockAPIService.friendslistUpdated = of();

fdescribe('APIService', () => {
  let apiService: APIService;
  let httpTestingController: HttpTestingController;
  let notification: MatSnackBar;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [{ provide: HttpXhrBackend, useClass: HttpTestingController }, APIService, MatSnackBar, Overlay],
      imports: [HttpClientTestingModule, SharedModule],
    });
    httpTestingController = TestBed.inject(HttpTestingController);
    apiService = TestBed.inject(APIService);
    notification = apiService['notification'];
  });
  afterEach(() => {
    httpTestingController.verify();
  });

  it('should be created', () => {
    expect(apiService).toBeTruthy();
  });

  it('can handle message response', () => {
    const openNotifSpy = spyOn(notification, 'open');

    apiService.handleResponse('error: "message"');

    expect(openNotifSpy).toHaveBeenCalledWith(APIService.SENDING_MSG, '', { duration: 5000 });
  });

  it('can handle error response', () => {
    const openNotifSpy = spyOn(notification, 'open');

    apiService.handleResponse('error: "error"');

    expect(openNotifSpy).toHaveBeenCalledWith(APIService.EMAIL_NOT_FOUND_MSG, '', { duration: 5000 });
  });

  it('can handle other response', () => {
    const openNotifSpy = spyOn(notification, 'open');

    apiService.handleResponse('error: "detail"');

    expect(openNotifSpy).toHaveBeenCalledWith(APIService.INVALID_DATA_MSG, '', { duration: 5000 });
  });

  it('can handle server error', () => {
    const openNotifSpy = spyOn(notification, 'open');

    apiService.handleError({ message: 'error: 500' } as ErrorEvent);

    expect(openNotifSpy).toHaveBeenCalledWith(APIService.SERVER_PROBLEM_MSG, 'ok', { duration: 10000 });
  });

  it('can handle file too large error', () => {
    const openNotifSpy = spyOn(notification, 'open');

    apiService.handleError({ message: 'error: 501' } as ErrorEvent);

    expect(openNotifSpy).toHaveBeenCalledWith(APIService.FILE_TOO_LARGE_MSG, 'ok', { duration: 10000 });
  });
});
