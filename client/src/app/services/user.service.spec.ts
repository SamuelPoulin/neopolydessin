import { TestBed, waitForAsync } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { APIService } from './api.service';
import { MockAPIService } from './api.service.spec';
import { UserService } from './user.service';
import { EventEmitter } from '@angular/core';
import { AccountInfo } from '@common/communication/account';

export const MockUserService = jasmine.createSpyObj('UserService', {
  login: null,
  refreshToken: null,
  fetchAvatar: Promise.resolve(),
  updateAccount: Promise.resolve(),
});

MockUserService.account = {
  _id: '',
  firstName: '',
  lastName: '',
  email: '',
  createdDate: Date.now(),
  friends: [],
  username: '',
  avatar: '',
} as AccountInfo;

MockUserService.loggedIn = new EventEmitter<void>();
MockUserService.loggedOut = new EventEmitter<void>();
MockUserService.accountUpdated = new EventEmitter<void>();

describe('UserService', () => {
  let service: UserService;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        imports: [RouterTestingModule],
        providers: [{ provide: APIService, useValue: MockAPIService }],
      }).compileComponents();
    }),
  );

  beforeEach(() => {
    service = TestBed.inject(UserService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
