import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChatService } from '@services/chat.service';
import { MockChatService } from '@services/chat.service.spec';

import { ChatTabsComponent } from './chat-tabs.component';

describe('ChatTabsComponent', () => {
  let component: ChatTabsComponent;
  let fixture: ComponentFixture<ChatTabsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ChatTabsComponent],
      providers: [{ provide: ChatService, useValue: MockChatService }],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ChatTabsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
