import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatCreateChatRoomComponent } from './chat-create-chat-room.component';

describe('ChatCreateChatRoomComponent', () => {
  let component: ChatCreateChatRoomComponent;
  let fixture: ComponentFixture<ChatCreateChatRoomComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ChatCreateChatRoomComponent],
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
