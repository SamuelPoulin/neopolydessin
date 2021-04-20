import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ChatModule } from '@components/pages/chat/chat.module';
import { SharedModule } from '@components/shared/shared.module';
import { StatusBarModule } from '@components/shared/status-bar/status-bar.module';
import { ChatService } from '@services/chat.service';
import { MockChatService } from '@services/chat.service.spec';
import { EditorService } from '@services/editor.service';
import { MockEditorService } from '@services/editor.service.spec';
import { GameService } from '@services/game.service';
import { MockGameService } from '@services/game.service.spec';
import { ModalDialogService } from '@services/modal/modal-dialog.service';
import { SocketService } from '@services/socket-service.service';
import { MockSocketService } from '@services/socket-service.service.spec';
import { TutorialService } from '@services/tutorial.service';
import { MockTutorialService } from '@services/tutorial.service.spec';
import { UserService } from '@services/user.service';
import { MockUserService } from '@services/user.service.spec';

import { GameEndComponent } from './game-end.component';

describe('GameEndComponent', () => {
  let component: GameEndComponent;
  let fixture: ComponentFixture<GameEndComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SharedModule, RouterTestingModule, StatusBarModule, ChatModule],
      declarations: [GameEndComponent],
      providers: [
        { provide: GameService, useValue: MockGameService },
        { provide: ChatService, useValue: MockChatService },
        { provide: UserService, useValue: MockUserService },
        { provide: TutorialService, useValue: MockTutorialService },
        { provide: SocketService, useValue: MockSocketService },
        { provide: EditorService, useValue: MockEditorService },
        { provide: ModalDialogService, useValue: {} },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GameEndComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
