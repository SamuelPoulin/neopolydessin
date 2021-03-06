import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef } from '@angular/material/dialog';
import { SharedModule } from '@components/shared/shared.module';
import { ChatService } from '@services/chat.service';
import { MockChatService } from '@services/chat.service.spec';

import { ChatAddFriendComponent } from './chat-add-friend.component';

describe('ChatAddFriendComponent', () => {
  let component: ChatAddFriendComponent;
  let fixture: ComponentFixture<ChatAddFriendComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SharedModule],
      declarations: [ChatAddFriendComponent],
      providers: [
        { provide: ChatService, useValue: MockChatService },
        { provide: MatDialogRef, useValue: {} },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ChatAddFriendComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
