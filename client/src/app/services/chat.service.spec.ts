import { async, TestBed } from '@angular/core/testing';
import { ChatService } from './chat.service';
import { SocketService } from './socket-service.service';
import { MockSocketService } from './socket-service.service.spec';

export const MockChatService = jasmine.createSpyObj('ChatService', {
  sendMessage: null,
  sendGuess: null,
  closeRoom: null,
  focusRoom: null,
  messages: [],
  roomName: '',
});

describe('ChatService', () => {
  let service: ChatService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      providers: [{ provide: SocketService, useValue: MockSocketService }],
    }).compileComponents();
  }));

  beforeEach(() => {
    service = TestBed.inject(ChatService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
