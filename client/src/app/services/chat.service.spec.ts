import { async, TestBed } from '@angular/core/testing';
import { APIService } from './api.service';
import { MockAPIService } from './api.service.spec';
import { ChatService } from './chat.service';
import { GameService } from './game.service';
import { MockGameService } from './game.service.spec';
import { SocketService } from './socket-service.service';
import { MockSocketService } from './socket-service.service.spec';
import { UserService } from './user.service';
import { MockUserService } from './user.service.spec';

export const MockChatService = jasmine.createSpyObj('ChatService', {
  sendMessage: null,
  sendGuess: null,
  closeRoom: null,
  focusRoom: null,
  roomName: '',
  resetGameMessages: null,
});

MockChatService.messages = [];
MockChatService.friends = [];
MockChatService.friendRequests = [];

describe('ChatService', () => {
  let service: ChatService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: SocketService, useValue: MockSocketService },
        { provide: GameService, useValue: MockGameService },
        { provide: APIService, useValue: MockAPIService },
        { provide: UserService, useValue: MockUserService },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    service = TestBed.inject(ChatService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
