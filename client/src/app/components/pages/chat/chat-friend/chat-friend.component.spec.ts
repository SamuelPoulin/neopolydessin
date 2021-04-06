import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatFriendComponent } from './chat-friend.component';

describe('ChatFriendComponent', () => {
  let component: ChatFriendComponent;
  let fixture: ComponentFixture<ChatFriendComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ChatFriendComponent],
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
