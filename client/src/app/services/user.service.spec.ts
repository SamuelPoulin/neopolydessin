import { async, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { APIService } from './api.service';
import { MockAPIService } from './api.service.spec';
import { UserService } from './user.service';

export const MockUserService = jasmine.createSpyObj('UserService', {
  login: null,
  refreshToken: null,
  fetchAvatar: Promise.resolve(),
});

MockUserService.account = { firstName: '', lastName: '', username: '', avatar: { _id: '' } };

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
