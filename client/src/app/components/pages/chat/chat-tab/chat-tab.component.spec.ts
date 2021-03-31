import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChatService } from '@services/chat.service';
import { MockChatService } from '@services/chat.service.spec';

import { ChatTabComponent } from './chat-tab.component';

describe('ChatTabComponent', () => {
  let component: ChatTabComponent;
  let fixture: ComponentFixture<ChatTabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ChatTabComponent],
      providers: [{ provide: ChatService, useValue: MockChatService }],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ChatTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
