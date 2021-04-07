import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SharedModule } from '@components/shared/shared.module';
import { APIService } from '@services/api.service';
import { MockAPIService } from '@services/api.service.spec';
import { ChatService } from '@services/chat.service';
import { MockChatService } from '@services/chat.service.spec';
import { UserService } from '@services/user.service';
import { MockUserService } from '@services/user.service.spec';

import { ChatFriendComponent } from './chat-friend.component';

describe('ChatFriendComponent', () => {
  let component: ChatFriendComponent;
  let fixture: ComponentFixture<ChatFriendComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SharedModule],
      declarations: [ChatFriendComponent],
      providers: [
        { provide: APIService, useValue: MockAPIService },
        { provide: ChatService, useValue: MockChatService },
        { provide: UserService, useValue: MockUserService },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ChatFriendComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
