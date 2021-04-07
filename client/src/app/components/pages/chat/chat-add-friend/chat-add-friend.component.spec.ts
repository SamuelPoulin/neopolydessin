import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatAddFriendComponent } from './chat-add-friend.component';

describe('ChatAddFriendComponent', () => {
  let component: ChatAddFriendComponent;
  let fixture: ComponentFixture<ChatAddFriendComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ChatAddFriendComponent],
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
