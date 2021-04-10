import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SharedModule } from '@components/shared/shared.module';
import { ChatService } from '@services/chat.service';
import { MockChatService } from '@services/chat.service.spec';
import { ModalDialogService } from '@services/modal/modal-dialog.service';
import { SocketService } from '@services/socket-service.service';
import { MockSocketService } from '@services/socket-service.service.spec';

import { ChatRoomsComponent } from './chat-rooms.component';

describe('ChatRoomsComponent', () => {
  let component: ChatRoomsComponent;
  let fixture: ComponentFixture<ChatRoomsComponent>;
  const modalDialogServiceSpy = jasmine.createSpyObj('ModalDialogService', ['openByName']);

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SharedModule],
      declarations: [ChatRoomsComponent],
      providers: [
        { provide: ChatService, useValue: MockChatService },
        { provide: SocketService, useValue: MockSocketService },
        {
          provide: ModalDialogService,
          useValue: modalDialogServiceSpy,
        },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ChatRoomsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
