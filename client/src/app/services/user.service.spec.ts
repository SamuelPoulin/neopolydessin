import { async, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { APIService } from './api.service';
import { MockAPIService } from './api.service.spec';
import { UserService } from './user.service';
import { Account } from '@models/account';

export const MockUserService = jasmine.createSpyObj('UserService', {
  login: null,
  refreshToken: null,
  fetchAvatar: Promise.resolve(),
});

MockUserService.account = {
  _id: '',
  firstName: '',
  lastName: '',
  email: '',
  createdDate: '',
  friends: [],
  username: '',
  avatar: { _id: '' },
} as Account;

describe('UserService', () => {
  let service: UserService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [{ provide: APIService, useValue: MockAPIService }],
    }).compileComponents();
  }));

  beforeEach(() => {
    service = TestBed.inject(UserService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
