import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef } from '@angular/material/dialog';
import { SharedModule } from '@components/shared/shared.module';
import { ChatService } from '@services/chat.service';
import { MockChatService } from '@services/chat.service.spec';

import { ChatCreateChatRoomComponent } from './chat-create-chat-room.component';

describe('ChatCreateChatRoomComponent', () => {
  let component: ChatCreateChatRoomComponent;
  let fixture: ComponentFixture<ChatCreateChatRoomComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SharedModule],
      declarations: [ChatCreateChatRoomComponent],
      providers: [
        { provide: MatDialogRef, useValue: {} },
        { provide: ChatService, useValue: MockChatService },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ChatCreateChatRoomComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
