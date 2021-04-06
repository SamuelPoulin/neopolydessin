import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatFriendslistComponent } from './chat-friendslist.component';

describe('ChatFriendslistComponent', () => {
  let component: ChatFriendslistComponent;
  let fixture: ComponentFixture<ChatFriendslistComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ChatFriendslistComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ChatFriendslistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
