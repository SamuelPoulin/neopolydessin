import { async, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import { SocketService } from './socket-service.service';
import { UserService } from './user.service';
import { MockUserService } from './user.service.spec';

export const MockSocketService = jasmine.createSpyObj('SocketService', {
  refreshToken: of(),
  receiveMessage: of(),
  receivePlayerConnections: of(),
  receivePlayerDisconnections: of(),
  joinLobby: null,
  getLobbyList: of(),
  sendMessage: null,
  sendGuess: null,
  sendReady: null,
  createLobby: Promise.resolve(),
  getPlayerJoined: of(),
  getLobbyInfo: of(),
  startGame: null,
  receiveStartPath: of(),
  receiveUpdatePath: of(),
  receiveEndPath: of(),
  receiveAddPath: of(),
  receiveRemovePath: of(),
  receiveGuess: of(),
  receiveGameEnd: of(),
  receiveGameStart: of(),
  receiveRoles: of(),
  receiveWord: of(),
  receiveScores: of(),
  receiveNextTimestamp: of(),
  receivePrivateMessage: of(),
  sendStartPath: null,
  sendUpdatePath: null,
  sendEndPath: null,
  sendAddPath: null,
  sendRemovePath: null,
});

describe('SocketService', () => {
  let service: SocketService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [{ provide: UserService, useValue: MockUserService }, SocketService],
    }).compileComponents();
  }));

  beforeEach(() => {
    service = TestBed.inject(SocketService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
