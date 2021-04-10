import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef } from '@angular/material/dialog';
import { SharedModule } from '@components/shared/shared.module';
import { SocketService } from '@services/socket-service.service';
import { MockSocketService } from '@services/socket-service.service.spec';

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
        { provide: SocketService, useValue: MockSocketService },
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
