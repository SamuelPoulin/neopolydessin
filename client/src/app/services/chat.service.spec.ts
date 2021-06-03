import { EventEmitter } from '@angular/core';
import { TestBed, waitForAsync } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RouterTestingModule } from '@angular/router/testing';
import { ChatState } from '@models/chat/chat-state';
import { ElectronService } from 'ngx-electron';
import { APIService } from './api.service';
import { MockAPIService } from './api.service.spec';
import { ChatService } from './chat.service';
import { MockElectronService } from './electron.service.spec';
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

MockChatService.chatState = {
  rooms: [],
  joinableRooms: [],
  friends: [],
  friendRequests: [],
  currentRoomIndex: 0,
  canGuess: false,
  guessing: false,
  friendslistOpened: false,
  chatRoomsOpened: false,
  inGame: false,
} as ChatState;
MockChatService.messages = [];
MockChatService.chatRoomChanged = new EventEmitter<void>();

describe('ChatService', () => {
  let service: ChatService;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        imports: [RouterTestingModule],
        providers: [
          { provide: SocketService, useValue: MockSocketService },
          { provide: GameService, useValue: MockGameService },
          { provide: APIService, useValue: MockAPIService },
          { provide: UserService, useValue: MockUserService },
          { provide: ElectronService, useValue: MockElectronService },
          { provide: MatSnackBar, useValue: {} },
        ],
      }).compileComponents();
    }),
  );

  beforeEach(() => {
    service = TestBed.inject(ChatService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
