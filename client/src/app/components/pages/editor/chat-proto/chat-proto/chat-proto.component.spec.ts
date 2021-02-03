import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatProtoComponent } from './chat-proto.component';

describe('ChatProtoComponent', () => {
  let component: ChatProtoComponent;
  let fixture: ComponentFixture<ChatProtoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChatProtoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChatProtoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
